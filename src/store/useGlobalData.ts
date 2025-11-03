// src/store/useGlobalStore.ts
import { create } from "zustand";

// ✅ Only import READ services (no create/update/delete)
import {
  fetchCustomers,
  fetchDashboardSummary,
  fetchRecentActivity,
} from "../services/dashboardServices";
import { fetchPrompts } from "../services/promptServices";
import { listenToUserProfile } from "../services/authServices";

// ✅ Types only
import {
  type User as UserProfile,
  type Customer,
  type Prompt,
  type DashboardSummaryStats,
  type Activity,
} from "../types";

// --- STATE INTERFACE ---
interface GlobalState {
  userProfile: UserProfile | null;
  customers: Customer[];
  prompts: Prompt[];
  dashboardStats: DashboardSummaryStats | null;
  recentActivity: Activity[];

  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;

  profileListenerUnsubscribe: (() => void) | null;
  authUnsubscribe: (() => void) | null;

  // --- Actions ---
  initAuthListener: () => Promise<void>;
  reset: () => void;
  addCustomer: (customer: Customer) => void;
  updateCustomerInStore: (updatedCustomer: Customer) => void;
  removeCustomer: (customerId: string) => void;
  addPrompt: (prompt: Prompt) => void;
  updatePromptInStore: (updatedPrompt: Prompt) => void;
}

// --- STORE CREATION ---
export const useGlobalData = create<GlobalState>((set, get) => ({
  userProfile: null,
  customers: [],
  prompts: [],
  dashboardStats: null,
  recentActivity: [],
  isLoading: false,
  isLoaded: false,
  error: null,
  profileListenerUnsubscribe: null,
  authUnsubscribe: null,

  initAuthListener: async () => {
    // idempotent: don't run if already loaded or loading
    if (get().isLoaded || get().isLoading) return;
    set({ isLoading: true, error: null });

    try {
      const stored = localStorage.getItem("user");
      const token = localStorage.getItem("authToken");

      if (stored && stored !== "undefined" && stored !== "null") {
        let userObj: Record<string, any>;
        try {
          userObj = JSON.parse(stored) as Record<string, any>;
        } catch (e) {
          console.warn("Failed to parse stored user, clearing key", e);
          localStorage.removeItem("user");
          userObj = {} as Record<string, any>;
        }
        const uid = userObj.uid || userObj.id || userObj.userId || null;

        // set a local user immediately; listener will update when profile arrives
        if (!uid) {
          set({ userProfile: userObj as UserProfile });
        } else {
          const prev = get().profileListenerUnsubscribe;
          if (prev) prev();
          const unsub = listenToUserProfile(uid, (profile) => {
            set({ userProfile: profile ?? (userObj as UserProfile) });
          });
          set({ profileListenerUnsubscribe: unsub });
        }
      }

      // if there's no token we cannot call protected endpoints
      if (!token) {
        set({ isLoading: false });
        return;
      }

      // fetch app data once on first mount
      const [customersData, promptsData, summaryData, activityData] =
        await Promise.all([
          fetchCustomers(),
          fetchPrompts(),
          fetchDashboardSummary(),
          fetchRecentActivity(100),
        ]);

      set({
        customers: customersData,
        prompts: promptsData,
        dashboardStats: summaryData,
        recentActivity: activityData,
        isLoaded: true,
        isLoading: false,
      });
    } catch (err: any) {
      console.error("Global data fetch failed:", err);
      set({ isLoading: false, error: "Failed to load application data." });
    }
  },

  reset: () => {
    const profileUnsub = get().profileListenerUnsubscribe;
    if (profileUnsub) {
      profileUnsub();
    }

    const authUnsub = get().authUnsubscribe;
    if (authUnsub) {
      authUnsub();
    }

    set({
      userProfile: null,
      customers: [],
      prompts: [],
      dashboardStats: null,
      recentActivity: [],
      isLoading: false,
      isLoaded: false,
      error: null,
      profileListenerUnsubscribe: null,
      authUnsubscribe: null,
    });
  },

  addCustomer: (customer) => {
    set((state) => ({
      customers: [...state.customers, customer],
    }));
  },

  updateCustomerInStore: (updatedCustomer) => {
    set((state) => ({
      customers: state.customers.map((c) =>
        c.id === updatedCustomer.id ? updatedCustomer : c
      ),
    }));
  },

  // ✅ Added: Remove customer by ID
  removeCustomer: (customerId) => {
    set((state) => ({
      customers: state.customers.filter((c) => c.id !== customerId),
    }));
  },

  addPrompt: (prompt) => {
    set((state) => ({
      prompts: [...state.prompts, prompt],
    }));
  },

  updatePromptInStore: (updatedPrompt) => {
    set((state) => ({
      prompts: state.prompts.map((p) =>
        p.id === updatedPrompt.id ? updatedPrompt : p
      ),
    }));
  },
}));

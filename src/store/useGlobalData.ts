// src/store/useGlobalStore.ts
import { create } from "zustand";

// ✅ Only import READ services (no create/update/delete)
import {
  fetchCustomers,
  fetchDashboardSummary,
  fetchRecentActivity,
} from "../services/dashboardServices";
import { fetchPrompts } from "../services/promptServices";
import { listenToUserProfile, fetchCurrentUser } from "../services/authServices";

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
  removePrompt: (promptId: string) => void;
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
      // Prefer authoritative profile from backend (protected endpoint) instead of localStorage.
      const token = localStorage.getItem("authToken");

      if (!token) {
        // Not authenticated on client side
        set({ isLoading: false });
        return;
      }

      // Fetch current user profile from backend. This ensures we use server-side data,
      // avoiding stale or incomplete objects stored in localStorage.
      const serverUser = await fetchCurrentUser();
      if (serverUser) {
        set({ userProfile: serverUser });

        // If we have a uid, start the profile polling to pick up server-side changes
        const uid = (serverUser as any).uid || (serverUser as any).id || null;
        if (uid) {
          const prev = get().profileListenerUnsubscribe;
          if (prev) prev();
          const unsub = listenToUserProfile(uid, (profile) => {
            set({ userProfile: profile ?? serverUser });
          });
          set({ profileListenerUnsubscribe: unsub });
        }
      } else {
        // fallback: try to use localStorage user if backend didn't return it
        const stored = localStorage.getItem("user");
        if (stored && stored !== "undefined" && stored !== "null") {
          try {
            const userObj = JSON.parse(stored) as Record<string, any>;
            set({ userProfile: userObj as UserProfile });
          } catch (e) {
            console.warn("Failed to parse stored user, clearing key", e);
            localStorage.removeItem("user");
          }
        }
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
      // If we add a customer manually (e.g., after create), mark data as loaded
      isLoaded: true,
      isLoading: false,
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

  // ✅ Remove a prompt by ID
  removePrompt: (promptId: string) => {
    set((state) => ({
      prompts: state.prompts.filter((p) => p.id !== promptId),
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

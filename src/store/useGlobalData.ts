// src/store/useGlobalStore.ts
import { create } from "zustand";
import { getAuth, onAuthStateChanged, type Unsubscribe } from "firebase/auth";

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

  profileListenerUnsubscribe: Unsubscribe | null;
  authUnsubscribe: Unsubscribe | null;

  // --- Actions ---
  initAuthListener: () => void;
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

  initAuthListener: () => {
    const currentAuthUnsub = get().authUnsubscribe;
    if (currentAuthUnsub) {
      currentAuthUnsub();
    }

    const auth = getAuth();
    const authUnsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        const profileUnsub = get().profileListenerUnsubscribe;
        if (profileUnsub) {
          profileUnsub();
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
          authUnsubscribe: get().authUnsubscribe,
        });
        return;
      }

      const uid = user.uid;
      const prevProfileUnsub = get().profileListenerUnsubscribe;
      if (prevProfileUnsub) {
        prevProfileUnsub();
      }

      const profileUnsub = listenToUserProfile(uid, (profile) => {
        set({ userProfile: profile });
      });
      set({ profileListenerUnsubscribe: profileUnsub });

      if (!get().isLoaded) {
        set({ isLoading: true, error: null });
        try {
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
          set({
            isLoading: false,
            error: "Failed to load application data.",
          });
        }
      } else {
        set({ isLoading: false });
      }
    });

    set({ authUnsubscribe });
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

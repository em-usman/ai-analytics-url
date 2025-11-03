import axios from "axios";
import type {
  StatData,
  Activity,
  Customer,
  DashboardSummaryStats,
} from "../types";


// --- Base API Configuration ---
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// --- Helper for Auth Headers ---

const getAuthHeaders = async () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("No auth token found. Please log in.");
  }
  // Force refresh if needed (optional: pass true to always get fresh token)
  // ← This auto-refreshes if expired!

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ============================================================================
// 🧩 CUSTOMER API
// ============================================================================

/**
 * Fetches all customers for the logged-in user.
 * Endpoint: GET /customers
 */
export const fetchCustomers = async (): Promise<Customer[]> => {
  try {
    const headers = await getAuthHeaders(); // ✅ wait for the promise to resolve
    const response = await axios.get(`${API_URL}/customers`, headers);
    return response.data;
  } catch (error) {
    console.error("API Error - fetchCustomers:", error);
    throw error;
  }
};

// ============================================================================
// 📊 DASHBOARD SUMMARY STATS API
// ============================================================================

/**
 * Fetches calculated dashboard summary statistics for the stat cards.
 * Endpoint: GET /dashboard/summary
 * Response:
 * {
 *   activeCustomers: number,
 *   analysesRun30d: number,
 *   reportsGenerated: number,
 *   promptsInLibrary: number
 * }
 */
export const fetchDashboardSummary =
  async (): Promise<DashboardSummaryStats> => {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.get(`${API_URL}/dashboard/summary`, headers);
      return response.data;
    } catch (error) {
      console.error("API Error - fetchDashboardSummary:", error);
      throw error;
    }
  };

// ============================================================================
// 🧠 RECENT ACTIVITY API
// ============================================================================

/**
 * Fetches recent analyses (activity feed) for the logged-in user.
 * Endpoint: GET /dashboard/analyses?limit=5
 */
export const fetchRecentActivity = async (
  limit: number = 5
): Promise<Activity[]> => {
  try {
    const headers = await getAuthHeaders();
    const url = `${API_URL}/dashboard/analyses?limit=${limit}`;
    const response = await axios.get(url, headers);
    return response.data;
  } catch (error) {
    console.error("API Error - fetchRecentActivity:", error);
    throw error;
  }
};

// ============================================================================
// 📈 (OPTIONAL) CUSTOMER ANALYSIS STATS
// ============================================================================

/**
 * Fetches customer analysis counts for dashboard stats (if used separately).
 * Endpoint: GET /stats/customer-analysis-counts
 */
export const fetchCustomerStats = async (): Promise<StatData[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/dashboard/summary`, headers);
    return response.data;
  } catch (error) {
    console.error("API Error - fetchCustomerStats:", error);
    throw error;
  }
};

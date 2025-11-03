// services/runAnalysisApi.js
import axios from "axios";
import type { RunAnalysisSuccessResponse } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// --- THIS IS THE FIX ---
// Helper to get authorization headers from localStorage
const getAuthHeaders = async () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("No auth token found. Please log in.");
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};
// --- END FIX ---

/**
 * Run an analysis for a customer with a specific prompt
 */
export const runAnalysisApi = async (
  // 1. Remove userId from arguments
  customerId: string,
  promptId: string,
  inputData: Record<string, any>,
  customPrompt?: { system: string; user: string }
): Promise<RunAnalysisSuccessResponse> => {
  try {
    // 2. Create payload *without* userId
    const payload = {
      customerId,
      promptId,
      inputData,
      customPrompt: customPrompt || null,
    };

    console.log("📤 Sending Payload to Backend:", payload);

    // 3. Add getAuthHeaders() to the axios call
    const headers = await getAuthHeaders();
    const res = await axios.post(
      `${API_URL}/api/analysis/run`, // Ensure this path is correct
      payload,
      headers
    );

    console.log("✅ Backend Response:", res.data);
    return res.data;
  } catch (err: any) {
    console.error("❌ Error running analysis:", err);
    throw new Error(
      err.response?.data?.error || "Failed to run analysis. Try again."
    );
  }
};

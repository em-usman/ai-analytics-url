import axios from "axios";
import type { Prompt, PromptUpdateData } from "../types"; // Import your types

// Get the API URL from your .env.local file
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// --- Helper Function to get Auth Token ---
// This reads the 'authToken' you saved in localStorage during login
const getAuthHeaders = async () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("No auth token found. Please log in.");
  }

  // ← This auto-refreshes if expired!

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// --- PROMPT API ---

/**
 * Calls your GET /prompts backend endpoint
 */
export const fetchPrompts = async (): Promise<Prompt[]> => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_URL}/prompts`, headers);
  // Returns the array of prompts from your controller
  return response.data;
};

/**
 * Calls your PUT /prompts/:id backend endpoint
 */
export const updatePrompt = async (
  promptId: string,
  data: PromptUpdateData
): Promise<Prompt> => {
  const headers = await getAuthHeaders();
  const response = await axios.put(
    `${API_URL}/prompts/${promptId}`,
    data,
    headers
  );
  // Returns the full updated prompt object from your controller
  return response.data;
};

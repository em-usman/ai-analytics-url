import axios from "axios";
import type { Customer, NewCustomerData, UpdateCustomerData } from "../types";
import { getAuth, getIdToken } from "firebase/auth";

// Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Helper to get authorization headers
const getAuthHeaders = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("No authenticated user. Please log in.");
  }

  // Force refresh if needed (optional: pass true to always get fresh token)
  const token = await getIdToken(user, true); // ← This auto-refreshes if expired!

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

/**
 * Fetches all customers for the logged-in user.
 * Calls: GET /customers
 */
export const fetchCustomers = async (): Promise<Customer[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/customers`, headers);
    return response.data;
  } catch (error) {
    console.error("API Error - fetchCustomers:", error);
    // Re-throw the error to be handled by the component
    throw error;
  }
};

/**
 * Creates a new customer.
 * Calls: POST /customers
 */
export const createCustomer = async (
  data: NewCustomerData
): Promise<Customer> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${API_URL}/customers`,
      data,
      headers
    );
    return response.data;
  } catch (error) {
    console.error("API Error - createCustomer:", error);
    throw error;
  }
};

/**
 * Updates an existing customer.
 * Calls: PUT /customers/:id
 */
export const updateCustomer = async (
  id: string,
  data: UpdateCustomerData
): Promise<Customer> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.put(
      `${API_URL}/customers/${id}`,
      data,
      headers
    );
    return response.data;
  } catch (error) {
    console.error("API Error - updateCustomer:", error);
    throw error;
  }
};

/**
 * Deletes a customer.
 * Calls: DELETE /customers/:id
 */
export const deleteCustomer = async (id: string): Promise<void> => {
  try {
    const headers = await getAuthHeaders();
    await axios.delete(`${API_URL}/customers/${id}`, headers);
  } catch (error) {
    console.error("API Error - deleteCustomer:", error);
    throw error;
  }
};

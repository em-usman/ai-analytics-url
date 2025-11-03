import axios from "axios";
import type {
  AuthSuccessResponse,
  AuthErrorResponse,
  RegisterData,
  LoginData,
  AuthResult,
  User as UserProfile,
} from "../types"; // Import your types

// Ensure ImportMetaEnv is available for Vite
/// <reference types="vite/client" />

// import { auth, db } from "../firebase/firebaseConfig";
// import { signInWithEmailAndPassword, signOut } from "firebase/auth";
// import { doc, onSnapshot } from "firebase/firestore";

// Get the API URL from environment variables
// Make sure to create a .env.local file with VITE_API_URL=http://localhost:5000
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

/**
 * Calls the backend API to register a new user.
 */
export const registerUser = async (data: RegisterData): Promise<AuthResult> => {
  try {
    // Call your POST /auth/signup endpoint
    const response = await axios.post<AuthSuccessResponse>(
      `${API_URL}/auth/signup`,
      data
    );

  // On success, your backend returns the token and user data
  const { idToken /*, user */ } = response.data;

  // Save only the token to local storage. The authoritative user profile
  // will be fetched from the backend via GET /auth/me to avoid stale data.
  localStorage.setItem("authToken", idToken);

    // Return a success object to the form
    return { success: true };
  } catch (error) {
    let message = "An unknown error occurred.";

    // Handle backend errors (e.g., "EMAIL_EXISTS")
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as AuthErrorResponse;
      message = errorData.error || "Signup failed. Please try again.";
    }

    // Return an error object to the form
    return { success: false, message: message };
  }
};

export const loginUser = async (data: LoginData): Promise<AuthResult> => {
  try {
    // --- THIS IS THE CRITICAL STEP ---
    // 1. Sign in the Firebase Client SDK first.
    // This tells `onAuthStateChanged` that the user is logged in.
    // await signInWithEmailAndPassword(auth, data.email, data.password);
    // --- END CRITICAL STEP ---

    // 2. Call your backend (this is for your API token)
    const response = await axios.post<AuthSuccessResponse>(
      `${API_URL}/auth/login`,
      data
    );

  const { idToken /*, user */ } = response.data;

  // Save only the token. The client will call GET /auth/me to fetch
  // the current profile from the backend and update the global store.
  localStorage.setItem("authToken", idToken);

    return { success: true };
  } catch (error: unknown) {
    let message = "An unknown error occurred.";

    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as AuthErrorResponse;
      message = errorData.error || "Login failed. Please try again.";
    } else if (error instanceof Error) {
      message = error.message;
    }

    return { success: false, message: message };
  }
};

export const listenToUserProfile = (
  uid: string,
  onProfileUpdate: (profile: UserProfile | null) => void,
  intervalMs = 5000
) => {
  if (!uid) {
    onProfileUpdate(null);
    return () => {};
  }

  let prevProfileJson: string | null = null;
  let stopped = false;

  const fetchProfile = async () => {
    if (stopped) return;
    try {
      // ✅ Use /auth/me instead of /users/:uid
      const resp = await axios.get<UserProfile>(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      const profile = resp.data;
      const json = JSON.stringify(profile);
      if (json !== prevProfileJson) {
        prevProfileJson = json;
        onProfileUpdate(profile);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      onProfileUpdate(null);
    }
  };

  fetchProfile(); // initial
  const handle = setInterval(fetchProfile, intervalMs);

  return () => {
    stopped = true;
    clearInterval(handle);
  };
};

// Fetch current user profile from backend using the stored auth token.
export const fetchCurrentUser = async (): Promise<UserProfile | null> => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) return null;

    const resp = await axios.get<UserProfile>(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return resp.data as UserProfile;
  } catch (err) {
    console.warn("fetchCurrentUser failed:", err);
    return null;
  }
};

export const signOutUser = async () => {
  try {
    const token = localStorage.getItem("authToken");
    // Optionally notify backend to invalidate session/token
    try {
      await axios.post(
        `${API_URL}/auth/logout`,
        {},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );
    } catch (e) {
      // ignore logout errors from backend, we will still clear client state
      console.warn("Backend logout failed (ignored):", e);
    }

    // Clear local storage
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error?.message };
  }
};

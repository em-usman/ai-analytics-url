import axios from "axios";
import type {
  AuthSuccessResponse,
  AuthErrorResponse,
  RegisterData,
  LoginData,
  AuthResult,
  User as UserProfile,
} from "../types"; // Import your types

import { auth, db } from "../firebase/firebaseConfig";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

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
    const { idToken, user } = response.data;

    // Save the token and user data to local storage
    localStorage.setItem("authToken", idToken);
    localStorage.setItem("user", JSON.stringify(user));

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
    await signInWithEmailAndPassword(auth, data.email, data.password);
    // --- END CRITICAL STEP ---

    // 2. Call your backend (this is for your API token)
    const response = await axios.post<AuthSuccessResponse>(
      `${API_URL}/auth/login`,
      data
    );

    const { idToken, user } = response.data;

    // 3. Save your API token and user data
    localStorage.setItem("authToken", idToken);
    localStorage.setItem("user", JSON.stringify(user));

    return { success: true };
  } catch (error: unknown) {
    let message = "An unknown error occurred.";

    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as AuthErrorResponse;
      message = errorData.error || "Login failed. Please try again.";
    } else if (error && typeof error === "object" && "code" in error) {
      const firebaseError = error as { code: string; message: string };
      if (
        firebaseError.code === "auth/user-not-found" ||
        firebaseError.code === "auth/wrong-password" ||
        firebaseError.code === "auth/invalid-credential"
      ) {
        message = "Invalid email or password.";
      } else {
        message = firebaseError.message;
      }
    } else if (error instanceof Error) {
      message = error.message;
    }

    return { success: false, message: message };
  }
};

export const listenToUserProfile = (
  uid: string,
  onProfileUpdate: (profile: UserProfile | null) => void
) => {
  const userDocRef = doc(db, "users", uid);

  console.log(`👀 Listening for user profile updates: ${uid}`);

  const unsubscribe = onSnapshot(
    userDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        console.log("✅ User profile updated:", data);
        onProfileUpdate(data);
      } else {
        console.warn("⚠️ No user document found for UID:", uid);
        onProfileUpdate(null);
      }
    },
    (error) => {
      console.error("❌ Error listening to user profile:", error);
      onProfileUpdate(null);
    }
  );

  return unsubscribe;
};


export const signOutUser = async () => {
  try {
    // Sign the user out of Firebase Authentication
    await signOut(auth);

    // [Crucial Step] Clear the token and user data from local storage
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

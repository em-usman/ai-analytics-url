/** Represents Firestore's Timestamp object structure. */
export interface FirebaseTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

// --- AUTH TYPES ---

/** Data from the SignupForm component. */
export interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/** Data sent to the backend registerUser API endpoint. */
export type RegisterData = Omit<FormData, "confirmPassword">;

/** Data from the SigninForm component. */
export interface LoginData {
  email: string;
  password: string;
}

/** Represents the user object stored in Firestore. */
export interface User {
  name: string;
  email: string;
  createdAt: FirebaseTimestamp; // Uses the utility type
}

/** Successful response from backend /auth routes. */
export interface AuthSuccessResponse {
  message: string;
  uid: string;
  idToken: string;
  user: User;
}

/** Error response from backend /auth routes. */
export interface AuthErrorResponse {
  error: string;
}

/** Result object returned from auth service functions to UI components. */
export interface AuthResult {
  success: boolean;
  message?: string;
}

// --- PROMPT TYPES ---

/** Represents a prompt document from Firestore/API. */
export interface Prompt {
  id: string;
  name: string;
  description: string;
  system_prompt: string;
  user_prompt: string;
  createdAt: FirebaseTimestamp; // Uses the utility type
  updatedAt?: FirebaseTimestamp; // Uses the utility type
}

/** Data sent when updating a prompt (PUT /prompts/:id). */
export interface PromptUpdateData {
  system_prompt: string;
  user_prompt: string;
}

// --- CUSTOMER TYPES ---

/** Represents a customer document from Firestore/API. */
export interface Customer {
  id: string;
  name: string;
  status: string;
  createdAt?: FirebaseTimestamp; // Uses the utility type
  updatedAt?: FirebaseTimestamp; // Uses the utility type
}

/** Data sent to create a new customer (POST /customers). */
export interface NewCustomerData {
  name: string;
  status?: string;
}

/** Data sent to update a customer (PUT /customers/:id). */
export interface UpdateCustomerData {
  name?: string;
  status?: string;
}

// --- DASHBOARD TYPES ---

/** Data structure for the statistics cards. */
export interface StatData {
  customerId: string;
  customerName: string;
  analysisCount: number;
}

export interface DashboardSummaryStats {
  activeCustomers: number;
  reportsGenerated: number;
  promptsInLibrary: number;
}

/** Represents a recent activity item (analysis document snippet for list view). */
export interface Activity {
  id: string; // analysisId
  timestamp: FirebaseTimestamp; // Uses the utility type
  promptId: string;
  customerId: string;
}

// --- ANALYSIS TYPES (NEW) ---

/** Represents the 'prompt_used' map stored within an analysis document. */
export interface PromptUsed {
  system: string;
  user: string; // This should contain the injected URL/data
}

/** Represents the 'input_data' map stored within an analysis document. */
export interface AnalysisInputData {
  target_url?: string; // For SWOT
  // Add other potential inputs like image_ref for AI Vision later
}

/** Represents the full analysis result document from Firestore. */
export interface AnalysisResult {
  id: string; // Document ID
  customerId: string;
  toolId: string;
  timestamp: FirebaseTimestamp;
  prompt_used: PromptUsed;
  input_data: AnalysisInputData;
  result_text: string;
  rating?: number | null; // Optional rating
  client_feedback?: string | null; // Optional feedback
}

/** Data structure for the request body of POST /analysis/swot endpoint. */
export interface RunSwotAnalysisPayload {
  customerId: string;
  target_url: string;
  custom_prompt?: {
    // Optional override
    system: string;
    user: string;
  };
}

/** Data structure for the successful response body of POST /analysis/swot endpoint. */
export interface RunAnalysisSuccessResponse {
  analysisId: string; // ID of the newly created analysis document
  result_text: string; // The generated text result
}

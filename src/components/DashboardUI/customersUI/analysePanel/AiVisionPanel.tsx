// import React, { useState } from "react";
// import { FaPlay, FaEdit, FaUpload } from "react-icons/fa";
// import type {
//   Customer,
//   Prompt,
//   RunAnalysisSuccessResponse,
// } from "../../../../types"; // Adjust path if needed
// import CustomizePromptModal from "../CustomizePromptModal"; // Adjust path if needed
// import { runAnalysisApi } from "../../../../services/runAnalysisApi"; // Adjust path if needed
// import { IconX } from "@tabler/icons-react";

// interface AiVisionPanelProps {
//   customer: Customer;
//   prompt: Prompt; // The prompt associated with AI Vision (e.g., prompt_vision)
// }

// const AiVisionPanel: React.FC<AiVisionPanelProps> = ({ customer, prompt }) => {
//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [imagePreview, setImagePreview] = useState<string | null>(null);
//   const [userPromptInput, setUserPromptInput] = useState(""); // User's specific question about the image
//   const [results, setResults] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
//   const [customPromptOverride, setCustomPromptOverride] = useState<{
//     system: string;
//     user: string;
//   } | null>(null);

//   // Handle image selection from file input
//   const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       if (file.size > 10 * 1024 * 1024) {
//         // 10MB Limit Check
//         setError("Image file size exceeds 10MB limit.");
//         return;
//       }
//       setImageFile(file);
//       setError(null); // Clear previous errors
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImagePreview(reader.result as string);
//       };
//       reader.readAsDataURL(file);
//     } else {
//       setImageFile(null);
//       setImagePreview(null);
//     }
//     // Clear results when image changes
//     setResults(null);
//   };

//   // Handle image drop
//   const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
//     event.preventDefault();
//     event.stopPropagation();
//     const file = event.dataTransfer.files?.[0];
//     if (file && file.type.startsWith("image/")) {
//       if (file.size > 10 * 1024 * 1024) {
//         // 10MB Limit Check
//         setError("Image file size exceeds 10MB limit.");
//         return;
//       }
//       setImageFile(file);
//       setError(null); // Clear previous errors
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImagePreview(reader.result as string);
//       };
//       reader.readAsDataURL(file);
//       // Clear results when image changes
//       setResults(null);
//     } else if (file) {
//       setError("Invalid file type. Please upload an image (PNG, JPG, WEBP).");
//     }
//   };

//   // Prevent default behavior for drag over
//   const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
//     event.preventDefault();
//     event.stopPropagation();
//   };

//   // --- API Call Logic ---
//   const handleRunAnalysis = async () => {
//     // Validation
//     if (!imageFile) {
//       setError("Please upload an image first.");
//       return;
//     }
//     if (!userPromptInput.trim()) {
//       setError(
//         "Please enter an analysis prompt (your question about the image)."
//       );
//       return;
//     }

//     setIsLoading(true);
//     setError(null);
//     setResults(null); // Clear previous results

//     try {
//       console.log(
//         "Running AI Vision for:",
//         customer.id,
//         "Image:",
//         imageFile.name,
//         "Prompt:",
//         userPromptInput
//       );
//       console.log("Using base prompt ID:", prompt.id);
//       console.log("Custom override:", customPromptOverride);

//       // Prepare input data specific to AI Vision for the backend
//       const inputData = { user_prompt: userPromptInput }; // This is the user's question

//       // Call the generic API service, passing the image file
//       const analysisResponse: RunAnalysisSuccessResponse = await runAnalysisApi(
//         customer.id,
//         "vision", // Tool ID for AI Vision
//         inputData,
//         imageFile, // Pass the image file
//         customPromptOverride // Pass override if it exists
//       );

//       // Display the result from the backend
//       setResults(analysisResponse.result_text);
//     } catch (err: any) {
//       // Display API error message from the service
//       setError(err.message || "Failed to run AI Vision analysis.");
//       console.error("Run AI Vision failed:", err);
//     } finally {
//       setIsLoading(false);
//       // Clear override *after* run attempt, successful or not
//       setCustomPromptOverride(null);
//     }
//   };

//   // --- Customize Modal Logic ---
//   const handleSaveCustomPromptAndRun = (
//     customSystem: string,
//     customUser: string
//   ) => {
//     setCustomPromptOverride({ system: customSystem, user: customUser });
//     setIsCustomizeModalOpen(false);
//     // Trigger run analysis immediately if inputs are ready
//     if (imageFile && userPromptInput) {
//       // Use setTimeout to ensure state update completes before API call
//       setTimeout(() => handleRunAnalysis(), 0);
//     } else {
//       // Update error state instead of alert
//       setError(
//         "Please upload an image and enter an analysis prompt before running with custom prompts."
//       );
//     }
//   };

//   return (
//     <div className="flex flex-col h-full bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
//       {/* Header */}
//       <div className="flex justify-between items-center p-4 border-b border-[var(--border-color)] flex-shrink-0">
//         <div>
//           <h2 className="text-xl font-bold">{prompt.name}</h2>
//           <p className="text-sm text-[var(--text-secondary)]">
//             {prompt.description}
//           </p>
//         </div>
//         {/* Customize Button */}
//         <button
//           onClick={() => setIsCustomizeModalOpen(true)}
//           className="flex items-center gap-1.5 px-3 py-1.5 hover: border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] rounded text-lg font-medium text-blue-500" // Ensure text color
//         >
//           <FaEdit className="h-3 w-3" />
//           Customize Prompts
//         </button>
//       </div>

//       {/* Content Area */}
//       <div className="flex-grow p-4 space-y-4 overflow-auto">
//         {/* Row for Upload and Prompt */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {/* 1. Upload Image */}
//           <div className="space-y-1">
//             <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
//               1. Upload Image <span className="text-red-500">*</span>
//             </label>

//             <div
//               onDrop={handleDrop}
//               onDragOver={handleDragOver}
//               className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-[var(--border-color)] border-dashed rounded-lg cursor-pointer bg-[var(--input-bg)] hover:bg-[var(--bg-tertiary)] transition-colors ${
//                 imagePreview ? "p-2" : ""
//               }`}
//             >
//               {imagePreview ? (
//                 <>
//                   <img
//                     src={imagePreview}
//                     alt="Upload preview"
//                     className="max-h-full max-w-full object-contain rounded"
//                   />

//                   {/* ❌ Cross button (top-right corner) */}
//                   <button
//                     type="button"
//                     onClick={(e) => {
//                       e.stopPropagation(); // stop event bubbling
//                       setImagePreview(null);
//                       setImageFile(null);
//                     }}
//                     className="absolute top-2 right-2 z-10 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition"
//                   >
//                     <IconX className="w-4 h-4" />
//                   </button>
//                 </>
//               ) : (
//                 <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
//                   <FaUpload className="w-8 h-8 mb-3 text-[var(--text-secondary)]" />
//                   <p className="mb-2 text-sm text-[var(--text-secondary)]">
//                     <span className="font-semibold">Click to upload</span> or
//                     drag & drop
//                   </p>
//                   <p className="text-xs text-[var(--text-secondary)]">
//                     PNG, JPG, WEBP (MAX. 10MB)
//                   </p>
//                 </div>
//               )}

//               <input
//                 id="dropzone-file"
//                 type="file"
//                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                 onChange={handleImageChange}
//                 accept="image/png, image/jpeg, image/webp"
//               />
//             </div>

//             {imageFile && (
//               <p className="text-xs text-[var(--text-secondary)] mt-1 truncate">
//                 Selected: {imageFile.name}
//               </p>
//             )}
//           </div>

//           {/* 2. Analysis Prompt */}
//           <div className="space-y-1">
//             <label
//               htmlFor="analysisPrompt"
//               className="block text-sm font-medium text-[var(--text-secondary)] mb-1"
//             >
//               2. Analysis Prompt <span className="text-red-500">*</span>
//             </label>
//             <textarea
//               id="analysisPrompt"
//               value={userPromptInput}
//               onChange={(e) => setUserPromptInput(e.target.value)}
//               rows={6} // Keep consistent height
//               placeholder="e.g., 'Analyze this ad creative for emotional sentiment and target audience...'"
//               required
//               className="w-full h-48 p-3 rounded bg-[var(--input-bg)] text-[var(--text-primary)] border border-[var(--border-color)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-hover)]" // resize-none
//             />
//           </div>
//         </div>

//         {/* Run Button */}
//         <button
//           onClick={handleRunAnalysis}
//           disabled={!imageFile || !userPromptInput || isLoading}
//           className="px-4 py-2 rounded bg-[var(--accent-active)] text-white disabled:opacity-50 flex items-center gap-2"
//         >
//           <FaPlay className="h-4 w-4" />
//           {isLoading ? "Running..." : "Run Analysis"}
//         </button>

//         {/* Error Display */}
//         {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

//         {/* Results */}
//         <div className="mt-4">
//           <h3 className="font-bold text-lg mb-2">Results</h3>
//           <div className="p-4 bg-[var(--bg-tertiary)] rounded min-h-[200px] w-full border border-[var(--border-color)] overflow-auto whitespace-pre-wrap">
//             {isLoading && (
//               <p className="text-[var(--text-secondary)]">
//                 Generating analysis...
//               </p>
//             )}
//             {/* Error is shown above */}
//             {results && <p className="text-[var(--text-primary)]">{results}</p>}
//             {!isLoading && !error && !results && (
//               <p className="text-[var(--text-secondary)]">
//                 Upload an image, enter a prompt, and click 'Run Analysis'.
//                 Results will appear here.
//               </p>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Customize Prompt Modal */}
//       <CustomizePromptModal
//         isOpen={isCustomizeModalOpen}
//         onClose={() => setIsCustomizeModalOpen(false)}
//         initialSystemPrompt={prompt.system_prompt}
//         initialUserPrompt={prompt.user_prompt} // Pass the BASE user prompt template
//         onSaveAndRun={handleSaveCustomPromptAndRun}
//       />
//     </div>
//   );
// };

// export default AiVisionPanel;

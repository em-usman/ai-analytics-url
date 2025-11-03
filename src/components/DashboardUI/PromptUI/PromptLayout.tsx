import React, { useState, useEffect } from "react";
import PromptList from "./PromptList";
import PromptModal from "./PromptModal";
import PromptEditorPanel from "./PromptEditorPanel";
import type { Prompt, PromptUpdateData } from "../../../types";
import { useGlobalData } from "../../../store/useGlobalData";
import { useShallow } from "zustand/shallow";

// --- Helper Components (moved up for clarity)
const WelcomePlaceholder = () => (
  <div className="flex flex-col items-center justify-center h-full text-center px-4">
    <div className="p-8 border-2 border-dashed rounded-lg border-[var(--border-color)]">
      <h2 className="mt-4 text-2xl font-bold text-[var(--text-primary)]">
        Welcome to the Prompt Library
      </h2>
      <p className="mt-2 text-[var(--text-secondary)]">
        Select a prompt on the left to read and update.
      </p>
    </div>
  </div>
);

// --- Main Component
const AppLayout: React.FC = () => {
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const {
    prompts,
    isLoading,
    error: fetchError,
  } = useGlobalData(
    useShallow((state) => ({
      prompts: state.prompts,
      isLoading: state.isLoading,
      error: state.error,
    }))
  );

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSavePrompt = async (promptId: string, data: PromptUpdateData) => {
    try {
      const { updatePrompt } = await import("../../../services/promptServices");
      const updatedPrompt = await updatePrompt(promptId, data);

      // ✅ Safe: get fresh store state at time of update
      useGlobalData.getState().updatePromptInStore(updatedPrompt);

      setToast({ message: "Prompt saved successfully!", type: "success" });
      return true;
    } catch (err) {
      console.error("Error saving prompt:", err);
      setToast({ message: "Failed to save prompt.", type: "error" });
      return false;
    }
  };

  // Modal state for creating prompt
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreatePrompt = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreatePromptSubmit = async (data: {
    name: string;
    description: string;
    system_prompt: string;
    user_prompt: string;
  }) => {
    try {
      const { createPrompt } = await import("../../../services/promptServices");
      const created = await createPrompt(data);
      useGlobalData.getState().addPrompt(created);
      setSelectedPromptId(created.id);
      setToast({ message: "Prompt created", type: "success" });
      setIsCreateModalOpen(false);
      return true;
    } catch (err) {
      console.error("Create prompt failed:", err);
      setToast({ message: "Failed to create prompt.", type: "error" });
      return false;
    }
  };

  const handleDeletePrompt = async (promptToDelete: Prompt) => {
    try {
      const { deletePrompt } = await import("../../../services/promptServices");
      await deletePrompt(promptToDelete.id);

      useGlobalData.getState().removePrompt(promptToDelete.id);
      setSelectedPromptId(null);
      setToast({ message: "Prompt deleted", type: "success" });
      return true;
    } catch (err) {
      console.error("Delete prompt error:", err);
      setToast({ message: "Failed to delete prompt.", type: "error" });
      return false;
    }
  };

  const selectedPrompt = prompts.find((p) => p.id === selectedPromptId);

  // ✅ Edit handler (opens editor — already selected, so no-op or focus)
  const handleEditPrompt = (prompt: Prompt) => {
    setSelectedPromptId(prompt.id);
    // Optional: scroll to editor or focus a field
  };

  return (
    <div className="flex h-full w-full bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-md shadow-lg font-medium text-white ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Desktop: two panels */}
      <div className="hidden lg:flex h-full w-full">
        <div className="w-80 flex-shrink-0 h-full border-r border-[var(--border-color)]">
          <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border-color)]">
            <h2 className="text-lg font-semibold pt-1">Prompt Library</h2>
            <button
              onClick={handleCreatePrompt}
              className="text-sm px-2 py-1 rounded bg-[var(--accent)] text-[var(--accent-active)] hover:bg-[var(--accent-hover)]"
            >
              + New
            </button>
          </div>
          <PromptList
            prompts={prompts}
            selectedPromptId={selectedPromptId}
            onSelectPrompt={setSelectedPromptId}
            onEditPrompt={handleEditPrompt}
            onDeletePrompt={handleDeletePrompt}
            error={fetchError}
            loading={isLoading}
          />
        </div>
        <div className="flex-grow h-full overflow-hidden">
          {selectedPrompt ? (
            <PromptEditorPanel
              key={selectedPrompt.id}
              prompt={selectedPrompt}
              onSavePrompt={handleSavePrompt}
              onDeletePrompt={() => handleDeletePrompt(selectedPrompt)}
            />
          ) : (
            <WelcomePlaceholder />
          )}
        </div>
        {/* Create Prompt Modal */}
        <PromptModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          mode="create"
          onSubmit={handleCreatePromptSubmit}
        />
      </div>

      {/* Mobile/Tablet: single panel, switch view */}
      <div className="flex flex-col h-full w-full lg:hidden">
        {!selectedPrompt ? (
          <>
            <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border-color)]">
              <h2 className="text-lg font-semibold pt-1">Prompt Library</h2>
              <button
                onClick={handleCreatePrompt}
                className="text-sm px-2 py-1 rounded bg-blue-600 text-white "
              >
                + New
              </button>
            </div>
            <PromptList
              prompts={prompts}
              selectedPromptId={selectedPromptId}
              onSelectPrompt={setSelectedPromptId}
              onEditPrompt={handleEditPrompt}
              onDeletePrompt={handleDeletePrompt}
              error={fetchError}
              loading={isLoading}
            />
            <PromptModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              mode="create"
              onSubmit={handleCreatePromptSubmit}
            />
          </>
        ) : (
          <div className="flex flex-col h-full w-full">
            <div className="px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
              <p
                className="text-blue-600 text-sm font-medium cursor-pointer hover:underline"
                onClick={() => setSelectedPromptId(null)}
              >
                ← Back to Prompts
              </p>
            </div>
            <div className="flex-grow min-h-0 overflow-auto">
              <PromptEditorPanel
                prompt={selectedPrompt}
                onSavePrompt={handleSavePrompt}
                onDeletePrompt={() => handleDeletePrompt(selectedPrompt)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppLayout;

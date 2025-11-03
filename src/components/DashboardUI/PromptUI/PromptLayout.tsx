import React, { useState, useEffect } from "react";
import PromptList from "./PromptList";
import PromptEditorPanel from "./PromptEditorPanel";
import { updatePrompt } from "../../../services/promptServices";
import type { PromptUpdateData } from "../../../types";
import { useGlobalData } from "../../../store/useGlobalData";
import { useShallow } from "zustand/shallow";

const AppLayout: React.FC = () => {
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Get prompts from global store
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
      const updatedPrompt = await updatePrompt(promptId, data);

      //Optimistically update via store action
      const updatePromptInStore = useGlobalData.getState().updatePromptInStore;
      updatePromptInStore(updatedPrompt);

      setToast({ message: "Prompt saved successfully!", type: "success" });
      return true;
    } catch (err) {
      console.error("Error saving prompt:", err);
      setToast({ message: "Failed to save prompt.", type: "error" });
      return false;
    }
  };

  const selectedPrompt = prompts.find((p) => p.id === selectedPromptId);

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

      {/* Desktop */}
      <div className="hidden lg:flex h-full w-full">
        <div className="w-80 flex-shrink-0 h-full border-r border-[var(--border-color)]">
          <PromptList
            prompts={prompts}
            selectedPromptId={selectedPromptId}
            onSelectPrompt={setSelectedPromptId}
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
            />
          ) : (
            <WelcomePlaceholder />
          )}
        </div>
      </div>

      {/* Tablet */}
      <div className="hidden md:flex lg:hidden h-full w-full flex-col">
        {!selectedPrompt ? (
          <PromptList
            prompts={prompts}
            selectedPromptId={selectedPromptId}
            onSelectPrompt={setSelectedPromptId}
            error={fetchError}
            loading={isLoading}
          />
        ) : (
          <div className="flex flex-col h-full w-full">
            <PanelHeader
              title={selectedPrompt.name}
              onBack={() => setSelectedPromptId(null)}
              backText="Back to Prompts"
            />
            <div className="flex-grow min-h-0 overflow-auto">
              <PromptEditorPanel
                prompt={selectedPrompt}
                onSavePrompt={handleSavePrompt}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile */}
      <div className="flex md:hidden h-full w-full flex-col">
        {!selectedPrompt ? (
          <PromptList
            prompts={prompts}
            selectedPromptId={selectedPromptId}
            onSelectPrompt={setSelectedPromptId}
            error={fetchError}
            loading={isLoading}
          />
        ) : (
          <div className="flex flex-col h-full w-full">
            <PanelHeader
              title={selectedPrompt.name}
              onBack={() => setSelectedPromptId(null)}
              backText="Back to Prompts"
            />
            <div className="flex-grow min-h-0 overflow-auto">
              <PromptEditorPanel
                prompt={selectedPrompt}
                onSavePrompt={handleSavePrompt}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Helper Components
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

const PanelHeader = ({ onBack, backText }: any) => (
  <div className="h-12 flex items-center px-4 bg-[var(--bg-primary)] flex-shrink-0">
    <button
      className="flex items-center gap-2 text-blue-700 text-lg"
      onClick={onBack}
    >
      <span>←</span>
      <span>{backText}</span>
    </button>
  </div>
);

export default AppLayout;

import React, { useState, useEffect } from "react";
import { FaSave } from "react-icons/fa"; 
import type { Prompt, PromptUpdateData } from "../../../types";
import Spinner from "../../ui/spinner";

interface PromptEditorPanelProps {
  prompt: Prompt;
  onSavePrompt: (promptId: string, data: PromptUpdateData) => Promise<boolean>; // Make it return a promise
}

const PromptEditorPanel: React.FC<PromptEditorPanelProps> = ({
  prompt,
  onSavePrompt,
}) => {
  // Local state for the text areas
  const [systemPrompt, setSystemPrompt] = useState(prompt.system_prompt);
  const [userPrompt, setUserPrompt] = useState(prompt.user_prompt);

  // State to track unsaved changes
  const [isDirty, setIsDirty] = useState(false);
  // State to show loading spinner on save
  const [isSaving, setIsSaving] = useState(false);

  // Effect to update local state if the selected prompt (prop) changes
  useEffect(() => {
    setSystemPrompt(prompt.system_prompt);
    setUserPrompt(prompt.user_prompt);
    setIsDirty(false); // Reset dirty state when prop changes
  }, [prompt]);

  // Handle changes to text areas
  const handleSystemChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSystemPrompt(e.target.value);
    setIsDirty(true);
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserPrompt(e.target.value);
    setIsDirty(true);
  };

  // Handle the save button click
  const handleSave = async () => {
    setIsSaving(true);
    const success = await onSavePrompt(prompt.id, {
      system_prompt: systemPrompt,
      user_prompt: userPrompt,
    });

    if (success) {
      setIsDirty(false); // Reset dirty state only on success
    }
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
      {/* Header Section - Fixed */}
      <div className="flex-shrink-0 flex justify-between items-center px-4 py-4 border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
        <h2 className="text-xl font-bold truncate">Prompts: {prompt.name}</h2>
        <button
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          className="flex-shrink-0 px-3 py-1 rounded text-xl flex items-center gap-1
             bg-[var(--accent)] text-[var(--accent-active)]
             hover:bg-[var(--accent-hover)]
             disabled:bg-[var(--border-color)] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Spinner
                size="sm"
                className="border-[var(--accent-active)] border-t-transparent"
              />
              Saving...
            </>
          ) : (
            <>
              <FaSave className="h-5 w-5" />
              Save
            </>
          )}
        </button>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-grow min-h-0 overflow-auto">
        <div className="p-4 space-y-6 max-w-full">
          {/* System Instruction */}
          <div className="space-y-2">
            <label className="block text-lg font-medium">
              System Instruction (Persona)
            </label>
            <textarea
              value={systemPrompt}
              onChange={handleSystemChange}
              placeholder="Enter system instruction..."
              className="w-full max-w-full p-3 rounded bg-[var(--input-bg)] text-[var(--text-primary)] border border-[var(--border-color)] resize-y focus:outline-none focus:ring-2 focus:ring-[var(--accent-hover)]"
              rows={6}
            />
          </div>

          {/* User Prompt Template */}
          <div className="space-y-2">
            <label className="block text-lg font-medium">
              User Prompt (Task)
            </label>
            <textarea
              value={userPrompt}
              onChange={handleUserChange}
              placeholder="Enter user prompt template..."
              className="w-full max-w-full p-3 rounded bg-[var(--input-bg)] text-[var(--text-primary)] border border-[var(--border-color)] resize-y focus:outline-none focus:ring-2 focus:ring-[var(--accent-hover)]"
              rows={6}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptEditorPanel;

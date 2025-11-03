import React, { useState } from "react";

interface CustomizePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemPrompt: string;
  userPrompt: string;
  onSaveAndRun: (systemPrompt: string, userPrompt: string) => void;
}

const CustomizePromptModal: React.FC<CustomizePromptModalProps> = ({
  isOpen,
  onClose,
  onSaveAndRun,
}) => {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [userPrompt, setUserPrompt] = useState("");

  const handleSaveClick = () => {
    onSaveAndRun(systemPrompt, userPrompt);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-[var(--bg-secondary)] p-6 rounded-lg shadow-xl w-full max-w-2xl border border-[var(--border-color)] max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Customize Prompts for this Run
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-2xl"
          >
            &times;
          </button>
        </div>

        <p className="text-sm text-[var(--text-secondary)] mb-4 flex-shrink-0">
          These changes will override the master prompt for this analysis only.
          They will not be saved to the Prompt Library.
        </p>

        {/* Scrollable Form Area */}
        <div className="space-y-4 overflow-y-auto flex-grow pr-2">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              System Instruction (Persona)
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 bg-[var(--input-bg)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-hover)] resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              User Prompt (Task)
            </label>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 bg-[var(--input-bg)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-hover)] resize-y"
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 pt-4 flex-shrink-0 border-t border-[var(--border-color)] mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded  hover:bg-[var(--accent-hover)] text-[var(--text-primary)] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveClick}
            className="px-4 py-2 rounded bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white disabled:opacity-50 flex items-center gap-2"
          >
            <button
              type="button"
              onClick={handleSaveClick}
              disabled={!systemPrompt.trim() || !userPrompt.trim()}
              className={`px-1 py-1 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white flex items-center gap-2 ${
                !systemPrompt.trim() || !userPrompt.trim()
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              Save & Run Analysis
            </button>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomizePromptModal;

import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit } from "react-icons/fa";
import type { Prompt } from "../../../types";

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  prompt?: Prompt;
  onSubmit: (data: {
    name: string;
    description: string;
    system_prompt: string;
    user_prompt: string;
  }) => Promise<boolean>;
}

const PromptModal: React.FC<PromptModalProps> = ({
  isOpen,
  onClose,
  mode,
  prompt,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && prompt) {
        setName(prompt.name);
        setDescription(prompt.description || "");
        setSystemPrompt(prompt.system_prompt);
        setUserPrompt(prompt.user_prompt);
      } else {
        setName("");
        setDescription("");
        setSystemPrompt("");
        setUserPrompt("");
      }
      setError(null);
      setIsSaving(false);
    }
  }, [isOpen, mode, prompt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !systemPrompt.trim() || !userPrompt.trim()) {
      setError("Name, System Prompt, and User Prompt are required.");
      return;
    }
    setError(null);
    setIsSaving(true);
    const success = await onSubmit({
      name,
      description,
      system_prompt: systemPrompt,
      user_prompt: userPrompt,
    });
    setIsSaving(false);
    if (success) {
      onClose();
    } else {
      setError(
        mode === "edit"
          ? "Failed to update prompt. Please try again."
          : "Failed to add prompt. Please try again."
      );
    }
  };

  if (!isOpen) return null;

  const title = mode === "edit" ? "Edit Prompt" : "Add New Prompt";
  const submitText = isSaving
    ? "Saving..."
    : mode === "edit"
    ? "Save Changes"
    : "Add Prompt";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-[var(--bg-secondary)] p-6 rounded-lg shadow-xl w-full max-w-md border border-[var(--border-color)]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-2xl"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Prompt Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-[var(--input-bg)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-hover)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--input-bg)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-hover)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              System Prompt <span className="text-red-500">*</span>
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              required
              rows={3}
              className="w-full px-3 py-2 bg-[var(--input-bg)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-hover)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              User Prompt <span className="text-red-500">*</span>
            </label>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              required
              rows={3}
              className="w-full px-3 py-2 bg-[var(--input-bg)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-hover)]"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded bg-[var(--bg-tertiary)] hover:bg-[var(--bg-quaternary)] text-[var(--text-primary)] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim() || !systemPrompt.trim() || !userPrompt.trim()}
              className="px-4 py-2 rounded bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white disabled:opacity-50 flex items-center gap-2"
            >
              {mode === "edit" ? (
                <FaEdit className="h-4 w-4" />
              ) : (
                <FaPlus className="h-4 w-4" />
              )}
              {submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromptModal;

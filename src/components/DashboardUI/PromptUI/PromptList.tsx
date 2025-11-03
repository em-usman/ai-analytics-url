import React, { useState } from "react";
import { FaEllipsisV } from "react-icons/fa";
// import { useGlobalData } from "../../../store/useGlobalData"; // adjust path as needed
import type { Prompt } from "../../../types"; // adjust as needed

type PromptListProps = {
  prompts: Prompt[];
  selectedPromptId: string | null;
  onSelectPrompt: (id: string) => void;
  error: string | null;
  loading: boolean;
  onEditPrompt: (prompt: Prompt) => void;
  onDeletePrompt: (prompt: Prompt) => void;
};

const PromptList: React.FC<PromptListProps> = ({
  prompts,
  selectedPromptId,
  onSelectPrompt,
  error,
  loading,
  onEditPrompt,
  onDeletePrompt,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [confirmDeletePrompt, setConfirmDeletePrompt] = useState<Prompt | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 🔸 Removed global menuRef and outside click handler
  //   → Simpler and avoids ref conflicts

  const filteredPrompts: Prompt[] = !error
    ? (prompts || [])
        .filter(
          (prompt): prompt is Prompt =>
            prompt != null &&
            typeof prompt.name === "string" &&
            typeof prompt.id === "string"
        )
        .filter((prompt) =>
          prompt.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
    : [];

  const SkeletonPromptItem = () => (
    <div className="px-2 py-2 mb-1">
      <div className="h-4 bg-[var(--bg-primary)] rounded w-3/4 mb-2 animate-pulse"></div>
      <div className="h-3 bg-[var(--bg-primary)] rounded w-1/2 animate-pulse"></div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[var(--bg-secondary)] text-[var(--text-primary)]">
      <div className="px-2 py-2">
        <input
          type="text"
          placeholder="Search prompts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={loading || !!error}
          className="w-full px-2 py-2 text-sm bg-[var(--input-bg)] text-[var(--text-primary)] placeholder-gray-500 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-active)] focus:border-transparent disabled:bg-[var(--bg-secondary)] disabled:cursor-not-allowed"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {error ? (
          <div className="px-3 py-3 text-red-500 text-sm text-center">
            <p className="font-medium">Failed to load prompts</p>
            <p className="mt-1 text-sm opacity-80">{error}</p>
          </div>
        ) : loading ? (
          // ✅ Show skeleton only when loading
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <SkeletonPromptItem key={i} />
            ))}
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="px-3 py-3 text-[var(--text-secondary)] text-sm">
            No prompts found.
          </div>
        ) : (
          filteredPrompts.map((prompt) => {
            const isSelected = selectedPromptId === prompt.id;
            return (
              <div
                key={prompt.id}
                className={`flex items-center justify-between px-2 py-2 mb-1 rounded-lg cursor-pointer transition-all relative ${
                  isSelected
                    ? "bg-[var(--accent-active)]"
                    : "hover:bg-[var(--accent-hover)]"
                }`}
                onClick={() => onSelectPrompt(prompt.id)}
                title={prompt.description}
              >
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-[var(--text-primary)] text-sm block">
                    {prompt.name}
                  </span>
                  <p className="text-xs text-[var(--text-secondary)] truncate">
                    {prompt.description}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === prompt.id ? null : prompt.id);
                  }}
                  className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                  aria-label="Prompt actions"
                >
                  <FaEllipsisV className="h-4 w-4" />
                </button>

                {openMenuId === prompt.id && (
                  <div
                    className="absolute right-0 top-full mt-1 z-10 w-32 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-md shadow-lg"
                    onClick={(e) => e.stopPropagation()} // prevent prompt selection
                  >
                    <button
                      onClick={() => {
                        onEditPrompt(prompt);
                        setOpenMenuId(null);
                      }}
                      className="block w-full text-left px-3 py-2 text-sm hover:bg-[var(--bg-tertiary)] rounded-t-md"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setConfirmDeletePrompt(prompt);
                        setOpenMenuId(null);
                      }}
                      className="block w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-[var(--bg-tertiary)] rounded-b-md"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      {/* Confirm Delete Modal */}
      {confirmDeletePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-[var(--bg-secondary)] p-6 rounded-lg shadow-xl w-full max-w-xs border border-[var(--border-color)]">
            <h2 className="text-lg font-semibold mb-3 text-[var(--text-primary)]">
              Confirm Delete
            </h2>
            <p className="mb-4 text-[var(--text-secondary)] text-sm">
              Are you sure you want to delete the prompt{" "}
              <span className="font-bold">{confirmDeletePrompt.name}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded bg-[var(--bg-tertiary)] hover:bg-[var(--bg-quaternary)] text-[var(--text-primary)]"
                onClick={() => setConfirmDeletePrompt(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                onClick={async () => {
                  setIsDeleting(true);
                  await onDeletePrompt(confirmDeletePrompt);
                  setIsDeleting(false);
                  setConfirmDeletePrompt(null);
                }}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="loader spinner-border spinner-border-sm"></span>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptList;

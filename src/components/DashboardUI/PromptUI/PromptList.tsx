import React, { useState } from "react";
import type { Prompt } from "../../../types";
import { useGlobalData } from "../../../store/useGlobalData";

interface PromptListProps {
  prompts: Prompt[];
  selectedPromptId: string | null;
  onSelectPrompt: (id: string) => void;
  error: string | null;
  loading: boolean;
}

const PromptList: React.FC<PromptListProps> = ({
  prompts,
  selectedPromptId,
  onSelectPrompt,
  error,
  loading,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const isLoaded = useGlobalData((state) => state.isLoaded);

  const filteredPrompts =
    !loading && !error
      ? (prompts || [])
          .filter((prompt) => prompt && typeof prompt.name === "string")
          .filter((prompt) =>
            prompt.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
      : [];

  // Skeleton item component
  const SkeletonPromptItem = () => (
    <div className="px-2 py-2 mb-1">
      <div className="h-4 bg-[var(--bg-primary)] rounded w-3/4 mb-2 animate-pulse"></div>
      <div className="h-3 bg-[var(--bg-primary)] rounded w-1/2 animate-pulse"></div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[var(--bg-secondary)] text-[var(--text-primary)]">
      <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border-color)]">
        <h2 className="text-lg font-semibold pt-1">Prompt Library</h2>
      </div>

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
            <p className="font-medium mt-1">Failed to load prompts</p>
            <p className="mt-1 text-sm opacity-80">{error}</p>
          </div>
        ) : !isLoaded ? (
          // Skeleton loader while data is loading
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
          filteredPrompts.map((prompt) => (
            <div
              key={prompt.id}
              onClick={() => onSelectPrompt(prompt.id)}
              title={prompt.description}
              className={`px-2 py-2 mb-1 rounded-lg cursor-pointer transition-all ${
                selectedPromptId === prompt.id
                  ? "bg-[var(--accent-active)]"
                  : "hover:bg-[var(--accent-hover)]"
              }`}
            >
              <span className="font-medium text-[var(--text-primary)] text-sm block">
                {prompt.name}
              </span>
              <p className="text-xs text-[var(--text-secondary)] truncate whitespace-nowrap overflow-hidden">
                {prompt.description}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PromptList;

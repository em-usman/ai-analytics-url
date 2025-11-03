// src/components/analysis/common/AnalysisPanelLayout.tsx
import React, { useState } from "react";
import { FaEdit } from "react-icons/fa";
import CustomizePromptModal from "../CustomizePromptModal";
import type { Prompt } from "../../../../types";

interface AnalysisPanelLayoutProps {
  prompt: Prompt;
  onRunWithCustomPrompt: (systemPrompt: string, userPrompt: string) => void;
  children: React.ReactNode; // each tool’s input area
}

const AnalysisPanelLayout: React.FC<AnalysisPanelLayoutProps> = ({
  prompt,
  onRunWithCustomPrompt,
  children,
}) => {
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-[var(--border-color)] flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold">{prompt.name}</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            {prompt.description}
          </p>
        </div>
        <button
          onClick={() => setIsCustomizeModalOpen(true)}
          className="flex items-center gap-1.5 px-2 py-1 text-sm border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] rounded font-medium text-blue-500 md:px-3 md:py-1.5 md:text-base"
        >
          <FaEdit className="h-5 w-5" />
          <span className="hidden sm:inline">Customize Prompts</span>
        </button>
      </div>

      {/* Children (tool-specific input UI) */}
      <div className="flex-grow p-4 overflow-auto">{children}</div>

      {/* Customize Prompt Modal */}
      <CustomizePromptModal
        isOpen={isCustomizeModalOpen}
        onClose={() => setIsCustomizeModalOpen(false)}
        systemPrompt={prompt.system_prompt} // <-- updated
        userPrompt={prompt.user_prompt}
        onSaveAndRun={(systemPrompt, userPrompt) => {
          setIsCustomizeModalOpen(false);
          onRunWithCustomPrompt(systemPrompt, userPrompt);
        }}
      />
    </div>
  );
};

export default AnalysisPanelLayout;

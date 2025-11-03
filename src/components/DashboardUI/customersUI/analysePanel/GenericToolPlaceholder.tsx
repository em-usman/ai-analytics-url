import React from "react";

interface GenericToolPlaceholderProps {
  toolName: string;
}

const GenericToolPlaceholder: React.FC<GenericToolPlaceholderProps> = ({
  toolName,
}) => {
  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-color)] flex-shrink-0">
        <h2 className="text-xl font-bold">Tool: {toolName}</h2>
        {/* Optional: Add a short description if available */}
      </div>

      {/* Content Area */}
      <div className="flex-grow p-4 flex items-center justify-center text-center">
        <p className="text-lg text-[var(--text-secondary)]">
          Workspace coming soon.
        </p>
      </div>
    </div>
  );
};

export default GenericToolPlaceholder;

import React from "react";
import { FaArrowLeft } from "react-icons/fa";

// Define the Tool type
interface Tool {
  id: string;
  name: string;
  icon: React.ReactNode; // Use ReactNode to accept JSX elements
  promptId: string;
}

interface ToolListPanelProps {
  customerName: string | undefined;
  tools: Tool[]; // Use the corrected Tool type
  selectedToolId: string | null; // Keep track of selection for potential future use (like focusing)
  onBack: () => void;
  onSelectTool: (toolId: string) => void;
}

const ToolListPanel: React.FC<ToolListPanelProps> = ({
  customerName,
  tools,
  // selectedToolId, // Keep prop even if not visually changing background
  onBack,
  onSelectTool,
}) => {
  return (
    <div className="flex flex-col h-full bg-[var(--bg-secondary)] text-[var(--text-primary)] border-r border-[var(--border-color)]">
      {/* Header */}
      <div className="px-4 py-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-blue-500 transition-colors"
            aria-label="Back to customers"
          >
            <FaArrowLeft className="h-4 w-4" />
            <span>back to customers</span>
          </button>
        </div>
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1 truncate">
          {customerName || "Select Customer"}
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">Analysis Tools</p>
      </div>

      {/* Tool List */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          {tools.map((tool) => {
            // isSelected is no longer used for background styling
            // const isSelected = selectedToolId === tool.id;
            return (
              <div
                key={tool.id}
                onClick={() => onSelectTool(tool.id)}
                // Apply hover effect directly, remove active background logic
                className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer hover:bg-[var(--accent-hover)] transition-colors group`}
              >
                {/* Icon */}
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-[var(--text-primary)] text-lg">
                  {tool.icon}
                </span>
                {/* Name */}
                <div className="flex-1 min-w-0">
                  <h4
                    className={`font-medium text-sm text-[var(--text-primary)] group-hover:text-[var(--text-primary)]`}
                  >
                    {" "}
                    {/* Removed conditional text color based on isSelected */}
                    {tool.name}
                  </h4>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ToolListPanel;

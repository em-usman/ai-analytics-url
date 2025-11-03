import React from "react";
import SelectCustomerPlaceholder from "./SelectCustomerPlaceholder";
import SelectToolPlaceholder from "./SelectToolPlaceholder";
import SwotAnalysisPanel from "../customersUI/analysePanel/SwotAnalysisPanel";
// import AiVisionPanel  from "../customersUI/analysePanel/AiVisionPanel"; // Import the AI Vision panel
import GenericToolPlaceholder from "../customersUI/analysePanel/GenericToolPlaceholder"; // Import the generic placeholder
import type { Customer, Prompt } from "../../../types"; // Adjust path if needed

interface MainPanelProps {
  selectedCustomer: Customer | undefined;
  selectedToolId: string | null;
  selectedToolName: string | undefined; // Pass tool name for placeholder
  selectedPrompt: Prompt | undefined; // Pass the prompt for tool panels
  // Add props needed by tool panels, e.g., onRunAnalysis
}

const MainPanel: React.FC<MainPanelProps> = ({
  selectedCustomer,
  selectedToolId,
  selectedToolName,
  selectedPrompt,
  // ... other props
}) => {
  // 1. No Customer Selected
  if (!selectedCustomer) {
    return <SelectCustomerPlaceholder />;
  }

  // 2. Customer Selected, No Tool Selected
  if (!selectedToolId) {
    return <SelectToolPlaceholder />;
  }

  // 3. Customer and Tool Selected - Check for required prompt data
  if (
    !selectedPrompt &&
    (selectedToolId === "swot" || selectedToolId === "vision")
  ) {
    // Show loading/error only for tools that NEED prompt data immediately
    return (
      <div className="p-4 text-center text-orange-500">
        Loading prompt data or prompt not found for this tool...
      </div>
    );
  }

  // 4. Render specific tool panel or generic placeholder

  
  switch (selectedToolId) {
    case "swot":
      // Render SWOT panel only if prompt data is available
      return selectedPrompt ? (
        <SwotAnalysisPanel
          customer={selectedCustomer}
          prompt={selectedPrompt}
          // Pass necessary functions like onRunSwotAnalysis
        />
      ) : null;

    // Use the ID from your TOOLS array
    // case "vision":
    //   // Render AI Vision panel only if prompt data is available
    //   return selectedPrompt ? (
    //     <AiVisionPanel
    //       customer={selectedCustomer}
    //       prompt={selectedPrompt}
    //       // Pass necessary functions like onRunVisionAnalysis
    //     />
    //   ) : null; 
    //   // Or a specific loading/error for this panel

    // Or a specific loading/error for this panel

    // For all other tools, show the generic placeholder
    default:
      return (
        <GenericToolPlaceholder
          toolName={selectedToolName || selectedToolId} // Use name if available, else ID
        />
      );
  }
};

export default MainPanel;

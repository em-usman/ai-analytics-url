import React, { useState } from "react";
import { FaPlay } from "react-icons/fa";
import { runAnalysisApi } from "../../../../services/runAnalysisApi";
import AnalysisPanelLayout from "../customerComponents/AnalysePanelLayout";
import type {
  Customer,
  Prompt,
  RunAnalysisSuccessResponse,
} from "../../../../types";
import Spinner from "../../../ui/spinner";

interface SwotAnalysisPanelProps {
  customer: Customer;
  prompt: Prompt;
}

const SwotAnalysisPanel: React.FC<SwotAnalysisPanelProps> = ({
  customer,
  prompt,
}) => {
  const [targetUrl, setTargetUrl] = useState("");
  const [results, setResults] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunAnalysis = async (
    systemPrompt?: string,
    userPrompt?: string
  ) => {
    if (!targetUrl.trim()) {
      setError("Please enter a Competitor URL.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const inputData = { target_url: targetUrl };
      const customPrompt =
        systemPrompt && userPrompt
          ? { system: systemPrompt, user: userPrompt }
          : undefined;

      // Debug logs
      // console.log("=== Run Analysis Payload ===");
      // console.log("Customer ID:", customer.id);
      // console.log("Tool ID:", prompt.id);
      // console.log("Input Data:", inputData);
      // console.log("Custom Prompt Override:", customPrompt);
      // console.log("============================");

      const response: RunAnalysisSuccessResponse = await runAnalysisApi(
        customer.id,
        prompt.id,
        inputData,
        customPrompt
      );

      setResults(response.result_text);
    } catch (err: any) {
      setError(err.message || "Failed to run analysis.");
      console.error("Run analysis failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnalysisPanelLayout
      prompt={prompt}
      onRunWithCustomPrompt={(system, user) => handleRunAnalysis(system, user)}
    >
      {/* Unique Input Section */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Competitor URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="p-2 w-full border-2 rounded bg-[var(--input-bg)] border-[var(--border-color)] focus:border-[var(--accent-active)]  focus:outline-none"
            placeholder="https://www.competitor.com"
          />
        </div>
        <button
          onClick={() => handleRunAnalysis()}
          disabled={!targetUrl || isLoading}
          className="px-4 py-2 rounded bg-[var(--accent-active)] text-white disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Spinner
                size="sm"
                className="border-[var(--text-primary)] border-t-transparent"
              />
              Running...
            </>
          ) : (
            <>
              <FaPlay className="h-4 w-4" />
              Run Analysis
            </>
          )}
        </button>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="mt-4">
          <h3 className="font-bold text-lg mb-2">Results</h3>
          <div className="bg-[var(--input-bg)] rounded p-2 min-h-[200px] border border-[var(--border-color)] overflow-auto whitespace-pre-wrap">
            {isLoading ? (
              <>
                <Spinner
                  size="sm"
                  className="border-[var(--text-primary)] border-t-transparent"
                />
                <span> Generating analysis...</span>
              </>
            ) : (
              results || "Enter a URL and click 'Run Analysis'."
            )}
          </div>
        </div>
      </div>
    </AnalysisPanelLayout>
  );
};

export default SwotAnalysisPanel;

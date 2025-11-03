import React from "react";

interface StatCardProps {
  /** The title displayed at the top (e.g., "Active Customers") */
  title: string;
  /** The main value (number or string). If null/undefined, display "--" */
  value?: string | number | null;
  changeText?: string;
  changeColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  return (
    <div
      className="
        flex flex-col justify-center items-start
        bg-[var(--bg-secondary)]
        p-4 sm:p-5
        rounded-lg border border-[var(--border-color)]
        shadow-sm
        transition-all duration-200
        hover:shadow-md
      "
    >
      {/* Title */}
      <h3 className="text-sm sm:text-base font-medium text-[var(--text-secondary)] mb-1 text-center">
        {title}
      </h3>

      {/* Value or "--" if not available */}
      <p className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
        {value !== null && value !== undefined && value !== "" ? value : "--"}
      </p>
    </div>
  );
};

export default StatCard;

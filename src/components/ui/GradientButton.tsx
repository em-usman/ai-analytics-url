import React from "react";

interface GradientButtonProps {
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  children: React.ReactNode;
}

const GradientButton: React.FC<GradientButtonProps> = ({
  children,
  onClick,
  className = "",
  type = "button",
  disabled = false,
}) => {
  return (
    <button
      className={`w-fit p-[3px] relative border border-[var(--white)] hover:border-[var(--light-gray)] cursor-pointer group ${className}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {/* Background gradient: keep your accent colors, but ensure contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--orange)] to-[var(--dark-gray)] group-hover:from-[var(--white)] group-hover:to-[var(--light-gray)] transition-all duration-300" />

      {/* Inner content: white text by default, dark text on hover (for light bg) */}
      <div className="px-8 py-2 bg-[var(--blue)] relative transition-all duration-300 text-[var(--white)] hover:text-[var(--dark)] group-hover:bg-[var(--white)]">
        {children}
      </div>
    </button>
  );
};

export default GradientButton;

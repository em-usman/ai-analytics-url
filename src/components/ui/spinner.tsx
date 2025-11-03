const Spinner = ({
  size = "sm",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className="inline-flex items-center justify-center">
      {/* Use white or your accent color */}
      <div
        className={`${sizeClasses[size]} border-2 rounded-full animate-spin border-current ${className}`}
      />
    </div>
  );
};

export default Spinner;

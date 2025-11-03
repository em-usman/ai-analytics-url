const SelectToolPlaceholder = () => (
  <div className="flex flex-col items-center justify-center h-full text-center px-4 text-[var(--text-primary)]">
    <div className="p-8 border-2 border-dashed rounded-lg border-[var(--border-color)] max-w-md">
      {/* Optional: Add an icon here */}
      {/* <YourIconComponent className="w-16 h-16 mx-auto text-[var(--text-secondary)] mb-4" /> */}
      <h2 className="mt-4 text-2xl font-bold">Select a Tool</h2>
      <p className="mt-2 text-[var(--text-secondary)]">
        Choose an analysis tool from the list on the left to get started.
      </p>
    </div>
  </div>
);
export default SelectToolPlaceholder;

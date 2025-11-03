// Helper to get initials (e.g., "John Doe" → "JD")
const getInitials = (fullName: string): string => {
  if (!fullName) return "?";
  const names = fullName.trim().split(/\s+/);
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  return (
    names[0].charAt(0).toUpperCase() +
    names[names.length - 1].charAt(0).toUpperCase()
  );
};
export default getInitials;
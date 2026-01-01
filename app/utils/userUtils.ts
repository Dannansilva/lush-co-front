/**
 * Get user initials from full name
 * @param name - User's full name
 * @returns Initials (1-2 characters)
 *
 * Examples:
 * - "Owner Lush&Co" → "OL"
 * - "Front Desk" → "FD"
 * - "John" → "J"
 */
export const getUserInitials = (name: string): string => {
  if (!name) return "U";

  const nameParts = name.trim().split(" ");

  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }

  return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Format user type for display
 * @param userType - User type from database (e.g., "OWNER", "RECEPTIONIST")
 * @returns Formatted user type (e.g., "Owner", "Receptionist")
 *
 * Examples:
 * - "OWNER" → "Owner"
 * - "RECEPTIONIST" → "Receptionist"
 * - "FRONT_DESK" → "Front desk"
 */
export const formatUserType = (userType: string): string => {
  if (!userType) return "User";

  return userType
    .charAt(0)
    .toUpperCase() + userType.slice(1).toLowerCase().replace("_", " ");
};

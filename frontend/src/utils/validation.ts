export const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email.trim());

export const passwordMessage = (password: string) => {
  if (!password) return "Password is required.";
  if (password.length < 6) return "Password must be at least 6 characters.";
  return "";
};

export const requiredMessage = (value: string, label: string) =>
  value.trim().length === 0 ? `${label} is required.` : "";

export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "PF";

export const normalizeRoles = (user) => {
  let roles = [];

  if (Array.isArray(user?.roles)) {
    roles = user.roles;
  } else if (typeof user?.role === "string" && user.role.trim()) {
    roles = [user.role];
  }

  return roles
    .filter(Boolean)
    .map((role) => role.replace("ROLE_", "").toUpperCase());
};

export const hasAllowedRole = (user, allowedRoles = []) => {
  const userRoles = normalizeRoles(user);
  const normalizedAllowedRoles = allowedRoles.map((role) =>
    role.replace("ROLE_", "").toUpperCase()
  );

  return userRoles.some((role) => normalizedAllowedRoles.includes(role));
};
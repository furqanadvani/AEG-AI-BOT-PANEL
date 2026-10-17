/** Backend utils/aclConstants.js ke sath bilkul same keys */
export const ACL_MODULES = {
  DASHBOARD: "DASHBOARD",
  MANAGE_ROLES: "MANAGE_ROLES",
  MEMBERS: "MEMBERS",
  CURRENCY: "CURRENCY",
  VISA: "VISA",
  HOTEL: "HOTEL",
  CUSTOMERS: "CUSTOMERS",
  SETTINGS: "SETTINGS",
  COUNTRIES: "COUNTRIES",
  VISA_TYPES: "VISA_TYPES",
  QUESTIONS: "QUESTIONS",
  KNOWLEDGE: "KNOWLEDGE",
  AGENTS: "AGENTS",
  LEADS: "LEADS",
  QUERIES: "QUERIES",
  SESSIONS: "SESSIONS",
  CHAT_LOGS: "CHAT_LOGS",
  CHAT: "CHAT",
  AI_CONTROL: "AI_CONTROL",
  INTEGRATIONS: "INTEGRATIONS",
  API_KEYS: "API_KEYS",
  NOTIFICATIONS: "NOTIFICATIONS",
};

export const ACL_ACCESS_LIST = {
  VIEW: "VIEW",
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  DISABLE: "DISABLE",
};

export const ACL_ALL = "ALL";

export const togglePermission = (permissions = [], moduleKey, action) => {
  const updated = structuredClone(permissions);
  const index = updated.findIndex((p) => p.key === moduleKey);
  if (index === -1) return [...updated, { key: moduleKey, access: [action] }];
  const access = updated[index].access;
  if (access.includes(action)) {
    const filtered = access.filter((a) => a !== action);
    if (filtered.length) updated[index].access = filtered;
    else updated.splice(index, 1);
  } else {
    updated[index].access = [...access, action];
  }
  return updated;
};

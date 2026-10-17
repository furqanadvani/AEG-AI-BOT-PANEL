import * as Yup from "yup";
import { API_URL } from "../../utils/Constants";

const json = (name, label, hint) => ({ name, label, type: "textarea", rows: 4, hint, placeholder: "{ }", isJson: true });

/** Har integration type ka form + description */
export const INTEGRATION_META = {
  ai: {
    title: "AI provider",
    description: "Powers both bot AI calls (understand and reply). Any OpenAI-compatible provider: Groq, OpenAI, OpenRouter.",
    fields: [
      { name: "provider", label: "Provider", type: "select", allowClear: false, options: [{ value: "groq", label: "Groq" }, { value: "openai", label: "OpenAI" }, { value: "openrouter", label: "OpenRouter" }, { value: "custom", label: "Custom (OpenAI-compatible)" }] },
      { name: "config.baseUrl", label: "Base URL", placeholder: "https://api.groq.com/openai/v1" },
      { name: "secrets.apiKey", label: "API key", type: "password", secret: true, span: 2 },
    ],
  },
  email: {
    title: "Email (SMTP)",
    description: "New lead emails to agents, AI limit alerts and password resets.",
    fields: [
      { name: "config.host", label: "SMTP host", placeholder: "smtp.gmail.com" },
      { name: "config.port", label: "Port", type: "number", placeholder: "587" },
      { name: "config.user", label: "Username", placeholder: "you@gmail.com" },
      { name: "secrets.password", label: "Password", type: "password", secret: true, hint: "Gmail: App password" },
      { name: "config.from", label: "From", placeholder: "AEG Visa <you@gmail.com>" },
      { name: "config.secure", label: "SSL (port 465)", type: "switch" },
    ],
  },
  whatsapp: {
    title: "WhatsApp Cloud API",
    description: "Phase 2: customers message on WhatsApp and the bot replies there.",
    help: `Meta webhook URL: ${API_URL.replace(/\/api\/?$/, "")}/api/webhooks/whatsapp`,
    fields: [
      { name: "config.phoneNumberId", label: "Phone number ID" },
      { name: "config.apiVersion", label: "API version", placeholder: "v21.0" },
      { name: "secrets.accessToken", label: "Access token", type: "password", secret: true, span: 2 },
      { name: "secrets.verifyToken", label: "Verify token", type: "password", secret: true, hint: "Use the same value in the Meta webhook setup" },
      { name: "secrets.appSecret", label: "App secret", type: "password", secret: true, hint: "Used to verify webhook signatures" },
    ],
  },
  crm: {
    title: "Internal CRM",
    description: "Phase 2: every new lead is pushed to your CRM. Configure endpoints and field names to match it.",
    fields: [
      { name: "config.baseUrl", label: "Base URL", placeholder: "https://crm.company.com/api" },
      { name: "secrets.apiKey", label: "API key", type: "password", secret: true },
      { name: "config.authHeader", label: "Auth header", placeholder: "Authorization" },
      { name: "config.authScheme", label: "Auth scheme", placeholder: "Bearer" },
      json("config.endpoints", "Endpoints (JSON)", 'e.g. { "createLead": "/leads", "updateLead": "/leads/:crmId", "ping": "/health" }'),
      json("config.leadFieldMap", "Lead field map (JSON)", 'Our field: CRM field, e.g. { "fullName": "name", "whatsapp": "phone" }. Empty = send as is'),
      json("config.customerFieldMap", "Customer field map (JSON)"),
    ],
  },
};

export const ORDER = ["ai", "email", "whatsapp", "crm"];

const get = (obj, path) => path.split(".").reduce((o, k) => o?.[k], obj);

/** API response -> form (secrets khali; masked value placeholder mein) */
export const toForm = (item) => {
  const meta = INTEGRATION_META[item.type];
  const values = { provider: item.provider, isEnabled: !!item.isEnabled, config: {}, secrets: {} };
  for (const f of meta.fields) {
    const [group, key] = f.name.includes(".") ? f.name.split(".") : [null, f.name];
    if (!group) continue;
    if (f.secret) values.secrets[key] = "";
    else {
      const v = get(item, f.name);
      values.config[key] = f.isJson ? JSON.stringify(v ?? {}, null, 2) : v ?? (f.type === "switch" ? false : "");
    }
  }
  return values;
};

export const toPayload = (type, values) => {
  const meta = INTEGRATION_META[type];
  const config = {};
  const secrets = {};
  for (const f of meta.fields) {
    const [group, key] = f.name.split(".");
    const v = values[group]?.[key];
    if (group === "secrets") {
      if (v) secrets[key] = v; // khali = purana secret hi rahe
    } else if (group === "config") {
      config[key] = f.isJson ? JSON.parse(v || "{}") : f.type === "number" ? (v === "" || v === null ? undefined : Number(v)) : v;
    }
  }
  return { provider: values.provider, isEnabled: values.isEnabled, config, ...(Object.keys(secrets).length && { secrets }) };
};

export const schemaFor = (type) => {
  const jsonFields = INTEGRATION_META[type].fields.filter((f) => f.isJson).map((f) => f.name.split(".")[1]);
  const isJson = (v) => {
    try {
      const o = JSON.parse(v || "{}");
      return o && typeof o === "object" && !Array.isArray(o);
    } catch {
      return false;
    }
  };
  return Yup.object({
    config: Yup.object(Object.fromEntries(jsonFields.map((k) => [k, Yup.string().test("json", "Enter a valid JSON object", isJson)]))),
  });
};

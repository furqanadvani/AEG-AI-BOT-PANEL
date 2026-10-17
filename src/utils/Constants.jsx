export const TOKEN = "AEG_TOKEN";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export const PAGE_SIZE = 20;

export const LEAD_STATUS_COLORS = {
  New: "blue",
  "In review": "geekblue",
  "Documents pending": "orange",
  Submitted: "purple",
  Approved: "green",
  Rejected: "red",
  Closed: "default",
  Cancelled: "default",
};

export const QUERY_TYPES = ["UNANSWERED", "HUMAN", "LOST", "GENERAL", "COMPLAINT"];
export const QUERY_STATUSES = ["Open", "In progress", "Answered", "Closed"];
export const QUERY_STATUS_COLORS = { Open: "orange", "In progress": "blue", Answered: "green", Closed: "default" };
export const QUERY_TYPE_COLORS = { UNANSWERED: "gold", HUMAN: "volcano", LOST: "red", GENERAL: "blue", COMPLAINT: "magenta" };

export const VISA_ACTIONS = ["Apply", "Refuse", "Forward"];
export const VISA_ACTION_COLORS = { Apply: "green", Refuse: "red", Forward: "orange" };

export const QUESTION_TYPES = ["text", "country", "visatype", "name", "phone", "number", "choice", "date", "duration"];

export const CUSTOMER_SOURCES = ["chatbot", "whatsapp", "walk-in", "facebook", "instagram", "website", "referral", "crm", "other"];

export const LANGUAGES = {
  en: "English",
  roman_ur: "Roman Urdu",
  ur: "Urdu",
  ar: "Arabic",
  ps: "Pashto",
  sd: "Sindhi",
  pa: "Punjabi",
  other: "Other",
};

export const OCCUPANCY = ["single", "double", "triple", "quad", "quint"];

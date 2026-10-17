import * as Yup from "yup";
import { CUSTOMER_SOURCES } from "../../utils/Constants";
import { readableText } from "../../utils/Methods";

export const customerFields = [
  { name: "name", label: "Full name", required: true },
  { name: "phone", label: "Phone", required: true, placeholder: "0300 1234567", hint: "Unique per customer: one phone, one profile" },
  { name: "email", label: "Email", type: "email" },
  { name: "whatsapp", label: "WhatsApp", placeholder: "Leave empty to use the phone" },
  { name: "city", label: "City" },
  { name: "preferredLanguage", label: "Language", type: "select", options: [{ value: "en", label: "English" }, { value: "roman_ur", label: "Roman Urdu" }, { value: "ur", label: "Urdu" }, { value: "ar", label: "Arabic" }] },
  { name: "cnic", label: "CNIC" },
  { name: "passportNumber", label: "Passport number" },
  { name: "source", label: "Source", type: "select", options: CUSTOMER_SOURCES.map((s) => ({ value: s, label: readableText(s) })) },
  { name: "tags", label: "Tags", type: "tags", placeholder: "e.g. vip, family" },
  { name: "notes", label: "Notes", type: "textarea", rows: 3 },
];

export const customerSchema = Yup.object({
  name: Yup.string().trim().required("Name is required"),
  phone: Yup.string().trim().min(10, "Enter the full number").required("Phone is required"),
  email: Yup.string().trim().email("Enter a valid email").nullable(),
});

export const CUSTOMER_DEFAULTS = { name: "", phone: "", email: "", whatsapp: "", city: "", preferredLanguage: undefined, cnic: "", passportNumber: "", source: "walk-in", tags: [], notes: "" };

export const customerToForm = (c = {}) => Object.fromEntries(Object.keys(CUSTOMER_DEFAULTS).map((k) => [k, c[k] ?? CUSTOMER_DEFAULTS[k]]));

/** Khali strings null bhejo (email unique/validation masle na karein) */
export const customerToPayload = (v) => Object.fromEntries(Object.entries(v).map(([k, val]) => [k, val === "" ? null : val]));

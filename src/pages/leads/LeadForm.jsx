import * as Yup from "yup";

export const leadFields = (countries = [], visaTypes = []) => [
  { name: "fullName", label: "Full name", required: true, placeholder: "Customer name" },
  { name: "whatsapp", label: "WhatsApp", required: true, placeholder: "0300 1234567", hint: "Used to link the customer profile" },
  { name: "country", label: "Country", type: "select", options: countries, placeholder: "Select country" },
  { name: "visaType", label: "Visa type", type: "select", options: visaTypes, placeholder: "Select visa type" },
  { name: "travelDate", label: "Travel date", placeholder: "e.g. December 2026" },
  { name: "duration", label: "Duration", placeholder: "e.g. 10 days" },
  { name: "travellers", label: "Travellers", placeholder: "e.g. 2" },
  { name: "relationship", label: "Relationship", placeholder: "e.g. wife" },
  { name: "cityToStay", label: "City to stay" },
  { name: "bankStatement", label: "Bank statement", placeholder: "e.g. Yes" },
  { name: "otherDetails", label: "Other details", type: "textarea", rows: 2 },
];

export const leadSchema = Yup.object({
  fullName: Yup.string().trim().required("Name is required"),
  whatsapp: Yup.string().trim().min(10, "Enter the full number").required("WhatsApp is required"),
});

export const LEAD_DEFAULTS = { fullName: "", whatsapp: "", country: undefined, visaType: undefined, travelDate: "", duration: "", travellers: "", relationship: "", cityToStay: "", bankStatement: "", otherDetails: "" };

export const leadToForm = (l = {}) => Object.fromEntries(Object.keys(LEAD_DEFAULTS).map((k) => [k, l[k] ?? LEAD_DEFAULTS[k]]));

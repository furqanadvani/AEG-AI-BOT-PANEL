import * as Yup from "yup";

export const RoleSchema = Yup.object({
  name: Yup.string().trim().required("Role name is required"),
  description: Yup.string().trim().required("Description is required"),
  permissions: Yup.array().test("at-least-one", "Select at least one permission", (v) => Array.isArray(v) && v.some((p) => p.access?.length)),
});

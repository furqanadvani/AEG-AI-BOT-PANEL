import { useEffect } from "react";
import { Button, Skeleton } from "antd";
import { Form, Formik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { ContainerWrapper } from "../../containers";
import { FormBuilder, PermissionMatrix } from "../../components";
import { CField } from "../../uiComponents";
import { getRoleDetail, saveRole } from "../../store/actions/ManageRoles.action";
import { RoleSchema } from "./AddRoleValidations";

const fields = [
  { name: "name", label: "Role name", required: true, placeholder: "e.g. Visa counsellor" },
  { name: "description", label: "Description", required: true, placeholder: "Who is this role for?" },
];

const AddRole = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { detail, detailLoading, saveLoading } = useSelector(({ manageRoles }) => manageRoles);
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) dispatch(getRoleDetail(id));
  }, [dispatch, id, isEdit]);

  const role = isEdit && detail?._id === id ? detail : null;
  const header = { title: isEdit ? `Edit role${role ? `: ${role.name}` : ""}` : "Add role", renderBack: true, backTo: "/manage-roles", hideTabs: true };

  if (isEdit && !role) {
    return <ContainerWrapper pageHeaderProps={header}><Skeleton active paragraph={{ rows: 8 }} loading={detailLoading} /></ContainerWrapper>;
  }

  return (
    <ContainerWrapper pageHeaderProps={header}>
      <Formik
        initialValues={{ name: role?.name || "", description: role?.description || "", permissions: role?.permissions || [] }}
        validationSchema={RoleSchema}
        onSubmit={(v) => dispatch(saveRole({ ...v, ...(role && { _id: role._id }) }, () => navigate("/manage-roles")))}
      >
        {({ values, errors, submitCount, setFieldValue }) => (
          <Form>
            <section className="section-card" style={{ padding: 20 }}>
              <FormBuilder fields={fields} />
              <CField label="Permissions" error={submitCount ? errors.permissions : undefined} hint="View is required before any other action">
                <PermissionMatrix value={values.permissions} onChange={(p) => setFieldValue("permissions", p)} />
              </CField>
              <div className="flex-end gap-10">
                <Button onClick={() => navigate("/manage-roles")}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={saveLoading}>{role ? "Save role" : "Create role"}</Button>
              </div>
            </section>
          </Form>
        )}
      </Formik>
    </ContainerWrapper>
  );
};

export default AddRole;

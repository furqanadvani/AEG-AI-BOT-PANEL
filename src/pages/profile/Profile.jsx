import { Button, Tabs, Tag } from "antd";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { ContainerWrapper } from "../../containers";
import { FormBuilder, UserAvatar } from "../../components";
import { changePassword } from "../../store/actions/Auth.action";
import { getFullName, readableText } from "../../utils/Methods";
import "../leads/LeadDetails.css";

const pwFields = [
  { name: "currentPassword", label: "Current password", type: "password", required: true, span: 2 },
  { name: "newPassword", label: "New password", type: "password", required: true },
  { name: "confirm", label: "Confirm new password", type: "password", required: true },
];

const pwSchema = Yup.object({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string().min(8, "At least 8 characters").required("New password is required").notOneOf([Yup.ref("currentPassword")], "Use a different password from the current one"),
  confirm: Yup.string().oneOf([Yup.ref("newPassword")], "Passwords do not match").required("Confirm your password"),
});

const Profile = () => {
  const dispatch = useDispatch();
  const [params, setParams] = useSearchParams();
  const user = useSelector(({ auth }) => auth.user);
  const loading = useSelector(({ auth }) => auth.changePasswordLoading);
  const permissions = user?.role?.permissions || [];

  return (
    <ContainerWrapper pageHeaderProps={{ title: "My profile", subtitle: "Your account and access." }}>
      <Tabs
        activeKey={params.get("tab") || "account"}
        onChange={(tab) => setParams({ tab }, { replace: true })}
        items={[
          {
            key: "account",
            label: "Account",
            children: (
              <div className="detail-grid">
                <section className="section-card detail-panel">
                  <div className="d-flex gap-16 align-item-center margin-bottom-16">
                    <UserAvatar name={getFullName(user)} size={56} />
                    <div>
                      <div className="font-semibold" style={{ fontSize: 18 }}>{getFullName(user)}</div>
                      <div className="text-gray">{user?.email}</div>
                    </div>
                  </div>
                  <dl className="kv-list">
                    <dt>Role</dt>
                    <dd>{user?.isSuperAdmin ? <Tag color="blue">Super admin</Tag> : user?.role?.name || "-"}</dd>
                    {user?.role?.description && (<><dt>About role</dt><dd>{user.role.description}</dd></>)}
                    <dt>Status</dt>
                    <dd>{user?.isActive ? "Active" : "Disabled"}</dd>
                  </dl>
                </section>
                <section className="section-card detail-panel">
                  <h2 className="section-title">Your access</h2>
                  {user?.isSuperAdmin ? (
                    <p className="text-gray">Super admin: full access to every module.</p>
                  ) : (
                    <dl className="kv-list">
                      {permissions.map((p) => (
                        <div key={p.key} style={{ display: "contents" }}>
                          <dt>{readableText(p.key)}</dt>
                          <dd>{p.access.map((a) => readableText(a)).join(", ")}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </section>
              </div>
            ),
          },
          {
            key: "password",
            label: "Change password",
            children: (
              <section className="section-card detail-panel" style={{ maxWidth: 560 }}>
                <p className="text-gray margin-bottom-16">After changing your password you will be signed out everywhere and need to sign in again.</p>
                <Formik initialValues={{ currentPassword: "", newPassword: "", confirm: "" }} validationSchema={pwSchema} onSubmit={({ currentPassword, newPassword }) => dispatch(changePassword({ currentPassword, newPassword }))}>
                  <Form>
                    <FormBuilder fields={pwFields} />
                    <div className="flex-end">
                      <Button type="primary" htmlType="submit" loading={loading}>Change password</Button>
                    </div>
                  </Form>
                </Formik>
              </section>
            ),
          },
        ]}
      />
    </ContainerWrapper>
  );
};

export default Profile;

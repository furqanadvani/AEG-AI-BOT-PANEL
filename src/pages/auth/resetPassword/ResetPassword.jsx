import { Form, Formik } from "formik";
import * as Yup from "yup";
import { Alert, Button } from "antd";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword } from "../../../store/actions/Auth.action";
import { CInput } from "../../../uiComponents";
import AuthCard from "../AuthCard";

export const passwordSchema = Yup.string().min(8, "At least 8 characters").required("Password is required");

const schema = Yup.object({
  password: passwordSchema,
  confirm: Yup.string().oneOf([Yup.ref("password")], "Passwords do not match").required("Confirm your password"),
});

const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token");
  const loading = useSelector(({ auth }) => auth.resetPasswordLoading);

  return (
    <AuthCard title="Set a new password" subtitle="Use at least 8 characters." footer={<Link to="/">Back to login</Link>}>
      {!token ? (
        <Alert type="error" showIcon title="This reset link is incomplete" description="Open the full link from your email, or request a new one." />
      ) : (
        <Formik initialValues={{ password: "", confirm: "" }} validationSchema={schema} onSubmit={({ password }) => dispatch(resetPassword({ token, password }, () => navigate("/")))}>
          {({ values, errors, submitCount, setFieldValue }) => (
            <Form noValidate>
              <CInput label="New password" name="password" type="password" size="large" value={values.password} onChange={(v) => setFieldValue("password", v)} error={submitCount ? errors.password : undefined} disabled={loading} />
              <CInput label="Confirm password" name="confirm" type="password" size="large" value={values.confirm} onChange={(v) => setFieldValue("confirm", v)} error={submitCount ? errors.confirm : undefined} disabled={loading} />
              <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                Save new password
              </Button>
            </Form>
          )}
        </Formik>
      )}
    </AuthCard>
  );
};

export default ResetPassword;

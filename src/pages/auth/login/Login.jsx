import { Form, Formik } from "formik";
import { Button } from "antd";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../../store/actions/Auth.action";
import { CInput } from "../../../uiComponents";
import AuthCard from "../AuthCard";
import { validationSchema } from "./Validations";

const Login = () => {
  const dispatch = useDispatch();
  const loading = useSelector(({ auth }) => auth.loginLoading);

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to manage leads, customers and your visa assistant.">
      <Formik initialValues={{ email: "", password: "" }} validationSchema={validationSchema} onSubmit={(values) => dispatch(login({ email: values.email.trim(), password: values.password }))}>
        {({ values, errors, touched, submitCount, setFieldValue, setFieldTouched }) => {
          const err = (k) => (submitCount || touched[k] ? errors[k] : undefined);
          return (
            <Form noValidate>
              <CInput label="Email" name="email" type="email" placeHolder="you@company.com" autoFocus value={values.email} onChange={(v) => setFieldValue("email", v)} onBlur={() => setFieldTouched("email")} error={err("email")} disabled={loading} size="large" />
              <CInput label="Password" name="password" type="password" placeHolder="Enter your password" value={values.password} onChange={(v) => setFieldValue("password", v)} onBlur={() => setFieldTouched("password")} error={err("password")} disabled={loading} size="large" />
              <div className="auth-link-row">
                <Link to="/forgot-password">Forgot password?</Link>
              </div>
              <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                Sign in
              </Button>
            </Form>
          );
        }}
      </Formik>
    </AuthCard>
  );
};

export default Login;

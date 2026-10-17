import { useState } from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { Alert, Button } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword } from "../../../store/actions/Auth.action";
import { CInput } from "../../../uiComponents";
import AuthCard from "../AuthCard";

const schema = Yup.object({ email: Yup.string().trim().email("Enter a valid email").required("Email is required") });

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(({ auth }) => auth.forgotPasswordLoading);
  const [sent, setSent] = useState(false);

  const onSubmit = ({ email }) =>
    dispatch(
      forgotPassword({ email: email.trim() }, (result) => {
        // Development: email band ho to backend token wapas deta hai
        if (result?.devResetToken) navigate(`/reset-password?token=${result.devResetToken}`);
        else setSent(true);
      })
    );

  return (
    <AuthCard title="Reset your password" subtitle="Enter your email and we'll send you a reset link." footer={<Link to="/">Back to login</Link>}>
      {sent ? (
        <Alert type="success" showIcon title="Check your email" description="If this email is registered, a reset link is on its way. It is valid for 30 minutes." />
      ) : (
        <Formik initialValues={{ email: "" }} validationSchema={schema} onSubmit={onSubmit}>
          {({ values, errors, submitCount, setFieldValue }) => (
            <Form noValidate>
              <CInput label="Email" name="email" type="email" placeHolder="you@company.com" autoFocus size="large" value={values.email} onChange={(v) => setFieldValue("email", v)} error={submitCount ? errors.email : undefined} disabled={loading} />
              <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                Send reset link
              </Button>
            </Form>
          )}
        </Formik>
      )}
    </AuthCard>
  );
};

export default ForgotPassword;

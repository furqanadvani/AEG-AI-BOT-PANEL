import { Route, Routes } from "react-router-dom";
import { ForgotPassword, Login, ResetPassword } from "../pages/auth";

const AuthRoutes = () => (
  <Routes>
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="*" element={<Login />} />
  </Routes>
);

export default AuthRoutes;

import { Suspense, useMemo } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button, Result } from "antd";
import { RouteFallback, ErrorBoundary } from "../components";
import { appRoutes, getHomePath } from "./RouteConfig";
import { getAllowedRoutes } from "../utils/acl/Helper";

const Unauthorized = () => (
  <Result status="403" title="You don't have access to this page" subTitle="Ask an admin to add this module to your role." extra={<Button type="primary" href="/">Go home</Button>} />
);

const ProtectedRoutes = () => {
  const user = useSelector(({ auth }) => auth.user);
  const { pathname } = useLocation();
  const allowed = useMemo(() => new Set(getAllowedRoutes(appRoutes, user).map((r) => r.path)), [user]);
  const home = getHomePath(user);

  return (
    <ErrorBoundary resetKey={pathname}>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {appRoutes.map(({ path, Component }) => (
            <Route
              key={path}
              path={path}
              element={allowed.has(path) ? <Component /> : path === "/" ? <Navigate to={home} replace /> : <Unauthorized />}
            />
          ))}
          <Route path="*" element={<Navigate to={home} replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default ProtectedRoutes;

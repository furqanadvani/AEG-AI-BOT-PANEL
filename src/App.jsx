import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AuthRoutes from "./routes/Auth";
import ProtectedRoutes from "./routes/Protected";
import { getProfile } from "./store/actions/Auth.action";
import { Loader } from "./components";
import { PageWrapper } from "./containers";

function App() {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(({ auth }) => auth.isLoggedIn);
  const loading = useSelector(({ auth }) => auth.getProfileLoading);

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  if (loading) return <Loader />;

  if (!isLoggedIn) return <AuthRoutes />;

  return (
    <PageWrapper>
      <ProtectedRoutes />
    </PageWrapper>
  );
}

export default App;

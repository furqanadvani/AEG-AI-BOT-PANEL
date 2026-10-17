import AUTH from "../constant/Auth.constant";
import { get, post } from "../../utils/ApiMethods";
import { clearLocalstorage, handleSuccess } from "../../utils/Methods";
import { apiRequest } from "../../utils/ReduxHelpers";
import { TOKEN } from "../../utils/Constants";

export const getProfile = () => async (dispatch) => {
  if (!localStorage.getItem(TOKEN)) {
    dispatch({ type: AUTH.GET_PROFILE, loading: false, data: null, isLoggedIn: false });
    return;
  }
  dispatch({ type: AUTH.GET_PROFILE, loading: true });
  try {
    const { data } = await get("auth/profile");
    if (data?.error) throw new Error(data.message);
    dispatch({ type: AUTH.GET_PROFILE, loading: false, data: data.data, isLoggedIn: true });
  } catch {
    clearLocalstorage();
    dispatch({ type: AUTH.GET_PROFILE, loading: false, data: null, isLoggedIn: false });
  }
};

export const login = (payload, CB) => (dispatch) =>
  apiRequest({
    dispatch,
    type: AUTH.LOGIN,
    call: () => post("auth/login", payload),
    errorMessage: "Invalid email or password",
    CB: (result) => {
      localStorage.setItem(TOKEN, result.token);
      handleSuccess(`Welcome back, ${result.user?.firstName || ""}`.trim());
      dispatch(getProfile());
      CB && CB();
    },
  });

export const changePassword = (payload, CB) => (dispatch) =>
  apiRequest({
    dispatch,
    type: AUTH.CHANGE_PASSWORD,
    call: () => post("auth/change-password", payload),
    success: true,
    CB: () => {
      // Backend password badalne par purane tokens band kar deta hai
      CB && CB();
      dispatch(logout());
    },
  });

export const forgotPassword = (payload, CB) => (dispatch) =>
  apiRequest({ dispatch, type: AUTH.FORGOT_PASSWORD, call: () => post("auth/forgot-password", payload), success: true, CB });

export const resetPassword = (payload, CB) => (dispatch) =>
  apiRequest({ dispatch, type: AUTH.RESET_PASSWORD, call: () => post("auth/reset-password", payload), success: true, CB });

export const logout = () => (dispatch) => {
  clearLocalstorage();
  dispatch({ type: AUTH.LOGOUT });
};

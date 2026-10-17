import AUTH from "../constant/Auth.constant";
import { TOKEN } from "../../utils/Constants";

// Function: logout ke baad token nahi hota, to loader dobara nahi chalna chahiye
const getInitialState = () => ({
  isLoggedIn: false,
  user: null,
  // token ho to pehle profile check, warna seedha login page
  getProfileLoading: !!localStorage.getItem(TOKEN),

  loginLoading: false,
  changePasswordLoading: false,
  forgotPasswordLoading: false,
  resetPasswordLoading: false,
});

export default function authReducer(state = getInitialState(), action = {}) {
  switch (action.type) {
    case AUTH.LOGIN:
      return { ...state, loginLoading: action.loading };
    case AUTH.GET_PROFILE:
      return {
        ...state,
        getProfileLoading: action.loading,
        ...(action.data !== undefined && { user: action.data }),
        ...(action.isLoggedIn !== undefined && { isLoggedIn: action.isLoggedIn }),
      };
    case AUTH.CHANGE_PASSWORD:
      return { ...state, changePasswordLoading: action.loading };
    case AUTH.FORGOT_PASSWORD:
      return { ...state, forgotPasswordLoading: action.loading };
    case AUTH.RESET_PASSWORD:
      return { ...state, resetPasswordLoading: action.loading };
    case AUTH.LOGOUT:
      return { ...getInitialState(), getProfileLoading: false };
    default:
      return state;
  }
}

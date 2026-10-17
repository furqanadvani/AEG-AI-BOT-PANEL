import { applyMiddleware, combineReducers, createStore } from "redux";
import { thunk } from "redux-thunk";
import reducers from "./reducers";
import AUTH from "./constant/Auth.constant";

const appReducer = combineReducers(reducers);

// Logout par poora store saaf (pichle user ka data agle ko na dikhe)
const rootReducer = (state, action) => appReducer(action.type === AUTH.LOGOUT ? undefined : state, action);

const store = createStore(rootReducer, {}, applyMiddleware(thunk));

export { store };

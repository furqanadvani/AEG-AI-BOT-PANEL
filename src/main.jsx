import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { App as AntApp, ConfigProvider } from "antd";
import "antd/dist/reset.css";
import "./index.css";
import "./App.css";
import App from "./App.jsx";
import { store } from "./store";
import { setupInterceptor } from "./utils/Interceptor";
import { AntdStaticHolder } from "./utils/AntdStatic";
import { THEME } from "./utils/Theme";

setupInterceptor();

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <ConfigProvider theme={THEME}>
      <AntApp>
        <AntdStaticHolder />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  </Provider>
);

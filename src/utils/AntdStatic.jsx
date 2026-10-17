import { useEffect } from "react";
import { App } from "antd";

/**
 * antd v6: message / notification / modal ko theme ke saath chalane ke liye App context chahiye.
 * Yeh component unhe ek baar pakar leta hai, taake Redux actions (React ke bahar) bhi
 * handleSuccess / handleError call kar sakein.
 */
const holder = { message: null, notification: null, modal: null };

export const AntdStaticHolder = () => {
  const { message, notification, modal } = App.useApp();
  useEffect(() => {
    Object.assign(holder, { message, notification, modal });
  }, [message, notification, modal]);
  return null;
};

export default holder;

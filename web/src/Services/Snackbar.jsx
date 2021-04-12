import { useSnackbar } from "notistack";
import React from "react";

const InnerSnackbarUtilsConfigurator = props => {
  props.setUseSnackbarRef(useSnackbar());
  return null;
};

let useSnackbarRef;
const setUseSnackbarRef = useSnackbarRefProp => {
  useSnackbarRef = useSnackbarRefProp;
};

export const SnackbarUtilsConfigurator = () => {
  return <InnerSnackbarUtilsConfigurator setUseSnackbarRef={setUseSnackbarRef} />;
};

const commands = {
  success(msg, options) {
    return this.toast(msg, { ...options, variant: "success" });
  },
  warning(msg, options) {
    return this.toast(msg, { ...options, variant: "warning" });
  },
  info(msg, options) {
    return this.toast(msg, { ...options, variant: "info" });
  },
  error(msg, options) {
    return this.toast(msg, { autoHideDuration: 5000, ...options, variant: "error" });
  },
  toast(msg, options) {
    return useSnackbarRef.enqueueSnackbar(msg, { autoHideDuration: 3000, ...options });
  },
  clear(key) {
    useSnackbarRef.closeSnackbar(key);
  },
};

export default commands;

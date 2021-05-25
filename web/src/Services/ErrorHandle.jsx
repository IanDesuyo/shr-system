export const HttpError = err => {
  if (err.response) {
    console.log(err.response);
    if (err.response.status >= 500) {
      return "errors.serverError";
    }
    if (err.response.status === 422) {
      return err.response.data.detail[0].msg;
    }
    if (err.response.data && err.response.data.detail) {
      return err.response.data.detail.i18n || err.response.data.detail.msg;
    }
    return "errors.unknownError";
  } else if (err.request) {
    console.log(err.request);
  } else {
    console.log(err);
  }
  return "errors.systemError";
};

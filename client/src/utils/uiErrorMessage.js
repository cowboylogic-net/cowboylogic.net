import {
  formatUiErrorMessage,
  mapApiErrorToUi,
  normalizeApiError,
} from "./apiError.js";

export const getUiErrorMessage = (error, fallbackMessage = null) => {
  if ((error === null || error === undefined) && fallbackMessage) {
    return fallbackMessage;
  }

  const apiError = error?.apiError || normalizeApiError(error);
  const uiError = mapApiErrorToUi(apiError);
  const message = formatUiErrorMessage(uiError);
  if (message) return message;
  return fallbackMessage || "Something went wrong.";
};

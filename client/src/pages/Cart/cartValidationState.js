export const getCheckoutDisabled = ({
  isAdding = false,
  isCheckoutLoading = false,
  isUpdating = false,
  isDeleting = false,
  isCartValidating = false,
  isResetting = false,
  lastBlocking = false,
} = {}) =>
  Boolean(
    isAdding ||
      isCheckoutLoading ||
      isUpdating ||
      isDeleting ||
      isCartValidating ||
      isResetting ||
      lastBlocking,
  );

export const getClearedBlockingValidationState = () => ({
  lastBlocking: false,
  lastValidationCode: null,
  lastIssues: null,
});

export const getValidationTransportFailureResult = (fallbackItems = []) => ({
  ok: false,
  blocking: false,
  requestFailed: true,
  itemsForCheckout: fallbackItems,
});

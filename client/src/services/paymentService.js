// client/src/services/paymentService.js
export const createSquarePayment = async ({ title, price, bookId, userId }) => {
  const res = await fetch("/api/square/create-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, price, bookId, userId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create payment");
  return data.checkoutUrl;
};

import { Client, Environment } from 'square';

const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.NODE_ENV === 'production'
    ? Environment.Production
    : Environment.Sandbox,
});


export const paymentsApi = squareClient.paymentsApi;
export const checkoutApi = squareClient.checkoutApi;
export const ordersApi = squareClient.ordersApi;

export const locationId = process.env.SQUARE_LOCATION_ID;

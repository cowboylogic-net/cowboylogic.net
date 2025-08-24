export function requireEnv() {
  ["SQUARE_ACCESS_TOKEN", "SQUARE_LOCATION_ID", "SQUARE_SUCCESS_URL"]
    .forEach((k) => {
      if (!process.env[k]) {
        throw new Error(`Missing required env: ${k}`);
      }
    });
}

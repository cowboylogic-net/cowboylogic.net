import crypto from "crypto";

const createRequestId = () => {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return crypto.randomBytes(16).toString("hex");
};

const requestId = (req, res, next) => {
  const id = createRequestId();
  req.requestId = id;
  res.setHeader("X-Request-Id", id);
  next();
};

export default requestId;

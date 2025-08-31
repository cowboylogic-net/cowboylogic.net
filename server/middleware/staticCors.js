// middlewares/staticCors.js

const staticCors = (req, res, next) => {
  
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
};

export default staticCors;

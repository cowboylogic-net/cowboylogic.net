const sendResponse = (res, { code = 200, message = null, data = null }) => {
  res.status(code).json({
    status: "success",
    code,
    ...(message && { message }),
    ...(data !== undefined && { data }),
  });
};

export default sendResponse;

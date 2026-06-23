export default function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || res.statusCode || 500;
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 404;
    err.message = "Resource not found!";
  }
  console.error(err.stack);

  const isClientError = statusCode >= 400 && statusCode < 500;
  const message = isClientError ? err.message : "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV == "development" ? err.stack : "🥞",
  });
}

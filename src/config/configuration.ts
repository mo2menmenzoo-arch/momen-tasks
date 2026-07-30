export default () => {
  const NODE_ENV = process.env.NODE_ENV || "development";
  const PORT = parseInt(process.env.PORT || "3000", 10);
  const FRONTEND_URL = (
    process.env.FRONTEND_URL || "http://localhost:5173"
  ).trimEnd();
  const API_URL = (process.env.API_URL || "http://localhost:3000").trimEnd();
  const ENCRYPTION_KEY =
    process.env.ENCRYPTION_KEY || "change-me-32-byte-hex-key-for-aes-256-gcm";
  const LOG_LEVEL = process.env.LOG_LEVEL || "debug";

  // Production guard: fail loud instead of silently using localhost
  if (NODE_ENV === "production") {
    if (!process.env.FRONTEND_URL?.trimEnd()) {
      throw new Error(
        "FRONTEND_URL is required in production. Set it in your hosting provider's environment variables.",
      );
    }
    if (!process.env.API_URL?.trimEnd()) {
      throw new Error(
        "API_URL is required in production. Set it in your hosting provider's environment variables.",
      );
    }
  }

  return { NODE_ENV, PORT, FRONTEND_URL, API_URL, ENCRYPTION_KEY, LOG_LEVEL };
};

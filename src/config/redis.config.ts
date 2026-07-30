export default () => {
  const redisUrl = process.env.REDIS_URL || "";
  let host = "localhost";
  let port = 6379;
  let password: string | undefined;
  let tls: object | undefined;

  if (redisUrl) {
    try {
      const url = new URL(redisUrl);
      host = url.hostname || host;
      port = parseInt(url.port, 10) || port;
      if (url.username || url.password) {
        password = url.password || process.env.REDIS_TOKEN;
      }
      if (url.protocol === "rediss:") {
        tls = {};
      }
    } catch {
      // Fallback for malformed URLs
      const cleaned = redisUrl.replace(/^rediss?:\/\//, "");
      const atIdx = cleaned.lastIndexOf("@");
      const hostPort = atIdx >= 0 ? cleaned.substring(atIdx + 1) : cleaned;
      const parts = hostPort.split(":");
      host = parts[0] || host;
      port = parseInt(parts[1] || "6379", 10) || port;
      password = process.env.REDIS_TOKEN;
      if (redisUrl.startsWith("rediss://")) {
        tls = {};
      }
    }
  }

  return {
    REDIS_CONFIG: {
      host,
      port,
      password: password || process.env.REDIS_TOKEN || undefined,
      tls,
    },
  };
};

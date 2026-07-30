export default () => {
  let url =
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING;
  if (url && !url.includes("connect_timeout")) {
    const separator = url.includes("?") ? "&" : "?";
    url = `${url}${separator}connect_timeout=10`;
  }
  return {
    DATABASE_CONFIG: { url },
  };
};

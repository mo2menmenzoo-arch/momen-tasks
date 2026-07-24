export default () => {
  let url = process.env.DATABASE_URL;
  if (url && !url.includes('connect_timeout')) {
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}connect_timeout=10`;
  }
  return {
    DATABASE_CONFIG: { url },
  };
};

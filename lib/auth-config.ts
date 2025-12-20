// Helper to check which OAuth providers are configured
export const isInstagramConfigured = () => {
  return !!(process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET);
};

export const isPinterestConfigured = () => {
  return !!(process.env.PINTEREST_CLIENT_ID && process.env.PINTEREST_CLIENT_SECRET);
};

export const isGoogleConfigured = () => {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
};

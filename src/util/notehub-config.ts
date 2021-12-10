const config = {
  baseURL: process.env.HUB_BASE_URL || "https://api.notefile.net",
  authToken: process.env.NOTEHUB_TOKEN,
  projectID: process.env.NOTEHUB_PROJECT_ID,
  notecardID: process.env.NOTECARD_DEVICE_ID,
  defaultRefreshInterval: process.env.REFRESH_INTERVAL,
};

export default config;

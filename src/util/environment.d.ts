// Declare process.ENV types
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      HUB_BASE_URL: string;
      NOTEHUB_TOKEN: string;
      NOTEHUB_PROJECT_ID: string;
      NOTECARD_DEVICE_ID: string;
    }
  }
}

// Empty export statement to treat this file as a module
export {};

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:4174", trace: "off", screenshot: "off" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npm run e2e:serve",
    url: "http://127.0.0.1:4174",
    reuseExistingServer: false,
    env: { VITE_AUTH_ENABLED: "true" },
  },
});

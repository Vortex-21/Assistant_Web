import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  startUrls: ["<all_urls>"],
  manifest: {
    name: "Summarizer",
    version: "1.0",
    description: "My Chrome Extension",
    permissions: ["activeTab", "scripting", "nativeMessaging", "tabs","storage"],
    background: {
      service_worker: "background.js",
    },
    action: {
      default_title: "Summarizer",
      default_popup: "popup.html",
    },
    host_permissions: [
      "<all_urls>"
    ],
    
  },
});

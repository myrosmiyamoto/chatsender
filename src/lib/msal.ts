import { PublicClientApplication, type Configuration } from "@azure/msal-browser";

const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? "";
const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID ?? "";

const msalConfig: Configuration = {
  auth: {
    clientId: CLIENT_ID,
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
    redirectUri: typeof window !== "undefined" ? window.location.origin : "",
  },
  cache: {
    cacheLocation: "localStorage",
  },
};

let msalInstance: PublicClientApplication | null = null;

export async function getMsalInstance(): Promise<PublicClientApplication> {
  if (!msalInstance) {
    msalInstance = new PublicClientApplication(msalConfig);
    await msalInstance.initialize();
  }
  return msalInstance;
}

export const SCOPES = ["Chat.ReadWrite", "User.Read"];

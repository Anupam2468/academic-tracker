export function getGoogleOAuthClient(scopes: string, callback: (response: any) => void) {
  if (!(window as any).google?.accounts?.oauth2) {
    console.error("Google Identity Services script not loaded");
    return null;
  }
  return (window as any).google.accounts.oauth2.initTokenClient({
    client_id: "178616425849-gkf2nnfa61qa4hffgppcb4mrm6mdm921.apps.googleusercontent.com",
    scope: scopes,
    callback: callback,
  });
}

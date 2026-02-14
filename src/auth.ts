const CLIENT_ID = "9d1c250a-e61b-44d9-88ed-5944d1962f5e";
const REDIRECT_URI = "https://console.anthropic.com/oauth/code/callback";
const SCOPES = "user:inference user:profile";
const AUTHORIZE_URL = "https://claude.ai/oauth/authorize";
const TOKEN_URL = "https://console.anthropic.com/v1/oauth/token";

export interface OAuthState {
  state: string;
  verifier: string;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

function base64urlEncode(buffer: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function generateRandom(byteLength: number): string {
  const buffer = new Uint8Array(byteLength);
  crypto.getRandomValues(buffer);
  return base64urlEncode(buffer);
}

async function generateChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return base64urlEncode(new Uint8Array(hash));
}

export async function startOAuthFlow(): Promise<{ url: string; oauthState: OAuthState }> {
  const verifier = generateRandom(32);
  const challenge = await generateChallenge(verifier);
  const state = generateRandom(16);

  const params = new URLSearchParams({
    code: "true",
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge: challenge,
    code_challenge_method: "S256",
    state: state,
  });

  return {
    url: `${AUTHORIZE_URL}?${params.toString()}`,
    oauthState: { state, verifier },
  };
}

export async function exchangeCodeForTokens(
  authCode: string,
  oauthState: OAuthState
): Promise<OAuthTokens> {
  const cleanCode = authCode.split("#")[0].split("&")[0].trim();

  const tokenResponse = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      code: cleanCode,
      redirect_uri: REDIRECT_URI,
      code_verifier: oauthState.verifier,
      state: oauthState.state,
    }),
  });

  if (!tokenResponse.ok) {
    const err = await tokenResponse.text();
    throw new Error(`Token exchange failed (${tokenResponse.status}): ${err}`);
  }

  const data = await tokenResponse.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + (data.expires_in || 28800) * 1000,
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
  const tokenResponse = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "refresh_token",
      client_id: CLIENT_ID,
      refresh_token: refreshToken,
    }),
  });

  if (!tokenResponse.ok) {
    const err = await tokenResponse.text();
    throw new Error(`Token refresh failed (${tokenResponse.status}): ${err}`);
  }

  const data = await tokenResponse.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + (data.expires_in || 28800) * 1000,
  };
}

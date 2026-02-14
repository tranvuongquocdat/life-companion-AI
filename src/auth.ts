const CLIENT_ID = "9d1c250a-e61b-44d9-88ed-5944d1962f5e";
const REDIRECT_URI = "https://console.anthropic.com/oauth/code/callback";
const SCOPES = "org:create_api_key user:profile user:inference";
const AUTHORIZE_URL = "https://console.anthropic.com/oauth/authorize";
const TOKEN_URL = "https://console.anthropic.com/v1/oauth/token";
const CREATE_API_KEY_URL = "https://api.anthropic.com/api/oauth/claude_cli/create_api_key";

export interface OAuthState {
  state: string;
  verifier: string;
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

export async function exchangeCodeForApiKey(
  authCode: string,
  oauthState: OAuthState
): Promise<string> {
  const cleanCode = authCode.split("#")[0].split("&")[0].trim();

  // Step 1: Exchange code for access token
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

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  // Step 2: Create permanent API key
  const keyResponse = await fetch(CREATE_API_KEY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!keyResponse.ok) {
    const err = await keyResponse.text();
    throw new Error(`API key creation failed (${keyResponse.status}): ${err}`);
  }

  const keyData = await keyResponse.json();
  return keyData.raw_key;
}

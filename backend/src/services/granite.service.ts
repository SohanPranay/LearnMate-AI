import axios, { AxiosError } from "axios";
import dotenv from "dotenv";

dotenv.config();

interface GraniteTokenResponse {
  access_token: string;
  expires_in: number;
}

interface GraniteGenerationResponse {
  model_id?: string;
  created_at?: string;
  results?: Array<{
    generated_text?: string;
    stop_reason?: string;
    generated_token_count?: number;
    input_token_count?: number;
  }>;
}

export interface GraniteResponse {
  success: boolean;
  data: {
    model: string;
    text: string;
    stopReason: string;
    tokens: {
      input: number;
      output: number;
    };
  };
  meta: {
    timestamp: string;
  };
}

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value.trim();
}

async function getIamToken(): Promise<string> {
  const now = Date.now();

  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  const apiKey = getRequiredEnv("IBM_CLOUD_API_KEY");
  const iamUrl = process.env.IBM_IAM_URL?.trim() || "https://iam.cloud.ibm.com/identity/token";

  const body = new URLSearchParams({
    grant_type: "urn:ibm:params:oauth:grant-type:apikey",
    apikey: apiKey,
  });

  const response = await axios.post<GraniteTokenResponse>(iamUrl, body.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    timeout: 15000,
  });

  cachedToken = response.data.access_token;
  const expiresInSeconds = response.data.expires_in || 3600;
  tokenExpiresAt = now + Math.max(60, expiresInSeconds - 120) * 1000;

  return cachedToken;
}

function buildGranitePayload(prompt: string) {
  return {
    model_id: process.env.IBM_GRANITE_MODEL_ID?.trim() || "ibm/granite-3-8b-instruct",
    input: prompt,
    parameters: {
      decoding_method: "greedy",
      max_new_tokens: 300,
      min_new_tokens: 1,
      repetition_penalty: 1.05,
    },
    project_id: getRequiredEnv("IBM_WATSONX_PROJECT_ID"),
  };
}

export async function callGranite(prompt: string): Promise<GraniteResponse> {
  if (!prompt || !prompt.trim()) {
    throw new Error("Prompt is required.");
  }

  try {
    const token = await getIamToken();
    const apiUrl =
      process.env.IBM_GRANITE_API_URL?.trim() ||
      "https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29";

    const response = await axios.post<GraniteGenerationResponse>(
      apiUrl,
      buildGranitePayload(prompt.trim()),
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 30000,
      }
    );

    const result = response.data.results?.[0];

    return {
      success: true,
      data: {
        model: response.data.model_id || buildGranitePayload(prompt).model_id,
        text: result?.generated_text || "",
        stopReason: result?.stop_reason || "unknown",
        tokens: {
          input: result?.input_token_count || 0,
          output: result?.generated_token_count || 0,
        },
      },
      meta: {
        timestamp: response.data.created_at || new Date().toISOString(),
      },
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error?: string; errors?: Array<{ message?: string }> }>;
      const remoteMessage =
        axiosError.response?.data?.error ||
        axiosError.response?.data?.errors?.[0]?.message ||
        axiosError.message;

      throw new Error(`Granite API error: ${remoteMessage}`);
    }

    throw new Error(
      `Granite service error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

export default callGranite;

import os
import time
import requests
from dotenv import load_dotenv

load_dotenv()

cached_token = None
token_expires_at = 0

def get_required_env(name: str) -> str:
    value = os.getenv(name)
    if not value or not value.strip():
        raise ValueError(f"Missing required environment variable: {name}")
    return value.strip()

def get_iam_token() -> str:
    global cached_token, token_expires_at
    now = time.time() * 1000

    if cached_token and now < token_expires_at:
        return cached_token

    api_key = get_required_env("IBM_CLOUD_API_KEY")
    iam_url = os.getenv("IBM_IAM_URL", "https://iam.cloud.ibm.com/identity/token").strip()

    payload = {
        "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
        "apikey": api_key
    }

    response = requests.post(
        iam_url,
        data=payload,
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json"
        },
        timeout=15
    )
    response.raise_for_status()

    data = response.json()
    cached_token = data["access_token"]
    expires_in = data.get("expires_in", 3600)
    token_expires_at = now + max(60, expires_in - 120) * 1000

    return cached_token

def call_granite(prompt: str) -> dict:
    if not prompt or not prompt.strip():
        raise ValueError("Prompt is required.")

    token = get_iam_token()
    api_url = os.getenv("IBM_GRANITE_API_URL", "https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29").strip()
    model_id = os.getenv("IBM_GRANITE_MODEL_ID", "ibm/granite-3-8b-instruct").strip()
    project_id = get_required_env("IBM_WATSONX_PROJECT_ID")

    payload = {
        "model_id": model_id,
        "input": prompt,
        "parameters": {
            "decoding_method": "greedy",
            "max_new_tokens": 1000,
            "min_new_tokens": 1,
            "repetition_penalty": 1.05
        },
        "project_id": project_id
    }

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    response = requests.post(api_url, json=payload, headers=headers, timeout=30)
    response.raise_for_status()
    
    res_data = response.json()
    results = res_data.get("results", [{}])
    generated_text = results[0].get("generated_text", "")
    stop_reason = results[0].get("stop_reason", "")
    input_tokens = results[0].get("input_token_count", 0)
    output_tokens = results[0].get("generated_token_count", 0)

    return {
        "success": True,
        "data": {
            "model": model_id,
            "text": generated_text,
            "stopReason": stop_reason,
            "tokens": {
                "input": input_tokens,
                "output": output_tokens
            }
        },
        "meta": {
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
    }

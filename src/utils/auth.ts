import { LoginCredentials, LoginResponse } from "../types";
import fetch from "node-fetch";

export async function login(credentials: LoginCredentials): Promise<string> {
  const loginUrl = `${process.env.CAMINHO_DO_FOGO_API}/login`;
  const loginResponse = await fetch(loginUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!loginResponse.ok) {
    throw new Error(`Login failed: ${loginResponse.statusText}`);
  }

  const loginData = (await loginResponse.json()) as LoginResponse;
  return loginData.token;
}

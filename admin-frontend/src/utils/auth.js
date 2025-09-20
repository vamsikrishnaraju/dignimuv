// src/utils/auth.js
import { setAuthToken } from "../api/client";

const TOKEN_KEY = "adminToken";

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
  setAuthToken(token);
}

export function loadToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) setAuthToken(token);
  return token;
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  setAuthToken(null);
}

export function isAuthenticated() {
  return !!localStorage.getItem(TOKEN_KEY);
}

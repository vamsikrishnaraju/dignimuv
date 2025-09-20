// src/api/client.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const client = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// helper to set/unset token for subsequent requests
export function setAuthToken(token) {
  if (token) client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete client.defaults.headers.common["Authorization"];
}

export default client;

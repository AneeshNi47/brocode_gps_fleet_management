// src/pages/AuthCallback.tsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { exchangeCodeForToken } from "@/lib/erp-oauth";

export function AuthCallback() {
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(loc.search);
      const code = params.get("code");
      const state = params.get("state") || "/";
      const verifier = sessionStorage.getItem("pkce_verifier") || "";

      try {
        await exchangeCodeForToken({ code: code!, code_verifier: verifier });
        nav(state, { replace: true });
      } catch (err) {
        console.error("Login failed", err);
        nav("/auth/error", { replace: true });
      }
    };
    run();
  }, []);

  return <div className="p-6">Logging in...</div>;
}
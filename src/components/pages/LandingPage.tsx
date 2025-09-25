// src/pages/LandingPage.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated,buildAuthorizeUrl } from "../../lib/erp-oauth"
import { makePkcePair } from "@/lib/pkce";

export function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard");
    }
  }, []);

  const handleLogin = async () => {
    const { verifier, challenge } = await makePkcePair();
    sessionStorage.setItem("pkce_verifier", verifier);

    const loginUrl = buildAuthorizeUrl({
      code_challenge: challenge,
      state: "/dashboard", // After login, redirect here
    });

    window.location.href = loginUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Welcome to Fleet Management</h1>
        <p className="text-lg text-muted-foreground">Please log in to continue.</p>
        <button
          onClick={handleLogin}
          className="bg-primary text-white px-6 py-3 rounded hover:bg-primary/90 transition"
        >
          Login with ERPNext
        </button>
      </div>
    </div>
  );
}
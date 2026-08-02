import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Login from "@/components/Login";

function messageFromQuery(raw: string | null): string | undefined {
  if (raw === "session_expired") {
    return "Your session has expired. Please sign in again.";
  }
  if (raw === "unauthorized") {
    return "You were signed out. Please sign in again.";
  }
  return undefined;
}

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bannerMessage = messageFromQuery(searchParams.get("message"));

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-sm text-text-muted">
        Loading…
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return <Login bannerMessage={bannerMessage} />;
}

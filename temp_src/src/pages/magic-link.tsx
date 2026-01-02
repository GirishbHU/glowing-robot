import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Loader2, CheckCircle, XCircle, Sparkles, User, AlertCircle, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MagicLink() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "name_required" | "name_setup" | "validating" | "success" | "not_found" | "error">("loading");
  const [error, setError] = useState<string>("");
  const [hint, setHint] = useState<string>("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const [showNameLogin, setShowNameLogin] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setError("Invalid magic link - no session ID provided");
      return;
    }

    async function checkSession() {
      try {
        const response = await fetch(`/api/user-sessions/${sessionId}`);
        
        if (!response.ok) {
          const data = await response.json();
          if (response.status === 404) {
            setStatus("not_found");
            setError("Session not found");
            return;
          }
          throw new Error(data.error || "Session not found or has been deactivated");
        }

        const data = await response.json();
        setSessionData(data.session);
        
        if (data.hasDisplayName) {
          setStatus("name_required");
        } else {
          setStatus("name_setup");
        }
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Failed to verify magic link");
      }
    }

    checkSession();
  }, [sessionId]);

  const handleValidateName = async () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setHint("");

    try {
      const response = await fetch(`/api/user-sessions/${sessionId}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Validation failed");
        setHint(data.hint || "");
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem("vjq_session_id", sessionId!);
      localStorage.setItem("valueHubSessionId", sessionId!);
      setStatus("success");
      
      setTimeout(() => {
        setLocation("/account");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to validate");
      setIsSubmitting(false);
    }
  };

  const handleNameLogin = async () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setHint("");

    try {
      const response = await fetch("/api/user-sessions/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "No account found with that name");
        setHint(data.hint || "Try different words from your name");
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem("vjq_session_id", data.session.sessionId);
      localStorage.setItem("valueHubSessionId", data.session.sessionId);
      
      // Also save the freeUser session ID if returned
      if (data.freeUser?.sessionId) {
        localStorage.setItem("i2u_session_id", data.freeUser.sessionId);
      }
      
      setStatus("success");
      
      setTimeout(() => {
        setLocation("/account");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login");
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isSubmitting) {
      if (status === "not_found" && showNameLogin) {
        handleNameLogin();
      } else {
        handleValidateName();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {status === "loading" && (
          <div className="text-center space-y-4" data-testid="status-loading">
            <div className="w-16 h-16 mx-auto rounded-full bg-violet-500/20 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-white">Loading Magic Link</h1>
            <p className="text-slate-400">Please wait...</p>
          </div>
        )}

        {status === "name_required" && (
          <div className="space-y-6" data-testid="status-name-required">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center">
                <User className="w-8 h-8 text-amber-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">Verify Your Identity</h1>
              <p className="text-slate-400">
                Enter any word from your name to access your account
              </p>
              <p className="text-sm text-slate-500">
                Spelling doesn't have to be perfect, and order doesn't matter!
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Enter any word from your name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                  disabled={isSubmitting}
                  data-testid="input-name-validate"
                />
                {error && (
                  <div className="flex items-start gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p>{error}</p>
                      {hint && <p className="text-slate-500 mt-1">{hint}</p>}
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={handleValidateName}
                disabled={isSubmitting || !name.trim()}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white"
                data-testid="button-validate-name"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Access My Account
                  </>
                )}
              </Button>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-500 text-center">
                Forgot your name? Contact support or start a new session.
              </p>
            </div>
          </div>
        )}

        {status === "name_setup" && (
          <div className="space-y-6" data-testid="status-name-setup">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">Welcome! Set Your Name</h1>
              <p className="text-slate-400">
                Choose a display name or use your real name - this will be your access key
              </p>
              <p className="text-sm text-slate-500">
                You'll use any word from this name to access your account
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="e.g., Cosmic Pioneer, John Smith, Project Phoenix..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                  disabled={isSubmitting}
                  data-testid="input-name-setup"
                />
                {error && (
                  <p className="text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </p>
                )}
              </div>

              <Button
                onClick={handleValidateName}
                disabled={isSubmitting || !name.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
                data-testid="button-set-name"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Set My Name & Continue
                  </>
                )}
              </Button>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <p className="text-amber-200 text-sm">
                <span className="font-semibold">Remember this name!</span> You'll need any word from it to access your account from other devices.
              </p>
            </div>
          </div>
        )}

        {status === "not_found" && (
          <div className="space-y-6" data-testid="status-not-found">
            {!showNameLogin ? (
              <>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-amber-400" />
                  </div>
                  <h1 className="text-2xl font-bold text-white">Link Not Found</h1>
                  <p className="text-slate-400">
                    This magic link doesn't match any active session. But don't worry - you have options!
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => setShowNameLogin(true)}
                    className="w-full bg-violet-600 hover:bg-violet-500 text-white"
                    data-testid="button-login-with-name"
                  >
                    <KeyRound className="w-4 h-4 mr-2" />
                    Login with My Name
                  </Button>
                  
                  <Button
                    onClick={() => {
                      window.location.href = "/value-journey";
                    }}
                    variant="outline"
                    className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
                    data-testid="button-start-fresh"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Start Fresh Assessment
                  </Button>
                </div>

                <p className="text-xs text-slate-500 text-center">
                  If you've completed an assessment before, try logging in with your name
                </p>
              </>
            ) : (
              <>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-violet-500/20 flex items-center justify-center">
                    <KeyRound className="w-8 h-8 text-violet-400" />
                  </div>
                  <h1 className="text-2xl font-bold text-white">Login with Your Name</h1>
                  <p className="text-slate-400">
                    Enter any word from your display name or real name
                  </p>
                  <p className="text-sm text-slate-500">
                    Spelling doesn't have to be perfect!
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      placeholder="e.g., Cosmic, Pioneer, John..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                      disabled={isSubmitting}
                      autoFocus
                      data-testid="input-name-login"
                    />
                    {error && (
                      <div className="flex items-start gap-2 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p>{error}</p>
                          {hint && <p className="text-slate-500 mt-1">{hint}</p>}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleNameLogin}
                    disabled={isSubmitting || !name.trim()}
                    className="w-full bg-violet-600 hover:bg-violet-500 text-white"
                    data-testid="button-submit-name-login"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Finding your account...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Find My Account
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => {
                      setShowNameLogin(false);
                      setError("");
                      setName("");
                    }}
                    variant="ghost"
                    className="w-full text-slate-400 hover:text-white"
                    data-testid="button-back"
                  >
                    Back to options
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {status === "success" && (
          <div className="text-center space-y-4" data-testid="status-success">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Welcome Back!</h1>
            <p className="text-slate-400">Identity verified. Redirecting to your account...</p>
            <div className="flex items-center justify-center gap-2 text-violet-400">
              <Sparkles className="w-4 h-4" />
              <span>Session restored</span>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="text-center space-y-4" data-testid="status-error">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Something Went Wrong</h1>
            <p className="text-slate-400">{error}</p>
            <div className="pt-4 space-y-3">
              <Button
                onClick={() => {
                  setStatus("not_found");
                  setError("");
                }}
                className="w-full bg-violet-600 hover:bg-violet-500 text-white"
                data-testid="button-try-login"
              >
                <KeyRound className="w-4 h-4 mr-2" />
                Try Login with Name
              </Button>
              <Button
                onClick={() => {
                  window.location.href = "/value-journey";
                }}
                variant="outline"
                className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
                data-testid="button-start-fresh"
              >
                Start Fresh Assessment
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

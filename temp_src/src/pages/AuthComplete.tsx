import { useEffect } from "react";
import { Check, Loader2 } from "lucide-react";

export default function AuthComplete() {
  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage('auth-complete', window.location.origin);
      setTimeout(() => {
        window.close();
      }, 1000);
    } else {
      window.location.href = '/';
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center p-8 bg-slate-800/50 rounded-2xl border border-slate-700 max-w-sm">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
          <Check className="w-8 h-8 text-green-400" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Sign In Successful!</h1>
        <p className="text-slate-400 text-sm">
          This window will close automatically...
        </p>
        <Loader2 className="w-5 h-5 mx-auto mt-4 animate-spin text-violet-400" />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import LoginMascot from "@/components/LoginMascot"; // Import the Bear

export default function LoginPage() {
  const router = useRouter();
  
  // Login Data
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Animation States
  const [focusedInput, setFocusedInput] = useState<"email" | "password" | null>(null);
  const [isSuccess, setIsSuccess] = useState(false); // Triggers happy face
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("❌ Access Denied: " + error.message);
      setLoading(false);
      setIsSuccess(false);
    } else {
      // SUCCESS! Trigger animation first
      setIsSuccess(true);
      setFocusedInput(null); // Reset hands
      
      // Wait 1.5s to enjoy the animation, then redirect
      setTimeout(() => {
        router.push("/admin");
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-xl shadow-2xl relative overflow-hidden">
        
        {/* Background Ambience */}
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none"></div>

        {/* --- THE MASCOT --- */}
        <LoginMascot 
          focusedInput={focusedInput} 
          textLength={email.length} 
          isSuccess={isSuccess} 
        />
        
        <h1 className="text-2xl font-bold text-white text-center mb-2 relative z-10">Restricted Area</h1>
        <p className="text-slate-400 text-center mb-8 text-sm relative z-10">Authenticate to access control center.</p>

        <form onSubmit={handleLogin} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-cyan-500 outline-none transition-colors"
              value={email}
              // Update state for animation
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedInput("email")}
              onBlur={() => setFocusedInput(null)}
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-cyan-500 outline-none transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              // Trigger "Cover Eyes"
              onFocus={() => setFocusedInput("password")}
              onBlur={() => setFocusedInput(null)}
            />
          </div>

          {error && <div className="p-3 bg-red-900/20 border border-red-900/50 text-red-400 text-sm rounded text-center animate-pulse">{error}</div>}

          <button 
            type="submit" 
            disabled={loading || isSuccess}
            className={`w-full py-3 rounded font-bold transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed
              ${isSuccess 
                ? "bg-green-500 text-white scale-105 shadow-[0_0_20px_rgba(34,197,94,0.5)]" 
                : "bg-cyan-600 hover:bg-cyan-500 text-white hover:shadow-[0_0_15px_rgba(6,182,212,0.5)]"
              }`}
          >
            {isSuccess ? "Access Granted!" : loading ? "Verifying..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
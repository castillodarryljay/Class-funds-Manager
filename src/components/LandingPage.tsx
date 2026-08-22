import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Wallet, Shield, Users, Landmark, FileText, ArrowRight, CheckCircle2 } from "lucide-react";

export const LandingPage: React.FC = () => {
  const { signInGoogle, loginSandboxUser, error, setError } = useApp();
  const [showSandboxOptions, setShowSandboxOptions] = useState(false);
  const [customName, setCustomName] = useState("");
  const [selectedRole, setSelectedRole] = useState<"treasurer" | "student">(() => {
    return (localStorage.getItem("preferred_login_role") as "treasurer" | "student") || "treasurer";
  });

  const handleSandboxLogin = async () => {
    try {
      await loginSandboxUser(selectedRole, customName.trim() || undefined);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between" id="landing-page">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-600 text-white p-2 rounded-xl shadow-md shadow-emerald-600/10">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-950 uppercase">Class Funds</span>
              <span className="text-[10px] block font-semibold text-emerald-600 tracking-wider uppercase -mt-0.5">Financial Transparency</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSandboxOptions(true)}
              className="text-sm font-semibold text-slate-700 hover:text-emerald-600 transition px-3 py-1.5 rounded-lg hover:bg-slate-100"
              id="about-system-btn"
            >
              Demo Sandbox
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 flex items-center justify-center py-12 px-6">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left: Title and Marketing message */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-emerald-100">
              <Shield className="h-3.5 w-3.5" /> Secure Enterprise Grade Database Encryption
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-none">
              Simple and transparent <br/>
              <span className="text-emerald-600">classroom fund</span> management.
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed max-w-xl">
              An elegant financial management platform for schools. Authorized Treasurers can create workspaces, securely log payments, record expenses, maintain detailed audit trails, and present students with their contribution logs in absolute privacy.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg pt-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-slate-950 text-sm">Role-Based Access</h3>
                  <p className="text-xs text-slate-500">Distinct secure views for Treasurer and Students.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-slate-950 text-sm">Transparent Audit Logs</h3>
                  <p className="text-xs text-slate-500">Every single transaction is logged to verify authenticity.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-slate-950 text-sm">Expense & Receipt Tracking</h3>
                  <p className="text-xs text-slate-500">Verify school expense records and remaining balances.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-slate-950 text-sm">Secure Sign-In</h3>
                  <p className="text-xs text-slate-500">Fully secured using Google Authentication.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Right: Sign-In Panel */}
          <div className="lg:col-span-5 bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 flex flex-col justify-center text-center">
            
            {/* Segmented Tab Selector for Login Role */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl mb-6">
              <button
                onClick={() => {
                  setSelectedRole("treasurer");
                  localStorage.setItem("preferred_login_role", "treasurer");
                }}
                className={`py-3 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  selectedRole === "treasurer"
                    ? "bg-white text-slate-950 shadow-sm font-black"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                id="login-tab-treasurer"
              >
                <Shield className="h-3.5 w-3.5" />
                Treasurer
              </button>
              <button
                onClick={() => {
                  setSelectedRole("student");
                  localStorage.setItem("preferred_login_role", "student");
                }}
                className={`py-3 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  selectedRole === "student"
                    ? "bg-white text-slate-950 shadow-sm font-black"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                id="login-tab-student"
              >
                <Users className="h-3.5 w-3.5" />
                Student
              </button>
            </div>

            {/* Role Header and Information */}
            <div className="mb-6 space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">
                {selectedRole === "treasurer" ? "Treasurer Portal" : "Student Portal"}
              </h2>
              <p className="text-slate-500 text-sm leading-normal">
                {selectedRole === "treasurer" 
                  ? "Sign in to manage classes, target goals, record payments, and track receipts."
                  : "Sign in to view your individual payments, remaining balances, and verify receipts."
                }
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl mb-6 text-left font-medium border border-red-100 relative">
                <span>{error}</span>
                <button onClick={() => setError(null)} className="absolute right-3 top-3 text-red-400 hover:text-red-700 font-bold">×</button>
              </div>
            )}

            <div className="space-y-4">
              {/* Google Sign In */}
              <button
                onClick={signInGoogle}
                className="w-full bg-slate-950 hover:bg-slate-900 text-white font-semibold py-3.5 px-6 rounded-xl transition flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:shadow-slate-950/10 cursor-pointer"
                id="google-signin-btn"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Continue as {selectedRole === "treasurer" ? "Treasurer" : "Student"}
              </button>

              {selectedRole === "treasurer" ? (
                <p className="text-[10px] text-slate-400 font-medium">
                  * First-time Treasurers will be requested to provide a security key.
                </p>
              ) : (
                <p className="text-[10px] text-emerald-600 font-semibold">
                  * Join your class instantly by signing in and entering your invite code.
                </p>
              )}

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">Or Sandbox Demo</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Fast Sandbox Options for reviewing inside the IFrame */}
              {!showSandboxOptions ? (
                <button
                  onClick={() => setShowSandboxOptions(true)}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold py-2.5 px-6 rounded-xl transition flex items-center justify-center gap-2 border border-slate-200/60 text-xs cursor-pointer"
                  id="show-sandbox-options-btn"
                >
                  Quick Sandbox Demo ({selectedRole === "treasurer" ? "Treasurer" : "Student"})
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl text-left space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-950 uppercase tracking-wider">Demo / Sandbox Login</span>
                    <button 
                      onClick={() => setShowSandboxOptions(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
                    >
                      Hide
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Testing Name</label>
                    <input
                      type="text"
                      className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                      placeholder={selectedRole === "treasurer" ? "e.g. Darryl Jay" : "e.g. Juan Dela Cruz"}
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={handleSandboxLogin}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-xs transition cursor-pointer"
                    id="submit-sandbox-login-btn"
                  >
                    Login as Sandbox {selectedRole === "treasurer" ? "Treasurer" : "Student"}
                  </button>
                  <p className="text-[10px] text-slate-400 text-center leading-normal mt-1">
                    * Bypasses Google popup blocker. Writes to real Firestore database.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>Class Funds System &copy; 2026. Designed & Developed by <strong>Darryl Jay Castillo (SHIRO)</strong>.</span>
          <div className="flex gap-4">
            <span className="text-slate-400">Firebase Firestore</span>
            <span className="text-slate-400">Secure Audit Logs</span>
            <span className="text-slate-400 font-bold text-emerald-600">SHIRO &bull; Creator</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Landmark, ShieldCheck, User, Key, Check } from "lucide-react";
import { UserRole } from "../types";

interface RoleSelectionProps {
  onRoleSelected: (role: UserRole) => void;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({ onRoleSelected }) => {
  const [selected, setSelected] = useState<UserRole | null>(null);
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const handleNext = () => {
    if (!selected) return;
    
    if (selected === "treasurer") {
      // Demostrate controlled registration process
      // We will allow standard passcode "TREASURER2026" or "DEMO" for testing, but show it on screen for easy verification!
      if (accessCode.trim().toUpperCase() !== "TREASURER2026" && accessCode.trim().toUpperCase() !== "DEMO") {
        setError("Invalid Registration Key. Enter 'TREASURER2026' or 'DEMO' to test the registration.");
        return;
      }
    }
    
    setError(null);
    onRoleSelected(selected);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-6" id="role-selection-view">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 space-y-6">
        <div className="text-center space-y-2">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl w-fit mx-auto mb-2 border border-emerald-100">
            <Landmark className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">What is your role?</h2>
          <p className="text-slate-500 text-sm">Select your official role to customize your dashboard workspace.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-xs p-3 rounded-xl font-medium">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {/* Option Student */}
          <button
            onClick={() => {
              setSelected("student");
              setError(null);
            }}
            className={`w-full p-4 rounded-2xl border-2 transition text-left flex items-start gap-4 ${
              selected === "student"
                ? "border-emerald-600 bg-emerald-50/40 shadow-sm"
                : "border-slate-100 bg-white hover:border-slate-200"
            }`}
          >
            <div className={`p-2.5 rounded-xl border ${
              selected === "student" ? "bg-emerald-600 text-white border-emerald-600" : "bg-slate-50 text-slate-600 border-slate-100"
            }`}>
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-950">Classroom Student</span>
                {selected === "student" && <Check className="h-4 w-4 text-emerald-600" />}
              </div>
              <p className="text-xs text-slate-500 mt-1">Join via invitation link, view private contribution status, and access class receipts.</p>
            </div>
          </button>

          {/* Option Treasurer */}
          <button
            onClick={() => {
              setSelected("treasurer");
              setError(null);
            }}
            className={`w-full p-4 rounded-2xl border-2 transition text-left flex items-start gap-4 ${
              selected === "treasurer"
                ? "border-emerald-600 bg-emerald-50/40 shadow-sm"
                : "border-slate-100 bg-white hover:border-slate-200"
            }`}
          >
            <div className={`p-2.5 rounded-xl border ${
              selected === "treasurer" ? "bg-emerald-600 text-white border-emerald-600" : "bg-slate-50 text-slate-600 border-slate-100"
            }`}>
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-950">Official Treasurer</span>
                {selected === "treasurer" && <Check className="h-4 w-4 text-emerald-600" />}
              </div>
              <p className="text-xs text-slate-500 mt-1">Create classrooms, generate secure invites, log payments, track expenses and audit histories.</p>
            </div>
          </button>
        </div>

        {selected === "treasurer" && (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-700">Treasurer Registration Key Required</span>
            </div>
            <input
              type="text"
              placeholder="Enter Registration Key"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="w-full bg-white border border-slate-200 px-3 py-2 text-sm rounded-xl focus:outline-none focus:border-emerald-600 text-slate-950 uppercase"
            />
            <p className="text-[10px] text-emerald-600 font-semibold leading-normal">
              *Controlled Signup Security: Please enter &quot;TREASURER2026&quot; or &quot;DEMO&quot; to authorize this Treasurer profile.
            </p>
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={!selected}
          className={`w-full py-3 px-4 font-bold rounded-xl transition shadow-md ${
            selected 
              ? "bg-slate-950 text-white hover:bg-slate-900 cursor-pointer" 
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          Confirm Role
        </button>
      </div>
    </div>
  );
};

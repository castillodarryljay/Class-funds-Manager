import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { ShieldCheck, Plus, X, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

interface JoinAnotherClassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JoinAnotherClassModal: React.FC<JoinAnotherClassModalProps> = ({ isOpen, onClose }) => {
  const { user, requestJoinClassroom, error, setError } = useApp();
  
  const [inviteCode, setInviteCode] = useState("");
  const [studentId, setStudentId] = useState(user?.studentId || "");
  const [program, setProgram] = useState(user?.program || "");
  const [section, setSection] = useState(user?.section || "");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    
    setLoading(true);
    setSuccessMessage(null);
    setError(null);

    try {
      const result = await requestJoinClassroom(inviteCode.trim(), {
        studentId: studentId.trim() || user.studentId || "",
        program: program.trim() || user.program || "",
        section: section.trim() || user.section || "",
        yearLevel: user.yearLevel || "2nd Year"
      });

      if (result.success) {
        if (result.status === "approved") {
          setSuccessMessage(`Successfully switched to ${result.classroom?.name || "classroom"}!`);
          setTimeout(() => {
            setSuccessMessage(null);
            setInviteCode("");
            onClose();
          }, 1500);
        } else {
          setSuccessMessage(`Join request submitted to ${result.classroom?.name || "Treasurer"}! Awaiting approval.`);
          setTimeout(() => {
            setSuccessMessage(null);
            setInviteCode("");
            onClose();
          }, 2000);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in text-left">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-5">
        
        {/* Close Button */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
            <Plus className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-950 tracking-tight">Join Another Classroom</h3>
            <p className="text-xs text-slate-500 font-medium">Enter the classroom invite code from your Treasurer</p>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-2xl flex items-center gap-2.5 font-bold animate-fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-2xl flex items-center gap-2.5 font-semibold animate-fade-in">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Class Invite Code *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. BSIT2A-7F29"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-black tracking-widest uppercase text-center"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Student ID
              </label>
              <input
                type="text"
                placeholder="e.g. 2024-00123"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Section
              </label>
              <input
                type="text"
                placeholder="e.g. BSIT 2-A"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !inviteCode.trim()}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-600/10 transition flex items-center gap-1.5 cursor-pointer"
            >
              {loading ? "Submitting..." : (
                <>
                  <span>Join Classroom</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Secure Student Workspace</span>
          </div>
          <span className="font-mono text-[10px]">Multi-Classroom Support</span>
        </div>

      </div>
    </div>
  );
};

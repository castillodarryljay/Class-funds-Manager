import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { AppLogo } from "./AppLogo";
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Mail, 
  User, 
  Hash, 
  GraduationCap, 
  Layers, 
  Calendar, 
  Phone, 
  RefreshCw, 
  ArrowLeft, 
  LogOut, 
  ShieldCheck,
  AlertTriangle
} from "lucide-react";

export const StudentPendingApproval: React.FC = () => {
  const { user, pendingJoinRequest, cancelStudentJoinRequest, signOutUser, error } = useApp();
  const [cancelling, setCancelling] = useState(false);

  if (!pendingJoinRequest) return null;

  const isPending = pendingJoinRequest.status === "pending";
  const isRejected = pendingJoinRequest.status === "rejected";

  const handleCancel = async () => {
    if (window.confirm("Are you sure you want to withdraw this registration request? You can submit another code afterwards.")) {
      setCancelling(true);
      await cancelStudentJoinRequest();
      setCancelling(false);
    }
  };

  const formattedDate = pendingJoinRequest.requestedAt 
    ? new Date(pendingJoinRequest.requestedAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      })
    : "Recently";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6" id="student-approval-status-view">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
        
        {/* Header Banner */}
        <div className={`p-8 text-center space-y-3 relative text-white ${
          isPending 
            ? "bg-slate-900" 
            : isRejected 
            ? "bg-red-950" 
            : "bg-emerald-950"
        }`}>
          <div className="flex justify-center mb-1">
            <AppLogo size="lg" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/10 backdrop-blur border border-white/10">
              {isPending && (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  <span className="text-amber-300">Pending Treasurer Approval</span>
                </>
              )}
              {isRejected && (
                <>
                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-red-300">Registration Declined</span>
                </>
              )}
            </div>

            <h2 className="text-2xl font-black tracking-tight text-white pt-2">
              {pendingJoinRequest.classroomName || "Classroom Workspace"}
            </h2>
            <p className="text-slate-300 text-xs font-medium">
              Submitted on {formattedDate}
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-xs p-3.5 rounded-2xl font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {isPending ? (
            <div className="bg-amber-50/80 border border-amber-200/70 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Verification In Progress</span>
              </div>
              <p className="text-amber-800/90 text-xs leading-relaxed font-medium">
                Your registration has been forwarded to the <strong>Classroom Treasurer</strong> for identity verification. Once approved, this screen will automatically refresh and grant you full access to fund reports and payment logs.
              </p>
            </div>
          ) : isRejected ? (
            <div className="bg-red-50 border border-red-200 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-red-950 font-bold text-sm">
                <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                <span>Registration Request Rejected</span>
              </div>
              <p className="text-red-800 text-xs leading-relaxed font-semibold">
                Reason: &ldquo;{pendingJoinRequest.rejectionReason || "Not found in official class masterlist"}&rdquo;
              </p>
              <p className="text-red-700/80 text-[11px] leading-relaxed">
                Please verify your student credentials with your classroom treasurer or withdraw this request to enter another class invite code.
              </p>
            </div>
          ) : null}

          {/* Student Submitted Registration Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                Submitted Student Credentials
              </span>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-200/50">
                <ShieldCheck className="w-3 h-3" /> Google Verified
              </span>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-3 text-xs">
              {/* Email */}
              <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-200/60">
                <span className="text-slate-500 font-bold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Registered Email:
                </span>
                <span className="text-slate-900 font-black text-right break-all">
                  {pendingJoinRequest.email}
                </span>
              </div>

              {/* Full Name */}
              <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-200/60">
                <span className="text-slate-500 font-bold flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Student Name:
                </span>
                <span className="text-slate-900 font-bold text-right">
                  {pendingJoinRequest.name}
                </span>
              </div>

              {/* Student ID */}
              <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-200/60">
                <span className="text-slate-500 font-bold flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-slate-400" /> Student ID:
                </span>
                <span className="text-slate-900 font-mono font-black text-right bg-white px-2 py-0.5 rounded border border-slate-200">
                  {pendingJoinRequest.studentId || "N/A"}
                </span>
              </div>

              {/* Program & Section */}
              <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-200/60">
                <span className="text-slate-500 font-bold flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> Course & Section:
                </span>
                <span className="text-slate-900 font-bold text-right">
                  {pendingJoinRequest.program} &bull; Section {pendingJoinRequest.section} ({pendingJoinRequest.yearLevel})
                </span>
              </div>

              {/* Contact */}
              {pendingJoinRequest.contact && (
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 font-bold flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> Contact Number:
                  </span>
                  <span className="text-slate-900 font-bold text-right">
                    {pendingJoinRequest.contact}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Real-time synchronization note */}
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
              <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
              <span>Real-time listener active — will auto-open upon approval</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 border border-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
              {cancelling ? "Withdrawing..." : "Withdraw Request / Try Another Code"}
            </button>

            <button
              onClick={signOutUser}
              className="w-full bg-transparent hover:bg-slate-100 text-slate-500 font-bold py-2 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>

        {/* Footer branding */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 font-medium tracking-wide">
            Powered by <span className="font-semibold text-slate-600">ClassFund Manager</span> &bull; Designed by <span className="font-semibold text-slate-600">Darryl jay Castillo (SHIRO)</span>
          </p>
        </div>
      </div>
    </div>
  );
};

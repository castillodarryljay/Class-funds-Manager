import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { JoinRequest } from "../types";
import { 
  UserCheck, 
  UserX, 
  Mail, 
  Hash, 
  GraduationCap, 
  Layers, 
  Clock, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Eye, 
  AlertCircle, 
  Phone, 
  User, 
  Calendar,
  X,
  Sparkles
} from "lucide-react";

export const JoinRequestsManager: React.FC = () => {
  const { classroom, joinRequests, approveJoinRequest, rejectJoinRequest } = useApp();
  
  const [filterStatus, setFilterStatus] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [inspectingRequest, setInspectingRequest] = useState<JoinRequest | null>(null);
  const [rejectModalRequest, setRejectModalRequest] = useState<JoinRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  if (!classroom) return null;

  // Counts
  const pendingRequests = joinRequests.filter(r => r.status === "pending");
  const approvedRequests = joinRequests.filter(r => r.status === "approved");
  const rejectedRequests = joinRequests.filter(r => r.status === "rejected");

  // Filtering
  const filteredRequests = joinRequests.filter(req => {
    // Status filter
    if (filterStatus !== "all" && req.status !== filterStatus) return false;
    
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = req.name.toLowerCase().includes(q);
      const matchEmail = (req.email || "").toLowerCase().includes(q);
      const matchStudentId = (req.studentId || "").toLowerCase().includes(q);
      const matchSection = (req.section || "").toLowerCase().includes(q);
      const matchProgram = (req.program || "").toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchStudentId && !matchSection && !matchProgram) {
        return false;
      }
    }
    return true;
  });

  const handleApprove = async (req: JoinRequest) => {
    setProcessingId(req.id);
    setActionSuccessMessage(null);
    try {
      const success = await approveJoinRequest(req);
      if (success) {
        setActionSuccessMessage(`Successfully approved ${req.name}! They are now an enrolled student.`);
        if (inspectingRequest?.id === req.id) {
          setInspectingRequest(null);
        }
      }
    } catch (err) {
      console.error("Approval error:", err);
    } finally {
      setProcessingId(null);
      setTimeout(() => setActionSuccessMessage(null), 4000);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectModalRequest) return;
    setProcessingId(rejectModalRequest.id);
    setActionSuccessMessage(null);
    try {
      const success = await rejectJoinRequest(
        rejectModalRequest, 
        rejectReason.trim() || "Registration declined by Treasurer"
      );
      if (success) {
        setActionSuccessMessage(`Declined join request from ${rejectModalRequest.name}.`);
        setRejectModalRequest(null);
        setRejectReason("");
        if (inspectingRequest?.id === rejectModalRequest.id) {
          setInspectingRequest(null);
        }
      }
    } catch (err) {
      console.error("Rejection error:", err);
    } finally {
      setProcessingId(null);
      setTimeout(() => setActionSuccessMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in" id="join-requests-manager">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
              Gatekeeper Control
            </span>
            {pendingRequests.length > 0 && (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                {pendingRequests.length} Waiting
              </span>
            )}
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">Student Registration Requests</h2>
          <p className="text-slate-400 text-xs sm:text-sm font-medium">
            Review student registration details, verify registered Google emails, and accept or reject class admission.
          </p>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button 
            onClick={() => setActionSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-900 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Controls Bar: Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        
        {/* Status Filter Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/80 gap-1 overflow-x-auto">
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              filterStatus === "pending"
                ? "bg-white text-slate-950 shadow-sm border border-slate-200/50"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Pending</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              pendingRequests.length > 0 ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-600"
            }`}>
              {pendingRequests.length}
            </span>
          </button>

          <button
            onClick={() => setFilterStatus("approved")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              filterStatus === "approved"
                ? "bg-white text-slate-950 shadow-sm border border-slate-200/50"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Approved ({approvedRequests.length})</span>
          </button>

          <button
            onClick={() => setFilterStatus("rejected")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              filterStatus === "rejected"
                ? "bg-white text-slate-950 shadow-sm border border-slate-200/50"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            <XCircle className="w-3.5 h-3.5 text-red-500" />
            <span>Rejected ({rejectedRequests.length})</span>
          </button>

          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              filterStatus === "all"
                ? "bg-white text-slate-950 shadow-sm border border-slate-200/50"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            <span>All ({joinRequests.length})</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by name, email, student ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <UserCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {filterStatus === "pending" 
              ? "No Pending Join Requests" 
              : "No Student Requests Found"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {filterStatus === "pending"
              ? "All student join requests have been processed. New student submissions will appear here in real-time."
              : "Try adjusting your search query or status filter."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredRequests.map((req) => {
            const isPending = req.status === "pending";
            const isApproved = req.status === "approved";
            const isRejected = req.status === "rejected";
            const isProcessing = processingId === req.id;

            const dateLabel = req.requestedAt 
              ? new Date(req.requestedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })
              : "Recently";

            return (
              <div 
                key={req.id}
                className={`bg-white rounded-2xl p-5 border transition-all hover:shadow-md ${
                  isPending 
                    ? "border-amber-200/80 bg-gradient-to-r from-amber-50/20 to-white shadow-sm" 
                    : isRejected
                    ? "border-red-100 bg-red-50/10"
                    : "border-slate-200/80 hover:border-slate-300"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left Column: Student Avatar & Identification */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black flex items-center justify-center text-base shrink-0 shadow-sm">
                      {req.name.charAt(0)}
                    </div>
                    
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-slate-950 text-sm">{req.name}</span>
                        
                        {/* Status Badge */}
                        {isPending && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
                            <Clock className="w-3 h-3" /> Pending Review
                          </span>
                        )}
                        {isApproved && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Enrolled
                          </span>
                        )}
                        {isRejected && (
                          <span className="bg-red-100 text-red-800 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 border border-red-200">
                            <XCircle className="w-3 h-3" /> Rejected
                          </span>
                        )}
                      </div>

                      {/* Prominent Registered Email Display (Requested specifically by user) */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 font-bold text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-lg border border-slate-200 transition">
                          <Mail className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-mono text-[11px]">{req.email}</span>
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/70 px-1 py-0.2 rounded">
                            Google Verified
                          </span>
                        </span>
                      </div>

                      {/* Student Course & ID Badges */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium pt-0.5">
                        <span className="flex items-center gap-1 font-mono text-slate-700">
                          <Hash className="w-3 h-3 text-slate-400" /> {req.studentId || "No ID"}
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1 text-slate-700">
                          <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> 
                          {req.program} - Section {req.section} ({req.yearLevel})
                        </span>
                        <span>&bull;</span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {dateLabel}
                        </span>
                      </div>

                      {/* Rejection Note if Rejected */}
                      {isRejected && req.rejectionReason && (
                        <p className="text-[11px] text-red-700 font-semibold bg-red-50 px-2 py-1 rounded-md border border-red-100 mt-1">
                          Reason: {req.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Quick Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 self-end lg:self-center pt-2 lg:pt-0">
                    <button
                      onClick={() => setInspectingRequest(req)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-200"
                      title="Inspect Student Details"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
                    </button>

                    {isPending ? (
                      <>
                        <button
                          onClick={() => handleApprove(req)}
                          disabled={isProcessing}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/10 disabled:opacity-50"
                        >
                          <UserCheck className="w-4 h-4" /> 
                          {isProcessing ? "Processing..." : "Approve & Enroll"}
                        </button>

                        <button
                          onClick={() => {
                            setRejectModalRequest(req);
                            setRejectReason("");
                          }}
                          disabled={isProcessing}
                          className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <UserX className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    ) : isApproved ? (
                      <button
                        onClick={() => {
                          setRejectModalRequest(req);
                          setRejectReason("");
                        }}
                        className="px-3 py-2 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-xl text-xs font-semibold transition flex items-center gap-1"
                      >
                        <UserX className="w-3 h-3" /> Revoke
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApprove(req)}
                        disabled={isProcessing}
                        className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Re-Approve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: STUDENT FULL DETAILS INSPECTION MODAL */}
      {/* ========================================================================= */}
      {inspectingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 text-left relative overflow-hidden max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Student Verification Details
                </span>
                <h3 className="text-xl font-black text-slate-950">
                  {inspectingRequest.name}
                </h3>
              </div>
              <button
                onClick={() => setInspectingRequest(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email Verification Box (Prominent for Treasurer) */}
            <div className="bg-emerald-50 border border-emerald-200/80 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Google Verified Registration Email
                </span>
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded">
                  Authenticated
                </span>
              </div>
              <div className="text-sm font-black text-slate-950 break-all font-mono">
                {inspectingRequest.email}
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                This email is linked to the student&apos;s authenticated Google Account and will receive official payment receipt logs.
              </p>
            </div>

            {/* Detailed Metadata Grid */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-bold flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-slate-400" /> Student ID:
                </span>
                <span className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {inspectingRequest.studentId || "Not Provided"}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-bold flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> Degree / Program:
                </span>
                <span className="font-bold text-slate-900">
                  {inspectingRequest.program || "General"}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-bold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-400" /> Year Level &amp; Section:
                </span>
                <span className="font-bold text-slate-900">
                  {inspectingRequest.yearLevel} &bull; Section {inspectingRequest.section}
                </span>
              </div>

              {inspectingRequest.contact && (
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                  <span className="text-slate-500 font-bold flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> Contact Number:
                  </span>
                  <span className="font-bold text-slate-900">
                    {inspectingRequest.contact}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-bold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date Submitted:
                </span>
                <span className="font-semibold text-slate-700">
                  {inspectingRequest.requestedAt ? new Date(inspectingRequest.requestedAt).toLocaleString() : "Recently"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Current Status:
                </span>
                <span className={`font-black uppercase tracking-wider text-[10px] px-2 py-0.5 rounded ${
                  inspectingRequest.status === "approved"
                    ? "bg-emerald-100 text-emerald-800"
                    : inspectingRequest.status === "rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-amber-100 text-amber-800"
                }`}>
                  {inspectingRequest.status}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 pt-2">
              {inspectingRequest.status === "pending" ? (
                <>
                  <button
                    onClick={() => handleApprove(inspectingRequest)}
                    disabled={processingId === inspectingRequest.id}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-md shadow-emerald-600/10"
                  >
                    <UserCheck className="w-4 h-4" /> 
                    {processingId === inspectingRequest.id ? "Approving..." : "Accept & Enroll Student"}
                  </button>

                  <button
                    onClick={() => {
                      setRejectModalRequest(inspectingRequest);
                      setRejectReason("");
                    }}
                    className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <UserX className="w-4 h-4" /> Decline
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setInspectingRequest(null)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-xs transition"
                >
                  Close Inspection
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: REJECT / DECLINE REASON MODAL */}
      {/* ========================================================================= */}
      {rejectModalRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 text-left">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest block">
                  Decline Registration
                </span>
                <h3 className="text-xl font-black text-slate-950">
                  Decline {rejectModalRequest.name}?
                </h3>
              </div>
              <button
                onClick={() => setRejectModalRequest(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Declining this request will prevent the student from accessing this classroom workspace. You may provide a reason below for their reference.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Decline Reason (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Student ID is not listed in the official section roster."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-red-600 focus:bg-white text-slate-900 font-semibold"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setRejectModalRequest(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl text-xs transition"
              >
                Cancel
              </button>
              
              <button
                onClick={handleConfirmReject}
                disabled={processingId === rejectModalRequest.id}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-md shadow-red-600/10"
              >
                <UserX className="w-4 h-4" /> 
                {processingId === rejectModalRequest.id ? "Declining..." : "Confirm Decline"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

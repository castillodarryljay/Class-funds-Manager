import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  ArrowDownToLine, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  AlertCircle, 
  CreditCard,
  Building,
  Smartphone,
  ChevronRight,
  Info
} from "lucide-react";
import { CashoutRequest } from "../types";

export const CashoutsManager: React.FC = () => {
  const { cashoutRequests, classroom, members, payments, expenses, processCashoutRequest } = useApp();
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "disbursed" | "rejected">("all");
  const [search, setSearch] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<CashoutRequest | null>(null);
  const [notes, setNotes] = useState("");
  const [reference, setReference] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionType, setActionType] = useState<"approved" | "disbursed" | "rejected" | null>(null);

  const totalClassExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const enrolledStudentsCount = Math.max(1, members.length || 1);
  const perStudentExpenseShare = totalClassExpenses / enrolledStudentsCount;

  const filteredRequests = cashoutRequests.filter(r => {
    const matchesFilter = filter === "all" ? true : r.status === filter;
    const matchesSearch = 
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      (r.studentIdNumber || "").toLowerCase().includes(search.toLowerCase()) ||
      r.payoutAccountName.toLowerCase().includes(search.toLowerCase()) ||
      (r.payoutAccountNumber || "").toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = cashoutRequests.filter(r => r.status === "pending").length;
  const approvedCount = cashoutRequests.filter(r => r.status === "approved").length;
  const disbursedCount = cashoutRequests.filter(r => r.status === "disbursed").length;

  const handleProcess = async (status: "approved" | "disbursed" | "rejected") => {
    if (!selectedRequest) return;
    setIsProcessing(true);
    try {
      await processCashoutRequest(
        selectedRequest.id,
        status,
        notes.trim() || undefined,
        reference.trim() || undefined
      );
      setSelectedRequest(null);
      setNotes("");
      setReference("");
      setActionType(null);
    } catch (err: any) {
      alert("Failed to process cashout request: " + (err.message || "Unknown error"));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 text-left" id="cashouts-manager">
      
      {/* Header card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">Student Payout Management</span>
          <h2 className="text-xl font-extrabold text-slate-950">Contribution Cashout Requests</h2>
          <p className="text-xs text-slate-500 font-medium">
            Review and disburse student contribution cashout claims (Contribution less equal share of class expenses).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-black">
            {pendingCount} Pending
          </span>
          <span className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs font-black">
            {approvedCount} Approved
          </span>
          <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-black">
            {disbursedCount} Disbursed
          </span>
        </div>
      </div>

      {/* Classroom Math Explainer for Transparency */}
      <div className="bg-emerald-50/70 border border-emerald-100/80 p-4 rounded-2xl flex items-start gap-3">
        <Info className="h-4 w-4 text-emerald-700 mt-0.5 shrink-0" />
        <div className="text-xs text-emerald-950 space-y-1">
          <p className="font-bold">Automated Equitable Share Formula</p>
          <p className="text-[11px] text-emerald-800/90 leading-relaxed">
            Per Student Expense Deduction = <strong>₱{totalClassExpenses.toLocaleString()} Total Class Expenses &divide; {enrolledStudentsCount} Enrolled Students = ₱{perStudentExpenseShare.toFixed(2)}</strong> per student.
            A student's maximum claimable cashout is strictly calculated as <strong>Total Contributed &minus; ₱{perStudentExpenseShare.toFixed(2)}</strong>.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, student ID, or payout account..."
            className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 shadow-sm"
          />
        </div>
        <div className="flex gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm shrink-0 overflow-x-auto">
          {(["all", "pending", "approved", "disbursed", "rejected"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition whitespace-nowrap cursor-pointer ${
                filter === tab 
                  ? "bg-slate-950 text-white shadow-sm" 
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs min-w-[700px]">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left">Student</th>
                <th className="px-5 py-3 text-left">Payout Method</th>
                <th className="px-5 py-3 text-left">Account Details</th>
                <th className="px-5 py-3 text-right">Requested Claim</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRequests.map(req => {
                const sPayments = payments.filter(p => p.studentId === req.studentId);
                const sTotalContributed = sPayments.reduce((sum, p) => sum + p.amount, 0);
                const sMaxEligible = Math.max(0, sTotalContributed - perStudentExpenseShare);

                return (
                  <tr key={req.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-4">
                      <div className="font-extrabold text-slate-950 text-sm">{req.studentName}</div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        ID: {req.studentIdNumber || "N/A"} &bull; Total Paid: ₱{sTotalContributed.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-bold">
                        Max Eligible: ₱{sMaxEligible.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-[11px] font-bold">
                        {req.payoutMethod === "Cash" && <Smartphone className="h-3 w-3" />}
                        {req.payoutMethod === "Bank Transfer" && <Building className="h-3 w-3" />}
                        {(req.payoutMethod === "GCash" || req.payoutMethod === "Maya") && <CreditCard className="h-3 w-3" />}
                        {req.payoutMethod}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px] text-slate-600">
                      <div className="font-bold text-slate-800">{req.payoutAccountName}</div>
                      {req.payoutAccountNumber && (
                        <div className="text-[10px] text-slate-500">{req.payoutAccountNumber}</div>
                      )}
                      {req.reason && (
                        <div className="text-[10px] text-slate-400 font-sans mt-0.5 truncate max-w-[180px]">
                          Note: {req.reason}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="text-base font-black text-emerald-600">
                        ₱{req.requestedAmount.toLocaleString()}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        {new Date(req.requestedAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        req.status === "disbursed"
                          ? "bg-emerald-100 text-emerald-800"
                          : req.status === "approved"
                          ? "bg-blue-100 text-blue-800"
                          : req.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {req.status === "pending" && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedRequest(req);
                              setActionType("approved");
                            }}
                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-[10px] transition cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRequest(req);
                              setActionType("disbursed");
                            }}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[10px] transition cursor-pointer shadow-sm shadow-emerald-600/10"
                          >
                            Disburse
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRequest(req);
                              setActionType("rejected");
                            }}
                            className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-[10px] transition cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {req.status === "approved" && (
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setActionType("disbursed");
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[10px] transition cursor-pointer shadow-sm shadow-emerald-600/10"
                        >
                          Mark as Disbursed
                        </button>
                      )}
                      {(req.status === "disbursed" || req.status === "rejected") && (
                        <span className="text-[10px] text-slate-400 italic">
                          {req.transactionReference ? `Ref: ${req.transactionReference}` : "Completed"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400 italic font-medium">
                    No cashout requests found matching this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation & Processing Modal */}
      {selectedRequest && actionType && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 shadow-2xl text-left">
            <div>
              <span className={`text-[10px] font-black uppercase tracking-wider block ${
                actionType === "disbursed" ? "text-emerald-600" : actionType === "approved" ? "text-blue-600" : "text-red-600"
              }`}>
                Confirm Action &bull; {actionType}
              </span>
              <h3 className="text-lg font-black text-slate-950">
                {actionType === "disbursed" && "Disburse Cashout Funds"}
                {actionType === "approved" && "Approve Cashout Request"}
                {actionType === "rejected" && "Reject Cashout Request"}
              </h3>
              <p className="text-xs text-slate-500">
                Student: <strong className="text-slate-900">{selectedRequest.studentName}</strong> &bull; Amount: <strong className="text-emerald-600">₱{selectedRequest.requestedAmount.toLocaleString()}</strong> via {selectedRequest.payoutMethod}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-1.5 text-xs text-slate-700 font-medium">
              <div>Account Name: <strong className="text-slate-950">{selectedRequest.payoutAccountName}</strong></div>
              {selectedRequest.payoutAccountNumber && (
                <div>Account/Mobile No: <strong className="text-slate-950 font-mono">{selectedRequest.payoutAccountNumber}</strong></div>
              )}
              {selectedRequest.reason && (
                <div className="text-slate-500 italic pt-1 border-t border-slate-200/60">
                  Student Note: "{selectedRequest.reason}"
                </div>
              )}
            </div>

            {actionType === "disbursed" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Reference / Receipt No. (Optional)
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g., GCash Ref #99281923"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Treasurer Remarks / Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any verification note or remarks..."
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedRequest(null);
                  setActionType(null);
                }}
                disabled={isProcessing}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleProcess(actionType)}
                disabled={isProcessing}
                className={`flex-1 py-2.5 text-white rounded-xl text-xs font-extrabold transition cursor-pointer ${
                  actionType === "disbursed" 
                    ? "bg-emerald-600 hover:bg-emerald-700" 
                    : actionType === "approved" 
                    ? "bg-blue-600 hover:bg-blue-700" 
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isProcessing ? "Processing..." : `Confirm ${actionType}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

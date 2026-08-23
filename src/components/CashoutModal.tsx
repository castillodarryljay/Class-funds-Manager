import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { X, DollarSign, Wallet, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck, Info } from "lucide-react";
import { motion } from "motion/react";

interface CashoutModalProps {
  isOpen?: boolean;
  onClose: () => void;
  totalContributed?: number;
  totalPaid?: number;
  totalClassExpenses?: number;
  enrolledStudentsCount?: number;
  expenseDeductionShare?: number;
  perStudentExpenseShare?: number;
  eligibleCashoutAmount?: number;
  availableCashout?: number;
}

export const CashoutModal: React.FC<CashoutModalProps> = ({
  isOpen = true,
  onClose,
  totalContributed,
  totalPaid,
  totalClassExpenses = 0,
  enrolledStudentsCount = 1,
  expenseDeductionShare,
  perStudentExpenseShare,
  eligibleCashoutAmount,
  availableCashout
}) => {
  const { user, requestCashout } = useApp();

  const finalTotalContributed = totalContributed ?? totalPaid ?? 0;
  const finalExpenseShare = expenseDeductionShare ?? perStudentExpenseShare ?? 0;
  const finalEligibleAmount = eligibleCashoutAmount ?? availableCashout ?? Math.max(0, finalTotalContributed - finalExpenseShare);

  const [requestedAmount, setRequestedAmount] = useState<number>(() => Math.max(0, finalEligibleAmount));
  const [payoutMethod, setPayoutMethod] = useState<"GCash" | "Cash" | "Bank Transfer" | "Other">("GCash");
  const [payoutAccountName, setPayoutAccountName] = useState<string>(user?.name || "");
  const [payoutAccountNumber, setPayoutAccountNumber] = useState<string>(user?.contact || "");
  const [reason, setReason] = useState<string>("End of Semester Fund Refund / Reimbursement");

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (isOpen === false) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const amountNum = Number(requestedAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setErrorMessage("Please enter a valid cashout amount greater than ₱0.");
      return;
    }

    if (amountNum > finalEligibleAmount) {
      setErrorMessage(`Requested amount (₱${amountNum.toLocaleString()}) cannot exceed your maximum eligible amount of ₱${finalEligibleAmount.toLocaleString()}.`);
      return;
    }

    if (payoutMethod !== "Cash" && !payoutAccountNumber.trim()) {
      setErrorMessage(`Please enter your ${payoutMethod} account/mobile number for disbursement.`);
      return;
    }

    setSubmitting(true);
    try {
      const success = await requestCashout({
        requestedAmount: amountNum,
        totalContributed: finalTotalContributed,
        totalClassExpenses: totalClassExpenses || 0,
        enrolledStudentsCount: enrolledStudentsCount || 1,
        expenseDeductionShare: finalExpenseShare,
        eligibleCashoutAmount: finalEligibleAmount,
        payoutMethod,
        payoutAccountName: payoutAccountName.trim(),
        payoutAccountNumber: payoutAccountNumber.trim(),
        reason: reason.trim()
      });

      if (success) {
        setSuccessMessage("Cashout request submitted successfully! Your classroom Treasurer will review and disburse your funds.");
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        setErrorMessage("Failed to record cashout request. Please check your connection and try again.");
      }
    } catch (err: any) {
      console.error("Cashout submission error:", err);
      setErrorMessage(err.message || "Failed to submit cashout request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden text-left"
      >
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Request Fund Cashout</h3>
              <p className="text-[11px] text-slate-400">Withdraw your remaining contribution balance</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Calculation Breakdown Banner */}
        <div className="bg-slate-50 border-b border-slate-200/80 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cashout Eligibility Breakdown</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              Fair Share System
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center bg-white p-3 rounded-2xl border border-slate-200/70 shadow-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">Contributed</span>
              <span className="text-sm font-black text-slate-900">₱{(finalTotalContributed || 0).toLocaleString()}</span>
            </div>
            <div className="border-x border-slate-100 px-1">
              <span className="text-[10px] text-slate-400 font-bold block">Share of Expenses</span>
              <span className="text-sm font-black text-red-600">-₱{Math.round(finalExpenseShare || 0).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-600 font-bold block">Eligible to Cashout</span>
              <span className="text-sm font-black text-emerald-600">₱{Math.round(finalEligibleAmount || 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-amber-50/70 border border-amber-200/70 p-2.5 rounded-xl">
            <Info className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-snug">
              Total class expenses (<strong>₱{(totalClassExpenses || 0).toLocaleString()}</strong>) are divided equally across all <strong>{enrolledStudentsCount || 1}</strong> students (₱{(finalExpenseShare || 0).toFixed(2)}/student), leaving your net claimable balance.
            </p>
          </div>
        </div>

        {/* Success / Error Messages */}
        {errorMessage && (
          <div className="m-5 mb-0 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="m-5 mb-0 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Cashout Request Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Amount to cash out */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Amount to Cash Out (PHP) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                ₱
              </div>
              <input 
                type="number"
                step="any"
                min="1"
                max={Math.max(1, finalEligibleAmount || 0)}
                required
                value={requestedAmount || ""}
                onChange={(e) => setRequestedAmount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-8 pr-20 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
              />
              <button
                type="button"
                onClick={() => setRequestedAmount(finalEligibleAmount)}
                className="absolute right-2.5 top-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-lg transition cursor-pointer"
              >
                Max (100%)
              </button>
            </div>
          </div>

          {/* Payout Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Disbursement Method <span className="text-red-500">*</span>
              </label>
              <select
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
              >
                <option value="GCash">GCash</option>
                <option value="Cash">Cash in Hand</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Other">Other Payout Channel</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Account / Mobile Number
              </label>
              <input 
                type="text"
                required={payoutMethod !== "Cash"}
                placeholder={payoutMethod === "GCash" ? "0912 345 6789" : "Account Number"}
                value={payoutAccountNumber}
                onChange={(e) => setPayoutAccountNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Account Holder Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Account / Recipient Full Name <span className="text-red-500">*</span>
            </label>
            <input 
              type="text"
              required
              placeholder="Full Name as shown on account"
              value={payoutAccountName}
              onChange={(e) => setPayoutAccountName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Reason / Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason / Remarks (Optional)
            </label>
            <textarea 
              rows={2}
              placeholder="e.g. End of school year refund, transfer out, reimbursement"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || eligibleCashoutAmount <= 0}
              className="flex-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Wallet className="h-4 w-4" />
              {submitting ? "Submitting Request..." : "Submit Cashout Claim"}
            </button>
          </div>
        </form>

      </motion.div>
    </motion.div>
  );
};

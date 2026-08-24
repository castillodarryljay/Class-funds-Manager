import React from "react";
import { 
  X, 
  Shield, 
  FileCheck, 
  Lock, 
  CheckCircle2, 
  Award, 
  Info, 
  Receipt, 
  Coins, 
  ArrowDownToLine, 
  Database 
} from "lucide-react";
import { AppLogo } from "./AppLogo";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-2xl max-h-[88vh] rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <AppLogo size="sm" showText={false} />
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-950 tracking-tight">Terms of Service &amp; Operational Policies</h3>
              <p className="text-xs text-slate-500 font-medium">ClassFund Manager Ledger &bull; Darryl Jay Castillo (SHIRO)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
            aria-label="Close Terms modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-600 text-xs sm:text-sm leading-relaxed">
          {/* Section 1 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <Shield className="h-4 w-4 text-emerald-600 shrink-0" />
              <h4 className="text-sm font-extrabold text-slate-900">1. Acceptance &amp; Core Mission</h4>
            </div>
            <p className="text-slate-600">
              Welcome to <strong>ClassFund Manager</strong>, an institutional classroom financial transparency and digital bookkeeping system. By accessing this platform as a <strong>Classroom Treasurer</strong> or <strong>Student Member</strong>, you agree to these operational terms designed to guarantee complete mathematical accuracy, ethical stewardship, and total auditability.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <Coins className="h-4 w-4 text-emerald-600 shrink-0" />
              <h4 className="text-sm font-extrabold text-slate-900">2. Equal-Share Classroom Expense Deductions</h4>
            </div>
            <p className="text-slate-600">
              Classroom disbursements recorded by the Treasurer are automatically divided equally across all registered active students (<code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono text-xs">Total Expense &divide; Total Enrolled Students</code>). This equal deduction is transparently updated on every student's ledger and personal balance breakdown in real-time.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <Receipt className="h-4 w-4 text-emerald-600 shrink-0" />
              <h4 className="text-sm font-extrabold text-slate-900">3. Receipt Proofs &amp; Zero-Storage CDN Processing</h4>
            </div>
            <p className="text-slate-600">
              Treasurers must attach photo receipts or official invoices for all recorded purchases. To preserve server efficiency and avoid hosting bloat, images undergo in-browser client compression and are converted directly into fast CDN URLs with zero permanent disk overhead. All students have 24/7 access to inspect high-resolution receipts with zoom and rotation tools.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <ArrowDownToLine className="h-4 w-4 text-emerald-600 shrink-0" />
              <h4 className="text-sm font-extrabold text-slate-900">4. Cashout Claims &amp; Refund Settlements</h4>
            </div>
            <p className="text-slate-600">
              Students who hold verified overpayments or surplus contributions are entitled to submit Cashout Requests via GCash, Bank Transfer, or Cash. Treasurers are obligated to review, fulfill, and record reference details within a reasonable timeframe.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <Database className="h-4 w-4 text-emerald-600 shrink-0" />
              <h4 className="text-sm font-extrabold text-slate-900">5. Tamper-Resistant Audit Trail</h4>
            </div>
            <p className="text-slate-600">
              Every financial transaction, student approval, target contribution adjustment, and expense creation is immutably timestamped in the <strong>Firebase Firestore Audit Ledger</strong>. No financial record can be erased without generating a corresponding audit entry.
            </p>
          </div>

          {/* Attribution Box */}
          <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/70 flex items-start gap-3">
            <Award className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950 leading-normal space-y-1">
              <p className="font-extrabold text-emerald-900">Original Architect &amp; Software Engineer</p>
              <p className="text-emerald-800">
                ClassFund Manager is designed, architected, and continuously maintained by <strong className="text-emerald-950 font-bold">Darryl Jay Castillo (SHIRO)</strong>. All rights to the UI/UX workflows, financial deduction engines, and verification protocols are reserved.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Updated &amp; Validated: August 2026</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            Acknowledge &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { AppLogo } from "./AppLogo";
import { OnboardingTour } from "./OnboardingTour";
import { TermsModal } from "./TermsModal";
import { PaymentModal } from "./PaymentModal";
import { ExpenseModal } from "./ExpenseModal";
import { ExpenseDetailModal } from "./ExpenseDetailModal";
import { WebsiteCredits } from "./WebsiteCredits";
import { ReportView } from "./ReportView";
import { JoinRequestsManager } from "./JoinRequestsManager";
import { CashoutsManager } from "./CashoutsManager";
import { Classroom, Member, Payment, Expense } from "../types";
import { 
  Landmark, 
  Users, 
  Wallet, 
  TrendingUp, 
  Plus, 
  Settings, 
  Clock, 
  Copy, 
  Check, 
  FileText, 
  Search, 
  Filter, 
  ArrowRight, 
  Edit, 
  Calendar, 
  User, 
  Briefcase,
  ExternalLink,
  ShieldAlert,
  LogOut,
  ChevronRight,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Menu,
  X,
  HelpCircle,
  UserCheck,
  Mail,
  UserX,
  GraduationCap,
  Layers,
  Phone,
  Trash2,
  ArrowDownToLine,
  Info,
  Receipt,
  Eye
} from "lucide-react";

export interface TreasurerDashboardProps {
  onCreateClassroom?: () => void;
}

export const TreasurerDashboard: React.FC<TreasurerDashboardProps> = ({ onCreateClassroom }) => {
  const { 
    user, 
    classroom, 
    classrooms, 
    members, 
    payments, 
    expenses, 
    joinRequests,
    cashoutRequests,
    auditLogs, 
    updateClassroomSettings, 
    selectClassroom,
    deleteClassroom,
    removeMember,
    signOutUser 
  } = useApp();

  const [activeTab, setActiveTab] = useState<"overview" | "requests" | "cashouts" | "students" | "payments" | "expenses" | "funds" | "reports" | "invite" | "audit" | "settings">("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Modal controllers
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedExpenseForDetail, setSelectedExpenseForDetail] = useState<Expense | null>(null);
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState<Member | undefined>(undefined);
  const [selectedPaymentForEdit, setSelectedPaymentForEdit] = useState<Payment | undefined>(undefined);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<Member | null>(null);

  // Search/Filters states for Students List
  const [studentSearch, setStudentSearch] = useState("");
  const [studentFilter, setStudentFilter] = useState<"all" | "contributor" | "non-contributor">("all");

  // Search/Filters states for Expenses List
  const [expenseSearch, setExpenseSearch] = useState("");
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState("all");

  // Copy controllers
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Onboarding & Terms state
  const [showTour, setShowTour] = useState<boolean>(() => {
    return !localStorage.getItem(`tour_completed_treasurer_${user?.uid}`);
  });
  const [showTerms, setShowTerms] = useState<boolean>(false);

  if (!user || classrooms.length === 0 || !classroom) {
    return null; // Safety, App.tsx handles loading or empty workspace redirect
  }

  // Pending Join Requests Count
  const pendingRequestsCount = joinRequests.filter(r => r.status === "pending").length;
  // Pending Cashout Claims Count
  const pendingCashoutsCount = cashoutRequests.filter(r => r.status === "pending").length;

  // Calculated Statistics
  const studentsCount = members.filter(m => m.role === "student" || m.role === "treasurer").length;
  const enrolledStudentsCount = Math.max(1, studentsCount);
  
  // Total Collected (Income)
  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  
  // Total Expenses (Expenses)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Equal Expense Share per Student
  const perStudentExpenseShare = totalExpenses / enrolledStudentsCount;

  // Net Balance
  const fundBalance = totalCollected - totalExpenses;

  // Non-contributing Students count (includes Treasurer as a potential contributor)
  const nonContributorsCount = members.filter(m => {
    if (m.role !== "student" && m.role !== "treasurer") return false;
    const studentPayments = payments.filter(p => p.studentId === m.uid);
    const paid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
    return paid === 0;
  }).length;

  const navigationTabs = [
    { id: "overview", label: "Overview", icon: Landmark },
    { id: "requests", label: "Join Requests", icon: UserCheck, badge: pendingRequestsCount },
    { id: "cashouts", label: "Cashout Claims", icon: ArrowDownToLine, badge: pendingCashoutsCount },
    { id: "students", label: "Students", icon: Users },
    { id: "payments", label: "Payments", icon: Wallet },
    { id: "expenses", label: "Expenses", icon: Receipt, badge: expenses.length },
    { id: "funds", label: "Fund Records", icon: TrendingUp },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "invite", label: "Invite Students", icon: ExternalLink },
    { id: "audit", label: "Audit Logs", icon: Clock },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  // Filtered Expenses List for Treasurer View
  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = 
      exp.description.toLowerCase().includes(expenseSearch.toLowerCase()) ||
      (exp.paidTo || "").toLowerCase().includes(expenseSearch.toLowerCase()) ||
      (exp.notes || "").toLowerCase().includes(expenseSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (expenseCategoryFilter !== "all" && exp.category.toLowerCase() !== expenseCategoryFilter.toLowerCase()) {
      return false;
    }
    return true;
  });
  const getInviteLink = () => {
    return `${window.location.origin}/?join=${classroom.inviteCode}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getInviteLink());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classroom.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const toggleInviteStatus = async () => {
    const nextStatus = classroom.inviteStatus === "active" ? "inactive" : "active";
    await updateClassroomSettings({ inviteStatus: nextStatus });
  };

  // Student list mapping with calculation (Total Contributed, Shared Expense Share, and Current Balance)
  const mappedStudents = members
    .filter(m => m.role === "student" || m.role === "treasurer")
    .map(student => {
      const studentPayments = payments.filter(p => p.studentId === student.uid);
      const paid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
      const hasContributed = paid > 0;

      const sCashouts = cashoutRequests.filter(c => c.studentId === student.uid && c.status === "disbursed");
      const disbursed = sCashouts.reduce((sum, c) => sum + c.requestedAmount, 0);
      const currentBalance = paid - perStudentExpenseShare - disbursed;

      return {
        member: student,
        paid,
        expenseShare: perStudentExpenseShare,
        disbursed,
        currentBalance,
        hasContributed
      };
    });

  // Filtered Students List
  const filteredStudents = mappedStudents.filter(s => {
    const matchesSearch = s.member.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
                          (s.member.studentId || "").toLowerCase().includes(studentSearch.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (studentFilter === "all") return true;
    if (studentFilter === "contributor") return s.hasContributed;
    if (studentFilter === "non-contributor") return !s.hasContributed;
    return true;
  });

  // Financial Ledger Logs (combines payments & expenses in sequential running timeline order)
  const financialRecords: Array<{
    date: string;
    description: string;
    income: number;
    expense: number;
    reference: string;
    recordedBy: string;
    type: "income" | "expense";
  }> = [
    ...payments.map(p => ({
      date: p.paymentDate,
      description: `Student Contribution: ${p.studentName}`,
      income: p.amount,
      expense: 0,
      reference: p.referenceNumber || "Cash Log",
      recordedBy: p.recordedBy,
      type: "income" as const
    })),
    ...expenses.map(e => ({
      date: e.createdAt.split("T")[0],
      description: `Expense: ${e.description} (${e.category})`,
      income: 0,
      expense: e.amount,
      reference: e.paidTo,
      recordedBy: e.recordedBy,
      type: "expense" as const
    }))
  ];

  // Sort by date descending
  financialRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Render individual student detail subview
  const renderStudentDetailView = () => {
    if (!selectedStudentDetail) return null;
    
    const sPayments = payments.filter(p => p.studentId === selectedStudentDetail.uid);
    const paid = sPayments.reduce((sum, p) => sum + p.amount, 0);
    const hasContributed = paid > 0;
    
    const sDisbursed = cashoutRequests
      .filter(c => c.studentId === selectedStudentDetail.uid && c.status === "disbursed")
      .reduce((sum, c) => sum + c.requestedAmount, 0);

    const sPendingCashout = cashoutRequests
      .filter(c => c.studentId === selectedStudentDetail.uid && (c.status === "pending" || c.status === "approved"))
      .reduce((sum, c) => sum + c.requestedAmount, 0);

    const currentBalance = paid - perStudentExpenseShare - sDisbursed;
    const isPositiveBalance = currentBalance >= 0;

    const statusLabel = hasContributed ? "Contributor" : "No Contribution";
    const statusClass = hasContributed ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600";

    const handleRemoveStudent = async () => {
      if (selectedStudentDetail.uid === user.uid) {
        return;
      }
      await removeMember(classroom.id, selectedStudentDetail.uid);
      setSelectedStudentDetail(null);
    };

    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-6 text-left animate-fade-in" id="student-profile-view">
        <div className="flex justify-between items-start">
          <button 
            onClick={() => setSelectedStudentDetail(null)}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition cursor-pointer"
          >
            &larr; Back to Student List
          </button>
          
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusClass}`}>
            {statusLabel}
          </span>
        </div>

        {/* Student Bio */}
        <div className="flex gap-4 items-center">
          <div className="bg-emerald-50 text-emerald-700 h-14 w-14 rounded-2xl flex items-center justify-center font-black text-lg border border-emerald-100/50">
            {selectedStudentDetail.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <h3 className="font-extrabold text-slate-950 text-lg leading-tight truncate">{selectedStudentDetail.name}</h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5 font-mono">ID: {selectedStudentDetail.studentId || "N/A"}</p>
          </div>
        </div>

        {/* Google Verified Email Box */}
        <div className="bg-emerald-50/70 border border-emerald-200/70 p-3.5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-emerald-600" /> Registered Email
            </span>
            <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-200">
              Google Verified
            </span>
          </div>
          <p className="text-xs font-black text-slate-950 break-all font-mono">
            {selectedStudentDetail.email}
          </p>
        </div>

        {/* Course & Metadata */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500 font-bold flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> Course &amp; Section:
            </span>
            <span className="font-bold text-slate-900">
              {selectedStudentDetail.program || classroom.program || "General"} &bull; {selectedStudentDetail.section || classroom.section || "A"} ({selectedStudentDetail.yearLevel || classroom.yearLevel || "2nd Year"})
            </span>
          </div>
          {selectedStudentDetail.contact && (
            <div className="flex justify-between">
              <span className="text-slate-500 font-bold flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Contact:
              </span>
              <span className="font-bold text-slate-900">{selectedStudentDetail.contact}</span>
            </div>
          )}
        </div>

        {/* Financial Standing & Current Balance (Equally Less All Expenses) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Financial Standing</span>
            <span className="text-[10px] font-bold text-emerald-600">Equitable Balance Formula</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {/* Contributed */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Contributed</span>
              <span className="text-base font-black text-slate-950 block mt-0.5">₱{paid.toLocaleString()}</span>
              <span className="text-[9px] text-slate-400 font-medium">{sPayments.length} payments</span>
            </div>

            {/* Expense Share */}
            <div className="bg-red-50/50 p-3.5 rounded-2xl border border-red-200/60">
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">Shared Expense</span>
              <span className="text-base font-black text-red-600 block mt-0.5">-₱{Math.round(perStudentExpenseShare).toLocaleString()}</span>
              <span className="text-[9px] text-red-500/80 font-medium">Equal 1/{enrolledStudentsCount} share</span>
            </div>

            {/* Current Net Balance */}
            <div className={`col-span-2 sm:col-span-1 p-3.5 rounded-2xl border ${
              isPositiveBalance 
                ? "bg-emerald-50/70 border-emerald-200/80 text-emerald-950" 
                : "bg-amber-50/70 border-amber-200/80 text-amber-950"
            }`}>
              <span className="text-[10px] font-black uppercase tracking-wider block text-emerald-700">Current Balance</span>
              <span className={`text-base font-black block mt-0.5 ${isPositiveBalance ? "text-emerald-600" : "text-amber-700"}`}>
                {currentBalance < 0 ? `-₱${Math.abs(Math.round(currentBalance)).toLocaleString()}` : `₱${Math.round(currentBalance).toLocaleString()}`}
              </span>
              <span className="text-[9px] font-semibold block text-slate-500">
                {isPositiveBalance ? "Net Claimable" : "Unpaid Share"}
              </span>
            </div>
          </div>

          {sDisbursed > 0 && (
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs flex justify-between items-center text-slate-600">
              <span>Disbursed Cashouts:</span>
              <strong className="text-slate-900">₱{sDisbursed.toLocaleString()}</strong>
            </div>
          )}

          {/* Mathematical Explainer Note */}
          <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-2xl text-[11px] text-emerald-950 space-y-1">
            <p className="font-bold flex items-center gap-1">
              <Info className="h-3.5 w-3.5 text-emerald-700" /> Current Balance Computation
            </p>
            <p className="text-emerald-800 leading-relaxed text-[10px]">
              ₱{paid.toLocaleString()} Contributed &minus; ₱{perStudentExpenseShare.toFixed(2)} Expense Share {sDisbursed > 0 ? `&minus; ₱${sDisbursed.toLocaleString()} Disbursed ` : ""}= <strong className="text-emerald-900">₱{currentBalance.toFixed(2)} Current Net Balance</strong>.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-2.5">
          <button
            onClick={() => {
              setSelectedStudentForPayment(selectedStudentDetail);
              setSelectedPaymentForEdit(undefined);
              setShowPaymentModal(true);
            }}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/10 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Record Payment
          </button>

          {selectedStudentDetail.uid !== user.uid && (
            <button
              onClick={handleRemoveStudent}
              className="p-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer"
              title="Remove Student from Classroom"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Personal Payment logs list */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wider">Payment Transactions Trail</h4>
          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1 border border-slate-100 rounded-2xl bg-white">
            {sPayments.map(p => (
              <div key={p.id} className="p-3.5 flex justify-between items-center hover:bg-slate-50/50">
                <div className="text-left space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-950 text-xs">{p.paymentDate}</span>
                    <span className="px-1.5 py-0.5 bg-slate-100 text-[10px] text-slate-600 font-bold rounded">{p.paymentMethod}</span>
                  </div>
                  {p.referenceNumber && <span className="text-[10px] text-slate-400 font-semibold block font-mono">Ref: {p.referenceNumber}</span>}
                  {p.notes && <p className="text-[10px] text-slate-500 italic leading-snug mt-1 max-w-xs">{p.notes}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-slate-950 text-sm">₱{p.amount.toLocaleString()}</span>
                  
                  {/* Adjustment Correct logs */}
                  <button
                    onClick={() => {
                      setSelectedPaymentForEdit(p);
                      setShowPaymentModal(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-900 transition hover:bg-slate-100 rounded-lg cursor-pointer"
                    title="Correct Payment"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {sPayments.length === 0 && (
              <div className="p-8 text-center text-slate-400 italic font-medium text-xs">
                No payments recorded for this student.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row" id="treasurer-dashboard">
      
      {/* Mobile Sticky Top Header */}
      <div className="md:hidden flex items-center justify-between bg-slate-950 text-white p-4 sticky top-0 z-40 shadow-md">
        <AppLogo size="sm" showText={true} dark={true} subtitle="Treasurer Console" />
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white transition"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Side Drawer */}
          <aside className="relative w-64 bg-slate-950 text-white flex flex-col justify-between p-6 h-full shadow-2xl z-50 animate-fade-in text-left">
            <div className="space-y-6 overflow-y-auto max-h-[85vh] pr-1">
              <div className="flex items-center justify-between">
                <AppLogo size="sm" showText={true} dark={true} subtitle="Treasurer Console" />
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-white transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Active Workspace Select */}
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Classroom Workspace</label>
                <select
                  value={classroom.id}
                  onChange={(e) => {
                    selectClassroom(e.target.value);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-600 cursor-pointer"
                >
                  {classrooms.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-2 pt-1.5">
                  <button
                    onClick={() => {
                      if (onCreateClassroom) {
                        onCreateClassroom();
                        setIsMobileMenuOpen(false);
                      }
                    }}
                    className="w-full py-1.5 bg-emerald-700/40 hover:bg-emerald-700 text-emerald-300 hover:text-white rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" /> Create Class
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm(`Are you sure you want to permanently delete the classroom "${classroom.name}"? This action cannot be undone.`)) {
                        const success = await deleteClassroom(classroom.id);
                        if (success) {
                          alert("Classroom deleted successfully!");
                          setIsMobileMenuOpen(false);
                        } else {
                          alert("Failed to delete classroom.");
                        }
                      }
                    }}
                    className="w-full py-1.5 bg-red-950/40 hover:bg-red-700 text-red-300 hover:text-white rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <X className="h-3 w-3" /> Delete Active
                  </button>
                </div>
              </div>

              {/* User profile card */}
              <div className="bg-slate-900 p-3 flex items-center gap-2.5 rounded-2xl border border-slate-800/80">
                <img 
                  src={user.photoURL} 
                  alt="Avatar" 
                  referrerPolicy="no-referrer"
                  className="h-8 w-8 rounded-full border border-slate-700 bg-slate-800 p-0.5" 
                />
                <div className="min-w-0 text-left">
                  <span className="font-bold text-slate-100 text-xs block truncate">{user.name}</span>
                  <span className="text-[9px] text-emerald-400 font-bold block uppercase tracking-wider">Active Treasurer</span>
                </div>
              </div>

              {/* Navigation links */}
              <nav className="space-y-1.5 text-left">
                {navigationTabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        setSelectedStudentDetail(null);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                        activeTab === tab.id
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                          : "text-slate-400 hover:text-white hover:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4" /> 
                        <span>{tab.label}</span>
                      </div>
                      {tab.badge && tab.badge > 0 ? (
                        <span className="bg-amber-400 text-amber-950 font-black text-[10px] px-1.5 py-0.2 rounded-full">
                          {tab.badge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom action buttons */}
            <div className="space-y-1 pt-4 border-t border-slate-800 mt-6">
              <button
                onClick={() => {
                  setShowTour(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 transition flex items-center gap-2.5 text-left"
              >
                <HelpCircle className="h-4 w-4" /> Quick Overview Tour
              </button>
              <button
                onClick={() => {
                  setShowTerms(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition flex items-center gap-2.5 text-left"
              >
                <ShieldCheck className="h-4 w-4" /> Terms of Service
              </button>
              <button
                onClick={signOutUser}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition flex items-center gap-2.5 text-left"
              >
                <LogOut className="h-4 w-4" /> Log Out Account
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Dashboard Sidebar Navigation (Desktop version) */}
      <aside className="hidden md:flex w-64 bg-slate-950 text-white flex-col justify-between shrink-0 p-6 md:min-h-screen border-r border-slate-800">
        <div className="space-y-8">
          {/* Brand logo */}
          <AppLogo size="md" showText={true} dark={true} subtitle="Treasurer Console" />

          {/* Active Workspace Select */}
          <div className="space-y-1 text-left">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Classroom Workspace</label>
            <select
              value={classroom.id}
              onChange={(e) => selectClassroom(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              {classrooms.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2 pt-1.5">
              <button
                onClick={onCreateClassroom}
                className="w-full py-1.5 bg-emerald-700/40 hover:bg-emerald-700 text-emerald-300 hover:text-white rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="h-3 w-3" /> Create Class
              </button>
              <button
                onClick={async () => {
                  await deleteClassroom(classroom.id);
                }}
                className="w-full py-1.5 bg-red-950/40 hover:bg-red-700 text-red-300 hover:text-white rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <X className="h-3 w-3" /> Delete Active
              </button>
            </div>
          </div>

          {/* User profile card */}
          <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800/80 flex items-center gap-3">
            <img 
              src={user.photoURL} 
              alt="Avatar" 
              referrerPolicy="no-referrer"
              className="h-9 w-9 rounded-full border border-slate-700 bg-slate-800 p-0.5" 
            />
            <div className="min-w-0 text-left">
              <span className="font-bold text-slate-100 text-sm block truncate">{user.name}</span>
              <span className="text-[10px] text-emerald-400 font-bold block uppercase tracking-wider">Active Treasurer</span>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="space-y-1.5 text-left">
            {navigationTabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setSelectedStudentDetail(null);
                  }}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                    activeTab === tab.id
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4" /> 
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && tab.badge > 0 ? (
                    <span className="bg-amber-400 text-amber-950 font-black text-[10px] px-1.5 py-0.2 rounded-full">
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom actions */}
        <div className="space-y-1 pt-4 border-t border-slate-800">
          <button
            onClick={() => setShowTour(true)}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 transition flex items-center gap-2.5 text-left"
          >
            <HelpCircle className="h-4 w-4" /> Quick Overview Tour
          </button>
          <button
            onClick={() => setShowTerms(true)}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition flex items-center gap-2.5 text-left"
          >
            <ShieldCheck className="h-4 w-4" /> Terms of Service
          </button>
          <button
            onClick={signOutUser}
            className="w-full py-2 px-3 rounded-xl text-xs font-bold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition flex items-center gap-2.5 text-left"
          >
            <LogOut className="h-4 w-4" /> Log Out Account
          </button>
        </div>
      </aside>

      {/* Main Panel Area */}
      <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto md:max-h-screen">
        
        {/* Top Header Workspace Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm text-left">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Class Workspace Dashboard</span>
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">{classroom.name}</h1>
            <p className="text-xs text-slate-500 font-medium">
              {classroom.school} &bull; SY {classroom.schoolYear} &bull; {classroom.program || "General Course"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedStudentForPayment(undefined);
                setSelectedPaymentForEdit(undefined);
                setShowPaymentModal(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/10"
            >
              <Plus className="h-4 w-4" /> Record Payment
            </button>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="bg-slate-950 hover:bg-slate-900 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm shadow-slate-950/10"
            >
              <Plus className="h-4 w-4" /> Add Expense
            </button>
          </div>
        </div>

        {/* 1. OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            
            {/* Pending Requests Alert */}
            {pendingRequestsCount > 0 && (
              <div className="bg-gradient-to-r from-amber-500/15 via-amber-50 to-white border border-amber-300/80 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-fade-in text-left">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-sm shadow-amber-500/20">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-amber-950 text-sm flex items-center gap-2">
                      <span>{pendingRequestsCount} Student Registration Request{pendingRequestsCount > 1 ? "s" : ""} Pending Review</span>
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                    </h4>
                    <p className="text-xs text-amber-800/90 font-medium">
                      Students have submitted their details and verified emails. Review and approve their admission.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("requests")}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 shrink-0 shadow-sm shadow-amber-600/20"
                >
                  Review Requests ({pendingRequestsCount}) <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            
            {/* statistics cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 text-left">
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Collected</span>
                <span className="text-2xl font-black text-emerald-600">₱{totalCollected.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 block font-semibold">{payments.length} registered receipts</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Class Expenses</span>
                <span className="text-2xl font-black text-red-600">₱{totalExpenses.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 block font-semibold">{expenses.length} outgoing records</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Net Fund Balance</span>
                <span className="text-2xl font-black text-slate-950">₱{fundBalance.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 block font-semibold">Available cash inside class</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Expense / Student</span>
                <span className="text-2xl font-black text-red-600">₱{Math.round(perStudentExpenseShare).toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 block font-semibold">₱{totalExpenses.toLocaleString()} &divide; {enrolledStudentsCount} students</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2 col-span-2 lg:col-span-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Enrolled Students</span>
                <span className="text-2xl font-black text-slate-950">{studentsCount}</span>
                <span className="text-[10px] text-slate-400 block font-semibold">{nonContributorsCount} non-contributors</span>
              </div>
            </div>

            {/* Formula Banner for Equal Expense Sharing Transparency */}
            <div className="bg-emerald-50/70 border border-emerald-100/80 p-4 rounded-3xl flex items-start gap-3.5 text-left">
              <Info className="h-5 w-5 text-emerald-700 mt-0.5 shrink-0" />
              <div className="space-y-1 text-xs text-emerald-950">
                <p className="font-extrabold text-sm text-emerald-950">Equitable Student Balance System Active</p>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Every enrolled student's current balance is automatically calculated as: <strong>Total Contributed &minus; Equal Share of Expenses (₱{perStudentExpenseShare.toFixed(2)}) &minus; Disbursed Cashouts</strong>.
                  This ensures full fairness where all classroom expenses are shared equally across all {enrolledStudentsCount} student accounts.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
              
              {/* Financial Progress Visual */}
              <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-950 text-base">Student Contribution Participation</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-slate-400 block font-semibold">Contributing Students</span>
                    <span className="text-xl font-bold text-emerald-600">{studentsCount - nonContributorsCount} accounts</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-semibold">Non-contributing Students</span>
                    <span className="text-xl font-bold text-slate-500">{nonContributorsCount} accounts</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-emerald-600 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${studentsCount > 0 ? Math.round(((studentsCount - nonContributorsCount) / studentsCount) * 100) : 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                    <span>{studentsCount > 0 ? Math.round(((studentsCount - nonContributorsCount) / studentsCount) * 100) : 0}% of class participated</span>
                    <span>Total Enrolled: {studentsCount} students</span>
                  </div>
                </div>
              </div>

              {/* Fast invitation summary */}
              <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">Join Code</span>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
                    <span className="font-extrabold text-slate-950 tracking-wider text-sm">{classroom.inviteCode}</span>
                    <button onClick={handleCopyCode} className="text-slate-400 hover:text-slate-700 transition">
                      {copiedCode ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab("invite")}
                  className="w-full mt-4 bg-slate-950 hover:bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                >
                  Open Invitation Center
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Recent records */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
              {/* Recent Payments */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-950 text-sm">Recent Contributions</h3>
                  <button onClick={() => setActiveTab("payments")} className="text-xs font-bold text-emerald-600 hover:text-emerald-700">View All</button>
                </div>
                <div className="divide-y divide-slate-100">
                  {payments.slice(0, 4).map(p => (
                    <div key={p.id} className="py-2.5 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-950 text-xs block">{p.studentName}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{p.paymentDate} &bull; {p.paymentMethod}</span>
                      </div>
                      <span className="font-extrabold text-emerald-600 text-xs">+₱{p.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  {payments.length === 0 && (
                    <div className="py-8 text-center text-slate-400 italic text-xs font-semibold">No payments recorded yet.</div>
                  )}
                </div>
              </div>

              {/* Recent Expenses */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-950 text-sm">Recent Outgoing Expenses</h3>
                  <button onClick={() => setActiveTab("funds")} className="text-xs font-bold text-emerald-600 hover:text-emerald-700">View All</button>
                </div>
                <div className="divide-y divide-slate-100">
                  {expenses.slice(0, 4).map(e => (
                    <div key={e.id} className="py-2.5 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-950 text-xs block">{e.description}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{e.paidTo} &bull; {e.category}</span>
                      </div>
                      <span className="font-extrabold text-red-600 text-xs">-₱{e.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  {expenses.length === 0 && (
                    <div className="py-8 text-center text-slate-400 italic text-xs font-semibold">No expenses logged yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. JOIN REQUESTS APPROVAL CONSOLE */}
        {activeTab === "requests" && (
          <JoinRequestsManager />
        )}

        {/* 2.1 CASHOUT CLAIMS DISBURSEMENT CONSOLE */}
        {activeTab === "cashouts" && (
          <CashoutsManager />
        )}

        {/* 3. STUDENTS TAB */}
        {activeTab === "students" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
            
            {/* Student List Grid - Left/Full */}
            <div className={`${selectedStudentDetail ? "lg:col-span-7" : "lg:col-span-12"} bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-950 text-base">Class Students List</h3>
                <span className="text-xs text-slate-400 font-semibold">{filteredStudents.length} of {mappedStudents.length} students</span>
              </div>

              {/* Search & Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pb-2">
                {/* Search */}
                <div className="sm:col-span-8 relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search students by name or ID..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                </div>
                {/* Filters */}
                <div className="sm:col-span-4 relative">
                  <Filter className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <select
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 font-bold text-slate-600 focus:outline-none focus:border-emerald-600 focus:bg-white"
                    value={studentFilter}
                    onChange={(e) => setStudentFilter(e.target.value as any)}
                  >
                    <option value="all">All Contribution Levels</option>
                    <option value="contributor">With Contribution</option>
                    <option value="non-contributor">No Contribution</option>
                  </select>
                </div>
              </div>

              {/* Students Table */}
              <div className="overflow-x-auto w-full rounded-2xl border border-slate-100">
                <table className="w-full text-xs min-w-[650px]">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 text-left">Student</th>
                      <th className="px-4 py-3 text-left">Student ID</th>
                      <th className="px-4 py-3 text-right">Contributed</th>
                      <th className="px-4 py-3 text-right">Expense Share</th>
                      <th className="px-4 py-3 text-right">Current Balance</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredStudents.map(({ member, paid, expenseShare, currentBalance, hasContributed }) => (
                      <tr 
                        key={member.uid} 
                        className={`hover:bg-slate-50/50 cursor-pointer transition ${selectedStudentDetail?.uid === member.uid ? "bg-slate-50" : ""}`}
                        onClick={() => setSelectedStudentDetail(member)}
                      >
                        <td className="px-4 py-3.5 font-bold text-slate-950 flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-slate-100 text-[10px] text-slate-700 font-bold flex items-center justify-center border border-slate-200 shrink-0">
                            {member.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <span className="block truncate">{member.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono font-normal block truncate">{member.email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate-500 font-mono text-[10px]">{member.studentId || "—"}</td>
                        <td className="px-4 py-3.5 text-right font-bold text-slate-900">₱{paid.toLocaleString()}</td>
                        <td className="px-4 py-3.5 text-right font-semibold text-red-600">-₱{Math.round(expenseShare).toLocaleString()}</td>
                        <td className="px-4 py-3.5 text-right">
                          <span className={`font-black ${currentBalance >= 0 ? "text-emerald-600" : "text-amber-700"}`}>
                            {currentBalance < 0 ? `-₱${Math.abs(Math.round(currentBalance)).toLocaleString()}` : `₱${Math.round(currentBalance).toLocaleString()}`}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            hasContributed ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                          }`}>
                            {hasContributed ? "Contributor" : "No Payment"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStudentForPayment(member);
                              setSelectedPaymentForEdit(undefined);
                              setShowPaymentModal(true);
                            }}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded text-[10px] transition cursor-pointer"
                          >
                            + Record
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-slate-400 font-medium italic">
                          No classroom student accounts match these filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Student details column view - Right */}
            {selectedStudentDetail && (
              <div className="lg:col-span-5">
                {renderStudentDetailView()}
              </div>
            )}
          </div>
        )}

        {/* 3. PAYMENTS TAB */}
        {activeTab === "payments" && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm text-left space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-950 text-base">Contribution Payments Ledger</h3>
                <p className="text-slate-400 text-xs">Verify student payments and corrections in real time.</p>
              </div>
              <span className="text-xs text-slate-400 font-bold">{payments.length} log records</span>
            </div>

            <div className="overflow-x-auto w-full rounded-2xl border border-slate-100">
              <table className="w-full text-xs min-w-[500px]">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 text-left">Date</th>
                    <th className="px-5 py-3 text-left">Student</th>
                    <th className="px-5 py-3 text-left">Method</th>
                    <th className="px-5 py-3 text-left">Reference #</th>
                    <th className="px-5 py-3 text-left">Notes / Explanations</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                    <th className="px-5 py-3 text-center">Correct</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {payments.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3.5 font-semibold text-slate-900">{p.paymentDate}</td>
                      <td className="px-5 py-3.5 font-bold text-slate-950">{p.studentName}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 bg-slate-100 rounded font-semibold text-slate-700">{p.paymentMethod}</span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[10px] text-slate-500">{p.referenceNumber || "—"}</td>
                      <td className="px-5 py-3.5 text-slate-500 italic max-w-xs truncate" title={p.notes}>{p.notes || "—"}</td>
                      <td className="px-5 py-3.5 text-right font-extrabold text-emerald-600">+₱{p.amount.toLocaleString()}</td>
                      <td className="px-5 py-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedPaymentForEdit(p);
                            setSelectedStudentForPayment(undefined);
                            setShowPaymentModal(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-900 transition hover:bg-slate-100 rounded-lg"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-slate-400 font-medium italic">
                        No student payment records exist.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. EXPENSES TAB */}
        {activeTab === "expenses" && (
          <div className="space-y-6 text-left">
            {/* Top statistics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Classroom Expenses</span>
                <span className="text-2xl font-black text-red-600">₱{totalExpenses.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 block font-semibold">{expenses.length} official disbursements</span>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Per Student Equal Share</span>
                <span className="text-2xl font-black text-slate-900">₱{perStudentExpenseShare.toFixed(2)}</span>
                <span className="text-[10px] text-slate-400 block font-semibold">Shared across all {enrolledStudentsCount} students</span>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Remaining Cash in Fund</span>
                <span className="text-2xl font-black text-emerald-600">₱{fundBalance.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 block font-semibold">Available for classroom activities</span>
              </div>
            </div>

            {/* Expenses List Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-slate-950 text-base">Classroom Expenses & Receipt Proofs</h3>
                  <p className="text-slate-400 text-xs">View all recorded purchases, equal sharing deductions, and attached receipts.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(true)}
                  className="bg-slate-950 hover:bg-slate-900 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm shadow-slate-950/10 self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Log New Expense
                </button>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8 relative">
                  <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by description, vendor, or notes..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                    value={expenseSearch}
                    onChange={(e) => setExpenseSearch(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-4 relative">
                  <Filter className="absolute left-3.5 top-3 h-3.5 w-3.5 text-slate-400" />
                  <select
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 font-bold text-slate-600 focus:outline-none focus:border-emerald-600 focus:bg-white cursor-pointer"
                    value={expenseCategoryFilter}
                    onChange={(e) => setExpenseCategoryFilter(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    <option value="Supplies">Supplies</option>
                    <option value="Event">Event</option>
                    <option value="Printing">Printing</option>
                    <option value="Refreshments">Refreshments</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Expenses Table */}
              <div className="overflow-x-auto w-full rounded-2xl border border-slate-100">
                <table className="w-full text-xs min-w-[650px]">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5 text-left">Date</th>
                      <th className="px-5 py-3.5 text-left">Item / Description</th>
                      <th className="px-5 py-3.5 text-left">Category</th>
                      <th className="px-5 py-3.5 text-left">Paid To</th>
                      <th className="px-5 py-3.5 text-right">Total Amount</th>
                      <th className="px-5 py-3.5 text-right">Per Student</th>
                      <th className="px-5 py-3.5 text-center">Receipt & Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredExpenses.map((exp) => (
                      <tr
                        key={exp.id}
                        onClick={() => setSelectedExpenseForDetail(exp)}
                        className="hover:bg-slate-50/70 transition cursor-pointer group"
                      >
                        <td className="px-5 py-3.5 font-semibold text-slate-500 font-mono text-[11px]">
                          {new Date(exp.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-slate-950">
                          <div className="group-hover:text-emerald-700 transition">{exp.description}</div>
                          {exp.notes && (
                            <div className="text-[10px] text-slate-400 font-normal mt-0.5 truncate max-w-xs">
                              {exp.notes}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold">
                            {exp.category}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-slate-600">{exp.paidTo || "—"}</td>
                        <td className="px-5 py-3.5 text-right font-black text-red-600">-₱{exp.amount.toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-right font-bold text-slate-700">
                          -₱{(exp.amount / enrolledStudentsCount).toFixed(2)}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <button
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setSelectedExpenseForDetail(exp);
                            }}
                            className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition cursor-pointer"
                          >
                            {exp.receiptURL ? (
                              <>
                                <Receipt className="h-3 w-3 text-emerald-600" />
                                <span>Inspect Receipt</span>
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3" />
                                <span>Details</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredExpenses.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-slate-400 font-medium italic">
                          No classroom expenses match the current filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. FUND RECORDS TAB */}
        {activeTab === "funds" && (
          <div className="space-y-6">
            
            {/* Fund Balance Sheet Header */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Income (Contributions)</span>
                <span className="text-xl font-extrabold text-emerald-600">₱{totalCollected.toLocaleString()}</span>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Expenses Statement</span>
                <span className="text-xl font-extrabold text-red-600">₱{totalExpenses.toLocaleString()}</span>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Remaining Balance Sheet</span>
                <span className="text-xl font-extrabold text-slate-950">₱{fundBalance.toLocaleString()}</span>
              </div>
            </div>

            {/* Income and Expenses sequential statement (As requested in Item 14: "CLASSROOM FUND RECORDS") */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm text-left space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-950 text-base">Class Ledger History</h3>
                  <p className="text-slate-400 text-xs">Official sequential fund audit statement.</p>
                </div>
                <span className="text-xs text-slate-400 font-bold">{financialRecords.length} statements</span>
              </div>

              <div className="overflow-x-auto w-full rounded-2xl border border-slate-100">
                <table className="w-full text-xs min-w-[500px]">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3 text-left">Date</th>
                      <th className="px-5 py-3 text-left">Description</th>
                      <th className="px-5 py-3 text-left">Reference / Source</th>
                      <th className="px-5 py-3 text-right">Income</th>
                      <th className="px-5 py-3 text-right">Expense</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {financialRecords.map((rec, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3.5 font-semibold text-slate-500 font-mono text-[10px]">{rec.date}</td>
                        <td className="px-5 py-3.5 font-bold text-slate-950">{rec.description}</td>
                        <td className="px-5 py-3.5 font-semibold text-slate-600">{rec.reference}</td>
                        <td className="px-5 py-3.5 text-right font-extrabold text-emerald-600">
                          {rec.income > 0 ? `+₱${rec.income.toLocaleString()}` : "—"}
                        </td>
                        <td className="px-5 py-3.5 text-right font-extrabold text-red-600">
                          {rec.expense > 0 ? `-₱${rec.expense.toLocaleString()}` : "—"}
                        </td>
                      </tr>
                    ))}
                    {financialRecords.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center text-slate-400 font-medium italic">
                          No accounting ledger records yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. REPORTS TAB */}
        {activeTab === "reports" && <ReportView />}

        {/* 6. INVITE STUDENTS TAB */}
        {activeTab === "invite" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
              <div>
                <h3 className="font-extrabold text-slate-950 text-base">Student Invitation System</h3>
                <p className="text-slate-400 text-xs">Generate unique code invitations for students to join.</p>
              </div>

              {/* Status Area */}
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Invitation Status</span>
                  <span className={`text-xs font-black uppercase tracking-wider ${classroom.inviteStatus === "active" ? "text-emerald-600" : "text-slate-400"}`}>
                    {classroom.inviteStatus === "active" ? "● Active" : "○ Deactivated"}
                  </span>
                </div>
                <button
                  onClick={toggleInviteStatus}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    classroom.inviteStatus === "active"
                      ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/10"
                  }`}
                >
                  {classroom.inviteStatus === "active" ? "Deactivate" : "Activate"}
                </button>
              </div>

              {/* Code */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Classroom Invite Code</span>
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between">
                  <span className="font-black text-emerald-950 text-xl tracking-widest">{classroom.inviteCode}</span>
                  <button onClick={handleCopyCode} className="text-emerald-700 hover:text-emerald-950 p-2 hover:bg-emerald-100/50 rounded-xl transition">
                    {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Link */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Invitation Web URL</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 font-mono outline-none"
                    value={getInviteLink()}
                  />
                  <button
                    onClick={handleCopyLink}
                    className="bg-slate-950 hover:bg-slate-900 text-white font-semibold text-xs py-2 px-3.5 rounded-xl transition flex items-center gap-1 shrink-0"
                  >
                    {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedLink ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                  Secure Onboarding: Students will complete their official student bio profile upon clicking this invitation link. Joined profiles are securely saved to your class.
                </p>
              </div>
            </div>

            {/* QR Invite View */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-950 text-sm">Class Invitation QR Code</h3>
                <p className="text-slate-400 text-xs">Students scan this QR to complete their profile and join instantly.</p>
              </div>

              <div className="border border-slate-200/80 p-2.5 bg-white rounded-2xl shadow-inner shadow-slate-50">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(getInviteLink())}`}
                  alt="Invite QR Code"
                  referrerPolicy="no-referrer"
                  className="w-44 h-44"
                />
              </div>

              <span className="text-[10px] text-slate-400 italic">SY {classroom.schoolYear} &bull; {classroom.name} Invitation QR</span>
            </div>
          </div>
        )}

        {/* 7. AUDIT LOGS TAB */}
        {activeTab === "audit" && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm text-left space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-950 text-base">Classroom Audit Logs</h3>
                <p className="text-slate-400 text-xs">Comprehensive tracking log of database modifications.</p>
              </div>
              <span className="text-xs text-slate-400 font-bold">{auditLogs.length} entries</span>
            </div>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-2">
              {auditLogs.map((log, idx) => (
                <div key={log.id || idx} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-start gap-3 text-xs">
                  <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                    log.action.includes("Payment") ? "bg-emerald-100 text-emerald-800" :
                    log.action.includes("Expense") ? "bg-amber-100 text-amber-800" :
                    "bg-slate-200 text-slate-700"
                  }`}>
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-grow space-y-1">
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-bold text-slate-900">{log.action}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-600 font-medium">{log.details}</p>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">
                      By: {log.userName} ({log.userRole})
                    </div>
                  </div>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <div className="py-12 text-center text-slate-400 italic font-medium text-xs">No audit logs logged in database.</div>
              )}
            </div>
          </div>
        )}

        {/* 8. SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm text-left max-w-xl mx-auto space-y-5">
            <div>
              <h3 className="font-extrabold text-slate-950 text-base">Classroom Settings</h3>
              <p className="text-slate-400 text-xs">Update your funding parameters and class descriptors.</p>
            </div>

            {/* Editable config form */}
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const nameValue = formData.get("name") as string;
              const schoolValue = formData.get("school") as string;
              const syValue = formData.get("schoolYear") as string;
              const descValue = formData.get("description") as string;

              if (nameValue && schoolValue) {
                await updateClassroomSettings({
                  name: nameValue,
                  school: schoolValue,
                  schoolYear: syValue,
                  description: descValue
                });
              }
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Classroom Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={classroom.name}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-950 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">School / Institution</label>
                <input
                  type="text"
                  name="school"
                  defaultValue={classroom.school}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-950 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">School Year</label>
                <input
                  type="text"
                  name="schoolYear"
                  defaultValue={classroom.schoolYear}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-950 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Description (Optional)</label>
                <textarea
                  name="description"
                  defaultValue={classroom.description}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-950 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-sm"
              >
                Save Settings Adjustments
              </button>
            </form>
          </div>
        )}

        {/* Professional Footer Credits */}
        <WebsiteCredits onOpenTerms={() => setShowTerms(true)} />
      </main>

      {/* --- MODAL RENDERING WINDOWS --- */}
      {showPaymentModal && (
        <PaymentModal
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedStudentForPayment(undefined);
            setSelectedPaymentForEdit(undefined);
          }}
          student={selectedStudentForPayment}
          paymentToEdit={selectedPaymentForEdit}
        />
      )}

      {showExpenseModal && (
        <ExpenseModal
          onClose={() => setShowExpenseModal(false)}
        />
      )}

      {/* Detailed Expense & Receipt Inspector Modal */}
      {selectedExpenseForDetail && (
        <ExpenseDetailModal
          expense={selectedExpenseForDetail}
          enrolledStudentsCount={enrolledStudentsCount}
          onClose={() => setSelectedExpenseForDetail(null)}
        />
      )}

      {/* Onboarding Tour for Treasurers */}
      {showTour && (
        <OnboardingTour
          role="treasurer"
          userName={user.name}
          onComplete={() => {
            localStorage.setItem(`tour_completed_treasurer_${user.uid}`, "true");
            setShowTour(false);
          }}
        />
      )}

      {/* Terms of Service & Privacy Modal */}
      <TermsModal
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
      />
    </div>
  );
};

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { AppLogo } from "./AppLogo";
import { OnboardingTour } from "./OnboardingTour";
import { TermsModal } from "./TermsModal";
import { CashoutModal } from "./CashoutModal";
import { 
  DollarSign, 
  Wallet, 
  Clock, 
  LogOut, 
  TrendingUp, 
  CheckCircle, 
  Lock, 
  HelpCircle, 
  ChevronRight, 
  FileText,
  Bookmark,
  Sparkles,
  Award,
  Menu,
  X,
  ShieldCheck,
  ArrowDownToLine,
  Info
} from "lucide-react";
import html2canvas from "html2canvas-pro";
import { motion } from "motion/react";

export const StudentDashboard: React.FC = () => {
  const { user, classroom, members, payments, expenses, cashoutRequests, signOutUser } = useApp();
  const [activeTab, setActiveTab] = useState<"contributions" | "records" | "cashouts">("contributions");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [exportingImage, setExportingImage] = useState(false);
  const [exportedImageSrc, setExportedImageSrc] = useState<string | null>(null);
  const [showCashoutModal, setShowCashoutModal] = useState<boolean>(false);

  // Onboarding & Terms state
  const [showTour, setShowTour] = useState<boolean>(() => {
    return !localStorage.getItem(`tour_completed_student_${user?.uid}`);
  });
  const [showTerms, setShowTerms] = useState<boolean>(false);

  if (!user || !classroom) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-100 shadow-xl text-center space-y-4">
          <div className="text-amber-500 text-4xl">⚠️</div>
          <h2 className="text-xl font-extrabold text-slate-950">No Active Classroom Workspace</h2>
          <p className="text-slate-500 text-sm">You haven&apos;t joined any classroom workspace yet. Ask your classroom Treasurer for an official invitation link or code.</p>
          <button 
            onClick={signOutUser}
            className="bg-slate-950 hover:bg-slate-900 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition"
          >
            Log Out Account
          </button>
        </div>
      </div>
    );
  }

  // Calculate this specific student's contributions
  const myPayments = payments.filter(p => p.studentId === user.uid);
  const myTotalPaid = myPayments.reduce((sum, p) => sum + p.amount, 0);

  // General Classroom Fund Stats
  const totalClassCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalClassExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const classBalance = totalClassCollected - totalClassExpenses;

  // Student Cashout Calculation: Student Contribution less their equal share of class expenses
  const enrolledStudentsCount = Math.max(1, members.length || 1);
  const perStudentExpenseShare = totalClassExpenses / enrolledStudentsCount;
  const rawEligibleCashout = myTotalPaid - perStudentExpenseShare;
  const eligibleCashoutAmount = Math.max(0, rawEligibleCashout);

  // Student's Cashout requests history
  const myCashouts = cashoutRequests.filter(c => c.studentId === user.uid);
  const totalDisbursedCashouts = myCashouts
    .filter(c => c.status === "disbursed")
    .reduce((sum, c) => sum + c.requestedAmount, 0);
  const pendingCashoutsAmount = myCashouts
    .filter(c => c.status === "pending" || c.status === "approved")
    .reduce((sum, c) => sum + c.requestedAmount, 0);

  // Current remaining available cashout
  const remainingAvailableCashout = Math.max(0, eligibleCashoutAmount - totalDisbursedCashouts - pendingCashoutsAmount);

  const handleExportImage = async () => {
    const element = document.getElementById("student-report-capture-area");
    if (!element) return;
    setExportingImage(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#f8fafc",
        logging: false,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      setExportedImageSrc(imgData);
      
      // Fallback standard download trigger
      const link = document.createElement("a");
      link.download = `${classroom.name.replace(/\s+/g, "_")}_student_${activeTab}_statement.png`;
      link.href = imgData;
      link.click();
    } catch (err) {
      console.error("Failed to export student statement as image:", err);
    } finally {
      setExportingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row" id="student-dashboard">
      
      {/* Mobile Top Header Bar */}
      <div className="md:hidden flex items-center justify-between bg-slate-950 text-white p-4 sticky top-0 z-40 shadow-md">
        <AppLogo size="sm" showText={true} dark={true} subtitle="Student Portal" />
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white transition"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Drawer Panel */}
          <aside className="relative w-64 bg-slate-950 text-white flex flex-col justify-between p-6 h-full shadow-2xl z-50 animate-fade-in text-left">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <AppLogo size="sm" showText={true} dark={true} subtitle="Student Portal" />
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-white transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Student Profile Overview */}
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800/80 space-y-3">
                <div className="flex items-center gap-3">
                  <img 
                    src={user.photoURL} 
                    alt="Avatar" 
                    referrerPolicy="no-referrer"
                    className="h-10 w-10 rounded-full border border-slate-700 p-0.5 bg-slate-800" 
                  />
                  <div className="min-w-0">
                    <span className="font-bold text-slate-100 text-sm block truncate">{user.name}</span>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wide">ID: {user.studentId || "N/A"}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800/60 grid grid-cols-2 gap-1 text-[10px] text-slate-400 font-bold">
                  <div>CLASS: <span className="text-white">{classroom.name}</span></div>
                  <div>SY: <span className="text-white">{classroom.schoolYear}</span></div>
                </div>
              </div>

              {/* Navigation Menus */}
              <nav className="space-y-1.5 text-left">
                <button
                  onClick={() => {
                    setActiveTab("contributions");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
                    activeTab === "contributions"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <Wallet className="h-4 w-4" /> My Contributions
                </button>
                <button
                  onClick={() => {
                    setActiveTab("records");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
                    activeTab === "records"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <TrendingUp className="h-4 w-4" /> Class Fund Statement
                </button>
                <button
                  onClick={() => {
                    setActiveTab("cashouts");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
                    activeTab === "cashouts"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <ArrowDownToLine className="h-4 w-4" /> Cashout Claims
                  {myCashouts.length > 0 && (
                    <span className="ml-auto text-[10px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                      {myCashouts.length}
                    </span>
                  )}
                </button>
              </nav>
            </div>

            {/* Bottom Navigation / Actions */}
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
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition flex items-center gap-2.5 text-left"
              >
                <LogOut className="h-4 w-4" /> Log Out Account
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Navigation Sidebar (Desktop view) */}
      <aside className="hidden md:flex w-64 bg-slate-950 text-white flex-col justify-between shrink-0 p-6 md:min-h-screen">
        <div className="space-y-8">
          {/* Logo Brand */}
          <AppLogo size="md" showText={true} dark={true} subtitle="Student Portal" />

          {/* Student Profile Overview */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-3">
              <img 
                src={user.photoURL} 
                alt="Avatar" 
                referrerPolicy="no-referrer"
                className="h-10 w-10 rounded-full border border-slate-700 p-0.5 bg-slate-800" 
              />
              <div className="min-w-0">
                <span className="font-bold text-slate-100 text-sm block truncate">{user.name}</span>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wide">ID: {user.studentId || "N/A"}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800/60 grid grid-cols-2 gap-1 text-[10px] text-slate-400 font-bold">
              <div>CLASS: <span className="text-white">{classroom.name}</span></div>
              <div>SY: <span className="text-white">{classroom.schoolYear}</span></div>
            </div>
          </div>

          {/* Navigation Menus */}
          <nav className="space-y-1.5 text-left">
            <button
              onClick={() => setActiveTab("contributions")}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
                activeTab === "contributions"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Wallet className="h-4 w-4" /> My Contributions
            </button>
            <button
              onClick={() => setActiveTab("records")}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
                activeTab === "records"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <TrendingUp className="h-4 w-4" /> Class Fund Statement
            </button>
            <button
              onClick={() => setActiveTab("cashouts")}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
                activeTab === "cashouts"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <ArrowDownToLine className="h-4 w-4" /> Cashout Claims
              {myCashouts.length > 0 && (
                <span className="ml-auto text-[10px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                  {myCashouts.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Bottom Actions Desktop */}
        <div className="space-y-1 pt-4 border-t border-slate-800 mt-8 md:mt-0">
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

      {/* Main Panel Content */}
      <main className="flex-1 p-4 md:p-8 space-y-6">
        
        {/* Top Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm text-left">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">Classroom Workspace</span>
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">{classroom.name}</h1>
            <p className="text-xs text-slate-500 font-medium">{classroom.school} &bull; {classroom.program} ({classroom.yearLevel} - Sec {classroom.section})</p>
          </div>
          <button
            onClick={handleExportImage}
            disabled={exportingImage}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition whitespace-nowrap self-start sm:self-center cursor-pointer shadow-sm"
          >
            <FileText className="h-4 w-4" />
            {exportingImage ? "Generating Image..." : "Export Statement as Image"}
          </button>
        </div>

        {/* Captured Report Block */}
        <div id="student-report-capture-area" className="bg-slate-50 p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-6">
          {/* Official Document Header for Image Export */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm text-left">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">Official Student Financial Statement</span>
            <h2 className="text-xl font-black text-slate-950 tracking-tight">{classroom.name}</h2>
            <p className="text-xs text-slate-500 font-semibold">
              Student: <strong className="text-slate-900">{user.name}</strong> ({user.studentId || "N/A"}) &bull; {classroom.school} &bull; Generated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {activeTab === "contributions" && (
          /* Student Contributions Tab */
          <div className="space-y-6">
            
            {/* Top Contribution Summary card with Cashout Eligibility */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm text-left space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">My Financial Standing</span>
                  <h3 className="font-extrabold text-slate-950 text-lg">Personal Contributions &amp; Cashout Balance</h3>
                </div>
                <button
                  onClick={() => setShowCashoutModal(true)}
                  disabled={remainingAvailableCashout <= 0}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-extrabold rounded-2xl transition flex items-center justify-center gap-2 shadow-md shadow-emerald-600/10 cursor-pointer self-start sm:self-center"
                >
                  <ArrowDownToLine className="h-4 w-4" />
                  Request Cashout Payout
                </button>
              </div>

              {/* Major Financial Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Total Contributed */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Total Contributed</span>
                    <Wallet className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">
                    ₱{myTotalPaid.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold block">
                    Logged in {myPayments.length} transactions
                  </span>
                </div>

                {/* 2. Equal Expense Share Deduction */}
                <div className="bg-red-50/50 p-5 rounded-2xl border border-red-200/70 space-y-2">
                  <div className="flex items-center justify-between text-red-500">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Shared Expense Deduction</span>
                    <TrendingUp className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-red-600">
                    -₱{Math.round(perStudentExpenseShare).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-red-600/80 font-semibold block">
                    ₱{totalClassExpenses.toLocaleString()} &divide; {enrolledStudentsCount} students
                  </span>
                </div>

                {/* 3. Available Net to Cash Out */}
                <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200/80 space-y-2">
                  <div className="flex items-center justify-between text-emerald-700">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Available to Cashout</span>
                    <ArrowDownToLine className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-600">
                    ₱{Math.round(remainingAvailableCashout).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-emerald-700/80 font-semibold block">
                    Net claimable balance after expenses
                  </span>
                </div>
              </div>

              {/* Transparent Calculation Explainer Note */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 flex items-start gap-3">
                <Info className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-600 leading-relaxed space-y-1">
                  <p className="font-semibold text-slate-800">
                    How is your available cashout calculated?
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Your contribution of <strong>₱{myTotalPaid.toLocaleString()}</strong> is reduced by your equal portion of all verified classroom expenses (<strong>₱{totalClassExpenses.toLocaleString()} &divide; {enrolledStudentsCount} enrolled students = ₱{perStudentExpenseShare.toFixed(2)}</strong> per student). The remaining balance of <strong>₱{Math.max(0, rawEligibleCashout).toFixed(2)}</strong> can be cashed out directly back to you.
                  </p>
                </div>
              </div>
            </div>

            {/* General Stats Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Class Funds Collected</span>
                <span className="text-xl font-extrabold text-emerald-600">₱{totalClassCollected.toLocaleString()}</span>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Class Funds Expended</span>
                <span className="text-xl font-extrabold text-red-600">₱{totalClassExpenses.toLocaleString()}</span>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Class Vault Net Balance</span>
                <span className="text-xl font-extrabold text-slate-950">₱{classBalance.toLocaleString()}</span>
              </div>
            </div>

            {/* Personal Payment History list */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 text-left">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-950 text-base">My Contribution History</h3>
                <span className="text-xs text-slate-400 font-semibold">{myPayments.length} logs saved</span>
              </div>

              <div className="overflow-x-auto w-full rounded-2xl border border-slate-100">
                <table className="w-full text-sm min-w-[500px]">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3 text-left">Date</th>
                      <th className="px-5 py-3 text-left">Method</th>
                      <th className="px-5 py-3 text-left">Reference Number</th>
                      <th className="px-5 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {myPayments.map((p, idx) => (
                      <tr key={p.id || idx} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3.5 font-semibold text-slate-950">{p.paymentDate}</td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-bold">{p.paymentMethod}</span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{p.referenceNumber || "—"}</td>
                        <td className="px-5 py-3.5 text-right font-bold text-emerald-600">+₱{p.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                    {myPayments.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-slate-400 italic font-medium">
                          No payments have been logged under your name yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Note on Student Privacy Rule */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 flex items-start gap-2.5">
                <Lock className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                  Privacy Protection Active: Other classroom members cannot view your individual contribution amounts. Only you and the official Treasurer have authorized access to these receipts.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "records" && (
          /* General Classroom Funds transparency log */
          <div className="space-y-6">
            
            {/* Aggregate Dashboard overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Collected (Class)</span>
                <span className="text-xl font-extrabold text-emerald-600">₱{totalClassCollected.toLocaleString()}</span>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Expenses (Class)</span>
                <span className="text-xl font-extrabold text-red-600">₱{totalClassExpenses.toLocaleString()}</span>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Available Fund Balance</span>
                <span className="text-xl font-extrabold text-slate-950">₱{classBalance.toLocaleString()}</span>
              </div>
            </div>

            {/* Expenses statement list */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 text-left">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-950 text-base">Classroom Fund Expenses</h3>
                  <p className="text-slate-400 text-xs">Verify class purchases and transparency records.</p>
                </div>
                <span className="text-xs text-slate-400 font-semibold">{expenses.length} records</span>
              </div>

              <div className="overflow-x-auto w-full rounded-2xl border border-slate-100">
                <table className="w-full text-sm min-w-[500px]">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3 text-left">Date</th>
                      <th className="px-5 py-3 text-left">Item / Description</th>
                      <th className="px-5 py-3 text-left">Category</th>
                      <th className="px-5 py-3 text-left">Recipient</th>
                      <th className="px-5 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {expenses.map((e, idx) => (
                      <tr key={e.id || idx} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3.5 font-semibold text-slate-500 font-mono text-xs">
                          {new Date(e.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-slate-950">
                          <div>{e.description}</div>
                          {e.notes && <div className="text-[10px] text-slate-400 font-medium mt-0.5">{e.notes}</div>}
                          
                          {/* Receipt image viewer inside the student portal */}
                          {e.receiptURL && (
                            <a 
                              href={e.receiptURL} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 mt-1 cursor-pointer"
                            >
                              <FileText className="h-3 w-3" /> View Receipt
                            </a>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-semibold">{e.category}</span>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-slate-600">{e.paidTo}</td>
                        <td className="px-5 py-3.5 text-right font-bold text-red-600">-₱{e.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                    {expenses.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-10 text-center text-slate-400 italic font-medium">
                          No classroom expenses have been recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "cashouts" && (
          /* Cashout Claims History Tab */
          <div className="space-y-6 text-left">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">Disbursement History</span>
                  <h3 className="font-extrabold text-slate-950 text-lg">My Cashout Claims</h3>
                </div>
                <button
                  onClick={() => setShowCashoutModal(true)}
                  disabled={remainingAvailableCashout <= 0}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-extrabold rounded-2xl transition flex items-center justify-center gap-2 shadow-md shadow-emerald-600/10 cursor-pointer"
                >
                  <ArrowDownToLine className="h-4 w-4" />
                  New Cashout Request
                </button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Remaining Claimable</span>
                  <span className="text-xl font-black text-emerald-600 block mt-1">₱{Math.round(remainingAvailableCashout).toLocaleString()}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Approval</span>
                  <span className="text-xl font-black text-amber-600 block mt-1">₱{pendingCashoutsAmount.toLocaleString()}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Disbursed</span>
                  <span className="text-xl font-black text-slate-900 block mt-1">₱{totalDisbursedCashouts.toLocaleString()}</span>
                </div>
              </div>

              {/* Cashout Requests Ledger */}
              <div className="overflow-x-auto w-full rounded-2xl border border-slate-100">
                <table className="w-full text-xs min-w-[600px]">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3 text-left">Date Requested</th>
                      <th className="px-5 py-3 text-left">Payout Method</th>
                      <th className="px-5 py-3 text-left">Account Details</th>
                      <th className="px-5 py-3 text-right">Claim Amount</th>
                      <th className="px-5 py-3 text-center">Status</th>
                      <th className="px-5 py-3 text-left">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {myCashouts.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3.5 font-semibold text-slate-950">
                          {new Date(c.requestedAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 bg-slate-100 font-bold text-slate-700 rounded text-[10px]">
                            {c.payoutMethod}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600">
                          <div>{c.payoutAccountName}</div>
                          {c.payoutAccountNumber && <div className="text-[10px] text-slate-400">{c.payoutAccountNumber}</div>}
                        </td>
                        <td className="px-5 py-3.5 text-right font-extrabold text-emerald-600">
                          ₱{c.requestedAmount.toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            c.status === "disbursed"
                              ? "bg-emerald-100 text-emerald-800"
                              : c.status === "approved"
                              ? "bg-blue-100 text-blue-800"
                              : c.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[11px] text-slate-500">
                          {c.notes || c.reason || "—"}
                          {c.transactionReference && (
                            <div className="font-mono text-[10px] text-slate-400 mt-0.5">Ref: {c.transactionReference}</div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {myCashouts.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-10 text-center text-slate-400 italic font-medium">
                          You haven&apos;t filed any cashout requests yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        </div>

        {/* Footer Credits */}
        <footer className="mt-8 border-t border-slate-200/60 pt-6 pb-4 text-center text-xs text-slate-400">
          <p className="tracking-wide">
            Powered by <span className="font-semibold text-slate-600">ClassFund Manager</span>
            <span className="mx-2 text-slate-300">|</span>
            Designed by <span className="font-bold text-emerald-600">Darryl jay Castillo (SHIRO)</span>
          </p>
        </footer>
      </main>

      {/* Resilient Sandbox Image Export Help Dialog */}
      {exportedImageSrc && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
        >
          <motion.div 
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-200/80 overflow-hidden text-left"
          >
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base tracking-tight">Statement Image Generated</h3>
                <p className="text-[10px] sm:text-xs text-slate-400">Your statement was successfully compiled to a digital image.</p>
              </div>
              <button 
                onClick={() => setExportedImageSrc(null)}
                className="bg-slate-800 hover:bg-slate-700 p-2 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content & Sandbox Warning */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-left">
                <span className="text-lg">💡</span>
                <p className="text-[11px] text-amber-900 leading-relaxed font-semibold">
                  <strong>Sandbox Environment Safe Mode:</strong> If the automatic file download was blocked by your browser&apos;s sandboxed preview constraints, you can easily save it by **right-clicking (or holding down on mobile)** the image below and selecting <strong className="underline">Save Image As...</strong>.
                </p>
              </div>

              {/* Generated Image Base64 Frame */}
              <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-inner bg-slate-100 p-3 flex justify-center items-center">
                <img 
                  src={exportedImageSrc} 
                  alt="Financial Report Preview" 
                  className="max-w-full h-auto rounded-xl shadow-md border border-slate-200"
                />
              </div>
            </div>

            {/* Footer buttons */}
            <div className="bg-slate-50 p-4 border-t border-slate-200/60 flex justify-end gap-2 shrink-0">
              <a 
                href={exportedImageSrc}
                download={`${classroom.name.replace(/\s+/g, "_")}_student_${activeTab}_statement.png`}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <FileText className="h-3.5 w-3.5" /> Force Download
              </a>
              <button 
                onClick={() => setExportedImageSrc(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Close Preview
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Onboarding Tour for Students */}
      {showTour && (
        <OnboardingTour
          role="student"
          userName={user.name}
          onComplete={() => {
            localStorage.setItem(`tour_completed_student_${user.uid}`, "true");
            setShowTour(false);
          }}
        />
      )}

      {/* Terms of Service Modal */}
      <TermsModal
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
      />

      {/* Student Cashout Request Modal */}
      <CashoutModal
        isOpen={showCashoutModal}
        onClose={() => setShowCashoutModal(false)}
        availableCashout={remainingAvailableCashout}
        totalPaid={myTotalPaid}
        perStudentExpenseShare={perStudentExpenseShare}
      />
    </div>
  );
};

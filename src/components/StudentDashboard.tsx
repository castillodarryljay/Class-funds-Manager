import React, { useState } from "react";
import { useApp } from "../context/AppContext";
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
  X
} from "lucide-react";
import html2canvas from "html2canvas-pro";
import { motion } from "motion/react";

export const StudentDashboard: React.FC = () => {
  const { user, classroom, payments, expenses, signOutUser } = useApp();
  const [activeTab, setActiveTab] = useState<"contributions" | "records">("contributions");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [exportingImage, setExportingImage] = useState(false);
  const [exportedImageSrc, setExportedImageSrc] = useState<string | null>(null);

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
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 p-1.5 rounded-lg text-white">
            <DollarSign className="h-4 w-4" />
          </div>
          <div>
            <span className="font-extrabold text-xs uppercase tracking-wider block leading-none">Class Funds</span>
            <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-wider block">Student Portal</span>
          </div>
        </div>
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
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-600 p-1.5 rounded-lg text-white">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-xs uppercase tracking-wider block leading-none">Class Funds</span>
                    <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-wider block">Student Portal</span>
                  </div>
                </div>
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
              </nav>
            </div>

            {/* Logout Bottom */}
            <button
              onClick={signOutUser}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition flex items-center gap-2.5 text-left mt-8"
            >
              <LogOut className="h-4 w-4" /> Log Out Account
            </button>
          </aside>
        </div>
      )}

      {/* Navigation Sidebar (Desktop view) */}
      <aside className="hidden md:flex w-64 bg-slate-950 text-white flex-col justify-between shrink-0 p-6 md:min-h-screen">
        <div className="space-y-8">
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-600 p-2 rounded-xl">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight uppercase block leading-none">Class Funds</span>
              <span className="text-[9px] text-emerald-400 font-bold tracking-wider uppercase">Student Portal</span>
            </div>
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
          </nav>
        </div>

        {/* Logout Bottom */}
        <button
          onClick={signOutUser}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition flex items-center gap-2.5 text-left mt-8 md:mt-0"
        >
          <LogOut className="h-4 w-4" /> Log Out Account
        </button>
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

          {activeTab === "contributions" ? (
          /* Student Contributions Tab */
          <div className="space-y-6">
            
            {/* Top Contribution Summary card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm text-left space-y-4">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">My Financial Standing</span>
                <h3 className="font-extrabold text-slate-950 text-base">Personal Contributions Summary</h3>
              </div>

              {/* Huge Contribution Values */}
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-emerald-600">₱{myTotalPaid.toLocaleString()}</span>
                <span className="text-slate-400 font-bold text-sm">Total Contributed</span>
              </div>

              <p className="text-slate-500 text-xs">
                You have contributed a total of <strong>₱{myTotalPaid.toLocaleString()}</strong> across <strong>{myPayments.length}</strong> separate logged transactions. Every contribution is fully audited and tracked.
              </p>
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
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Available Net Balance</span>
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
        ) : (
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
                              <FileText className="h-3 w-3" /> View Receipt Receipt
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
        </div>

        {/* Footer Credits */}
        <footer className="mt-8 border-t border-slate-200/60 pt-6 pb-4 text-center text-xs text-slate-500">
          <p>Class Funds System &copy; 2026. Designed & Developed by <strong className="text-slate-800">Darryl Jay Castillo (SHIRO)</strong>.</p>
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
    </div>
  );
};

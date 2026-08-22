import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { FileText, Download, TrendingUp, Users, DollarSign, Wallet, RefreshCw, CheckCircle2, X } from "lucide-react";
import html2canvas from "html2canvas-pro";
import { motion } from "motion/react";

export const ReportView: React.FC = () => {
  const { classroom, members, payments, expenses } = useApp();
  const [reportType, setReportType] = useState<"summary" | "students" | "expenses">("summary");
  const [exportingImage, setExportingImage] = useState(false);
  const [exportedImageSrc, setExportedImageSrc] = useState<string | null>(null);

  if (!classroom) return null;

  // Calculate statistics
  const totalStudents = members.filter(m => m.role === "student").length;
  
  // Total Collected (Sum of all payments)
  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  
  // Total Expenses
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Balance
  const fundBalance = totalCollected - totalExpenses;

  // Student specific contribution tracking
  const studentContributionMap = members
    .filter(m => m.role === "student")
    .map(student => {
      const studentPayments = payments.filter(p => p.studentId === student.uid);
      const paid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
      const hasContributed = paid > 0;

      return {
        name: student.name,
        email: student.email,
        studentId: student.studentId || "N/A",
        paid,
        hasContributed
      };
    });

  const contributorCount = studentContributionMap.filter(s => s.hasContributed).length;
  const nonContributorCount = totalStudents - contributorCount;

  // Export functions
  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSummary = () => {
    let csv = "CLASSROOM FUND SUMMARY REPORT\n";
    csv += `Classroom,${classroom.name}\n`;
    csv += `School,${classroom.school}\n`;
    csv += `School Year,${classroom.schoolYear}\n\n`;
    csv += `Financial Metric,Amount\n`;
    csv += `Total Students enrolled,${totalStudents}\n`;
    csv += `Total Actual Collected,₱${totalCollected.toFixed(2)}\n`;
    csv += `Total Outgoing Expenses,₱${totalExpenses.toFixed(2)}\n`;
    csv += `Net Remaining Fund Balance,₱${fundBalance.toFixed(2)}\n\n`;
    csv += `Student Contribution Status Counts,Count\n`;
    csv += `Contributors,${contributorCount}\n`;
    csv += `Non-Contributors,${nonContributorCount}\n`;

    downloadCSV(csv, `${classroom.name.replace(/\s+/g, "_")}_Financial_Summary.csv`);
  };

  const handleExportStudents = () => {
    let csv = "STUDENT CONTRIBUTIONS REPORT\n";
    csv += `Classroom,${classroom.name}\n`;
    csv += `School Year,${classroom.schoolYear}\n\n`;
    csv += "Student Name,Student ID,Email,Amount Paid,Status\n";
    studentContributionMap.forEach(s => {
      csv += `"${s.name}","${s.studentId}","${s.email}",${s.paid},"${s.hasContributed ? "Contributor" : "No Payment"}"\n`;
    });

    downloadCSV(csv, `${classroom.name.replace(/\s+/g, "_")}_Student_Contributions.csv`);
  };

  const handleExportExpenses = () => {
    let csv = "CLASSROOM EXPENSE STATEMENT\n";
    csv += `Classroom,${classroom.name}\n`;
    csv += `School Year,${classroom.schoolYear}\n\n`;
    csv += "Date,Description,Category,Paid To,Amount,Recorded By,Notes\n";
    expenses.forEach(e => {
      csv += `"${new Date(e.createdAt).toLocaleDateString()}","${e.description}","${e.category}","${e.paidTo}",${e.amount},"${e.recordedBy}","${e.notes || ""}"\n`;
    });

    downloadCSV(csv, `${classroom.name.replace(/\s+/g, "_")}_Class_Expenses.csv`);
  };

  const handleExportImage = async () => {
    const reportElement = document.getElementById("reports-view-container");
    if (!reportElement) return;
    setExportingImage(true);
    try {
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      setExportedImageSrc(imgData);

      // Fallback automatic click download
      const link = document.createElement("a");
      link.download = `${classroom.name.replace(/\s+/g, "_")}_${reportType}_report.png`;
      link.href = imgData;
      link.click();
    } catch (err) {
      console.error("Failed to export report as image:", err);
    } finally {
      setExportingImage(false);
    }
  };

  return (
    <div className="space-y-6" id="reports-view">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Financial Reports & Exports</h2>
          <p className="text-slate-500 text-sm">Download official statements and view breakdown matrices.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportImage}
            disabled={exportingImage}
            className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold py-2 px-4 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5" />
            {exportingImage ? "Generating Image..." : "Export as Image (PNG)"}
          </button>

          {reportType === "summary" && (
            <button
              onClick={handleExportSummary}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/10 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" /> Export Summary CSV
            </button>
          )}
          {reportType === "students" && (
            <button
              onClick={handleExportStudents}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/10 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" /> Export Student Contributions
            </button>
          )}
          {reportType === "expenses" && (
            <button
              onClick={handleExportExpenses}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/10 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" /> Export Expenses CSV
            </button>
          )}
        </div>
      </div>

      {/* Reports Selection Tabs */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => setReportType("summary")}
          className={`py-2.5 px-4 font-bold text-xs border-b-2 transition ${
            reportType === "summary"
              ? "border-slate-950 text-slate-950"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Classroom Fund Summary
        </button>
        <button
          onClick={() => setReportType("students")}
          className={`py-2.5 px-4 font-bold text-xs border-b-2 transition ${
            reportType === "students"
              ? "border-slate-950 text-slate-950"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Student Contributions Matrix
        </button>
        <button
          onClick={() => setReportType("expenses")}
          className={`py-2.5 px-4 font-bold text-xs border-b-2 transition ${
            reportType === "expenses"
              ? "border-slate-950 text-slate-950"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Classroom Expenses Statement
        </button>
      </div>

      {/* Captured Report Block */}
      <div id="reports-view-container" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        {/* Printable/Exportable Document Header */}
        <div className="border-b border-slate-100 pb-5">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">Official Financial Statement</span>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">{classroom.name}</h1>
          <p className="text-xs text-slate-500 font-semibold">{classroom.school} &bull; School Year {classroom.schoolYear} &bull; Generated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Report Summary View */}
        {reportType === "summary" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 text-left">
              <h3 className="font-extrabold text-slate-950 text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" /> General Finance Matrix
              </h3>
              
              <div className="space-y-3.5">
                <div className="flex justify-between items-center py-2 border-b border-slate-200/60">
                  <span className="text-slate-500 text-sm">Total Enrolled Students</span>
                  <span className="font-bold text-slate-950 text-sm">{totalStudents}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200/60">
                  <span className="text-slate-500 text-sm">Total Collected Contributions</span>
                  <span className="font-bold text-emerald-600 text-sm">₱{totalCollected.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200/60">
                  <span className="text-slate-500 text-sm">Total Outgoing Expenses</span>
                  <span className="font-bold text-red-600 text-sm">₱{totalExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-slate-950 font-extrabold text-sm">Net Class Fund Balance</span>
                  <span className="font-extrabold text-slate-950 text-base">₱{fundBalance.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Collection Status Grid */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 text-left">
              <h3 className="font-extrabold text-slate-950 text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-600" /> Student Status Breakdown
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-emerald-100/55 rounded-2xl border border-emerald-100 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-emerald-800 uppercase block">Contributors</span>
                    <span className="text-slate-600 text-[10px]">Students who have logged a payment</span>
                  </div>
                  <span className="text-xl font-black text-emerald-700">{contributorCount}</span>
                </div>

                <div className="p-4 bg-slate-200/50 rounded-2xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-slate-700 uppercase block">Non-contributors</span>
                    <span className="text-slate-600 text-[10px]">Students with zero logged contributions</span>
                  </div>
                  <span className="text-xl font-black text-slate-700">{nonContributorCount}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Student Contributions Table */}
        {reportType === "students" && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-x-auto w-full text-left">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-left">Student</th>
                  <th className="px-6 py-4 text-left">Student ID</th>
                  <th className="px-6 py-4 text-left">Email Address</th>
                  <th className="px-6 py-4 text-right">Paid</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {studentContributionMap.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3.5 font-bold text-slate-950">{s.name}</td>
                    <td className="px-6 py-3.5 font-medium text-slate-500 font-mono text-xs">{s.studentId}</td>
                    <td className="px-6 py-3.5 text-slate-500 text-xs">{s.email}</td>
                    <td className="px-6 py-3.5 text-right font-bold text-slate-900">₱{s.paid.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        s.hasContributed ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                      }`}>
                        {s.hasContributed ? "Contributor" : "No Payment"}
                      </span>
                    </td>
                  </tr>
                ))}
                {studentContributionMap.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                      No student contribution accounts configured yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Expenses Table */}
        {reportType === "expenses" && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-x-auto w-full text-left">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-left">Date</th>
                  <th className="px-6 py-4 text-left">Description</th>
                  <th className="px-6 py-4 text-left">Category</th>
                  <th className="px-6 py-4 text-left">Recipient</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {expenses.map((e, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3.5 font-medium text-slate-500 font-mono text-xs">
                      {new Date(e.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3.5 font-bold text-slate-950">
                      <div>{e.description}</div>
                      {e.notes && <div className="text-[10px] text-slate-400 font-medium mt-0.5">{e.notes}</div>}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 text-xs font-semibold">{e.category}</span>
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-600">{e.paidTo}</td>
                    <td className="px-6 py-3.5 text-right font-bold text-red-600">-₱{e.amount.toLocaleString()}</td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                      No outgoing expense payments logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
                <h3 className="font-extrabold text-sm sm:text-base tracking-tight">Report Image Generated</h3>
                <p className="text-[10px] sm:text-xs text-slate-400">Your report was successfully compiled to a digital image.</p>
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
                download={`${classroom.name.replace(/\s+/g, "_")}_${reportType}_report.png`}
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

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { FileText, Download, TrendingUp, Users, DollarSign, Wallet, RefreshCw, CheckCircle2 } from "lucide-react";

export const ReportView: React.FC = () => {
  const { classroom, members, payments, expenses } = useApp();
  const [reportType, setReportType] = useState<"summary" | "students" | "expenses">("summary");

  if (!classroom) return null;

  // Calculate statistics
  const totalStudents = members.filter(m => m.role === "student").length;
  const goal = classroom.contributionGoal;
  const expectedTotal = totalStudents * goal;
  
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
      const remaining = Math.max(0, goal - paid);
      let status: "Paid" | "Partial" | "Unpaid" = "Unpaid";
      if (paid >= goal) status = "Paid";
      else if (paid > 0) status = "Partial";

      return {
        name: student.name,
        email: student.email,
        studentId: student.studentId || "N/A",
        paid,
        remaining,
        status
      };
    });

  const paidCount = studentContributionMap.filter(s => s.status === "Paid").length;
  const partialCount = studentContributionMap.filter(s => s.status === "Partial").length;
  const unpaidCount = studentContributionMap.filter(s => s.status === "Unpaid").length;

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
    csv += `Target Contribution Per Student,₱${goal.toFixed(2)}\n`;
    csv += `Total Students enrolled,${totalStudents}\n`;
    csv += `Total Expected Collections,₱${expectedTotal.toFixed(2)}\n`;
    csv += `Total Actual Collected,₱${totalCollected.toFixed(2)}\n`;
    csv += `Total Outgoing Expenses,₱${totalExpenses.toFixed(2)}\n`;
    csv += `Net Remaining Fund Balance,₱${fundBalance.toFixed(2)}\n\n`;
    csv += `Student Status Counts,Count\n`;
    csv += `Fully Paid,${paidCount}\n`;
    csv += `Partially Paid,${partialCount}\n`;
    csv += `Unpaid,${unpaidCount}\n`;

    downloadCSV(csv, `${classroom.name.replace(/\s+/g, "_")}_Financial_Summary.csv`);
  };

  const handleExportStudents = () => {
    let csv = "STUDENT CONTRIBUTION PROGRESS REPORT\n";
    csv += `Classroom,${classroom.name}\n`;
    csv += `School Year,${classroom.schoolYear}\n\n`;
    csv += "Student Name,Student ID,Email,Amount Paid,Amount Remaining,Status\n";
    studentContributionMap.forEach(s => {
      csv += `"${s.name}","${s.studentId}","${s.email}",${s.paid},${s.remaining},"${s.status}"\n`;
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

  return (
    <div className="space-y-6" id="reports-view">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Financial Reports & Exports</h2>
          <p className="text-slate-500 text-sm">Download official statements and view breakdown matrices.</p>
        </div>
        <div className="flex gap-2">
          {reportType === "summary" && (
            <button
              onClick={handleExportSummary}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/10"
            >
              <Download className="h-3.5 w-3.5" /> Export Summary CSV
            </button>
          )}
          {reportType === "students" && (
            <button
              onClick={handleExportStudents}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/10"
            >
              <Download className="h-3.5 w-3.5" /> Export Student Contributions
            </button>
          )}
          {reportType === "expenses" && (
            <button
              onClick={handleExportExpenses}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/10"
            >
              <Download className="h-3.5 w-3.5" /> Export Expenses CSV
            </button>
          )}
        </div>
      </div>

      {/* Reports Selection Tabs */}
      <div className="flex border-b border-slate-200 gap-1">
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

      {/* Report Summary View */}
      {reportType === "summary" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 text-left">
            <h3 className="font-extrabold text-slate-950 text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" /> General Finance Matrix
            </h3>
            
            <div className="space-y-3.5">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 text-sm">Target Contribution per Student</span>
                <span className="font-bold text-slate-950 text-sm">₱{goal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 text-sm">Total Enrolled Students</span>
                <span className="font-bold text-slate-950 text-sm">{totalStudents}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 text-sm">Total Expected Contributions</span>
                <span className="font-bold text-slate-950 text-sm">₱{expectedTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 text-sm">Total Collected Contributions</span>
                <span className="font-bold text-emerald-600 text-sm">₱{totalCollected.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
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
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 text-left">
            <h3 className="font-extrabold text-slate-950 text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-600" /> Student Status Breakdown
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100/50 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase block">Fully Paid</span>
                  <span className="text-slate-600 text-[10px]">Students who have met the target</span>
                </div>
                <span className="text-xl font-black text-emerald-700">{paidCount}</span>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100/50 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-amber-800 uppercase block">Partially Paid</span>
                  <span className="text-slate-600 text-[10px]">Students with remaining balances</span>
                </div>
                <span className="text-xl font-black text-amber-700">{partialCount}</span>
              </div>

              <div className="p-4 bg-red-50 rounded-2xl border border-red-100/50 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-red-800 uppercase block">Unpaid</span>
                  <span className="text-slate-600 text-[10px]">Students with zero logged contributions</span>
                </div>
                <span className="text-xl font-black text-red-700">{unpaidCount}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Contributions Table */}
      {reportType === "students" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-left">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left">Student</th>
                <th className="px-6 py-4 text-left">Student ID</th>
                <th className="px-6 py-4 text-right">Paid</th>
                <th className="px-6 py-4 text-right">Remaining</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {studentContributionMap.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="px-6 py-3.5 font-bold text-slate-950">{s.name}</td>
                  <td className="px-6 py-3.5 font-medium text-slate-500 font-mono text-xs">{s.studentId}</td>
                  <td className="px-6 py-3.5 text-right font-bold text-slate-900">₱{s.paid.toLocaleString()}</td>
                  <td className="px-6 py-3.5 text-right font-bold text-slate-500">₱{s.remaining.toLocaleString()}</td>
                  <td className="px-6 py-3.5 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      s.status === "Paid" ? "bg-emerald-100 text-emerald-800" :
                      s.status === "Partial" ? "bg-amber-100 text-amber-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {s.status}
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
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-left">
          <table className="w-full text-sm">
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
  );
};

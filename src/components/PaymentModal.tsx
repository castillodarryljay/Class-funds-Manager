import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Member, Payment } from "../types";
import { X, DollarSign, Check, ChevronDown, CheckCircle2, Search, User, UserCheck } from "lucide-react";
import { motion } from "motion/react";

interface PaymentModalProps {
  onClose: () => void;
  student?: Member; // For fresh payment for a specific student
  paymentToEdit?: Payment; // For editing/correcting an existing payment
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ onClose, student, paymentToEdit }) => {
  const { members, recordPayment, updatePayment } = useApp();
  
  // Memoize students list (includes students and treasurer who can also contribute)
  const students = useMemo(() => {
    return members.filter(m => m.role === "student" || m.role === "treasurer");
  }, [members]);

  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    if (paymentToEdit) return paymentToEdit.studentId;
    if (student) return student.uid;
    return students.length > 0 ? students[0].uid : "";
  });

  const [amount, setAmount] = useState<number>(() => {
    if (paymentToEdit) return paymentToEdit.amount;
    return 200;
  });

  const [paymentDate, setPaymentDate] = useState<string>(() => {
    if (paymentToEdit) return paymentToEdit.paymentDate;
    return new Date().toISOString().split("T")[0];
  });

  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "GCash" | "Bank Transfer" | "Other">(() => {
    if (paymentToEdit) return paymentToEdit.paymentMethod;
    return "Cash";
  });

  const [referenceNumber, setReferenceNumber] = useState<string>(() => {
    if (paymentToEdit) return paymentToEdit.referenceNumber || "";
    return "";
  });

  const [notes, setNotes] = useState<string>(() => {
    if (paymentToEdit) return paymentToEdit.notes || "";
    return "";
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter students based on search term
  const filteredStudents = useMemo(() => {
    if (!studentSearchTerm.trim()) return students;
    const q = studentSearchTerm.toLowerCase();
    return students.filter(s => 
      s.name.toLowerCase().includes(q) ||
      (s.studentId && s.studentId.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.section && s.section.toLowerCase().includes(q))
    );
  }, [students, studentSearchTerm]);

  // Synchronize when paymentToEdit or student prop changes
  useEffect(() => {
    if (paymentToEdit) {
      setSelectedStudentId(paymentToEdit.studentId);
      setAmount(paymentToEdit.amount);
      setPaymentDate(paymentToEdit.paymentDate);
      setPaymentMethod(paymentToEdit.paymentMethod);
      setReferenceNumber(paymentToEdit.referenceNumber || "");
      setNotes(paymentToEdit.notes || "");
    } else if (student) {
      setSelectedStudentId(student.uid);
      setAmount(200);
      setPaymentDate(new Date().toISOString().split("T")[0]);
    }
  }, [paymentToEdit?.id, student?.uid]);

  // Ensure an initial student is selected if none was chosen yet
  useEffect(() => {
    if (!selectedStudentId && students.length > 0) {
      setSelectedStudentId(students[0].uid);
    }
  }, [students, selectedStudentId]);

  const currentSelectedStudent = useMemo(() => {
    return students.find(s => s.uid === selectedStudentId);
  }, [students, selectedStudentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!selectedStudentId) {
      setFormError("Please select a student to record payment for.");
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      setFormError("Please specify a valid payment amount greater than ₱0.");
      return;
    }
    
    const targetStudent = students.find(s => s.uid === selectedStudentId);
    const studentName = targetStudent ? targetStudent.name : "Student";

    setSubmitting(true);
    
    try {
      if (paymentToEdit) {
        // Correct/Update payment
        const ok = await updatePayment(paymentToEdit.id, paymentToEdit.amount, {
          studentId: selectedStudentId,
          studentName,
          amount,
          paymentMethod,
          referenceNumber: referenceNumber.trim(),
          paymentDate,
          notes: notes.trim() || "Corrected transaction logs."
        });
        
        if (ok) {
          setSuccessMessage("Payment log updated successfully!");
          setTimeout(() => {
            onClose();
          }, 600);
        } else {
          setFormError("Could not update payment record. Please check your connection and try again.");
        }
      } else {
        // Create new payment
        const ok = await recordPayment({
          studentId: selectedStudentId,
          studentName,
          amount,
          paymentMethod,
          referenceNumber: referenceNumber.trim(),
          paymentDate,
          notes: notes.trim()
        });

        if (ok) {
          setSuccessMessage(`Payment of ₱${amount.toLocaleString()} logged for ${studentName}!`);
          setTimeout(() => {
            onClose();
          }, 600);
        } else {
          setFormError("Could not record payment. Please check your connection and try again.");
        }
      }
    } catch (err: any) {
      console.error("Payment modal submission error:", err);
      setFormError(err.message || "An unexpected error occurred while saving the payment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden"
      >
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              {paymentToEdit ? "Correct Contribution Payment" : "Record Contribution Payment"}
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              {paymentToEdit ? "Audit trails will log the adjustment history." : "Add a student payment to the classroom fund database."}
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
              <span className="shrink-0 text-base">⚠️</span>
              <p className="leading-tight">{formError}</p>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
              <span className="shrink-0 text-base">✅</span>
              <p className="leading-tight">{successMessage}</p>
            </div>
          )}
          
          {/* Enhanced Student Selector with Quick Search */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Student / Contributor ({students.length} Enrolled)</span>
              {studentSearchTerm && (
                <span className="text-[10px] text-emerald-600 font-bold lowercase">
                  {filteredStudents.length} match{filteredStudents.length === 1 ? "" : "es"}
                </span>
              )}
            </label>

            {paymentToEdit ? (
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl font-bold text-slate-900 text-sm flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                    {paymentToEdit.studentName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-slate-900 font-bold">{paymentToEdit.studentName}</div>
                    <div className="text-[11px] text-slate-400 font-normal">Student ID: {paymentToEdit.studentId}</div>
                  </div>
                </div>
                <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded">Locked to Record</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search student by name, student ID, email..."
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-9 py-2.5 text-xs focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-900 font-medium transition"
                  />
                  {studentSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setStudentSearchTerm("")}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Dropdown Select (Synced with filtered items if searching) */}
                <div className="relative">
                  <select
                    id="student-selector-dropdown"
                    required
                    value={selectedStudentId}
                    onChange={(e) => {
                      setSelectedStudentId(e.target.value);
                    }}
                    className="w-full bg-white hover:bg-slate-50 border-2 border-slate-200 focus:border-emerald-600 rounded-2xl p-3 pr-10 text-slate-900 font-bold text-sm focus:outline-none appearance-none transition cursor-pointer shadow-sm"
                  >
                    <option value="" disabled className="text-slate-400 font-normal">
                      -- Choose a Student / Contributor --
                    </option>
                    {(studentSearchTerm ? filteredStudents : students).map((s) => (
                      <option 
                        key={s.uid} 
                        value={s.uid} 
                        className="py-2 text-slate-900 font-semibold bg-white"
                      >
                        {s.name} {s.studentId ? `(ID: ${s.studentId})` : "(ID: N/A)"} {s.role === "treasurer" ? "★ [Treasurer]" : ""}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <ChevronDown className="h-5 w-5" />
                  </div>
                </div>

                {/* Quick select chips when searching */}
                {studentSearchTerm && filteredStudents.length > 0 && (
                  <div className="max-h-36 overflow-y-auto space-y-1.5 p-1 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                    {filteredStudents.map((s) => {
                      const isSelected = s.uid === selectedStudentId;
                      return (
                        <button
                          type="button"
                          key={s.uid}
                          onClick={() => {
                            setSelectedStudentId(s.uid);
                          }}
                          className={`w-full text-left p-2 rounded-xl transition flex items-center justify-between cursor-pointer ${
                            isSelected 
                              ? "bg-emerald-600 text-white shadow-sm" 
                              : "bg-white hover:bg-emerald-50 text-slate-800 border border-slate-100"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 ${
                              isSelected ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
                            }`}>
                              {s.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className={`text-xs font-bold truncate ${isSelected ? "text-white" : "text-slate-900"}`}>
                                {s.name} {s.role === "treasurer" ? "★" : ""}
                              </div>
                              <div className={`text-[10px] truncate ${isSelected ? "text-emerald-100" : "text-slate-400"}`}>
                                ID: {s.studentId || "N/A"} &bull; {s.email}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-white shrink-0 ml-1.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Selected Student Preview Card */}
                {currentSelectedStudent && (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200/90 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                        {currentSelectedStudent.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                          <span>{currentSelectedStudent.name}</span>
                          {currentSelectedStudent.role === "treasurer" && (
                            <span className="bg-emerald-200 text-emerald-900 text-[9px] font-black px-1.5 py-0.2 rounded">Treasurer</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium truncate font-mono">
                          ID: {currentSelectedStudent.studentId || "N/A"} &bull; {currentSelectedStudent.email}
                        </div>
                      </div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Amount (₱)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₱</span>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-bold"
                  value={amount || ""}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Payment Date</label>
              <input
                type="date"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-semibold"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Payment Method</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["Cash", "GCash", "Bank Transfer", "Other"] as const).map(method => (
                <button
                  type="button"
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border transition text-center ${
                    paymentMethod === method
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Reference Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reference / Receipt Number <span className="text-slate-400 lowercase italic font-normal">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. GCash Ref #, Bank TXN ID"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-semibold"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Adjustment Notes / Remarks <span className="text-slate-400 lowercase italic font-normal">{paymentToEdit ? "(required)" : "(optional)"}</span>
            </label>
            <textarea
              required={!!paymentToEdit}
              placeholder={paymentToEdit ? "Explain why this transaction was modified (for transparency log)" : "Add transaction notes..."}
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-medium resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold py-3.5 rounded-2xl transition text-sm shadow-md flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            {submitting ? "Saving Transaction..." : "Save Payment Log"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};


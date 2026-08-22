import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Member, Payment } from "../types";
import { X, Calendar, DollarSign, FileText, Check } from "lucide-react";
import { motion } from "motion/react";

interface PaymentModalProps {
  onClose: () => void;
  student?: Member; // For fresh payment for a specific student
  paymentToEdit?: Payment; // For editing/correcting an existing payment
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ onClose, student, paymentToEdit }) => {
  const { members, recordPayment, updatePayment, classroom } = useApp();
  
  // Filter members to only get students
  const students = members.filter(m => m.role === "student");
  
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "GCash" | "Bank Transfer" | "Other">("Cash");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Initializing form values
    if (paymentToEdit) {
      setSelectedStudentId(paymentToEdit.studentId);
      setAmount(paymentToEdit.amount);
      setPaymentDate(paymentToEdit.paymentDate);
      setPaymentMethod(paymentToEdit.paymentMethod);
      setReferenceNumber(paymentToEdit.referenceNumber || "");
      setNotes(paymentToEdit.notes || "");
    } else if (student) {
      setSelectedStudentId(student.uid);
      setPaymentDate(new Date().toISOString().split("T")[0]);
      
      // Pre-calculate remaining contribution if we have a classroom goal
      // Let's set default amount to 200 or remaining
      setAmount(200);
    } else {
      setPaymentDate(new Date().toISOString().split("T")[0]);
      if (students.length > 0) {
        setSelectedStudentId(students[0].uid);
      }
    }
  }, [student, paymentToEdit, students]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || amount <= 0) return;
    
    const selectedStudent = students.find(s => s.uid === selectedStudentId);
    const studentName = selectedStudent ? selectedStudent.name : "Unknown Student";

    if (paymentToEdit) {
      if (!confirm(`Are you sure you want to correct this payment to ₱${amount.toLocaleString()} for student ${studentName}? An audit log entry will register this adjustment.`)) {
        return;
      }
    } else {
      if (!confirm(`Are you sure you want to log a payment of ₱${amount.toLocaleString()} for student ${studentName}?`)) {
        return;
      }
    }

    setSubmitting(true);
    
    try {
      if (paymentToEdit) {
        // Correct/Update payment
        await updatePayment(paymentToEdit.id, paymentToEdit.amount, {
          studentId: selectedStudentId,
          studentName,
          amount,
          paymentMethod,
          referenceNumber,
          paymentDate,
          notes: notes.trim() || `Corrected transaction logs.`
        });
        alert("Payment log adjusted and updated successfully!");
      } else {
        // Create new payment
        await recordPayment({
          studentId: selectedStudentId,
          studentName,
          amount,
          paymentMethod,
          referenceNumber,
          paymentDate,
          notes
        });
        alert("Payment logged successfully!");
      }
      onClose();
    } catch (err) {
      console.error(err);
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
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden"
      >
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-lg">
              {paymentToEdit ? "Correct Contribution Payment" : "Record Contribution Payment"}
            </h3>
            <p className="text-slate-400 text-xs">
              {paymentToEdit ? "Audit trails will log the adjustment history." : "Add a student payment to the fund database."}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Student Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Student</label>
            {paymentToEdit || student ? (
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-slate-900 text-sm">
                {paymentToEdit ? paymentToEdit.studentName : student?.name}
              </div>
            ) : (
              <select
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-600 text-slate-950 font-semibold"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                <option value="">Select a student...</option>
                {students.map(s => (
                  <option key={s.uid} value={s.uid}>{s.name} (ID: {s.studentId || "N/A"})</option>
                ))}
              </select>
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-bold"
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-semibold"
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
                      ? "bg-emerald-600 border-emerald-600 text-white"
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
              Reference / Receipt Number <span className="text-slate-400 lowercase italic">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. GCash Ref #, Bank TXN ID"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-semibold"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Adjustment Notes / Remarks <span className="text-slate-400 lowercase italic">{paymentToEdit ? "(required)" : "(optional)"}</span>
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
            className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold py-3 rounded-xl transition text-sm shadow-md flex items-center justify-center gap-2 mt-4"
          >
            <Check className="h-4 w-4" />
            {submitting ? "Saving Transaction..." : "Save Payment Log"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

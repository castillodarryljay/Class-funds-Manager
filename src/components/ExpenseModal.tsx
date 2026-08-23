import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { X, Check } from "lucide-react";
import { motion } from "motion/react";
import { ReceiptImageUploader } from "./ReceiptImageUploader";

interface ExpenseModalProps {
  onClose: () => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ onClose }) => {
  const { recordExpense } = useApp();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState("Classroom");
  const [paidTo, setPaidTo] = useState("");
  const [receiptURL, setReceiptURL] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!description.trim()) {
      setFormError("Please enter a description or item name for this expense.");
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      setFormError("Please specify a valid expense amount greater than ₱0.");
      return;
    }
    if (!paidTo.trim()) {
      setFormError("Please specify who or which store/supplier this was paid to.");
      return;
    }

    setSubmitting(true);
    try {
      const ok = await recordExpense({
        description: description.trim(),
        amount,
        category,
        paidTo: paidTo.trim(),
        receiptURL: receiptURL.trim(),
        notes: notes.trim()
      });

      if (ok) {
        setSuccessMessage(`Classroom expense of ₱${amount.toLocaleString()} logged successfully!`);
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        setFormError("Could not save expense record. Please check your network and try again.");
      }
    } catch (err: any) {
      console.error("Expense submission error:", err);
      setFormError(err.message || "An unexpected error occurred while logging the expense.");
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
            <h3 className="font-extrabold text-lg">Log Classroom Expense</h3>
            <p className="text-slate-400 text-xs font-medium">Record outgoing funds to keep the balance sheet transparent.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
          
          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Description / Item</label>
            <input
              type="text"
              required
              placeholder="e.g. Whiteboard Markers, Decorations, Event Banner"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-semibold"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Amount Paid (₱)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 text-sm font-semibold">₱</span>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-4 py-1.5 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-bold"
                  value={amount || ""}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Category</label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-semibold"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Classroom">Classroom</option>
                <option value="Printing">Printing</option>
                <option value="Utilities">Utilities</option>
                <option value="Events">Events</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Paid To */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Paid To / Supplier</label>
            <input
              type="text"
              required
              placeholder="e.g. National Bookstore, Local Printer, Store Name"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-semibold"
              value={paidTo}
              onChange={(e) => setPaidTo(e.target.value)}
            />
          </div>

          {/* Zero-Storage Receipt Image Uploader & Link Generator */}
          <ReceiptImageUploader
            value={receiptURL}
            onChange={(url) => setReceiptURL(url)}
          />

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Notes <span className="text-slate-400 lowercase italic">(optional)</span>
            </label>
            <textarea
              placeholder="Add expense details..."
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
            {submitting ? "Logging Expense..." : "Save Expense Record"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

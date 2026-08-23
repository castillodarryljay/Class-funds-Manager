import React, { useState, useEffect } from "react";
import { 
  X, 
  Receipt, 
  Calendar, 
  User, 
  FileText, 
  ExternalLink, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Info,
  Maximize2,
  AlertCircle
} from "lucide-react";
import { Expense } from "../types";

interface ExpenseDetailModalProps {
  expense: Expense | null;
  enrolledStudentsCount?: number;
  onClose: () => void;
}

export const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({
  expense,
  enrolledStudentsCount = 1,
  onClose
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullScreenViewer, setIsFullScreenViewer] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Keyboard navigation for escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullScreenViewer) {
          setIsFullScreenViewer(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullScreenViewer, onClose]);

  if (!expense) return null;

  const validCount = Math.max(1, enrolledStudentsCount);
  const perStudentCost = expense.amount / validCount;

  // Category badge styling
  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "supplies":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "event":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "printing":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "refreshments":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "equipment":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const handleOpenExternal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!expense.receiptURL) return;

    if (expense.receiptURL.startsWith("data:")) {
      // Safe data URL handler without browser tab crash
      try {
        const imageWindow = window.open("", "_blank");
        if (imageWindow) {
          imageWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Receipt Preview - ${expense.description.replace(/</g, "&lt;")}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  body {
                    margin: 0;
                    padding: 24px;
                    background: #090d16;
                    color: #fff;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    font-family: system-ui, -apple-system, sans-serif;
                    box-sizing: border-box;
                  }
                  img {
                    max-width: 95vw;
                    max-height: 85vh;
                    object-fit: contain;
                    border-radius: 12px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
                    background: #fff;
                  }
                  .info {
                    margin-top: 16px;
                    font-size: 14px;
                    color: #94a3b8;
                    text-align: center;
                  }
                </style>
              </head>
              <body>
                <img src="${expense.receiptURL}" alt="Official Receipt Proof" />
                <div class="info">
                  <strong>${expense.description.replace(/</g, "&lt;")}</strong> • ₱${expense.amount.toLocaleString()} • ClassFund Manager
                </div>
              </body>
            </html>
          `);
          imageWindow.document.close();
          return;
        }
      } catch (err) {
        console.warn("Could not open data URL in new window:", err);
      }
    }

    // Standard HTTP/HTTPS link opening
    window.open(expense.receiptURL, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {/* 1. Main Expense Details Dialog */}
      <div 
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200/80 text-left my-6 transition-all"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 bg-slate-900 text-white flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30">
                  Classroom Expense
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryColor(expense.category)}`}>
                  {expense.category}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mt-1 break-words">
                {expense.description}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {new Date(expense.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </span>
                {expense.paidTo && (
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    Paid to: {expense.paidTo}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer shrink-0"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Total Amount Expended */}
              <div className="bg-red-50/70 border border-red-200/80 p-4 rounded-2xl">
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">
                  Total Disbursed
                </span>
                <span className="text-2xl font-black text-red-600 block mt-0.5">
                  ₱{expense.amount.toLocaleString()}
                </span>
                <span className="text-[10px] text-red-500 font-medium">
                  Classroom Fund Withdrawal
                </span>
              </div>

              {/* Per-Student Equal Share Deduction */}
              <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Equal Deduction Share
                </span>
                <span className="text-2xl font-black text-slate-900 block mt-0.5">
                  ₱{perStudentCost.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Per student (₱{expense.amount.toLocaleString()} &divide; {validCount} members)
                </span>
              </div>
            </div>

            {/* Equal Sharing Explainer */}
            <div className="bg-emerald-50/60 border border-emerald-100 p-3.5 rounded-2xl flex items-start gap-2.5">
              <Info className="h-4 w-4 text-emerald-700 mt-0.5 shrink-0" />
              <p className="text-xs text-emerald-900 leading-relaxed">
                <strong>Fair Share Transparency:</strong> This expense was equally deducted from all <strong>{validCount}</strong> registered students' balances (<strong>₱{perStudentCost.toFixed(2)}</strong> each).
              </p>
            </div>

            {/* Notes & Justification */}
            {expense.notes && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" /> Notes / Justification
                </span>
                <p className="text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                  {expense.notes}
                </p>
              </div>
            )}

            {/* Receipt Proof Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-950 text-sm flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-emerald-600" /> Official Receipt Proof
                </h3>
                {expense.receiptURL && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 3))}
                      className="p-1.5 text-slate-600 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs transition cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))}
                      className="p-1.5 text-slate-600 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs transition cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setRotation(prev => (prev + 90) % 360)}
                      className="p-1.5 text-slate-600 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs transition cursor-pointer"
                      title="Rotate 90°"
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFullScreenViewer(true)}
                      className="p-1.5 text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Full Screen Viewer"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenExternal}
                      className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Open in new window"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {expense.receiptURL ? (
                <div 
                  onClick={() => setIsFullScreenViewer(true)}
                  className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 min-h-[220px] max-h-[360px] flex items-center justify-center p-2 group cursor-pointer"
                  title="Click to view full screen"
                >
                  {!imageError ? (
                    <img
                      src={expense.receiptURL}
                      alt={`Receipt for ${expense.description}`}
                      onError={() => setImageError(true)}
                      className="max-h-[340px] max-w-full object-contain rounded-xl transition-transform duration-200 shadow-md"
                      style={{
                        transform: `scale(${zoomLevel}) rotate(${rotation}deg)`
                      }}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-center p-6 space-y-2 text-slate-400">
                      <AlertCircle className="h-8 w-8 text-amber-400 mx-auto" />
                      <p className="text-xs font-bold text-white">Receipt Image Link Unavailable</p>
                      <button
                        type="button"
                        onClick={handleOpenExternal}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded-lg transition"
                      >
                        Try Opening Link Directly
                      </button>
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full pointer-events-none flex items-center gap-1.5">
                    <Maximize2 className="h-3 w-3 text-emerald-400" /> Click to Expand Full Screen
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-2">
                  <Receipt className="h-8 w-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-500">No Receipt Photo Attached</p>
                  <p className="text-[10px] text-slate-400">
                    This transaction was recorded directly by the Treasurer without an image attachment.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-400 font-mono text-[10px]">
              ID: {expense.id || "EXP-RECORD"}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-xl transition cursor-pointer shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* 2. Isolated Full Screen Lightbox (Crash-Safe) */}
      {isFullScreenViewer && expense.receiptURL && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6"
          onClick={() => setIsFullScreenViewer(false)}
        >
          {/* Lightbox Toolbar Header */}
          <div 
            className="flex items-center justify-between bg-slate-900/80 border border-slate-800 text-white px-4 py-3 rounded-2xl backdrop-blur-sm max-w-4xl mx-auto w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-w-0 pr-4">
              <h4 className="text-sm font-bold text-white truncate">{expense.description}</h4>
              <p className="text-[11px] text-slate-400">₱{expense.amount.toLocaleString()} &bull; {expense.category} Proof</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 3))}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs transition cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs transition cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setRotation(prev => (prev + 90) % 360)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs transition cursor-pointer"
                title="Rotate 90°"
              >
                <RotateCw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleOpenExternal}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 rounded-xl text-xs transition cursor-pointer"
                title="Open in new window"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsFullScreenViewer(false)}
                className="p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-xl transition cursor-pointer ml-1"
                title="Close Full Screen (Esc)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Lightbox Image Stage */}
          <div 
            className="flex-1 flex items-center justify-center p-2 sm:p-6 overflow-auto max-h-[calc(100vh-140px)]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={expense.receiptURL}
              alt={`Receipt for ${expense.description}`}
              className="max-h-[82vh] max-w-[92vw] object-contain rounded-2xl shadow-2xl transition-transform duration-150 border border-slate-800 bg-white"
              style={{
                transform: `scale(${zoomLevel}) rotate(${rotation}deg)`
              }}
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Lightbox Footer Tip */}
          <div className="text-center text-slate-400 text-xs py-1">
            Press <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300">Esc</kbd> or click outside to exit full screen
          </div>
        </div>
      )}
    </>
  );
};

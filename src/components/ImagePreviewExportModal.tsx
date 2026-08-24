import React, { useState } from "react";
import { Download, Copy, Check, X, Eye, Sparkles } from "lucide-react";

interface ImagePreviewExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string | null;
  title?: string;
  fileName: string;
}

export const ImagePreviewExportModal: React.FC<ImagePreviewExportModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  title = "Statement Image Preview",
  fileName,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !imageSrc) return null;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.download = fileName.endsWith(".png") ? fileName : `${fileName}.png`;
    link.href = imageSrc;
    link.click();
  };

  const handleCopy = async () => {
    try {
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("Direct clipboard image write not supported:", err);
      // Fallback: download directly
      handleDownload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-fade-in text-left">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-950 text-base">{title}</h3>
              <p className="text-xs text-slate-500 font-medium">
                Review your uncropped, high-resolution statement image before saving.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Image Preview Area */}
        <div className="p-4 sm:p-6 overflow-y-auto overflow-x-auto flex-1 bg-slate-100 flex items-center justify-center min-h-[300px]">
          <div className="bg-white p-2 rounded-2xl shadow-md border border-slate-200/80 max-w-full">
            <img
              src={imageSrc}
              alt="Exported Statement Preview"
              className="max-w-full h-auto object-contain rounded-xl block mx-auto"
              style={{ maxHeight: "65vh" }}
            />
          </div>
        </div>

        {/* Actions Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="text-xs text-slate-400 font-mono">
            Format: High-Res PNG &bull; Scale: 2x
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Image</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md shadow-emerald-600/10 transition flex items-center gap-2 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Image</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

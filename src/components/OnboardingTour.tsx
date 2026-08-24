import React, { useState } from "react";
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  Shield, 
  Users, 
  Receipt, 
  FileText, 
  Sparkles,
  QrCode,
  Download,
  DollarSign,
  ArrowDownToLine,
  Camera
} from "lucide-react";
import { UserRole } from "../types";
import { AppLogo } from "./AppLogo";

interface OnboardingTourProps {
  role: UserRole;
  userName: string;
  onComplete: () => void;
}

interface Step {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  tip: string;
  badge: string;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ role, userName, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const treasurerSteps: Step[] = [
    {
      title: `Welcome to ClassFund, ${userName}!`,
      subtitle: "Official Treasurer Onboarding",
      description: "ClassFund Manager provides you with an enterprise-grade financial ledger to record student collections, distribute classroom expenses equally, and generate tamper-proof audit trails.",
      icon: <Sparkles className="h-8 w-8 text-emerald-600" />,
      tip: "All classroom entries are backed in real-time by Firebase Firestore cloud database.",
      badge: "Step 1: Workspace Overview"
    },
    {
      title: "Enroll Students & Share QR Codes",
      subtitle: "Effortless Class Distribution",
      description: "Define semester targets (e.g., ₱100/student). Distribute your 6-character Invite Code, direct Web Link, or generate high-res QR Codes for instant student join requests.",
      icon: <QrCode className="h-8 w-8 text-emerald-600" />,
      tip: "Students sign in seamlessly via Google authentication with zero friction.",
      badge: "Step 2: Student Enrollment"
    },
    {
      title: "Log Expenses with Photo Receipts",
      subtitle: "Zero-Storage Image Compression",
      description: "Record classroom purchases (supplies, events, printing). Snap photos directly using your camera or select from your gallery. Every expense is automatically divided equally among all students.",
      icon: <Receipt className="h-8 w-8 text-emerald-600" />,
      tip: "Images undergo in-browser compression to ensure zero permanent web storage overhead.",
      badge: "Step 3: Expenses & Receipts"
    },
    {
      title: "Manage Cashouts & Export Reports",
      subtitle: "Clearance-Ready Statements",
      description: "Review student cashout requests for overpayments. Export beautiful financial statements and digital receipts ready for department sign-offs and semester clearances.",
      icon: <Download className="h-8 w-8 text-emerald-600" />,
      tip: "You can download PNG statements and copy audit summaries with a single click.",
      badge: "Step 4: Claims & Reports"
    }
  ];

  const studentSteps: Step[] = [
    {
      title: `Welcome to ClassFund, ${userName}!`,
      subtitle: "Student Member Portal",
      description: "Track your contributions, remaining balance, and equal share of classroom expenses transparently in real-time without paper guesswork.",
      icon: <Sparkles className="h-8 w-8 text-emerald-600" />,
      tip: "Enjoy 100% financial transparency into all classroom collections and expenditures.",
      badge: "Step 1: Student Portal"
    },
    {
      title: "Inspect Equal-Share Expenses & Receipts",
      subtitle: "Full Receipt Transparency",
      description: "View every single item purchased by the classroom. Click any expense to inspect official receipt photos with full-screen zoom, rotation, and per-student share math.",
      icon: <Receipt className="h-8 w-8 text-emerald-600" />,
      tip: "Classroom purchases are divided equally so every student pays their fair share.",
      badge: "Step 2: Receipt Inspection"
    },
    {
      title: "Digital Receipts & Cashout Claims",
      subtitle: "Official Proof & Overpayment Refunds",
      description: "Download image receipts for your verified payments. If you overpaid or have surplus funds, submit a Cashout Claim directly to your Treasurer.",
      icon: <ArrowDownToLine className="h-8 w-8 text-emerald-600" />,
      tip: "Your transaction history is permanent and accessible anytime for school clearances.",
      badge: "Step 3: Receipts & Cashouts"
    }
  ];

  const steps = role === "treasurer" ? treasurerSteps : studentSteps;
  const current = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Progress bar */}
        <div className="w-full bg-slate-100 h-1.5 flex">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-full flex-1 transition-all duration-300 ${
                idx <= currentStep ? "bg-emerald-500" : "bg-slate-100"
              }`}
            />
          ))}
        </div>

        {/* Modal Header */}
        <div className="p-6 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-full border border-emerald-100 uppercase tracking-wide">
              {current.badge}
            </span>
          </div>
          <button
            onClick={onComplete}
            className="text-xs font-semibold text-slate-400 hover:text-slate-700 p-1 transition cursor-pointer"
          >
            Skip Walkthrough
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-6 pt-2 space-y-5 text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl shrink-0 flex items-center justify-center text-emerald-600 shadow-2xs">
            {current.icon}
          </div>

          <div className="space-y-2 flex-1">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {current.subtitle}
              </span>
              <h3 className="text-xl font-extrabold text-slate-950 tracking-tight">
                {current.title}
              </h3>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed">
              {current.description}
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-xs text-slate-500 font-medium leading-normal">
              💡 <span className="text-slate-700 font-bold">Pro Tip:</span> {current.tip}
            </div>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="p-6 pt-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/70 rounded-xl transition flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
            ) : (
              <span className="text-xs font-semibold text-slate-400 pl-1">
                {currentStep + 1} of {steps.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/10 transition flex items-center gap-1.5 cursor-pointer"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <CheckCircle className="h-4 w-4" /> Get Started
                </>
              ) : (
                <>
                  <span>Next Step</span> <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

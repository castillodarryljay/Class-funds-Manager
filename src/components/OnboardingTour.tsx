import React, { useState } from "react";
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  Shield, 
  Users, 
  PlusCircle, 
  FileText, 
  Sparkles,
  QrCode,
  Download,
  DollarSign
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
      description: "ClassFund Manager gives you full financial control over classroom fees, real-time student collections, expense tracking, and tamper-proof audit trails.",
      icon: <Sparkles className="h-8 w-8 text-emerald-600" />,
      tip: "Everything is synchronized live with Firebase Firestore for complete cloud persistence.",
      badge: "Step 1: Workspace Overview"
    },
    {
      title: "Create & Share Classrooms",
      subtitle: "Effortless Member Management",
      description: "Setup your classroom with custom target fees (e.g. ₱50/month). Share your 6-character Invite Code, direct Web Link, or generate high-res QR Codes for instant student joins.",
      icon: <QrCode className="h-8 w-8 text-emerald-600" />,
      tip: "Students can join in seconds using Google authentication without entering passwords.",
      badge: "Step 2: Class Distribution"
    },
    {
      title: "Record Payments & Expenses",
      subtitle: "Instant Ledgers & Balance Math",
      description: "Log Cash, GCash, or Bank Transfer payments. Log classroom expenditures with notes to automatically maintain an accurate running total and student balance breakdown.",
      icon: <DollarSign className="h-8 w-8 text-emerald-600" />,
      tip: "Audit logs are written immediately for complete accountability.",
      badge: "Step 3: Financial Records"
    },
    {
      title: "Export Receipts & Financial Statements",
      subtitle: "Professional Clearance-Ready Reports",
      description: "Generate beautiful image-based digital receipts for students and export comprehensive Financial Breakdown Reports ready for university or school department clearance.",
      icon: <Download className="h-8 w-8 text-emerald-600" />,
      tip: "You can download PNG statements and copy audit summaries with one click.",
      badge: "Step 4: Clearance & Reports"
    }
  ];

  const studentSteps: Step[] = [
    {
      title: `Welcome to ClassFund, ${userName}!`,
      subtitle: "Student Member Portal",
      description: "Track your contributions, remaining semester balances, and verified payment history transparently without relying on paper notebooks.",
      icon: <Sparkles className="h-8 w-8 text-emerald-600" />,
      tip: "Enjoy 100% financial transparency into where your class funds are being spent.",
      badge: "Step 1: Student Portal"
    },
    {
      title: "Real-Time Payment Tracking",
      subtitle: "Never Lose Track of Dues",
      description: "Whenever your Treasurer records a payment, your personal balance progress bar updates immediately. Verify dates, payment methods, and reference numbers.",
      icon: <FileText className="h-8 w-8 text-emerald-600" />,
      tip: "Check classroom announcements and expenditure logs to see how funds are used.",
      badge: "Step 2: Balance Breakdown"
    },
    {
      title: "Download Digital Receipts",
      subtitle: "Instant Proof of Payment",
      description: "View and save high-resolution digital receipts for your records, parent submission, or student organization clearance.",
      icon: <Download className="h-8 w-8 text-emerald-600" />,
      tip: "You can download, screenshot, or verify your receipts at any time.",
      badge: "Step 3: Receipts & Clearance"
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
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
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
            className="text-xs font-semibold text-slate-400 hover:text-slate-700 p-1 transition"
          >
            Skip Tutorial
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-6 pt-2 space-y-5 text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl shrink-0 flex items-center justify-center">
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
        <div className="p-6 pt-2 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {currentStep > 0 ? (
              <button
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
              onClick={handleNext}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/10 transition flex items-center gap-1.5 cursor-pointer"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <CheckCircle className="h-4 w-4" /> Get Started
                </>
              ) : (
                <>
                  Next <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

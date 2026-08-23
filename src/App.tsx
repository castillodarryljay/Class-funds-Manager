import React, { useState, useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { LandingPage } from "./components/LandingPage";
import { ClassroomCreate } from "./components/ClassroomCreate";
import { JoinClassroom } from "./components/JoinClassroom";
import { TreasurerDashboard } from "./components/TreasurerDashboard";
import { StudentDashboard } from "./components/StudentDashboard";
import { StudentPendingApproval } from "./components/StudentPendingApproval";
import { AppLogo } from "./components/AppLogo";
import { UserRole } from "./types";
import { ArrowRight, ShieldCheck, LogOut, PlusCircle, CheckCircle, HelpCircle, Mail } from "lucide-react";

function AppContent() {
  const { 
    user, 
    classroom, 
    classrooms, 
    pendingJoinRequest,
    loading, 
    signOutUser, 
    requestJoinClassroom, 
    error, 
    setError 
  } = useApp();
  
  // Custom navigation/routing state
  const [urlJoinCode, setUrlJoinCode] = useState<string | null>(null);
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [manualJoinCode, setManualJoinCode] = useState("");
  const [studentIdInput, setStudentIdInput] = useState("");
  const [programInput, setProgramInput] = useState("");
  const [sectionInput, setSectionInput] = useState("");
  const [showFullRegistration, setShowFullRegistration] = useState(false);
  const [joiningManual, setJoiningManual] = useState(false);

  // Parse URL parameters for invitation links
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const join = urlParams.get("join") || urlParams.get("invite") || urlParams.get("code") || urlParams.get("class");
    if (join && join.trim()) {
      setUrlJoinCode(join.trim());
    } else if (window.location.hash) {
      const hashClean = window.location.hash.replace(/^#\/?/, "");
      if (hashClean.startsWith("join=") || hashClean.startsWith("code=") || hashClean.startsWith("invite=")) {
        const hashParams = new URLSearchParams(hashClean);
        const hashJoin = hashParams.get("join") || hashParams.get("invite") || hashParams.get("code");
        if (hashJoin && hashJoin.trim()) {
          setUrlJoinCode(hashJoin.trim());
        }
      }
    }
  }, []);

  const handleJoinedUrlClass = () => {
    // Clear URL parameter once joined so reload doesn't re-trigger registration
    window.history.replaceState({}, document.title, window.location.pathname);
    setUrlJoinCode(null);
  };

  const handleManualJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualJoinCode.trim() || !user) return;
    setJoiningManual(true);
    setError(null);
    try {
      const result = await requestJoinClassroom(manualJoinCode.trim(), {
        studentId: studentIdInput.trim() || user.studentId || `S-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        program: programInput.trim() || user.program || "General Program",
        yearLevel: user.yearLevel || "2nd Year",
        section: sectionInput.trim() || user.section || "A"
      });
      if (result.success) {
        setManualJoinCode("");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to submit request.");
    } finally {
      setJoiningManual(false);
    }
  };

  // 1. LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="animate-bounce mb-4">
          <AppLogo size="xl" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-950 tracking-tight">Accessing Class Funds</h2>
          <p className="text-slate-400 text-sm font-semibold">Connecting to secure cloud databases...</p>
        </div>
      </div>
    );
  }

  // 2. INVITATION REDIRECT (URL JOIN FLOW)
  if (urlJoinCode) {
    return (
      <JoinClassroom 
        inviteCode={urlJoinCode} 
        onJoined={handleJoinedUrlClass} 
      />
    );
  }

  // 3. LANDING PAGE FOR UNAUTHENTICATED USERS
  if (!user) {
    return <LandingPage />;
  }

  // 4. ROLE ROUTING AND HOME VIEW (Determined automatically from landing page selection)
  const activeRole: UserRole = user.role || (localStorage.getItem("preferred_login_role") as UserRole) || "treasurer";

  if (activeRole === "treasurer") {
    
    // Create classroom form toggle
    if (isCreatingClass) {
      return (
        <ClassroomCreate 
          onBack={() => setIsCreatingClass(false)} 
          onCreated={() => setIsCreatingClass(false)} 
        />
      );
    }

    // If Treasurer has no classrooms yet, prompt them to create one
    if (classrooms.length === 0) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-6" id="treasurer-empty-workspace">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 text-center space-y-6">
            <div className="flex justify-center">
              <AppLogo size="lg" />
            </div>
            
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Authorization Success</span>
              <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">Welcome, {user.name}!</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                You are registered as an official Treasurer. Next, create a secure classroom fund workspace to generate invite links.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => setIsCreatingClass(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2"
              >
                <PlusCircle className="h-5 w-5" /> Create Classroom Workspace
              </button>
              
              <button
                onClick={signOutUser}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 px-4 rounded-xl text-xs transition"
              >
                Logout Account
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                Powered by <span className="font-semibold text-slate-600">ClassFund Manager</span> &bull; Designed by <span className="font-semibold text-slate-600">Darryl jay Castillo (SHIRO)</span>
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Active Dashboard
    return <TreasurerDashboard onCreateClassroom={() => setIsCreatingClass(true)} />;
  }

  // Student Routing
  if (user.role === "student") {
    
    // If Student is in an active classroom, show student portal
    if (classroom) {
      return <StudentDashboard />;
    }

    // If Student has an active pending or rejected join request, show approval status tracker
    if (pendingJoinRequest && pendingJoinRequest.status !== "approved") {
      return <StudentPendingApproval />;
    }

    // Student is logged in but hasn't joined a class
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6" id="student-join-required-view">
        <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 space-y-6 text-left">
          <div className="text-center space-y-2">
            <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-2xl w-fit mx-auto border border-emerald-100">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-950 tracking-tight">Join Your Classroom</h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Enter the unique invite code provided by your Treasurer to request registration.
            </p>
          </div>

          {/* Google Account Verified Info */}
          <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="truncate">
                <div className="font-bold text-slate-900 truncate">{user.name}</div>
                <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" /> {user.email}
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded shrink-0">
              Verified
            </span>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-xs p-3 rounded-xl font-semibold">
              {error}
            </div>
          )}

          {/* Manual Code Form */}
          <form onSubmit={handleManualJoin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Class Invite Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. BSIT2A-7F29"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-black tracking-widest uppercase text-center"
                value={manualJoinCode}
                onChange={(e) => setManualJoinCode(e.target.value)}
              />
            </div>

            {/* Optional expand for custom student info */}
            {!showFullRegistration ? (
              <button
                type="button"
                onClick={() => setShowFullRegistration(true)}
                className="text-xs text-emerald-600 font-bold hover:underline block text-center w-full"
              >
                + Add Student ID &amp; Section details (Recommended)
              </button>
            ) : (
              <div className="space-y-3 pt-1 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Student ID Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2026-10523"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-semibold"
                    value={studentIdInput}
                    onChange={(e) => setStudentIdInput(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Program
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BSIT"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-semibold"
                      value={programInput}
                      onChange={(e) => setProgramInput(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Section
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2A"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-semibold"
                      value={sectionInput}
                      onChange={(e) => setSectionInput(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-amber-50/70 border border-amber-200/50 p-2.5 rounded-xl text-[11px] text-amber-900 leading-relaxed font-medium">
              🛡️ <strong>Note:</strong> Registration requests require review and acceptance by your Classroom Treasurer before gaining dashboard access.
            </div>

            <button
              type="submit"
              disabled={joiningManual}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2"
            >
              <ArrowRight className="h-5 w-5" />
              {joiningManual ? "Submitting Request..." : "Request to Join Classroom"}
            </button>
          </form>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-3 text-slate-400 text-[10px] font-bold uppercase tracking-wider">Or</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <div className="space-y-3.5">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 flex gap-2.5 text-xs">
              <HelpCircle className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-slate-500 leading-relaxed font-semibold">
                Don&apos;t have a code? Ask your Treasurer for the direct classroom invite link.
              </p>
            </div>

            <button
              onClick={signOutUser}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout Account
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 font-medium tracking-wide">
              Powered by <span className="font-semibold text-slate-600">ClassFund Manager</span> &bull; Designed by <span className="font-semibold text-slate-600">Darryl jay Castillo (SHIRO)</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <button onClick={signOutUser} className="bg-slate-950 text-white font-bold py-2 px-4 rounded-xl">Logout</button>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}


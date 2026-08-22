import React, { useState, useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { LandingPage } from "./components/LandingPage";
import { ProfileForm } from "./components/ProfileForm";
import { ClassroomCreate } from "./components/ClassroomCreate";
import { JoinClassroom } from "./components/JoinClassroom";
import { TreasurerDashboard } from "./components/TreasurerDashboard";
import { StudentDashboard } from "./components/StudentDashboard";
import { UserRole } from "./types";
import { Landmark, ArrowRight, ShieldCheck, LogOut, PlusCircle, CheckCircle, HelpCircle } from "lucide-react";

function AppContent() {
  const { user, classroom, classrooms, loading, signOutUser, joinClassroomByCode, error, setError } = useApp();
  
  // Custom navigation/routing state
  const [urlJoinCode, setUrlJoinCode] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [manualJoinCode, setManualJoinCode] = useState("");
  const [joiningManual, setJoiningManual] = useState(false);

  // Parse URL parameters for invitation links
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const join = urlParams.get("join");
    if (join) {
      setUrlJoinCode(join);
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
    try {
      const success = await joinClassroomByCode(manualJoinCode.trim(), {
        studentId: user.studentId || `S-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        program: user.program || "General Program",
        yearLevel: user.yearLevel || "2nd Year",
        section: user.section || "A"
      });
      if (success) {
        setManualJoinCode("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setJoiningManual(false);
    }
  };

  // 1. LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-full w-fit mx-auto border border-emerald-100/50 animate-bounce">
          <Landmark className="h-8 w-8" />
        </div>
        <div className="space-y-2 mt-4">
          <h2 className="text-xl font-black text-slate-950 tracking-tight">Accessing Class Funds</h2>
          <p className="text-slate-400 text-sm font-semibold">Loading secure blockchain transaction databases...</p>
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

  // 4. DIRECT PROFILE FORM STEP (BYPASS ROLE SELECTION VIEW)
  // If the profile does not have a set role yet, directly use their landing page selection.
  if (!user.role) {
    const landingRole = (localStorage.getItem("preferred_login_role") as UserRole) || "treasurer";
    return (
      <ProfileForm 
        role={landingRole} 
        onProfileCreated={() => {
          // Clear routing states
          setSelectedRole(null);
        }} 
      />
    );
  }

  // 5. ROLE ROUTING AND HOME VIEW
  if (user.role === "treasurer") {
    
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
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-full w-fit mx-auto border border-emerald-100">
              <Landmark className="h-8 w-8" />
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
          </div>
        </div>
      );
    }

    // Active Dashboard
    return <TreasurerDashboard onCreateClassroom={() => setIsCreatingClass(true)} />;
  }

  // Student Routing
  if (user.role === "student") {
    
    // If Student is in a classroom, show student portal
    if (classroom) {
      return <StudentDashboard />;
    }

    // Student is logged in but hasn't joined a class (and didn't use a direct invite link)
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-6" id="student-join-required-view">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 space-y-6 text-left">
          <div className="text-center space-y-2">
            <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-2xl w-fit mx-auto border border-emerald-100">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">Join Your Classroom</h2>
            <p className="text-slate-500 text-sm">Welcome, student! Please enter the unique class invite code shared by your Treasurer.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-xs p-3 rounded-xl font-semibold">
              {error}
            </div>
          )}

          {/* Manual Code Form */}
          <form onSubmit={handleManualJoin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Class Invite Code</label>
              <input
                type="text"
                required
                placeholder="e.g. BSIT2A-7F29"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-black tracking-widest uppercase text-center"
                value={manualJoinCode}
                onChange={(e) => setManualJoinCode(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={joiningManual}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-md flex items-center justify-center gap-2"
            >
              <ArrowRight className="h-5 w-5" />
              {joiningManual ? "Verifying Code..." : "Enter Workspace"}
            </button>
          </form>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-3 text-slate-400 text-[10px] font-bold uppercase">Or</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <div className="space-y-3.5">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 flex gap-2.5 text-xs">
              <HelpCircle className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-slate-500 leading-relaxed font-semibold">
                Don&apos;t have a code? Ask your Treasurer to send you the direct invitation web link or present their class QR Code for you to scan.
              </p>
            </div>

            <button
              onClick={signOutUser}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 px-4 rounded-xl text-xs transition"
            >
              Logout Account
            </button>
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

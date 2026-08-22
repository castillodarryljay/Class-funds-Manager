import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Landmark, Sparkles, User, GraduationCap, CheckCircle } from "lucide-react";
import { Classroom } from "../types";

interface JoinClassroomProps {
  inviteCode: string;
  onJoined: () => void;
}

export const JoinClassroom: React.FC<JoinClassroomProps> = ({ inviteCode, onJoined }) => {
  const { user, joinClassroomByCode, error, setError, signInGoogle, loginSandboxUser } = useApp();
  const [classroomInfo, setClassroomInfo] = useState<Classroom | null>(null);
  const [treasurerName, setTreasurerName] = useState("The Classroom Treasurer");
  const [loadingClass, setLoadingClass] = useState(true);
  
  // Student registration fields
  const [studentId, setStudentId] = useState("");
  const [program, setProgram] = useState("");
  const [yearLevel, setYearLevel] = useState("2nd Year");
  const [section, setSection] = useState("");
  const [joining, setJoining] = useState(false);

  // Look up classroom metadata from invite code
  useEffect(() => {
    const lookupClass = async () => {
      try {
        const cleanCode = inviteCode.trim().toUpperCase();
        const q = query(
          collection(db, "classrooms"), 
          where("inviteCode", "==", cleanCode),
          where("inviteStatus", "==", "active")
        );
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const cls = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as Classroom;
          setClassroomInfo(cls);
          
          // Get Treasurer name
          const treasurerDoc = await getDocs(query(collection(db, "users"), where("uid", "==", cls.treasurerId)));
          if (!treasurerDoc.empty) {
            setTreasurerName(treasurerDoc.docs[0].data().name);
          }
        } else {
          setError("This invitation link is invalid or has been deactivated by the Treasurer.");
        }
      } catch (err: any) {
        console.error("Lookup class error:", err);
        setError("Failed to fetch invitation details.");
      } finally {
        setLoadingClass(false);
      }
    };

    lookupClass();
  }, [inviteCode]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || !program.trim() || !section.trim()) {
      setError("Please fill out all student registration fields.");
      return;
    }
    setJoining(true);
    try {
      const studentProfile = {
        studentId,
        program,
        yearLevel,
        section
      };
      const success = await joinClassroomByCode(inviteCode, studentProfile);
      if (success) {
        onJoined();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setJoining(false);
    }
  };

  const handleSandboxJoin = async () => {
    try {
      // Create a student demo account instantly and trigger joining
      await loginSandboxUser("student", "Juan Dela Cruz");
    } catch (err) {
      console.error(err);
    }
  };

  if (loadingClass) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-slate-500 text-sm font-semibold">Retrieving classroom invite details...</p>
        </div>
      </div>
    );
  }

  if (!classroomInfo) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-6">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 text-center space-y-4">
          <div className="text-red-500 text-4xl font-extrabold">⚠️</div>
          <h2 className="text-xl font-extrabold text-slate-950">Invalid Invitation Link</h2>
          <p className="text-slate-500 text-sm leading-relaxed">{error || "This class code does not exist or invitations have expired."}</p>
          <a href="/" className="inline-block bg-slate-950 hover:bg-slate-900 text-white font-semibold py-2.5 px-6 rounded-xl transition text-sm">
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-6" id="join-classroom-view">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
        
        {/* Invitation Banner */}
        <div className="bg-slate-900 text-white p-8 text-center space-y-3 relative">
          <div className="absolute top-4 right-4 bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
            Invite Link
          </div>
          <div className="bg-emerald-500/20 text-emerald-400 p-2.5 rounded-2xl w-fit mx-auto border border-emerald-500/30">
            <Landmark className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">You&apos;ve been invited!</span>
            <h2 className="text-2xl font-extrabold tracking-tight text-white">{classroomInfo.name}</h2>
            <p className="text-slate-300 text-xs">{classroomInfo.school} &bull; SY {classroomInfo.schoolYear}</p>
          </div>
          <p className="text-xs text-slate-400 italic pt-2">Invited by: <span className="text-emerald-400 font-semibold">{treasurerName}</span></p>
        </div>

        {/* Action Form / Sign In */}
        <div className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-xs p-3 rounded-xl font-medium">
              {error}
            </div>
          )}

          {!user ? (
            /* Step 1: Sign-In */
            <div className="space-y-4 text-center">
              <p className="text-slate-500 text-sm leading-normal">To join this classroom workspace, please authenticate your profile securely.</p>
              <button
                onClick={signInGoogle}
                className="w-full bg-slate-950 hover:bg-slate-900 text-white font-semibold py-3 px-6 rounded-xl transition flex items-center justify-center gap-3 shadow-md"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Continue with Google
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-slate-400 text-[10px] font-bold uppercase tracking-wider">Or</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <button
                onClick={handleSandboxJoin}
                className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold py-2 px-4 rounded-xl transition border border-emerald-100"
              >
                Instant Sandbox Join (Testing Student Profile)
              </button>
            </div>
          ) : (
            /* Step 2: Fill Student Profile to Join */
            <form onSubmit={handleJoin} className="space-y-4">
              <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-xl flex items-center gap-2 border border-emerald-100">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Authenticated as <span className="font-bold">{user.name}</span>. Complete your student profile below to join.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Student ID Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026-10523"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-semibold"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Program / Course</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BSIT"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-semibold"
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Section</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-semibold"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Year Level</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-semibold"
                  value={yearLevel}
                  onChange={(e) => setYearLevel(e.target.value)}
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="5th Year">5th Year</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={joining}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-md"
              >
                {joining ? "Joining Classroom..." : "Create Profile & Join"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

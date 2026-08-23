import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { db } from "../firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { Sparkles, User, GraduationCap, CheckCircle, ShieldCheck, Mail, AlertCircle, ArrowRight } from "lucide-react";
import { AppLogo } from "./AppLogo";
import { Classroom } from "../types";
import { StudentPendingApproval } from "./StudentPendingApproval";

interface JoinClassroomProps {
  inviteCode: string;
  onJoined: () => void;
}

export const JoinClassroom: React.FC<JoinClassroomProps> = ({ inviteCode, onJoined }) => {
  const { user, requestJoinClassroom, pendingJoinRequest, error, setError, signInGoogle } = useApp();
  const [classroomInfo, setClassroomInfo] = useState<Classroom | null>(null);
  const [treasurerName, setTreasurerName] = useState("The Classroom Treasurer");
  const [loadingClass, setLoadingClass] = useState(true);
  
  // Student registration fields
  const [studentId, setStudentId] = useState(user?.studentId || "");
  const [program, setProgram] = useState(user?.program || "");
  const [yearLevel, setYearLevel] = useState(user?.yearLevel || "2nd Year");
  const [section, setSection] = useState(user?.section || "");
  const [contact, setContact] = useState(user?.contact || "");
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Look up classroom metadata from invite code
  useEffect(() => {
    let isMounted = true;
    const lookupClass = async () => {
      setError(null);
      setLoadingClass(true);
      try {
        const rawCode = inviteCode.trim();
        const cleanCode = rawCode.toUpperCase();
        
        let foundDoc: any = null;

        // 1. First attempt: query by uppercase inviteCode
        const q1 = query(
          collection(db, "classrooms"), 
          where("inviteCode", "==", cleanCode)
        );
        const snap1 = await getDocs(q1);
        if (!snap1.empty) {
          foundDoc = snap1.docs[0];
        }

        // 2. Second attempt: query by raw inviteCode
        if (!foundDoc && rawCode !== cleanCode) {
          const q2 = query(
            collection(db, "classrooms"), 
            where("inviteCode", "==", rawCode)
          );
          const snap2 = await getDocs(q2);
          if (!snap2.empty) {
            foundDoc = snap2.docs[0];
          }
        }

        // 3. Third attempt: check if rawCode is the classroom document ID
        if (!foundDoc) {
          try {
            const docRef = doc(db, "classrooms", rawCode);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              foundDoc = docSnap;
            }
          } catch (e) {
            // Ignore error if not valid doc ID
          }
        }

        // 4. Fourth attempt: fallback scan in case of legacy formatting
        if (!foundDoc) {
          const allSnap = await getDocs(collection(db, "classrooms"));
          for (const d of allSnap.docs) {
            const data = d.data();
            if (
              (data.inviteCode && data.inviteCode.toString().trim().toUpperCase() === cleanCode) ||
              d.id.toUpperCase() === cleanCode
            ) {
              foundDoc = d;
              break;
            }
          }
        }
        
        if (foundDoc && isMounted) {
          const cls = { id: foundDoc.id, ...foundDoc.data() } as Classroom;
          setClassroomInfo(cls);
          
          // Pre-populate program/section/year from classroom if available
          if (cls.program && !program) setProgram(cls.program);
          if (cls.section && !section) setSection(cls.section);
          if (cls.yearLevel && !yearLevel) setYearLevel(cls.yearLevel);

          // Get Treasurer name safely
          if (cls.treasurerId) {
            try {
              const treasurerSnap = await getDoc(doc(db, "users", cls.treasurerId));
              if (treasurerSnap.exists() && treasurerSnap.data()?.name) {
                setTreasurerName(treasurerSnap.data().name);
              }
            } catch (e) {
              console.warn("Could not load treasurer name:", e);
            }
          }
        } else if (isMounted) {
          setError("This invitation link is invalid or has been deactivated by the Treasurer.");
        }
      } catch (err: any) {
        console.error("Lookup class error:", err);
        if (isMounted) {
          setError("Failed to fetch invitation details: " + (err.message || "Please check connection."));
        }
      } finally {
        if (isMounted) {
          setLoadingClass(false);
        }
      }
    };

    lookupClass();
    return () => {
      isMounted = false;
    };
  }, [inviteCode]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || !program.trim() || !section.trim()) {
      setError("Please fill out all required student registration fields.");
      return;
    }
    setSubmitting(true);
    try {
      const studentProfile = {
        name: user?.name,
        studentId: studentId.trim(),
        program: program.trim(),
        yearLevel,
        section: section.trim(),
        contact: contact.trim()
      };
      const result = await requestJoinClassroom(inviteCode, studentProfile);
      if (result.success) {
        if (result.status === "approved") {
          onJoined();
        } else {
          setSubmittedSuccess(true);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to submit registration request.");
    } finally {
      setSubmitting(false);
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

  if (pendingJoinRequest || submittedSuccess) {
    return <StudentPendingApproval />;
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6" id="join-classroom-view">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
        
        {/* Invitation Banner */}
        <div className="bg-slate-900 text-white p-8 text-center space-y-3 relative">
          <div className="absolute top-4 right-4 bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
            Invite Link
          </div>
          <div className="flex justify-center mb-1">
            <AppLogo size="lg" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Classroom Invitation</span>
            <h2 className="text-2xl font-black tracking-tight text-white">{classroomInfo.name}</h2>
            <p className="text-slate-300 text-xs font-medium">{classroomInfo.school} &bull; SY {classroomInfo.schoolYear}</p>
          </div>
          <p className="text-xs text-slate-400 italic pt-2">Managed by: <span className="text-emerald-400 font-semibold">{treasurerName}</span></p>
        </div>

        {/* Action Form / Sign In */}
        <div className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-xs p-3.5 rounded-2xl font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {!user ? (
            /* Step 1: Sign-In */
            <div className="space-y-4 text-center">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl text-left space-y-1">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-blue-600" /> Google Verified Registration
                </span>
                <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                  Your registered Google email will be automatically verified and presented to the Treasurer for enrollment review.
                </p>
              </div>

              <p className="text-slate-500 text-sm leading-normal">
                To request registration in this classroom, please authenticate your account.
              </p>

              <button
                onClick={() => signInGoogle("student")}
                className="w-full bg-slate-950 hover:bg-slate-900 text-white font-semibold py-3.5 px-6 rounded-xl transition flex items-center justify-center gap-3 shadow-md"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Continue with Google
              </button>
            </div>
          ) : (
            /* Step 2: Fill Student Profile for Treasurer Approval */
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              
              {/* Account Email Details (Treasurer Visibility Notice) */}
              <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-slate-400" /> Registered Email
                  </span>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Google Verified
                  </span>
                </div>
                <div className="text-sm font-black text-slate-900 break-all">
                  {user.email || "No email detected"}
                </div>
                <p className="text-[10px] text-slate-500">
                  This official email will be displayed to Treasurer <strong className="text-slate-800">{treasurerName}</strong> for approval.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Student ID Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026-10523"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-semibold"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Course / Program *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BSIT"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-semibold"
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Section *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2A"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-semibold"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Contact No. (Opt)</label>
                  <input
                    type="tel"
                    placeholder="e.g. 09123456789"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-semibold"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-amber-50/70 border border-amber-200/60 p-3 rounded-xl text-[11px] text-amber-900 leading-relaxed font-medium">
                🛡️ <strong>Approval Requirement:</strong> Submitting will send a join request to the Treasurer. You will be granted access immediately upon their approval.
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2"
              >
                {submitting ? "Submitting Request..." : "Submit Join Request"}
                {!submitting && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 font-medium tracking-wide">
            Powered by <span className="font-semibold text-slate-600">ClassFund Manager</span> &bull; Designed by <span className="font-semibold text-slate-600">Darryl jay Castillo (SHIRO)</span>
          </p>
        </div>
      </div>
    </div>
  );
};


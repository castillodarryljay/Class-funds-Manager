import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  onSnapshot, 
  orderBy, 
  limit, 
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { db, auth, googleProvider } from "../firebase";
import { UserProfile, Classroom, Member, Payment, Expense, AuditLog, UserRole, JoinRequest, CashoutRequest } from "../types";

interface AppContextType {
  user: UserProfile | null;
  classroom: Classroom | null;
  classrooms: Classroom[];
  members: Member[];
  payments: Payment[];
  expenses: Expense[];
  cashoutRequests: CashoutRequest[];
  auditLogs: AuditLog[];
  joinRequests: JoinRequest[];
  pendingJoinRequest: JoinRequest | null;
  loading: boolean;
  error: string | null;
  isSandbox: boolean;
  
  signInGoogle: (targetRole?: UserRole) => Promise<void>;
  signOutUser: () => Promise<void>;
  createProfile: (profile: Partial<UserProfile>) => Promise<void>;
  createClassroom: (classroomData: Partial<Classroom>) => Promise<Classroom | null>;
  joinClassroomByCode: (inviteCode: string, studentProfile: Partial<UserProfile>) => Promise<boolean>;
  requestJoinClassroom: (inviteCode: string, studentProfile: Partial<UserProfile>) => Promise<{ success: boolean; status?: "pending" | "approved" | "rejected"; classroom?: Classroom; message?: string }>;
  approveJoinRequest: (requestOrClassroomIdOrId: JoinRequest | string, optionalRequestId?: string) => Promise<boolean>;
  rejectJoinRequest: (requestOrClassroomIdOrId: JoinRequest | string, reasonOrRequestId?: string, optionalReason?: string) => Promise<boolean>;
  cancelStudentJoinRequest: () => Promise<boolean>;
  removeMember: (memberUidOrClassroomId: string, memberNameOrMemberUid?: string, optionalMemberName?: string) => Promise<boolean>;
  recordPayment: (paymentData: Partial<Payment>) => Promise<boolean>;
  updatePayment: (paymentId: string, oldAmount: number, paymentData: Partial<Payment>) => Promise<boolean>;
  recordExpense: (expenseData: Partial<Expense>) => Promise<boolean>;
  requestCashout: (cashoutData: Partial<CashoutRequest>) => Promise<boolean>;
  processCashoutRequest: (cashoutId: string, status: "approved" | "rejected" | "disbursed", notes?: string, transactionRef?: string) => Promise<boolean>;
  updateClassroomSettings: (settings: Partial<Classroom>) => Promise<void>;
  writeAuditLog: (action: string, details: string) => Promise<void>;
  loginSandboxUser: (role: UserRole, customName?: string) => Promise<void>;
  setError: (err: string | null) => void;
  selectClassroom: (classroomId: string) => void;
  deleteClassroom: (classroomId: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [cashoutRequests, setCashoutRequests] = useState<CashoutRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [pendingJoinRequest, setPendingJoinRequest] = useState<JoinRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSandbox, setIsSandbox] = useState<boolean>(false);

  // Sync auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsSandbox(false);
        try {
          const selectedLandingRole = (localStorage.getItem("preferred_login_role") as UserRole) || "treasurer";
          
          // Check if user has profile in Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const profile = userDoc.data() as UserProfile;
            
            // If profile doesn't have a role assigned yet, assign the role selected from the landing page
            if (!profile.role) {
              profile.role = selectedLandingRole;
              await setDoc(doc(db, "users", firebaseUser.uid), { role: selectedLandingRole }, { merge: true });
            }
            
            setUser(profile);
            
            // Fetch classroom if student or treasurer
            if (profile.role === "student") {
              await fetchStudentClassroom(firebaseUser.uid);
            } else if (profile.role === "treasurer") {
              await fetchTreasurerClassrooms(firebaseUser.uid);
            }
          } else {
            // No profile yet, create profile directly assigned with the role chosen on landing page
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || "New User",
              email: firebaseUser.email || "",
              photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(firebaseUser.displayName || "NU")}`,
              role: selectedLandingRole,
              createdAt: new Date().toISOString()
            };
            await setDoc(doc(db, "users", firebaseUser.uid), newProfile);
            setUser(newProfile);
            if (selectedLandingRole === "student") {
              await fetchStudentClassroom(firebaseUser.uid);
            } else {
              await fetchTreasurerClassrooms(firebaseUser.uid);
            }
          }
        } catch (err: any) {
          console.error("Error loading user profile:", err);
          setError("Failed to load user profile: " + err.message);
        }
      } else {
        setUser(null);
        setClassroom(null);
        setClassrooms([]);
        setJoinRequests([]);
        setPendingJoinRequest(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch treasurer's classrooms
  const fetchTreasurerClassrooms = async (uid: string) => {
    try {
      const q = query(collection(db, "classrooms"), where("treasurerId", "==", uid));
      const querySnapshot = await getDocs(q);
      const list: Classroom[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Classroom);
      });
      setClassrooms(list);
      
      // Select first classroom by default if none selected
      if (list.length > 0) {
        setClassroom(list[0]);
      }
    } catch (err) {
      console.error("Error fetching treasurer classrooms:", err);
    }
  };

  // Fetch student's joined classrooms or pending request
  const fetchStudentClassroom = async (uid: string) => {
    try {
      const userSnap = await getDoc(doc(db, "users", uid));
      const userData = userSnap.exists() ? (userSnap.data() as UserProfile) : null;
      const targetClassId = (userData as any)?.classroomId || localStorage.getItem(`student_classroom_${uid}`);

      const q = query(collection(db, "classrooms"));
      const querySnapshot = await getDocs(q);
      
      const activeList: Classroom[] = [];
      let pendingReq: JoinRequest | null = null;

      for (const classDoc of querySnapshot.docs) {
        const classData = { id: classDoc.id, ...classDoc.data() } as Classroom;
        
        // 1. Check active membership in classroom
        const memberSnap = await getDoc(doc(db, "classrooms", classDoc.id, "members", uid));
        if (memberSnap.exists() && (memberSnap.data().status === "active" || memberSnap.data().role === "student" || memberSnap.data().role === "treasurer")) {
          activeList.push(classData);
          continue;
        }

        // 2. Check approved join request
        const reqSnap = await getDoc(doc(db, "classrooms", classDoc.id, "joinRequests", uid));
        if (reqSnap.exists()) {
          const reqData = { id: reqSnap.id, ...reqSnap.data() } as JoinRequest;
          if (reqData.status === "approved") {
            activeList.push(classData);
          } else if (reqData.status === "pending" || reqData.status === "rejected") {
            if (!pendingReq) {
              pendingReq = reqData;
            }
          }
        }
      }

      setClassrooms(activeList);

      if (activeList.length > 0) {
        // Find preferred active class or fallback to first
        const selected = activeList.find(c => c.id === targetClassId) || activeList[0];
        setClassroom(selected);
        setPendingJoinRequest(null);
        localStorage.setItem(`student_classroom_${uid}`, selected.id);
        await setDoc(doc(db, "users", uid), { classroomId: selected.id, status: "active" }, { merge: true });
      } else if (pendingReq) {
        setClassroom(null);
        setPendingJoinRequest(pendingReq);
      } else {
        setClassroom(null);
        setPendingJoinRequest(null);
      }
    } catch (err) {
      console.error("Error fetching student classroom:", err);
    }
  };

  // Subscriptions for active classroom details (members, payments, expenses, auditLogs, joinRequests)
  useEffect(() => {
    if (!classroom) {
      setMembers([]);
      setPayments([]);
      setExpenses([]);
      setAuditLogs([]);
      setJoinRequests([]);
      return;
    }

    // 1. Subscribe to members
    const unsubscribeMembers = onSnapshot(
      collection(db, "classrooms", classroom.id, "members"),
      (snapshot) => {
        const list: Member[] = [];
        snapshot.forEach((doc) => {
          list.push({ uid: doc.id, ...doc.data() } as Member);
        });
        setMembers(list);
      },
      (err) => console.error("Members sub error:", err)
    );

    // 2. Subscribe to payments
    const unsubscribePayments = onSnapshot(
      query(collection(db, "payments"), where("classroomId", "==", classroom.id)),
      (snapshot) => {
        const list: Payment[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Payment);
        });
        list.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
        setPayments(list);
      },
      (err) => console.error("Payments sub error:", err)
    );

    // 3. Subscribe to expenses
    const unsubscribeExpenses = onSnapshot(
      query(collection(db, "expenses"), where("classroomId", "==", classroom.id)),
      (snapshot) => {
        const list: Expense[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Expense);
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setExpenses(list);
      },
      (err) => console.error("Expenses sub error:", err)
    );

    // 4. Subscribe to audit logs
    const unsubscribeLogs = onSnapshot(
      query(collection(db, "auditLogs"), where("classroomId", "==", classroom.id), orderBy("timestamp", "desc")),
      (snapshot) => {
        const list: AuditLog[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as AuditLog);
        });
        setAuditLogs(list);
      },
      (err) => console.error("AuditLogs sub error:", err)
    );

    // 5. Subscribe to joinRequests (Treasurer review queue)
    const unsubscribeJoinRequests = onSnapshot(
      collection(db, "classrooms", classroom.id, "joinRequests"),
      (snapshot) => {
        const list: JoinRequest[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as JoinRequest);
        });
        list.sort((a, b) => new Date(b.requestedAt || 0).getTime() - new Date(a.requestedAt || 0).getTime());
        setJoinRequests(list);
      },
      (err) => console.error("JoinRequests sub error:", err)
    );

    // 6. Subscribe to cashoutRequests
    const unsubscribeCashouts = onSnapshot(
      query(collection(db, "cashoutRequests"), where("classroomId", "==", classroom.id)),
      (snapshot) => {
        const list: CashoutRequest[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as CashoutRequest);
        });
        list.sort((a, b) => new Date(b.requestedAt || 0).getTime() - new Date(a.requestedAt || 0).getTime());
        setCashoutRequests(list);
      },
      (err) => console.error("CashoutRequests sub error:", err)
    );

    return () => {
      unsubscribeMembers();
      unsubscribePayments();
      unsubscribeExpenses();
      unsubscribeLogs();
      unsubscribeJoinRequests();
      unsubscribeCashouts();
    };
  }, [classroom]);

  // Real-time listener for student's pending join request status
  useEffect(() => {
    if (!user || user.role !== "student" || !pendingJoinRequest) return;

    const unsubscribeMyRequest = onSnapshot(
      doc(db, "classrooms", pendingJoinRequest.classroomId, "joinRequests", user.uid),
      async (docSnap) => {
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as JoinRequest;
          setPendingJoinRequest(data);
          
          if (data.status === "approved") {
            // Once treasurer approves, immediately fetch classroom and unlock student dashboard
            const classDoc = await getDoc(doc(db, "classrooms", data.classroomId));
            if (classDoc.exists()) {
              const activeClass = { id: classDoc.id, ...classDoc.data() } as Classroom;
              setClassroom(activeClass);
              setPendingJoinRequest(null);
              localStorage.setItem(`student_classroom_${user.uid}`, data.classroomId);
              await setDoc(doc(db, "users", user.uid), { classroomId: data.classroomId, status: "active" }, { merge: true });
            }
          }
        } else {
          // Request was cancelled or deleted
          setPendingJoinRequest(null);
        }
      },
      (err) => console.error("Student join request listener error:", err)
    );

    return () => unsubscribeMyRequest();
  }, [user, pendingJoinRequest?.classroomId]);

  // Select a classroom (for treasurers or students managing multiple classes)
  const selectClassroom = (classroomId: string) => {
    const selected = classrooms.find(c => c.id === classroomId);
    if (selected) {
      setClassroom(selected);
      if (user) {
        if (user.role === "student") {
          localStorage.setItem(`student_classroom_${user.uid}`, classroomId);
          setDoc(doc(db, "users", user.uid), { classroomId }, { merge: true }).catch((err) => {
            console.warn("Failed to persist student selected classroom:", err);
          });
        }
      }
    }
  };

  // Google Sign In
  const signInGoogle = async (targetRole?: UserRole) => {
    setLoading(true);
    setError(null);
    try {
      const assignedRole = targetRole || (localStorage.getItem("preferred_login_role") as UserRole) || "treasurer";
      localStorage.setItem("preferred_login_role", assignedRole);

      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      // Load or prepare user profile
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists()) {
        const profile = userDoc.data() as UserProfile;
        profile.role = assignedRole;
        await setDoc(doc(db, "users", firebaseUser.uid), { role: assignedRole }, { merge: true });
        
        setUser(profile);
        if (assignedRole === "student") {
          await fetchStudentClassroom(firebaseUser.uid);
        } else {
          await fetchTreasurerClassrooms(firebaseUser.uid);
        }
      } else {
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || "New User",
          email: firebaseUser.email || "",
          photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(firebaseUser.displayName || "NU")}`,
          role: assignedRole,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, "users", firebaseUser.uid), newProfile);
        setUser(newProfile);
        if (assignedRole === "student") {
          await fetchStudentClassroom(firebaseUser.uid);
        } else {
          await fetchTreasurerClassrooms(firebaseUser.uid);
        }
      }
    } catch (err: any) {
      console.error("Google login error:", err);
      setError(err.message || "Failed to authenticate with Google.");
    } finally {
      setLoading(false);
    }
  };

  // Local Sandbox / Demo login
  const loginSandboxUser = async (role: UserRole, customName?: string) => {
    setLoading(true);
    setError(null);
    setIsSandbox(true);
    try {
      const demoId = role === "treasurer" 
        ? `sandbox-treasurer-${customName?.toLowerCase().replace(/\s+/g, "-") || "darryl"}`
        : `sandbox-student-${customName?.toLowerCase().replace(/\s+/g, "-") || "juan"}`;
        
      const demoEmail = role === "treasurer"
        ? `${customName?.toLowerCase().replace(/\s+/g, "") || "darryl"}@sandbox.classfunds.app`
        : `${customName?.toLowerCase().replace(/\s+/g, "") || "juan"}@sandbox.classfunds.app`;

      const demoName = customName || (role === "treasurer" ? "Darryl Jay" : "Juan Dela Cruz");

      const profileDoc = await getDoc(doc(db, "users", demoId));
      let profile: UserProfile;

      if (profileDoc.exists()) {
        profile = profileDoc.data() as UserProfile;
      } else {
        profile = {
          uid: demoId,
          name: demoName,
          email: demoEmail,
          photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(demoName)}`,
          role: role,
          createdAt: new Date().toISOString()
        };
        
        await setDoc(doc(db, "users", demoId), profile);
      }

      setUser(profile);
      localStorage.setItem("class_funds_sandbox_user", JSON.stringify(profile));

      if (role === "student") {
        await fetchStudentClassroom(demoId);
      } else {
        await fetchTreasurerClassrooms(demoId);
      }
    } catch (err: any) {
      console.error("Sandbox login error:", err);
      setError("Sandbox login failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sign Out
  const signOutUser = async () => {
    setLoading(true);
    try {
      if (isSandbox) {
        localStorage.removeItem("class_funds_sandbox_user");
        setUser(null);
        setClassroom(null);
        setClassrooms([]);
        setJoinRequests([]);
        setPendingJoinRequest(null);
        setIsSandbox(false);
      } else {
        await firebaseSignOut(auth);
        setUser(null);
        setClassroom(null);
        setClassrooms([]);
        setJoinRequests([]);
        setPendingJoinRequest(null);
      }
    } catch (err: any) {
      setError("Sign out failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Complete User Profile
  const createProfile = async (profileData: Partial<UserProfile>) => {
    if (!user) return;
    setLoading(true);
    try {
      const updatedProfile = {
        ...user,
        ...profileData,
        createdAt: user.createdAt || new Date().toISOString()
      } as UserProfile;

      const finalProfile = Object.fromEntries(
        Object.entries(updatedProfile).filter(([_, v]) => v !== undefined)
      ) as UserProfile;

      await setDoc(doc(db, "users", user.uid), finalProfile);
      setUser(finalProfile);

      if (finalProfile.role === "treasurer") {
        await fetchTreasurerClassrooms(finalProfile.uid);
      } else {
        await fetchStudentClassroom(finalProfile.uid);
      }
    } catch (err: any) {
      console.error("Create profile error:", err);
      setError("Failed to create profile: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create Classroom (Treasurer)
  const createClassroom = async (classroomData: Partial<Classroom>) => {
    if (!user || user.role !== "treasurer") return null;
    try {
      const inviteCode = (classroomData.name || "CLASS")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .substring(0, 6) + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();

      const newId = `class-${Math.random().toString(36).substring(2, 11)}`;
      const newClassroom: Classroom = {
        id: newId,
        name: classroomData.name || "Unnamed Class",
        school: classroomData.school || "Unnamed School",
        program: classroomData.program || "",
        yearLevel: classroomData.yearLevel || "",
        section: classroomData.section || "",
        schoolYear: classroomData.schoolYear || "2026-2027",
        description: classroomData.description || "",
        treasurerId: user.uid,
        createdAt: new Date().toISOString(),
        inviteCode: inviteCode,
        inviteStatus: "active"
      };

      await setDoc(doc(db, "classrooms", newId), newClassroom);

      // Add Treasurer as an active member automatically
      const treasurerMember: Member = {
        uid: user.uid,
        name: user.name,
        email: user.email,
        role: "treasurer",
        joinedAt: new Date().toISOString(),
        status: "active"
      };
      await setDoc(doc(db, "classrooms", newId, "members", user.uid), treasurerMember);

      // Log action
      await addDoc(collection(db, "auditLogs"), {
        classroomId: newId,
        userId: user.uid,
        userName: user.name,
        userRole: "treasurer",
        action: "Classroom Created",
        details: `Created classroom workspace "${newClassroom.name}" under ${newClassroom.school}.`,
        timestamp: new Date().toISOString()
      });

      // Refresh list
      await fetchTreasurerClassrooms(user.uid);
      const createdClass = { ...newClassroom };
      setClassroom(createdClass);
      return createdClass;
    } catch (err: any) {
      console.error("Create classroom error:", err);
      setError("Failed to create classroom: " + err.message);
      return null;
    }
  };

  // Helper to find a classroom by invite code
  const findClassroomByInviteCode = async (inviteCode: string): Promise<Classroom | null> => {
    const rawCode = inviteCode.trim();
    const cleanCode = rawCode.toUpperCase();
    
    let targetDoc: any = null;

    // 1. Query by cleanCode
    const q1 = query(collection(db, "classrooms"), where("inviteCode", "==", cleanCode));
    const snap1 = await getDocs(q1);
    if (!snap1.empty) targetDoc = snap1.docs[0];

    // 2. Query by rawCode
    if (!targetDoc && rawCode !== cleanCode) {
      const q2 = query(collection(db, "classrooms"), where("inviteCode", "==", rawCode));
      const snap2 = await getDocs(q2);
      if (!snap2.empty) targetDoc = snap2.docs[0];
    }

    // 3. Check doc ID match
    if (!targetDoc) {
      try {
        const docRef = doc(db, "classrooms", rawCode);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) targetDoc = docSnap;
      } catch (e) {}
    }

    // 4. Fallback scan
    if (!targetDoc) {
      const allSnap = await getDocs(collection(db, "classrooms"));
      for (const d of allSnap.docs) {
        const data = d.data();
        if (
          (data.inviteCode && data.inviteCode.toString().trim().toUpperCase() === cleanCode) ||
          d.id.toUpperCase() === cleanCode
        ) {
          targetDoc = d;
          break;
        }
      }
    }

    if (!targetDoc) return null;
    return { id: targetDoc.id, ...targetDoc.data() } as Classroom;
  };

  // Request to Join Classroom (Student Registration for Treasurer Approval)
  const requestJoinClassroom = async (inviteCode: string, studentProfile: Partial<UserProfile>) => {
    if (!user) {
      setError("Please sign in or authenticate your profile first.");
      return { success: false, message: "Not authenticated" };
    }
    setLoading(true);
    setError(null);
    try {
      const targetClassroom = await findClassroomByInviteCode(inviteCode);
      if (!targetClassroom) {
        setError("Invalid or deactivated invitation code.");
        return { success: false, message: "Invalid or deactivated code" };
      }

      if (targetClassroom.inviteStatus === "inactive") {
        setError("This classroom is currently not accepting new student join requests.");
        return { success: false, message: "Classroom registration is inactive" };
      }

      // Check if user is already an active member in this classroom
      const existingMemberDoc = await getDoc(doc(db, "classrooms", targetClassroom.id, "members", user.uid));
      if (existingMemberDoc.exists() && existingMemberDoc.data().status === "active") {
        if (!classrooms.some(c => c.id === targetClassroom.id)) {
          setClassrooms(prev => [...prev, targetClassroom]);
        }
        setClassroom(targetClassroom);
        setPendingJoinRequest(null);
        localStorage.setItem(`student_classroom_${user.uid}`, targetClassroom.id);
        await setDoc(doc(db, "users", user.uid), { classroomId: targetClassroom.id, status: "active" }, { merge: true });
        return { success: true, status: "approved", classroom: targetClassroom };
      }

      // Update student profile in users collection
      const updatedProfile: UserProfile = {
        ...user,
        name: studentProfile.name || user.name,
        studentId: studentProfile.studentId || user.studentId || "",
        program: studentProfile.program || user.program || "",
        yearLevel: studentProfile.yearLevel || user.yearLevel || "2nd Year",
        section: studentProfile.section || user.section || "",
        contact: studentProfile.contact || user.contact || "",
        role: "student" as UserRole
      };
      await setDoc(doc(db, "users", user.uid), updatedProfile, { merge: true });
      setUser(updatedProfile);

      // Create JoinRequest record for Treasurer Approval
      const joinReq: JoinRequest = {
        id: user.uid,
        classroomId: targetClassroom.id,
        classroomName: targetClassroom.name,
        userId: user.uid,
        name: updatedProfile.name,
        email: user.email, // Always guaranteed from Google Auth / registered account!
        photoURL: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(updatedProfile.name)}`,
        studentId: updatedProfile.studentId || "",
        program: updatedProfile.program || "",
        yearLevel: updatedProfile.yearLevel || "",
        section: updatedProfile.section || "",
        contact: updatedProfile.contact || "",
        status: "pending",
        requestedAt: new Date().toISOString()
      };

      await setDoc(doc(db, "classrooms", targetClassroom.id, "joinRequests", user.uid), joinReq);
      
      // If student has no active classroom, show pending approval page
      if (!classroom && classrooms.length === 0) {
        setPendingJoinRequest(joinReq);
      }

      // Audit Log in classroom
      await addDoc(collection(db, "auditLogs"), {
        classroomId: targetClassroom.id,
        userId: user.uid,
        userName: updatedProfile.name,
        userRole: "student",
        action: "Join Request Submitted",
        details: `${updatedProfile.name} (${user.email} - Student ID: ${updatedProfile.studentId || "N/A"}) requested to join ${targetClassroom.name}.`,
        timestamp: new Date().toISOString()
      });

      return { 
        success: true, 
        status: "pending", 
        classroom: targetClassroom, 
        message: "Join request submitted! Waiting for treasurer approval." 
      };
    } catch (err: any) {
      console.error("Request join classroom error:", err);
      setError("Failed to submit join request: " + (err.message || "Please check connection."));
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Backward-compatible alias that calls requestJoinClassroom
  const joinClassroomByCode = async (inviteCode: string, studentProfile: Partial<UserProfile>): Promise<boolean> => {
    const res = await requestJoinClassroom(inviteCode, studentProfile);
    return res.success;
  };

  // Treasurer: Approve Student Join Request
  const approveJoinRequest = async (requestOrClassroomIdOrId: JoinRequest | string, optionalRequestId?: string): Promise<boolean> => {
    if (!user || user.role !== "treasurer") return false;
    try {
      let req: JoinRequest | undefined;
      let targetClassroomId: string | undefined = classroom?.id;
      let targetUserId: string;

      if (typeof requestOrClassroomIdOrId === "string") {
        if (optionalRequestId) {
          targetClassroomId = requestOrClassroomIdOrId;
          targetUserId = optionalRequestId;
        } else {
          targetUserId = requestOrClassroomIdOrId;
        }
        req = joinRequests.find(r => r.id === targetUserId || r.userId === targetUserId);
      } else {
        req = requestOrClassroomIdOrId;
        targetClassroomId = req.classroomId || classroom?.id;
        targetUserId = req.userId || req.id;
      }

      if (!targetClassroomId || !targetUserId) {
        console.error("Missing classroomId or userId for approving join request", { targetClassroomId, targetUserId });
        return false;
      }

      // If req is not fully in state, try reading it from firestore
      if (!req || !req.name) {
        try {
          const snap = await getDoc(doc(db, "classrooms", targetClassroomId, "joinRequests", targetUserId));
          if (snap.exists()) {
            req = snap.data() as JoinRequest;
          }
        } catch (e) {}
      }

      // 1. Update JoinRequest status to 'approved'
      await updateDoc(doc(db, "classrooms", targetClassroomId, "joinRequests", targetUserId), {
        status: "approved",
        reviewedAt: new Date().toISOString(),
        reviewedBy: user.name
      });

      // 2. Create / Activate Member in classroom
      const activeMember: Member = {
        uid: targetUserId,
        name: req?.name || "Student",
        email: req?.email || "",
        photoURL: req?.photoURL || "",
        role: "student",
        joinedAt: new Date().toISOString(),
        status: "active",
        studentId: req?.studentId || "",
        program: req?.program || "",
        yearLevel: req?.yearLevel || "",
        section: req?.section || "",
        contact: req?.contact || ""
      };
      await setDoc(doc(db, "classrooms", targetClassroomId, "members", targetUserId), activeMember);

      // 3. Update student user document so future logins load directly
      try {
        await setDoc(doc(db, "users", targetUserId), {
          role: "student",
          classroomId: targetClassroomId,
          classroomName: classroom?.name || req?.classroomName || "",
          status: "active"
        }, { merge: true });
        localStorage.setItem(`student_classroom_${targetUserId}`, targetClassroomId);
      } catch (e) {
        console.warn("Could not sync student user profile doc:", e);
      }

      // 4. Write Audit Log
      await addDoc(collection(db, "auditLogs"), {
        classroomId: targetClassroomId,
        userId: user.uid,
        userName: user.name,
        userRole: "treasurer",
        action: "Student Approved",
        details: `Treasurer ${user.name} approved student ${req?.name || targetUserId} (${req?.email || ""}) into the classroom.`,
        timestamp: new Date().toISOString()
      });

      return true;
    } catch (err: any) {
      console.error("Approve join request error:", err);
      setError("Failed to approve student: " + err.message);
      return false;
    }
  };

  // Treasurer: Reject Student Join Request
  const rejectJoinRequest = async (
    requestOrClassroomIdOrId: JoinRequest | string,
    reasonOrRequestId?: string,
    optionalReason?: string
  ): Promise<boolean> => {
    if (!user || user.role !== "treasurer") return false;
    try {
      let req: JoinRequest | undefined;
      let targetClassroomId: string | undefined = classroom?.id;
      let targetUserId: string;
      let declineReason: string;

      if (typeof requestOrClassroomIdOrId === "string") {
        if (optionalReason !== undefined) {
          targetClassroomId = requestOrClassroomIdOrId;
          targetUserId = reasonOrRequestId || "";
          declineReason = optionalReason.trim() || "Registration declined by Treasurer";
        } else if (requestOrClassroomIdOrId === classroom?.id && reasonOrRequestId && !reasonOrRequestId.includes(" ")) {
          targetClassroomId = requestOrClassroomIdOrId;
          targetUserId = reasonOrRequestId;
          declineReason = "Registration declined by Treasurer";
        } else {
          targetUserId = requestOrClassroomIdOrId;
          declineReason = reasonOrRequestId?.trim() || "Registration declined by Treasurer";
        }
        req = joinRequests.find(r => r.id === targetUserId || r.userId === targetUserId);
      } else {
        req = requestOrClassroomIdOrId;
        targetClassroomId = req.classroomId || classroom?.id;
        targetUserId = req.userId || req.id;
        declineReason = reasonOrRequestId?.trim() || "Registration declined by Treasurer";
      }

      if (!targetClassroomId || !targetUserId) {
        console.error("Missing classroomId or userId for rejecting join request", { targetClassroomId, targetUserId });
        return false;
      }

      if (!req || !req.name) {
        try {
          const snap = await getDoc(doc(db, "classrooms", targetClassroomId, "joinRequests", targetUserId));
          if (snap.exists()) {
            req = snap.data() as JoinRequest;
          }
        } catch (e) {}
      }

      // 1. Update JoinRequest status to 'rejected'
      await updateDoc(doc(db, "classrooms", targetClassroomId, "joinRequests", targetUserId), {
        status: "rejected",
        rejectionReason: declineReason,
        reviewedAt: new Date().toISOString(),
        reviewedBy: user.name
      });

      // 2. Remove from members subcollection if any draft exists
      try {
        await deleteDoc(doc(db, "classrooms", targetClassroomId, "members", targetUserId));
      } catch (e) {}

      // 3. Write Audit Log
      await addDoc(collection(db, "auditLogs"), {
        classroomId: targetClassroomId,
        userId: user.uid,
        userName: user.name,
        userRole: "treasurer",
        action: "Student Rejected",
        details: `Treasurer ${user.name} rejected join request from ${req?.name || targetUserId} (${req?.email || ""}). Reason: ${declineReason}`,
        timestamp: new Date().toISOString()
      });

      return true;
    } catch (err: any) {
      console.error("Reject join request error:", err);
      setError("Failed to reject student: " + err.message);
      return false;
    }
  };

  // Student: Cancel their pending join request to try another code
  const cancelStudentJoinRequest = async (): Promise<boolean> => {
    if (!user || !pendingJoinRequest) return false;
    try {
      await deleteDoc(doc(db, "classrooms", pendingJoinRequest.classroomId, "joinRequests", user.uid));
      setPendingJoinRequest(null);
      return true;
    } catch (err: any) {
      console.error("Cancel join request error:", err);
      setError("Failed to cancel request: " + err.message);
      return false;
    }
  };

  // Treasurer: Remove Active Member from Classroom
  const removeMember = async (
    memberUidOrClassroomId: string, 
    memberNameOrMemberUid?: string, 
    optionalMemberName?: string
  ): Promise<boolean> => {
    if (!user || user.role !== "treasurer") return false;
    try {
      let targetClassroomId = classroom?.id;
      let targetUid: string;
      let memberName = "Member";

      if (optionalMemberName !== undefined) {
        targetClassroomId = memberUidOrClassroomId;
        targetUid = memberNameOrMemberUid || "";
        memberName = optionalMemberName;
      } else if (memberUidOrClassroomId === classroom?.id && memberNameOrMemberUid) {
        targetClassroomId = memberUidOrClassroomId;
        targetUid = memberNameOrMemberUid;
        const found = members.find(m => m.uid === targetUid);
        memberName = found?.name || "Member";
      } else {
        targetUid = memberUidOrClassroomId;
        memberName = memberNameOrMemberUid || members.find(m => m.uid === targetUid)?.name || "Member";
      }

      if (!targetClassroomId || !targetUid) return false;

      await deleteDoc(doc(db, "classrooms", targetClassroomId, "members", targetUid));
      try {
        await deleteDoc(doc(db, "classrooms", targetClassroomId, "joinRequests", targetUid));
      } catch (e) {}

      await addDoc(collection(db, "auditLogs"), {
        classroomId: targetClassroomId,
        userId: user.uid,
        userName: user.name,
        userRole: "treasurer",
        action: "Member Removed",
        details: `Treasurer ${user.name} removed ${memberName} from classroom.`,
        timestamp: new Date().toISOString()
      });

      return true;
    } catch (err: any) {
      console.error("Remove member error:", err);
      setError("Failed to remove member: " + err.message);
      return false;
    }
  };

  // Record Payment (Treasurer)
  const recordPayment = async (paymentData: Partial<Payment>): Promise<boolean> => {
    if (!user || user.role !== "treasurer" || !classroom) return false;
    try {
      const amountNum = Number(paymentData.amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error("Invalid payment amount specified");
      }

      const newPayment = {
        classroomId: classroom.id,
        studentId: paymentData.studentId || "",
        studentName: paymentData.studentName || "Student",
        amount: amountNum,
        paymentMethod: paymentData.paymentMethod || "Cash",
        referenceNumber: paymentData.referenceNumber || "",
        paymentDate: paymentData.paymentDate || new Date().toISOString().split("T")[0],
        recordedBy: user.name || "Treasurer",
        notes: paymentData.notes || "",
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "payments"), newPayment);

      try {
        await addDoc(collection(db, "auditLogs"), {
          classroomId: classroom.id,
          userId: user.uid,
          userName: user.name || "Treasurer",
          userRole: "treasurer",
          action: "Payment Recorded",
          details: `Recorded ₱${newPayment.amount} (${newPayment.paymentMethod}) for student ${newPayment.studentName}.`,
          timestamp: new Date().toISOString()
        });
      } catch (auditErr) {
        console.warn("Audit log non-fatal error on recordPayment:", auditErr);
      }

      return true;
    } catch (err: any) {
      console.error("Record payment error:", err);
      setError("Failed to record payment: " + err.message);
      return false;
    }
  };

  // Update/Edit Payment (Treasurer - Transparency Mode)
  const updatePayment = async (paymentId: string, oldAmount: number, paymentData: Partial<Payment>): Promise<boolean> => {
    if (!user || user.role !== "treasurer" || !classroom) return false;
    try {
      const amountNum = Number(paymentData.amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error("Invalid payment amount specified");
      }

      const finalData = {
        amount: amountNum,
        paymentMethod: paymentData.paymentMethod || "Cash",
        referenceNumber: paymentData.referenceNumber || "",
        paymentDate: paymentData.paymentDate || new Date().toISOString().split("T")[0],
        notes: paymentData.notes || "",
        recordedBy: user.name || "Treasurer"
      };

      await updateDoc(doc(db, "payments", paymentId), finalData);

      try {
        await addDoc(collection(db, "auditLogs"), {
          classroomId: classroom.id,
          userId: user.uid,
          userName: user.name || "Treasurer",
          userRole: "treasurer",
          action: "Payment Updated",
          details: `Updated ${paymentData.studentName || "Student"}'s payment. Previous Amount: ₱${oldAmount} → New Amount: ₱${finalData.amount}. Method: ${finalData.paymentMethod}. Reason/Notes: ${finalData.notes || "No reason given"}`,
          timestamp: new Date().toISOString()
        });
      } catch (auditErr) {
        console.warn("Audit log non-fatal error on updatePayment:", auditErr);
      }

      return true;
    } catch (err: any) {
      console.error("Update payment error:", err);
      setError("Failed to update payment: " + err.message);
      return false;
    }
  };

  // Record Expense (Treasurer)
  const recordExpense = async (expenseData: Partial<Expense>): Promise<boolean> => {
    if (!user || user.role !== "treasurer" || !classroom) return false;
    try {
      const amountNum = Number(expenseData.amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error("Invalid expense amount specified");
      }

      const newExpense = {
        classroomId: classroom.id,
        description: expenseData.description?.trim() || "Expense item",
        amount: amountNum,
        category: expenseData.category || "Classroom",
        receiptURL: expenseData.receiptURL || "",
        recordedBy: user.name || "Treasurer",
        paidTo: expenseData.paidTo?.trim() || "General",
        notes: expenseData.notes || "",
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "expenses"), newExpense);

      try {
        await addDoc(collection(db, "auditLogs"), {
          classroomId: classroom.id,
          userId: user.uid,
          userName: user.name || "Treasurer",
          userRole: "treasurer",
          action: "Expense Added",
          details: `Added classroom expense: "${newExpense.description}" of ₱${newExpense.amount} paid to ${newExpense.paidTo}.`,
          timestamp: new Date().toISOString()
        });
      } catch (auditErr) {
        console.warn("Audit log non-fatal error on recordExpense:", auditErr);
      }

      return true;
    } catch (err: any) {
      console.error("Record expense error:", err);
      setError("Failed to record expense: " + err.message);
      return false;
    }
  };

  // Request Cashout (Student or Treasurer)
  const requestCashout = async (cashoutData: Partial<CashoutRequest>): Promise<boolean> => {
    if (!user || !classroom) return false;
    try {
      const requestedAmount = Number(cashoutData.requestedAmount);
      if (isNaN(requestedAmount) || requestedAmount <= 0) {
        throw new Error("Please specify a valid cashout amount greater than ₱0.");
      }

      const newCashout: Omit<CashoutRequest, "id"> = {
        classroomId: classroom.id,
        studentId: user.uid,
        studentName: user.name || "Student",
        studentEmail: user.email || "",
        studentIdNumber: user.studentId || "N/A",
        requestedAmount: requestedAmount,
        totalContributed: Number(cashoutData.totalContributed || 0),
        totalClassExpenses: Number(cashoutData.totalClassExpenses || 0),
        enrolledStudentsCount: Number(cashoutData.enrolledStudentsCount || 1),
        expenseDeductionShare: Number(cashoutData.expenseDeductionShare || 0),
        eligibleCashoutAmount: Number(cashoutData.eligibleCashoutAmount || 0),
        payoutMethod: cashoutData.payoutMethod || "GCash",
        payoutAccountName: cashoutData.payoutAccountName?.trim() || user.name || "",
        payoutAccountNumber: cashoutData.payoutAccountNumber?.trim() || "",
        reason: cashoutData.reason?.trim() || "Student fund cashout claim",
        status: "pending",
        requestedAt: new Date().toISOString()
      };

      await addDoc(collection(db, "cashoutRequests"), newCashout);

      try {
        await addDoc(collection(db, "auditLogs"), {
          classroomId: classroom.id,
          userId: user.uid,
          userName: user.name || "Student",
          userRole: user.role || "student",
          action: "Cashout Requested",
          details: `Student ${user.name} requested cashout of ₱${requestedAmount.toLocaleString()} via ${newCashout.payoutMethod} (${newCashout.payoutAccountNumber || "N/A"}). Reason: ${newCashout.reason}`,
          timestamp: new Date().toISOString()
        });
      } catch (auditErr) {
        console.warn("Audit log non-fatal error on requestCashout:", auditErr);
      }

      return true;
    } catch (err: any) {
      console.error("Request cashout error:", err);
      setError("Failed to submit cashout request: " + err.message);
      return false;
    }
  };

  // Process Cashout Request (Treasurer Approve, Reject, or Mark Disbursed)
  const processCashoutRequest = async (
    cashoutId: string, 
    status: "approved" | "rejected" | "disbursed", 
    notes?: string, 
    transactionRef?: string
  ): Promise<boolean> => {
    if (!user || user.role !== "treasurer" || !classroom) return false;
    try {
      const cashoutRef = doc(db, "cashoutRequests", cashoutId);
      const cashoutSnap = await getDoc(cashoutRef);
      if (!cashoutSnap.exists()) {
        throw new Error("Cashout record not found");
      }

      const existingData = cashoutSnap.data() as CashoutRequest;

      const updatePayload: Partial<CashoutRequest> = {
        status: status,
        processedAt: new Date().toISOString(),
        processedBy: user.name || "Treasurer",
        notes: notes?.trim() || existingData.notes || "",
        transactionReference: transactionRef?.trim() || existingData.transactionReference || ""
      };

      await updateDoc(cashoutRef, updatePayload);

      // If marked disbursed, we can optionally log an expense or record of student payout
      let actionLabel = "Cashout Approved";
      if (status === "disbursed") actionLabel = "Cashout Disbursed";
      if (status === "rejected") actionLabel = "Cashout Rejected";

      try {
        await addDoc(collection(db, "auditLogs"), {
          classroomId: classroom.id,
          userId: user.uid,
          userName: user.name || "Treasurer",
          userRole: "treasurer",
          action: actionLabel,
          details: `Treasurer ${user.name} marked cashout for ${existingData.studentName} (₱${existingData.requestedAmount.toLocaleString()}) as ${status.toUpperCase()}. Ref: ${updatePayload.transactionReference || "None"}. Notes: ${updatePayload.notes || "None"}`,
          timestamp: new Date().toISOString()
        });
      } catch (auditErr) {
        console.warn("Audit log non-fatal error on processCashoutRequest:", auditErr);
      }

      return true;
    } catch (err: any) {
      console.error("Process cashout request error:", err);
      setError("Failed to process cashout request: " + err.message);
      return false;
    }
  };

  // Update Classroom settings/invitations
  const updateClassroomSettings = async (settings: Partial<Classroom>) => {
    if (!user || user.role !== "treasurer" || !classroom) return;
    try {
      await updateDoc(doc(db, "classrooms", classroom.id), settings);
      
      const updatedClass = { ...classroom, ...settings };
      setClassroom(updatedClass);
      setClassrooms(classrooms.map(c => c.id === classroom.id ? updatedClass : c));

      const changeDesc = settings.inviteStatus ? `Invitation status changed to ${settings.inviteStatus}` : "Classroom details updated";
      await addDoc(collection(db, "auditLogs"), {
        classroomId: classroom.id,
        userId: user.uid,
        userName: user.name,
        userRole: "treasurer",
        action: "Classroom Updated",
        details: changeDesc,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      console.error("Update classroom settings error:", err);
      setError("Failed to update settings: " + err.message);
    }
  };

  // Delete Classroom (Treasurer)
  const deleteClassroom = async (classroomId: string) => {
    if (!user || user.role !== "treasurer") return false;
    try {
      await deleteDoc(doc(db, "classrooms", classroomId));
      
      if (classroom && classroom.id === classroomId) {
        const remaining = classrooms.filter(c => c.id !== classroomId);
        if (remaining.length > 0) {
          setClassroom(remaining[0]);
        } else {
          setClassroom(null);
        }
      }

      setClassrooms(classrooms.filter(c => c.id !== classroomId));
      return true;
    } catch (err: any) {
      console.error("Delete classroom error:", err);
      setError("Failed to delete classroom: " + err.message);
      return false;
    }
  };

  // Write manual Audit Log if needed
  const writeAuditLog = async (action: string, details: string) => {
    if (!user || !classroom) return;
    try {
      await addDoc(collection(db, "auditLogs"), {
        classroomId: classroom.id,
        userId: user.uid,
        userName: user.name,
        userRole: user.role,
        action: action,
        details: details,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error("Write audit log error:", err);
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      classroom,
      classrooms,
      members,
      payments,
      expenses,
      cashoutRequests,
      auditLogs,
      joinRequests,
      pendingJoinRequest,
      loading,
      error,
      isSandbox,
      signInGoogle,
      signOutUser,
      createProfile,
      createClassroom,
      joinClassroomByCode,
      requestJoinClassroom,
      approveJoinRequest,
      rejectJoinRequest,
      cancelStudentJoinRequest,
      removeMember,
      recordPayment,
      updatePayment,
      recordExpense,
      requestCashout,
      processCashoutRequest,
      updateClassroomSettings,
      writeAuditLog,
      loginSandboxUser,
      setError,
      selectClassroom,
      deleteClassroom
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

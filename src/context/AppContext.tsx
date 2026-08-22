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
import { UserProfile, Classroom, Member, Payment, Expense, AuditLog, UserRole } from "../types";

interface AppContextType {
  user: UserProfile | null;
  classroom: Classroom | null;
  classrooms: Classroom[];
  members: Member[];
  payments: Payment[];
  expenses: Expense[];
  auditLogs: AuditLog[];
  loading: boolean;
  error: string | null;
  isSandbox: boolean;
  
  signInGoogle: (targetRole?: UserRole) => Promise<void>;
  signOutUser: () => Promise<void>;
  createProfile: (profile: Partial<UserProfile>) => Promise<void>;
  createClassroom: (classroomData: Partial<Classroom>) => Promise<Classroom | null>;
  joinClassroomByCode: (inviteCode: string, studentProfile: Partial<UserProfile>) => Promise<boolean>;
  recordPayment: (paymentData: Partial<Payment>) => Promise<void>;
  updatePayment: (paymentId: string, oldAmount: number, paymentData: Partial<Payment>) => Promise<void>;
  recordExpense: (expenseData: Partial<Expense>) => Promise<void>;
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
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
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

  // Fetch student's joined classroom
  const fetchStudentClassroom = async (uid: string) => {
    try {
      // Find classrooms where this user is a member
      const q = query(collection(db, "classrooms"));
      const querySnapshot = await getDocs(q);
      
      for (const classDoc of querySnapshot.docs) {
        const memberDoc = await getDoc(doc(db, "classrooms", classDoc.id, "members", uid));
        if (memberDoc.exists() && memberDoc.data().status === "active") {
          setClassroom({ id: classDoc.id, ...classDoc.data() } as Classroom);
          return;
        }
      }
      setClassroom(null);
    } catch (err) {
      console.error("Error fetching student classroom:", err);
    }
  };

  // Subscriptions for active classroom details (members, payments, expenses, auditLogs)
  useEffect(() => {
    if (!classroom) {
      setMembers([]);
      setPayments([]);
      setExpenses([]);
      setAuditLogs([]);
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
        // Sort by date descending
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
        // Sort by date descending
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

    return () => {
      unsubscribeMembers();
      unsubscribePayments();
      unsubscribeExpenses();
      unsubscribeLogs();
    };
  }, [classroom]);

  // Select a classroom (for treasurers managing multiple classes)
  const selectClassroom = (classroomId: string) => {
    const selected = classrooms.find(c => c.id === classroomId);
    if (selected) {
      setClassroom(selected);
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
        // Always assign the selected role from the landing page selection
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

  // Local Sandbox / Demo login (ideal for testing in IFrame!)
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
        
        // Save profile to database
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
        setIsSandbox(false);
      } else {
        await firebaseSignOut(auth);
        setUser(null);
        setClassroom(null);
        setClassrooms([]);
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

      // Clean undefined properties for firestore
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

      // Add Treasurer as a member automatically
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
      // Select the new classroom
      const createdClass = { ...newClassroom };
      setClassroom(createdClass);
      return createdClass;
    } catch (err: any) {
      console.error("Create classroom error:", err);
      setError("Failed to create classroom: " + err.message);
      return null;
    }
  };

  // Join Classroom (Student)
  const joinClassroomByCode = async (inviteCode: string, studentProfile: Partial<UserProfile>) => {
    if (!user) {
      setError("Please sign in or create an account first.");
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      const rawCode = inviteCode.trim();
      const cleanCode = rawCode.toUpperCase();
      
      let targetDoc: any = null;

      // 1. Query by cleanCode
      const q1 = query(
        collection(db, "classrooms"), 
        where("inviteCode", "==", cleanCode)
      );
      const snap1 = await getDocs(q1);
      if (!snap1.empty) {
        targetDoc = snap1.docs[0];
      }

      // 2. Query by rawCode
      if (!targetDoc && rawCode !== cleanCode) {
        const q2 = query(
          collection(db, "classrooms"), 
          where("inviteCode", "==", rawCode)
        );
        const snap2 = await getDocs(q2);
        if (!snap2.empty) {
          targetDoc = snap2.docs[0];
        }
      }

      // 3. Check doc ID match
      if (!targetDoc) {
        try {
          const docRef = doc(db, "classrooms", rawCode);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            targetDoc = docSnap;
          }
        } catch (e) {
          // Ignore
        }
      }

      // 4. Fallback search all classrooms
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
      
      if (!targetDoc) {
        setError("Invalid or deactivated invitation code.");
        return false;
      }

      const targetClassroom = { 
        id: targetDoc.id, 
        ...targetDoc.data() 
      } as Classroom;

      // Update student profile with fields
      const updatedProfile = {
        ...user,
        ...studentProfile,
        role: "student" as UserRole
      } as UserProfile;

      await setDoc(doc(db, "users", user.uid), updatedProfile);
      setUser(updatedProfile);

      // Create Member record in classroom
      const studentMember: Member = {
        uid: user.uid,
        name: updatedProfile.name,
        email: updatedProfile.email,
        role: "student",
        joinedAt: new Date().toISOString(),
        status: "active",
        studentId: updatedProfile.studentId
      };
      await setDoc(doc(db, "classrooms", targetClassroom.id, "members", user.uid), studentMember);

      // Audit Log
      await addDoc(collection(db, "auditLogs"), {
        classroomId: targetClassroom.id,
        userId: user.uid,
        userName: updatedProfile.name,
        userRole: "student",
        action: "Student Joined",
        details: `${updatedProfile.name} (ID: ${updatedProfile.studentId || "N/A"}) joined the classroom.`,
        timestamp: new Date().toISOString()
      });

      setClassroom(targetClassroom);
      setError(null);
      return true;
    } catch (err: any) {
      console.error("Join classroom error:", err);
      setError("Failed to join classroom: " + (err.message || "Please check connection."));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Record Payment (Treasurer)
  const recordPayment = async (paymentData: Partial<Payment>) => {
    if (!user || user.role !== "treasurer" || !classroom) return;
    try {
      const newPayment: Partial<Payment> = {
        classroomId: classroom.id,
        studentId: paymentData.studentId,
        studentName: paymentData.studentName,
        amount: Number(paymentData.amount),
        paymentMethod: paymentData.paymentMethod || "Cash",
        referenceNumber: paymentData.referenceNumber || "",
        paymentDate: paymentData.paymentDate || new Date().toISOString().split("T")[0],
        recordedBy: user.name,
        notes: paymentData.notes || "",
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "payments"), newPayment);

      // Audit Log
      await addDoc(collection(db, "auditLogs"), {
        classroomId: classroom.id,
        userId: user.uid,
        userName: user.name,
        userRole: "treasurer",
        action: "Payment Recorded",
        details: `Recorded ₱${newPayment.amount} (${newPayment.paymentMethod}) for student ${newPayment.studentName}.`,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      console.error("Record payment error:", err);
      setError("Failed to record payment: " + err.message);
    }
  };

  // Update/Edit Payment (Treasurer - Transparency Mode)
  const updatePayment = async (paymentId: string, oldAmount: number, paymentData: Partial<Payment>) => {
    if (!user || user.role !== "treasurer" || !classroom) return;
    try {
      const finalData = {
        amount: Number(paymentData.amount),
        paymentMethod: paymentData.paymentMethod,
        referenceNumber: paymentData.referenceNumber || "",
        paymentDate: paymentData.paymentDate,
        notes: paymentData.notes || "",
        recordedBy: user.name
      };

      await updateDoc(doc(db, "payments", paymentId), finalData);

      // Audit Log for Audit Trail Transparency (Item 18 requirement)
      await addDoc(collection(db, "auditLogs"), {
        classroomId: classroom.id,
        userId: user.uid,
        userName: user.name,
        userRole: "treasurer",
        action: "Payment Updated",
        details: `Updated ${paymentData.studentName}'s payment. Previous Amount: ₱${oldAmount} → New Amount: ₱${finalData.amount}. Method: ${finalData.paymentMethod}. Reason/Notes: ${finalData.notes || "No reason given"}`,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      console.error("Update payment error:", err);
      setError("Failed to update payment: " + err.message);
    }
  };

  // Record Expense (Treasurer)
  const recordExpense = async (expenseData: Partial<Expense>) => {
    if (!user || user.role !== "treasurer" || !classroom) return;
    try {
      const newExpense: Partial<Expense> = {
        classroomId: classroom.id,
        description: expenseData.description,
        amount: Number(expenseData.amount),
        category: expenseData.category || "Classroom",
        receiptURL: expenseData.receiptURL || "",
        recordedBy: user.name,
        paidTo: expenseData.paidTo || "General",
        notes: expenseData.notes || "",
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "expenses"), newExpense);

      // Audit Log
      await addDoc(collection(db, "auditLogs"), {
        classroomId: classroom.id,
        userId: user.uid,
        userName: user.name,
        userRole: "treasurer",
        action: "Expense Added",
        details: `Added classroom expense: "${newExpense.description}" of ₱${newExpense.amount} paid to ${newExpense.paidTo}.`,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      console.error("Record expense error:", err);
      setError("Failed to record expense: " + err.message);
    }
  };

  // Update Classroom settings/invitations
  const updateClassroomSettings = async (settings: Partial<Classroom>) => {
    if (!user || user.role !== "treasurer" || !classroom) return;
    try {
      await updateDoc(doc(db, "classrooms", classroom.id), settings);
      
      // Update local selected state
      const updatedClass = { ...classroom, ...settings };
      setClassroom(updatedClass);
      
      // Update in classrooms list
      setClassrooms(classrooms.map(c => c.id === classroom.id ? updatedClass : c));

      // Audit Log
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
      
      // If deleted classroom was currently selected, select another or null
      if (classroom && classroom.id === classroomId) {
        const remaining = classrooms.filter(c => c.id !== classroomId);
        if (remaining.length > 0) {
          setClassroom(remaining[0]);
        } else {
          setClassroom(null);
        }
      }

      // Also clean up local classrooms state
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
      auditLogs,
      loading,
      error,
      isSandbox,
      signInGoogle,
      signOutUser,
      createProfile,
      createClassroom,
      joinClassroomByCode,
      recordPayment,
      updatePayment,
      recordExpense,
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

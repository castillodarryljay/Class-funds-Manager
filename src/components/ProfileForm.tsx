import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { User, Mail, GraduationCap, Phone, CheckSquare } from "lucide-react";
import { UserRole } from "../types";

interface ProfileFormProps {
  role: UserRole;
  onProfileCreated: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ role, onProfileCreated }) => {
  const { user, createProfile } = useApp();
  const [name, setName] = useState(user?.name || "");
  const [studentId, setStudentId] = useState("");
  const [program, setProgram] = useState("");
  const [yearLevel, setYearLevel] = useState("1st Year");
  const [section, setSection] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await createProfile({
        name,
        role,
        studentId,
        program,
        yearLevel,
        section,
        contact
      });
      onProfileCreated();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-6" id="profile-creation-view">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">
            Create Your {role === "treasurer" ? "Treasurer" : "Student"} Profile
          </h2>
          <p className="text-slate-500 text-sm">Provide some academic background details to complete registration.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-medium"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* Email (Read Only) */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-300" />
              <input
                type="email"
                disabled
                className="w-full bg-slate-100 border border-slate-200/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-400 font-medium cursor-not-allowed"
                value={user?.email || ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Student ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Student ID</label>
              <input
                type="text"
                required
                placeholder="e.g. 2026-12345"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-medium"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </div>

            {/* Year Level */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Year Level</label>
              <select
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-medium"
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Program / Course */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Program / Course</label>
              <input
                type="text"
                required
                placeholder="e.g. BSIT"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-medium"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
              />
            </div>

            {/* Section */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Section</label>
              <input
                type="text"
                required
                placeholder="e.g. A"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-medium"
                value={section}
                onChange={(e) => setSection(e.target.value)}
              />
            </div>
          </div>

          {/* Contact (Optional for student, requested for treasurer) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Contact Number {role === "student" && <span className="text-slate-400 lowercase italic">(optional)</span>}
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required={role === "treasurer"}
                placeholder="e.g. 09123456789"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-medium"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20 text-center flex items-center justify-center gap-2"
          >
            <CheckSquare className="h-4 w-4" />
            {submitting ? "Creating Profile..." : `Create ${role === "treasurer" ? "Treasurer" : "Student"} Profile`}
          </button>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { ArrowLeft, PlusCircle, Sparkles, Copy, Check, Share2, QrCode } from "lucide-react";
import { AppLogo } from "./AppLogo";
import { Classroom } from "../types";

interface ClassroomCreateProps {
  onBack: () => void;
  onCreated: (cls: Classroom) => void;
}

export const ClassroomCreate: React.FC<ClassroomCreateProps> = ({ onBack, onCreated }) => {
  const { createClassroom } = useApp();
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [program, setProgram] = useState("");
  const [yearLevel, setYearLevel] = useState("2nd Year");
  const [section, setSection] = useState("");
  const [schoolYear, setSchoolYear] = useState("2026-2027");
  const [description, setDescription] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [createdClassroom, setCreatedClassroom] = useState<Classroom | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !school.trim()) return;

    setSubmitting(true);
    try {
      const cls = await createClassroom({
        name: name.trim(),
        school: school.trim(),
        program: program.trim(),
        yearLevel,
        section: section.trim(),
        schoolYear,
        description: description.trim()
      });
      if (cls) {
        setCreatedClassroom(cls);
      }
    } catch (err) {
      console.error("Create classroom error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const getInviteLink = () => {
    if (!createdClassroom) return "";
    return `${window.location.origin}/?join=${createdClassroom.inviteCode}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getInviteLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4" id="create-classroom-view">
      {/* Return Header */}
      {!createdClassroom && (
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition font-semibold text-sm mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Workspace
        </button>
      )}

      {/* Success View */}
      {createdClassroom ? (
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 text-center space-y-6 animate-fade-in">
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-full w-fit mx-auto border border-emerald-100">
            <Sparkles className="h-8 w-8" />
          </div>
          
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">Classroom Created Successfully!</h2>
            <p className="text-slate-500 text-sm">Your new financial workspace is fully initialized and secure.</p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/60 space-y-4 text-left">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Classroom Name</span>
              <span className="text-lg font-bold text-slate-900">{createdClassroom.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">School / Institution</span>
                <span className="text-sm font-semibold text-slate-700">{createdClassroom.school}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">School Year</span>
                <span className="text-sm font-semibold text-slate-700">{createdClassroom.schoolYear}</span>
              </div>
            </div>
            
            <hr className="border-slate-200" />

            {/* Invite Code Area */}
            <div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block mb-1">Classroom Code</span>
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 font-extrabold text-xl py-3 px-4 rounded-xl tracking-wider text-center select-all">
                {createdClassroom.inviteCode}
              </div>
            </div>

            {/* QR Invite & Link */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Invitation Link</span>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={getInviteLink()} 
                  className="bg-white border border-slate-200 text-slate-500 text-xs px-3 py-2 rounded-lg flex-1 focus:outline-none select-all font-mono"
                />
                <button
                  onClick={handleCopyLink}
                  className="bg-slate-950 text-white hover:bg-slate-900 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
            
            {/* Real QR Code using the qrserver API */}
            <div className="pt-2 flex flex-col items-center justify-center text-center bg-white p-4 rounded-xl border border-slate-100 gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Invitation QR Code</span>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(getInviteLink())}`} 
                alt="Invitation QR Code"
                referrerPolicy="no-referrer"
                className="w-40 h-40 border border-slate-200 rounded-lg p-1 bg-white"
              />
              <span className="text-[10px] text-slate-400 italic">Students scan this QR to join instantly</span>
            </div>
          </div>

          <button
            onClick={() => onCreated(createdClassroom)}
            className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold py-3.5 rounded-xl transition"
            id="go-to-classroom-dashboard-btn"
          >
            Go to Classroom Dashboard
          </button>
        </div>
      ) : (
        /* Form view */
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 space-y-6">
          <div className="flex items-center gap-3">
            <AppLogo size="sm" />
            <div>
              <h2 className="text-xl font-extrabold text-slate-950 tracking-tight">Create Classroom Workspace</h2>
              <p className="text-xs text-slate-500">Configure your classroom fund targets and profile.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Classroom Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Classroom Name</label>
              <input
                type="text"
                required
                placeholder="e.g. BSIT 2A"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-semibold"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* School */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">School / University</label>
              <input
                type="text"
                required
                placeholder="e.g. University of Makati"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-semibold"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
              />
            </div>

            {/* Program / Course */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Program / Course</label>
              <input
                type="text"
                required
                placeholder="e.g. Bachelor of Science in Information Technology"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-semibold"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Year Level */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Year Level</label>
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

              {/* Section */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Section</label>
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
              {/* School Year */}
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">School Year</label>
              <input
                type="text"
                required
                placeholder="e.g. 2026-2027"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-semibold"
                value={schoolYear}
                onChange={(e) => setSchoolYear(e.target.value)}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Description (Optional)</label>
              <textarea
                placeholder="Describe the main funding objectives..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-950 font-semibold resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20 text-center flex items-center justify-center gap-2"
            >
              <PlusCircle className="h-5 w-5" />
              {submitting ? "Initializing Classroom..." : "Create Classroom"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

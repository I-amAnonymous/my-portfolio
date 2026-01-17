"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation"; 
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/canvasUtils";
import { FaUpload, FaCheck, FaTrash, FaPlus, FaLink, FaRightFromBracket, FaFilePdf } from "react-icons/fa6";

type Project = {
  title: string;
  description: string;
  techStack: string[];
  link: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  // Profile States
  const [fullName, setFullName] = useState("");
  const [roles, setRoles] = useState("");
  const [about, setAbout] = useState("");
  const [nameSpeed, setNameSpeed] = useState(5000);
  const [roleSpeed, setRoleSpeed] = useState(4000);
  
  // NEW: Resume State
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // Project States
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProject, setNewProject] = useState({ title: "", description: "", tech: "", link: "" });
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);

  // Image States
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedImageBlob, setCroppedImageBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  // --- 1. SECURITY CHECK & DATA FETCH ---
  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setIsAuthenticated(true);

      const { data } = await supabase.from('profile').select('*').limit(1).single();
      if (data) {
        setFullName(data.full_name || "");
        setRoles(data.roles ? data.roles.join(", ") : "");
        setAbout(data.about_text || "");
        setNameSpeed(data.name_speed || 5000);
        setRoleSpeed(data.role_speed || 4000);
        if (data.avatar_url) setAvatarUrl(data.avatar_url);
        if (data.projects) setProjects(data.projects);
        // NEW: Load Resume URL
        if (data.resume_url) setResumeUrl(data.resume_url);
      }
    };
    checkAuthAndFetch();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // --- FILE HANDLERS ---
  const onFileChange = async (e: any) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result as string);
        setIsCropperOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onResumeChange = (e: any) => {
    if (e.target.files && e.target.files.length > 0) {
      setResumeFile(e.target.files[0]);
    }
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = async () => {
    try {
      if (!imageSrc || !croppedAreaPixels) return;
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedBlob) {
        setCroppedImageBlob(croppedBlob);
        setPreviewUrl(URL.createObjectURL(croppedBlob));
        setIsCropperOpen(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- PROJECT HANDLERS ---
  const handleAddProject = () => {
    if (!newProject.title || !newProject.description) return alert("Title and Description are required!");
    const projectToAdd: Project = {
      title: newProject.title,
      description: newProject.description,
      link: newProject.link || "#",
      techStack: newProject.tech.split(",").map(t => t.trim()).filter(t => t !== "")
    };
    setProjects([...projects, projectToAdd]);
    setNewProject({ title: "", description: "", tech: "", link: "" }); 
    setIsProjectFormOpen(false);
  };

  const handleDeleteProject = (index: number) => {
    if (confirm("Are you sure you want to delete this project?")) {
      const updatedProjects = projects.filter((_, i) => i !== index);
      setProjects(updatedProjects);
    }
  };

  // --- SAVE ALL CHANGES ---
  const handleUpdate = async () => {
    setLoading(true);
    setMessage("");
    let finalAvatarUrl = avatarUrl;
    let finalResumeUrl = resumeUrl;

    try {
      // 1. Upload Avatar (if changed)
      if (croppedImageBlob) {
        const fileName = `avatar-${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage.from('images').upload(fileName, croppedImageBlob);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName);
        finalAvatarUrl = urlData.publicUrl;
      }

      // 2. Upload Resume (if changed)
      if (resumeFile) {
        const fileName = `resume-${Date.now()}.pdf`;
        const { error: uploadError } = await supabase.storage.from('images').upload(fileName, resumeFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName);
        finalResumeUrl = urlData.publicUrl;
      }

      const updates = {
        full_name: fullName,
        roles: roles.split(",").map(r => r.trim()),
        about_text: about,
        name_speed: nameSpeed,
        role_speed: roleSpeed,
        avatar_url: finalAvatarUrl,
        resume_url: finalResumeUrl, // Save new resume URL
        projects: projects
      };

      const { data: profile } = await supabase.from('profile').select('id').limit(1).single();
      if (profile) {
        const { error } = await supabase.from('profile').update(updates).eq('id', profile.id);
        if (error) throw error;
        setMessage("✅ Everything updated successfully!");
        setResumeFile(null); // Clear file input
      }
    } catch (error: any) {
      console.error(error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 flex flex-col items-center font-sans relative">
      
      {/* CROPPER MODAL */}
      {isCropperOpen && imageSrc && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg h-[400px] bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
            <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
          </div>
          <div className="w-full max-w-lg mt-6 bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col gap-4">
            <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
            <div className="flex gap-4">
              <button onClick={() => setIsCropperOpen(false)} className="flex-1 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium">Cancel</button>
              <button onClick={showCroppedImage} className="flex-1 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center justify-center gap-2"><FaCheck /> Apply Crop</button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN FORM */}
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 shadow-2xl space-y-8 relative">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-cyan-400">Portfolio Control Center</h1>
          <button onClick={handleLogout} className="text-xs flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors"><FaRightFromBracket /> Logout</button>
        </div>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Profile Details</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label><input className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-cyan-500" value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
            <div><label className="block text-sm font-medium text-slate-400 mb-2">Roles (Comma separated)</label><input className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-cyan-500" value={roles} onChange={(e) => setRoles(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div><label className="block text-xs font-medium text-slate-400 mb-1">Name Interval (ms)</label><input type="number" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" value={nameSpeed} onChange={(e) => setNameSpeed(Number(e.target.value))} /></div>
             <div><label className="block text-xs font-medium text-slate-400 mb-1">Role Duration (ms)</label><input type="number" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" value={roleSpeed} onChange={(e) => setRoleSpeed(Number(e.target.value))} /></div>
          </div>
          <div><label className="block text-sm font-medium text-slate-400 mb-2">About Me</label><textarea className="w-full h-32 bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-cyan-500" value={about} onChange={(e) => setAbout(e.target.value)} /></div>
          
          {/* UPLOAD SECTION: IMAGE & RESUME */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Image Upload */}
            <div className="p-4 border border-dashed border-slate-700 rounded-lg bg-slate-950/50 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-cyan-500/50 bg-slate-800 flex-shrink-0">
                 {previewUrl ? <img src={previewUrl} className="object-cover w-full h-full" /> : avatarUrl ? <img src={avatarUrl} className="object-cover w-full h-full" /> : null}
              </div>
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-xs text-slate-300 hover:text-white transition-all">
                <FaUpload /> Update Photo
                <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
              </label>
            </div>

            {/* NEW: Resume Upload */}
            <div className="p-4 border border-dashed border-slate-700 rounded-lg bg-slate-950/50 flex flex-col justify-center">
              <label className="block text-xs font-medium text-slate-400 mb-2">Curriculum Vitae (PDF)</label>
              <div className="flex items-center gap-3">
                 <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-xs text-slate-300 hover:text-white transition-all">
                  <FaFilePdf /> {resumeFile ? "File Selected" : "Upload New CV"}
                  <input type="file" accept="application/pdf" onChange={onResumeChange} className="hidden" />
                </label>
                {resumeUrl && !resumeFile && <span className="text-xs text-green-400">Current CV Active</span>}
                {resumeFile && <span className="text-xs text-cyan-400">Ready to upload</span>}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6 border-t border-slate-800 pt-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Projects Manager</h2>
            <button onClick={() => setIsProjectFormOpen(!isProjectFormOpen)} className="flex items-center gap-2 text-sm bg-cyan-900/30 text-cyan-400 px-3 py-1 rounded hover:bg-cyan-900/50 transition-colors"><FaPlus /> Add New</button>
          </div>
          {isProjectFormOpen && (
            <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-4">
              <input placeholder="Project Title" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" value={newProject.title} onChange={(e) => setNewProject({...newProject, title: e.target.value})} />
              <textarea placeholder="Description" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white h-20" value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value})} />
              <div className="grid md:grid-cols-2 gap-4">
                <input placeholder="Tech Stack (comma separated)" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" value={newProject.tech} onChange={(e) => setNewProject({...newProject, tech: e.target.value})} />
                <input placeholder="Project Link (URL)" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" value={newProject.link} onChange={(e) => setNewProject({...newProject, link: e.target.value})} />
              </div>
              <button onClick={handleAddProject} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded">Add to List</button>
            </div>
          )}
          <div className="space-y-3">
            {projects.map((project, index) => (
              <div key={index} className="flex justify-between items-start p-4 bg-slate-950 border border-slate-800 rounded-lg group hover:border-slate-700 transition-colors">
                <div>
                  <h3 className="font-bold text-white flex items-center gap-2">{project.title} <a href={project.link} target="_blank" className="text-slate-500 hover:text-cyan-400"><FaLink size={12}/></a></h3>
                  <p className="text-sm text-slate-400 mt-1 line-clamp-1">{project.description}</p>
                  <div className="flex gap-2 mt-2">{project.techStack.map(t => <span key={t} className="text-[10px] bg-slate-900 text-slate-400 px-1 rounded border border-slate-800">{t}</span>)}</div>
                </div>
                <button onClick={() => handleDeleteProject(index)} className="text-slate-600 hover:text-red-500 transition-colors p-2"><FaTrash /></button>
              </div>
            ))}
            {projects.length === 0 && <p className="text-slate-600 text-sm text-center py-4">No projects added yet.</p>}
          </div>
        </section>
        {message && <div className={`p-3 rounded text-center font-bold ${message.includes('Error') ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}`}>{message}</div>}
        <button onClick={handleUpdate} disabled={loading} className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${loading ? "bg-slate-700 text-slate-400" : "bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:shadow-cyan-500/25"}`}>{loading ? "Saving Everything..." : "Save All Changes"}</button>
      </div>
    </div>
  );
}
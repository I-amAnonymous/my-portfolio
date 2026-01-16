"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  // Form States
  const [fullName, setFullName] = useState("");
  const [roles, setRoles] = useState("");
  const [about, setAbout] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  // NEW: Speed Controls
  const [nameSpeed, setNameSpeed] = useState(60); // Default 60ms
  const [roleSpeed, setRoleSpeed] = useState(4000); // Default 4000ms

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('profile').select('*').limit(1).single();
      if (data) {
        setFullName(data.full_name || "");
        setRoles(data.roles ? data.roles.join(", ") : "");
        setAbout(data.about_text || "");
        // Load speeds from DB
        if (data.name_speed) setNameSpeed(data.name_speed);
        if (data.role_speed) setRoleSpeed(data.role_speed);
      }
    };
    fetchData();
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    setMessage("");
    let avatarUrl = null;

    try {
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `profile-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('images').upload(fileName, avatarFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName);
        avatarUrl = urlData.publicUrl;
      }

      const updates: any = {
        full_name: fullName,
        roles: roles.split(",").map(r => r.trim()),
        about_text: about,
        name_speed: nameSpeed, // Save Name Speed
        role_speed: roleSpeed, // Save Role Speed
      };

      if (avatarUrl) updates.avatar_url = avatarUrl;

      const { data: profile } = await supabase.from('profile').select('id').limit(1).single();
      
      if (profile) {
        const { error } = await supabase.from('profile').update(updates).eq('id', profile.id);
        if (error) throw error;
        setMessage("✅ Profile & Speeds updated successfully!");
      }

    } catch (error: any) {
      console.error(error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 flex flex-col items-center font-sans">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-cyan-400 mb-8 border-b border-slate-800 pb-4">
          Portfolio Control Center
        </h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
            <input className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Roles (Comma separated)</label>
            <input className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none" value={roles} onChange={(e) => setRoles(e.target.value)} />
          </div>

          {/* NEW: Speed Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Name Scramble Interval (ms)</label>
              <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-cyan-500" value={nameSpeed} onChange={(e) => setNameSpeed(Number(e.target.value))} />
              <p className="text-xs text-slate-500 mt-1">5000 = Scramble every 5 seconds</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Role Duration (ms)</label>
              <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-cyan-500" value={roleSpeed} onChange={(e) => setRoleSpeed(Number(e.target.value))} />
              <p className="text-xs text-slate-500 mt-1">4000 = Text stays for 4 seconds</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">About Me</label>
            <textarea className="w-full h-32 bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none" value={about} onChange={(e) => setAbout(e.target.value)} />
          </div>

          <div className="p-4 border border-dashed border-slate-700 rounded-lg bg-slate-950/50">
            <label className="block text-sm font-medium text-slate-400 mb-2">Update Profile Picture</label>
            <input type="file" accept="image/*" className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-900/30 file:text-cyan-400 hover:file:bg-cyan-900/50 cursor-pointer" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
          </div>

          {message && <div className={`p-3 rounded text-sm text-center font-medium ${message.includes('Error') ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}`}>{message}</div>}

          <button onClick={handleUpdate} disabled={loading} className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${loading ? "bg-slate-700 text-slate-400" : "bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:shadow-cyan-500/25"}`}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
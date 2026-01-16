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

  // Fetch existing data on page load
  useEffect(() => {
    const fetchData = async () => {
      // We select the first row (ID=1) since this is a single-user portfolio
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .limit(1)
        .single();

      if (data) {
        setFullName(data.full_name || "");
        setRoles(data.roles ? data.roles.join(", ") : "");
        setAbout(data.about_text || "");
      }
    };
    fetchData();
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    setMessage("");
    let avatarUrl = null;

    try {
      // 1. Upload Image if a new file is selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `profile-${Date.now()}.${fileExt}`;
        
        const { data, error: uploadError } = await supabase.storage
          .from('images')
          .upload(fileName, avatarFile);
        
        if (uploadError) throw uploadError;

        // Get the Public URL
        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(fileName);
        
        avatarUrl = urlData.publicUrl;
      }

      // 2. Prepare Data for Database Update
      const updates: any = {
        full_name: fullName,
        roles: roles.split(",").map(r => r.trim()), // Convert string back to array
        about_text: about,
      };

      if (avatarUrl) updates.avatar_url = avatarUrl;

      // 3. Update the Database row (assuming ID=1 or the first row found)
      // First, get the ID of the existing row
      const { data: profile } = await supabase.from('profile').select('id').limit(1).single();
      
      if (profile) {
        const { error } = await supabase
          .from('profile')
          .update(updates)
          .eq('id', profile.id);

        if (error) throw error;
        setMessage("✅ Profile updated successfully!");
      } else {
        setMessage("❌ No profile found to update. Did you run the SQL setup?");
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
          
          {/* Full Name Input */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
            <input 
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Shafayatur Rahman"
            />
          </div>

          {/* Roles Input */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Roles <span className="text-xs opacity-50">(Comma separated for the typewriter effect)</span>
            </label>
            <input 
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
              value={roles}
              onChange={(e) => setRoles(e.target.value)}
              placeholder="CS Student, Security Enthusiast, Developer"
            />
          </div>

          {/* About Text Area */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">About Me Bio</label>
            <textarea 
              className="w-full h-32 bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all resize-none"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Write something about yourself..."
            />
          </div>

          {/* Image Upload */}
          <div className="p-4 border border-dashed border-slate-700 rounded-lg bg-slate-950/50">
            <label className="block text-sm font-medium text-slate-400 mb-2">Update Profile Picture</label>
            <input 
              type="file"
              accept="image/*"
              className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-900/30 file:text-cyan-400 hover:file:bg-cyan-900/50 cursor-pointer"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
            />
            <p className="text-xs text-slate-500 mt-2">
              Selected: {avatarFile ? avatarFile.name : "No new file selected (Current image will remain)"}
            </p>
          </div>

          {/* Status Message */}
          {message && (
            <div className={`p-3 rounded text-sm text-center font-medium ${message.includes('Error') ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}`}>
              {message}
            </div>
          )}

          {/* Save Button */}
          <button 
            onClick={handleUpdate}
            disabled={loading}
            className={`w-full py-4 rounded-lg font-bold text-lg tracking-wide shadow-lg transition-all 
              ${loading 
                ? "bg-slate-700 text-slate-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 hover:shadow-cyan-500/25"
              }`}
          >
            {loading ? "Uploading & Saving..." : "Save Changes"}
          </button>

        </div>
      </div>
    </div>
  );
}
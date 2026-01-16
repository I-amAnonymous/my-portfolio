"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import Cropper from "react-easy-crop"; // The cropping library
import getCroppedImg from "@/lib/canvasUtils"; // The helper we just made
import { FaUpload, FaCheck } from "react-icons/fa6";; // Icons for UI

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  // Form States
  const [fullName, setFullName] = useState("");
  const [roles, setRoles] = useState("");
  const [about, setAbout] = useState("");
  const [nameSpeed, setNameSpeed] = useState(5000);
  const [roleSpeed, setRoleSpeed] = useState(4000);

  // --- IMAGE & CROPPER STATES ---
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null); // To show current DB image
  const [imageSrc, setImageSrc] = useState<string | null>(null); // The raw image user picked
  const [croppedImageBlob, setCroppedImageBlob] = useState<Blob | null>(null); // The final processed image
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // To show the result on screen

  // Cropper Controls
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  // Fetch Data on Load
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('profile').select('*').limit(1).single();
      if (data) {
        setFullName(data.full_name || "");
        setRoles(data.roles ? data.roles.join(", ") : "");
        setAbout(data.about_text || "");
        setNameSpeed(data.name_speed || 5000);
        setRoleSpeed(data.role_speed || 4000);
        if (data.avatar_url) setAvatarUrl(data.avatar_url);
      }
    };
    fetchData();
  }, []);

  // 1. Handle File Selection
  const onFileChange = async (e: any) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result as string); // Save base64 for cropper
        setIsCropperOpen(true); // Open the modal
      });
      reader.readAsDataURL(file);
    }
  };

  // 2. Track Crop Coordinates
  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // 3. Process the Crop (User clicked "Done")
  const showCroppedImage = async () => {
    try {
      if (!imageSrc || !croppedAreaPixels) return;
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      
      if (croppedBlob) {
        setCroppedImageBlob(croppedBlob);
        setPreviewUrl(URL.createObjectURL(croppedBlob)); // Show preview on Admin page
        setIsCropperOpen(false); // Close modal
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 4. Save to Supabase
  const handleUpdate = async () => {
    setLoading(true);
    setMessage("");
    let finalAvatarUrl = avatarUrl; // Default to existing URL

    try {
      // If user cropped a new image, upload it
      if (croppedImageBlob) {
        const fileName = `avatar-${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(fileName, croppedImageBlob);
        
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(fileName);
        
        finalAvatarUrl = urlData.publicUrl;
      }

      // Update Database
      const updates = {
        full_name: fullName,
        roles: roles.split(",").map(r => r.trim()),
        about_text: about,
        name_speed: nameSpeed,
        role_speed: roleSpeed,
        avatar_url: finalAvatarUrl
      };

      const { data: profile } = await supabase.from('profile').select('id').limit(1).single();
      if (profile) {
        const { error } = await supabase.from('profile').update(updates).eq('id', profile.id);
        if (error) throw error;
        setMessage("✅ Profile updated successfully!");
      }
    } catch (error: any) {
      console.error(error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 flex flex-col items-center font-sans relative">
      
      {/* --- CROPPER MODAL (Pop-up Window) --- */}
      {isCropperOpen && imageSrc && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg h-[400px] bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1} // Force square/circle crop
              cropShape="round" // Visual circle guide
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>

          {/* Controls */}
          <div className="w-full max-w-lg mt-6 bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col gap-4">
            <div className="flex items-center gap-4">
               <span className="text-sm text-slate-400">Zoom</span>
               <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setIsCropperOpen(false)}
                className="flex-1 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={showCroppedImage}
                className="flex-1 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-colors flex items-center justify-center gap-2"
              >
                <FaCheck /> Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}


      {/* --- MAIN DASHBOARD FORM --- */}
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-cyan-400 mb-8 border-b border-slate-800 pb-4">
          Portfolio Control Center
        </h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
            <input className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-cyan-500" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Roles (Comma separated)</label>
            <input className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-cyan-500" value={roles} onChange={(e) => setRoles(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Name Interval (ms)</label>
              <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-cyan-500" value={nameSpeed} onChange={(e) => setNameSpeed(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Role Duration (ms)</label>
              <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-cyan-500" value={roleSpeed} onChange={(e) => setRoleSpeed(Number(e.target.value))} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">About Me</label>
            <textarea className="w-full h-32 bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-cyan-500" value={about} onChange={(e) => setAbout(e.target.value)} />
          </div>

          {/* --- NEW IMAGE UPLOAD SECTION --- */}
          <div className="p-4 border border-dashed border-slate-700 rounded-lg bg-slate-950/50 flex flex-col md:flex-row items-center gap-6">
            
            {/* 1. The Preview Circle */}
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-cyan-500/50 shadow-lg bg-slate-800 flex-shrink-0">
               {previewUrl ? (
                 <img src={previewUrl} alt="New" className="object-cover w-full h-full" />
               ) : avatarUrl ? (
                 <img src={avatarUrl} alt="Current" className="object-cover w-full h-full" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">No Img</div>
               )}
            </div>

            {/* 2. The Upload Button */}
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-slate-400 mb-2">Update Profile Picture</label>
              <div className="relative">
                <input 
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  className="hidden" 
                  id="file-upload"
                />
                <label 
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-all w-full md:w-auto justify-center"
                >
                  <FaUpload /> Choose & Crop Image
                </label>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Click to open the Editor Window. Zoom and pan to fit perfectly.
              </p>
            </div>
          </div>

          {message && <div className={`p-3 rounded text-sm text-center font-medium ${message.includes('Error') ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}`}>{message}</div>}

          <button onClick={handleUpdate} disabled={loading} className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${loading ? "bg-slate-700 text-slate-400" : "bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:shadow-cyan-500/25"}`}>
            {loading ? "Uploading & Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
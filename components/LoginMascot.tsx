"use client";

import { useEffect, useState } from "react";

type MascotProps = {
  focusedInput: "email" | "password" | null;
  textLength: number; 
  isSuccess: boolean; 
};

export default function LoginMascot({ focusedInput, textLength, isSuccess }: MascotProps) {
  const [look, setLook] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (focusedInput === "email") {
      // 1. LOOK DOWN: Fixed Y offset to look at the input box
      const lookDownY = 6; 

      // 2. SCAN X: Map text length to eye movement
      // Range: Start at -6 (Left) and max out at +6 (Right)
      // Eye Radius is 10, Pupil is 4. Max movement is ~6 before clipping.
      const maxMove = 6;
      const startX = -6; 
      const speed = 0.5; // How fast eyes move per character
      
      let nextX = startX + (textLength * speed);
      
      // Clamp the value so it never exceeds +/- 6 (stays inside the eye)
      nextX = Math.min(Math.max(nextX, -maxMove), maxMove);

      setLook({ x: nextX, y: lookDownY });

    } else {
      // Reset to center/forward when not typing email
      setLook({ x: 0, y: 0 });
    }
  }, [focusedInput, textLength]);

  // CSS CLASSES
  const handClass = focusedInput === "password" 
    ? "translate-y-0 opacity-100 duration-300 ease-out" // Hands UP (Cover Eyes)
    : "translate-y-24 opacity-0 duration-200 ease-in"; // Hands DOWN (Hidden)

  const eyeClass = isSuccess 
    ? "scale-110 fill-green-400" 
    : "fill-white";

  return (
    <div className="w-32 h-32 relative mx-auto mb-4">
      <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-2xl">
        
        {/* --- EARS --- */}
        <circle cx="25" cy="25" r="12" className="fill-slate-700" />
        <circle cx="95" cy="25" r="12" className="fill-slate-700" />

        {/* --- HEAD --- */}
        <rect x="10" y="20" width="100" height="90" rx="30" className="fill-slate-800" />
        
        {/* --- MUZZLE AREA --- */}
        <ellipse cx="60" cy="75" rx="25" ry="18" className="fill-slate-900" />
        <path d="M55,70 Q60,80 65,70" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
        <circle cx="60" cy="68" r="5" className="fill-cyan-500" /> {/* Nose */}

        {/* --- EYES CONTAINER --- */}
        <g className="transition-all duration-300">
          
          {/* Eyeballs (White Part) */}
          <circle cx="35" cy="50" r="10" className={`transition-all duration-300 ${eyeClass}`} />
          <circle cx="85" cy="50" r="10" className={`transition-all duration-300 ${eyeClass}`} />

          {/* PUPILS (The moving part) */}
          {!isSuccess && focusedInput !== "password" && (
             <g 
               style={{ transform: `translate(${look.x}px, ${look.y}px)` }} 
               className="transition-transform duration-75 ease-out"
             >
               <circle cx="35" cy="50" r="4" className="fill-slate-900" />
               <circle cx="85" cy="50" r="4" className="fill-slate-900" />
             </g>
          )}

          {/* SUCCESS EYES (Happy Curves) */}
          {isSuccess && (
             <g>
               <path d="M28,52 Q35,42 42,52" fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
               <path d="M78,52 Q85,42 92,52" fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
             </g>
          )}
        </g>

        {/* --- HANDS (Covering Eyes Logic) --- */}
        <g className={`transition-all ${handClass}`}>
           <circle cx="30" cy="50" r="16" className="fill-slate-600 border-2 border-slate-900" />
           <path d="M30,50 L30,120" stroke="#475569" strokeWidth="20" strokeLinecap="round" />
        </g>
        <g className={`transition-all ${handClass}`}>
           <circle cx="90" cy="50" r="16" className="fill-slate-600 border-2 border-slate-900" />
           <path d="M90,50 L90,120" stroke="#475569" strokeWidth="20" strokeLinecap="round" />
        </g>

      </svg>
    </div>
  );
}
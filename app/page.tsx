"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient"; 
import { FaGithub, FaFacebookF, FaInstagram, FaEnvelope, FaLinkedin } from "react-icons/fa6";

// --- 1. DYNAMIC SCRAMBLE TEXT (Name) ---
// 'speed' now controls the INTERVAL (how long to wait before scrambling again)
const ScrambleText = ({ name, speed = 5000 }: { name: string, speed?: number }) => {
  const [text, setText] = useState(name);
  const CYCLES_PER_LETTER = 2;
  const FLIP_SPEED = 60; // Hardcoded "Matrix" speed (fast and cool)
  
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const animate = () => {
      let pos = 0;
      const animationInterval = setInterval(() => {
        const scrambled = name.split("")
          .map((char, index) => {
            if (pos / CYCLES_PER_LETTER > index) return char;
            const randomChars = "01";
            return randomChars[Math.floor(Math.random() * randomChars.length)];
          })
          .join("");

        setText(scrambled);
        pos++;

        if (pos >= name.length * CYCLES_PER_LETTER) {
          clearInterval(animationInterval);
        }
      }, FLIP_SPEED);
    };

    // 1. Run immediately on mount
    animate();

    // 2. Schedule repetition based on 'speed' prop (e.g., 5000ms)
    intervalId = setInterval(() => {
      animate();
    }, speed);

    return () => {
      clearInterval(intervalId);
    };
  }, [name, speed]);

  return (
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 font-mono break-words">
      {text}
    </span>
  );
};

// --- 2. DYNAMIC ROTATE (Roles) ---
const SmoothRotate = ({ words, speed = 4000 }: { words: string[], speed?: number }) => {
  const [index, setIndex] = useState(0);
  const [animationClass, setAnimationClass] = useState("opacity-0 translate-y-4 blur-sm");

  useEffect(() => {
    if (words.length === 0) return;

    // Slide IN
    const entryTimer = setTimeout(() => setAnimationClass("opacity-100 translate-y-0 blur-0"), 100);
    
    // Slide OUT (Dynamic Speed)
    const exitTimer = setTimeout(() => setAnimationClass("opacity-0 -translate-y-4 blur-sm"), speed); 
    
    // NEXT Word (Dynamic Speed + 1s buffer)
    const nextTimer = setTimeout(() => {
      setIndex((prev) => (prev + 1) % words.length);
      setAnimationClass("opacity-0 translate-y-4 blur-sm"); 
    }, speed + 1000); 

    return () => {
      clearTimeout(entryTimer);
      clearTimeout(exitTimer);
      clearTimeout(nextTimer);
    };
  }, [index, words, speed]);

  return (
    <span className={`inline-block transition-all duration-1000 ease-out transform ${animationClass} text-cyan-400 font-bold`}>
      {words[index] || "Loading..."}
    </span>
  );
};

// --- 3. SKILL BADGE COMPONENT ---
const SkillBadge = ({ skill }: { skill: string }) => {
  const [displayText, setDisplayText] = useState(skill);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    let iteration = 0;
    clearInterval(intervalRef.current!);
    intervalRef.current = setInterval(() => {
      setDisplayText((prev) =>
        prev.split("").map((letter, index) => {
            if (index < iteration) return skill[index];
            return Math.floor(Math.random() * 2).toString();
          }).join("")
      );
      if (iteration >= skill.length) clearInterval(intervalRef.current!);
      iteration += 1 / 2;
    }, 30);
  };

  const handleMouseLeave = () => {
    clearInterval(intervalRef.current!);
    setDisplayText(skill);
  };

  return (
    <span 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="px-3 py-1 text-xs font-mono rounded-full border border-slate-700 bg-slate-900/50 text-slate-300 cursor-pointer transition-all duration-300 hover:border-cyan-400 hover:text-cyan-400 hover:shadow-[0_0_10px_rgba(34,211,238,0.3)] hover:bg-slate-800 select-none"
    >
      {displayText}
    </span>
  );
};

const projects = [
  {
    title: "Jersey Shop E-Commerce", 
    description: "A full-stack marketplace featuring a custom Admin Dashboard, coupon system, and real-time inventory management. Built with Supabase for the database and authentication.",
    techStack: ["Next.js", "Supabase", "PostgreSQL", "Tailwind CSS"], 
    link: "https://github.com/I-amAnonymous/jersey-shop",
  },
  {
    title: "Python HIDS & Integrity Checker",
    description: "A Host-based Intrusion Detection System (HIDS) that monitors file integrity in real-time. It detects unauthorized modifications to critical system files using cryptographic hashing.",
    techStack: ["Python", "Cybersecurity", "File Integrity", "Hashing"],
    link: "https://github.com/I-amAnonymous/python-hids-integrity",
  },
];

const socials = [
  { Icon: FaGithub, link: "https://github.com/I-amAnonymous", hoverColor: "hover:bg-slate-700 hover:text-white hover:shadow-slate-500/30" },
  { Icon: FaLinkedin, link: "https://www.linkedin.com/in/shafayatur-rahman-999785287/", hoverColor: "hover:bg-cyan-600 hover:text-white hover:shadow-cyan-500/30" },
  { Icon: FaFacebookF, link: "#", hoverColor: "hover:bg-blue-600 hover:text-white hover:shadow-blue-500/30" },
  { Icon: FaInstagram, link: "#", hoverColor: "hover:bg-pink-600 hover:text-white hover:shadow-pink-500/30" },
  { Icon: FaEnvelope, link: "mailto:shafayaturrahman1@gmail.com", hoverColor: "hover:bg-red-600 hover:text-white hover:shadow-red-500/30" },
];

export default function Home() {
  const [profile, setProfile] = useState({
    full_name: "SHAFAYATUR RAHMAN",
    roles: ["Computer Science Student", "Cybersecurity Enthusiast"],
    about_text: "Loading bio...", 
    avatar_url: "/profile.jpg",
    name_speed: 5000, // Default 5 seconds
    role_speed: 4000  // Default 4 seconds
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase.from('profile').select('*').limit(1).single();
      if (data) {
        setProfile({
          full_name: data.full_name || "SHAFAYATUR RAHMAN",
          roles: data.roles || ["Computer Science Student"],
          about_text: data.about_text || "I am a CS Student...",
          avatar_url: data.avatar_url || "/profile.jpg",
          name_speed: data.name_speed || 5000,
          role_speed: data.role_speed || 4000
        });
      }
    };
    fetchProfile();
  }, []);

  return (
    <main className="flex min-h-[100dvh] flex-col items-center p-6 md:p-24 bg-[#0f172a] overflow-x-hidden">
      
      {/* HERO SECTION */}
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex flex-col-reverse lg:flex-row mb-12 md:mb-24 mt-4 md:mt-10">
        
        {/* Left Side: Text */}
        <div className="text-center lg:text-left lg:w-1/2">
          <p className="mb-4 inline-block border border-slate-700 bg-slate-800 px-3 py-1 rounded-full text-xs font-semibold text-cyan-400">
            Available for hire
          </p>
          
          <h1 className="mb-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-white md:text-6xl min-h-[60px] leading-tight">
             Hi, I'm <br className="md:hidden" />
             {/* name_speed now controls the Interval (e.g. 5000ms) */}
             <ScrambleText name={profile.full_name.toUpperCase()} speed={profile.name_speed} />
          </h1>

          <div className="mb-8 text-base text-slate-400 md:text-xl max-w-2xl min-h-[60px] md:min-h-[80px] flex flex-col justify-center lg:block">
            <p className="mt-2 leading-relaxed">
               I am a <SmoothRotate words={profile.roles} speed={profile.role_speed} />
            </p>
          </div>

          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center lg:justify-start w-full sm:w-auto">
            <a href="#projects" className="w-full sm:w-auto text-center rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors">
              View My Work
            </a>
            <a href="https://github.com/I-amAnonymous" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto text-center rounded-lg border border-slate-700 bg-slate-800 px-6 py-3 text-white font-medium hover:bg-slate-700 transition-colors">
              GitHub Profile
            </a>
          </div>
        </div>
        
        {/* Right Side: Image */}
        <div className="flex relative lg:w-1/2 justify-end items-center flex-col mb-10 lg:mb-0 lg:mt-0">
           <div className="relative w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] flex items-center justify-center">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-80 sm:h-80 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 blur-[50px] sm:blur-[70px] rounded-full"></div>
             <div className="absolute w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] rounded-full border-2 border-cyan-400/50 shadow-[0_0_25px_rgba(34,211,238,0.4)] animate-[spin_12s_linear_infinite]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-cyan-100 rounded-full shadow-[0_0_20px_5px_rgba(34,211,238,0.7)]"></div>
             </div>
             <div className="absolute w-[230px] h-[230px] sm:w-[290px] sm:h-[290px] rounded-full border border-blue-500/30 animate-pulse"></div>
             <div className="relative z-10 w-56 h-56 sm:w-72 sm:h-72 rounded-full border-4 border-slate-800 bg-slate-800 overflow-hidden shadow-2xl">
               <Image src={profile.avatar_url} alt={profile.full_name} fill className="object-cover" priority />
             </div>
           </div>
           <div className="mt-8 flex items-center justify-center gap-3 sm:gap-4 relative z-20 flex-wrap">
             {socials.map((social, index) => (
               <a key={index} href={social.link} target="_blank" rel="noopener noreferrer" className={`p-3 rounded-full bg-slate-800/80 border border-slate-700 text-slate-400 transition-all duration-300 hover:scale-110 hover:shadow-lg ${social.hoverColor}`}>
                 <social.Icon className="w-5 h-5" />
               </a>
             ))}
           </div>
        </div>
      </div>

      <section className="w-full max-w-5xl mb-12 md:mb-24 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center md:text-left">About Me</h2>
          <div className="space-y-4 text-slate-400 leading-relaxed whitespace-pre-wrap text-center md:text-left">
            <p>{profile.about_text}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="p-4 sm:p-6 rounded-xl bg-slate-900 border border-slate-800">
            <h3 className="text-3xl sm:text-4xl font-bold text-cyan-400 mb-2">3+</h3>
            <p className="text-xs sm:text-sm text-slate-500">Years Coding</p>
          </div>
          <div className="p-4 sm:p-6 rounded-xl bg-slate-900 border border-slate-800">
            <h3 className="text-3xl sm:text-4xl font-bold text-blue-500 mb-2">5+</h3>
            <p className="text-xs sm:text-sm text-slate-500">Projects Completed</p>
          </div>
          <div className="col-span-2 p-4 sm:p-6 rounded-xl bg-slate-900 border border-slate-800">
            <h4 className="text-base sm:text-lg font-semibold text-white mb-4">Tech Stack</h4>
            <div className="flex flex-wrap gap-2">
              {["JavaScript (ES6+)", "React & Next.js", "Node.js", "Python", "Supabase", "PostgreSQL", "Tailwind CSS", "Git & GitHub", "Linux / Bash"].map((skill) => (
                <SkillBadge key={skill} skill={skill} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="w-full max-w-5xl">
        <h2 className="mb-8 md:mb-12 text-2xl md:text-3xl font-bold text-white text-center md:text-left">Featured Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <a key={index} href={project.link} target="_blank" rel="noopener noreferrer" className="group block rounded-xl border border-slate-800 bg-slate-900/50 p-6 hover:bg-slate-800/50 hover:border-cyan-500/50 transition-all duration-300">
              <h3 className="mb-2 text-xl font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">{project.title}</h3>
              <p className="mb-4 text-sm text-slate-400">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span key={tech} className="text-xs font-medium text-cyan-200 bg-cyan-900/30 px-2 py-1 rounded">{tech}</span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </section>

      <footer className="w-full max-w-5xl mt-12 md:mt-24 border-t border-slate-800 pt-8 pb-12 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm text-center md:text-left gap-4 md:gap-0">
        <p>© {new Date().getFullYear()} {profile.full_name}. All rights reserved.</p>
        <div className="flex space-x-6">
          <a href="https://github.com/I-amAnonymous" target="_blank" className="hover:text-cyan-400 transition-colors">GitHub</a>
          <a href="https://linkedin.com/in/shafayatur" target="_blank" className="hover:text-cyan-400 transition-colors">LinkedIn</a>
          <a href="mailto:shafayaturrahman1@gmail.com" className="hover:text-cyan-400 transition-colors">Email</a>
        </div>
      </footer>
    </main>
  );
}
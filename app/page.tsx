"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { FaGithub, FaFacebookF, FaInstagram, FaWhatsapp, FaEnvelope, FaLinkedin } from "react-icons/fa6";

// --- 1. THE "HACKER" SCRAMBLE TEXT COMPONENT (Binary Edition) ---
const ScrambleText = () => {
  const [text, setText] = useState("SHAFAYATUR RAHMAN");
  const TARGET_TEXT = "SHAFAYATUR RAHMAN";
  const CYCLES_PER_LETTER = 2;
  const SHUFFLE_TIME = 60;
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let pos = 0;

    intervalRef.current = setInterval(() => {
      const scrambled = TARGET_TEXT.split("")
        .map((char, index) => {
          if (pos / CYCLES_PER_LETTER > index) {
            return char;
          }
          const randomChars = "01";
          return randomChars[Math.floor(Math.random() * randomChars.length)];
        })
        .join("");

      setText(scrambled);
      pos++;

      if (pos >= TARGET_TEXT.length * CYCLES_PER_LETTER) {
        clearInterval(intervalRef.current!);
      }
    }, SHUFFLE_TIME);

    return () => clearInterval(intervalRef.current!);
  }, []);

  return (
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 font-mono">
      {text}
    </span>
  );
};

// --- 2. SMOOTH CINEMATIC ROTATE COMPONENT ---
const SmoothRotate = () => {
  const phrases = [
    "Computer Science Student",
    "Cybersecurity Enthusiast",
    "Critical Thinker",
    "Problem Solver",
    "Full Stack Developer"
  ];
  
  const [index, setIndex] = useState(0);
  const [animationClass, setAnimationClass] = useState("opacity-0 translate-y-4 blur-sm");

  useEffect(() => {
    const entryTimer = setTimeout(() => {
      setAnimationClass("opacity-100 translate-y-0 blur-0");
    }, 100);

    const exitTimer = setTimeout(() => {
      setAnimationClass("opacity-0 -translate-y-4 blur-sm");
    }, 4000); 

    const nextTimer = setTimeout(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
      setAnimationClass("opacity-0 translate-y-4 blur-sm"); 
    }, 5000); 

    return () => {
      clearTimeout(entryTimer);
      clearTimeout(exitTimer);
      clearTimeout(nextTimer);
    };
  }, [index]);

  return (
    <span className={`inline-block transition-all duration-1000 ease-out transform ${animationClass} text-cyan-400 font-bold`}>
      {phrases[index]}
    </span>
  );
};

// --- 3. NEW: SKILL BADGE COMPONENT (Glitch Effect) ---
const SkillBadge = ({ skill }: { skill: string }) => {
  const [displayText, setDisplayText] = useState(skill);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    let iteration = 0;
    clearInterval(intervalRef.current!);

    intervalRef.current = setInterval(() => {
      setDisplayText((prev) =>
        prev
          .split("")
          .map((letter, index) => {
            if (index < iteration) {
              return skill[index];
            }
            return Math.floor(Math.random() * 2).toString(); // Return 0 or 1
          })
          .join("")
      );

      if (iteration >= skill.length) {
        clearInterval(intervalRef.current!);
      }

      iteration += 1 / 2; // Speed of decoding
    }, 30);
  };

  const handleMouseLeave = () => {
    clearInterval(intervalRef.current!);
    setDisplayText(skill); // Reset instantly on leave
  };

  return (
    <span 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="px-3 py-1 text-xs font-mono rounded-full border border-slate-700 bg-slate-900/50 text-slate-300 cursor-pointer transition-all duration-300 hover:border-cyan-400 hover:text-cyan-400 hover:shadow-[0_0_10px_rgba(34,211,238,0.3)] hover:bg-slate-800"
    >
      {displayText}
    </span>
  );
};

// --- 4. DATA ---
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
  { 
    Icon: FaGithub, 
    link: "https://github.com/I-amAnonymous", 
    hoverColor: "hover:bg-slate-700 hover:text-white hover:shadow-slate-500/30" 
  },
  { 
    Icon: FaLinkedin, 
    link: "https://www.linkedin.com/in/shafayatur-rahman-999785287/", 
    hoverColor: "hover:bg-cyan-600 hover:text-white hover:shadow-green-500/30" 
  },
  { 
    Icon: FaFacebookF, 
    link: "#", 
    hoverColor: "hover:bg-blue-600 hover:text-white hover:shadow-blue-500/30" 
  },
  { 
    Icon: FaInstagram, 
    link: "#", 
    hoverColor: "hover:bg-pink-600 hover:text-white hover:shadow-pink-500/30" 
  },
  { 
    Icon: FaEnvelope, 
    link: "mailto:shafayaturrahman1@gmail.com", 
    hoverColor: "hover:bg-red-600 hover:text-white hover:shadow-red-500/30"
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-24 bg-[#0f172a] overflow-hidden">
      
      {/* --- HERO SECTION --- */}
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex mb-24 mt-10">
        <div className="text-center lg:text-left lg:w-1/2">
          <p className="mb-4 inline-block border border-slate-700 bg-slate-800 px-3 py-1 rounded-full text-xs font-semibold text-cyan-400">
            Available for hire
          </p>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white md:text-6xl min-h-[60px]">
             Hi, I'm <br className="md:hidden" />
             <ScrambleText />
          </h1>
          <div className="mb-8 text-lg text-slate-400 md:text-xl max-w-2xl min-h-[80px] flex flex-col justify-center lg:block">
            <p className="mt-2 leading-relaxed">
               I am a <SmoothRotate />
            </p>
          </div>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center lg:justify-start">
            <a href="#projects" className="rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors">
              View My Work
            </a>
            <a href="https://github.com/I-amAnonymous" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-slate-700 bg-slate-800 px-6 py-3 text-white font-medium hover:bg-slate-700 transition-colors">
              GitHub Profile
            </a>
          </div>
        </div>
        
        {/* --- RIGHT SIDE: IMAGE & SOCIALS --- */}
        <div className="hidden lg:flex relative lg:w-1/2 justify-end items-center flex-col mt-12 lg:mt-0">
           
           {/* Image Container Stack */}
           {/* Width and Height reduced back to 350px from 350px for tighter spacing */}
           <div className="relative w-[350px] h-[350px] flex items-center justify-center">
             
             {/* 1. Background Ambience (Reduced back to w-80 h-80) */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 blur-[70px] rounded-full"></div>
             
             {/* 2. The Outer GLOWING Scanner Ring (Reduced back to 300px) */}
             <div className="absolute w-[300px] h-[300px] rounded-full border-2 border-cyan-400/50 shadow-[0_0_25px_rgba(34,211,238,0.4)] animate-[spin_12s_linear_infinite]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-cyan-100 rounded-full shadow-[0_0_20px_5px_rgba(34,211,238,0.7)]"></div>
             </div>

             {/* 3. The Inner Pulsing Ring (Reduced back to 290px) */}
             <div className="absolute w-[290px] h-[290px] rounded-full border border-blue-500/30 animate-pulse"></div>

             {/* 4. The Actual Image (Stays 72/72) */}
             <div className="relative z-10 h-72 w-72 rounded-full border-4 border-slate-800 bg-slate-800 overflow-hidden shadow-2xl">
               <Image src="/profile.jpg" alt="Shafayatur Rahman" fill className="object-cover" priority />
             </div>
           </div>

           {/* Social Icons */}
           <div className="mt-8 flex items-center justify-center gap-4 relative z-20">
             {socials.map((social, index) => (
               <a key={index} href={social.link} target="_blank" rel="noopener noreferrer" className={`p-3 rounded-full bg-slate-800/80 border border-slate-700 text-slate-400 transition-all duration-300 hover:scale-110 hover:shadow-lg ${social.hoverColor}`}>
                 <social.Icon className="w-5 h-5" />
               </a>
             ))}
           </div>
        </div>
      </div>

      {/* --- ABOUT SECTION --- */}
      <section className="w-full max-w-5xl mb-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-6">About Me</h2>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>I am a final-year Computer Science student at <strong className="text-cyan-400">BRAC University</strong>, passionate about bridging the gap between software development and system security.</p>
            <p>My journey involves more than just building websites; I focus on understanding the underlying systems. Whether I am architecting a full-stack e-commerce platform with <strong className="text-white">Next.js</strong> or writing Python scripts to <strong className="text-white">detect system intrusions</strong>, I enjoy solving complex engineering problems.</p>
            <p>When I'm not coding, I'm usually exploring Linux internals, learning about network security, or preparing for my next hackathon.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
            <h3 className="text-4xl font-bold text-cyan-400 mb-2">3+</h3>
            <p className="text-sm text-slate-500">Years Coding</p>
          </div>
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
            <h3 className="text-4xl font-bold text-blue-500 mb-2">5+</h3>
            <p className="text-sm text-slate-500">Projects Completed</p>
          </div>
          <div className="col-span-2 p-6 rounded-xl bg-slate-900 border border-slate-800">
            <h4 className="text-lg font-semibold text-white mb-4">Tech Stack</h4>
            
            {/* DYNAMIC TECH STACK BADGES */}
            <div className="flex flex-wrap gap-2">
              {[
                "JavaScript (ES6+)", "React & Next.js", "Node.js", "Python", 
                "Supabase", "PostgreSQL", "Tailwind CSS", "Git & GitHub", "Linux / Bash"
              ].map((skill) => (
                <SkillBadge key={skill} skill={skill} />
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* --- PROJECTS SECTION --- */}
      <section id="projects" className="w-full max-w-5xl">
        <h2 className="mb-12 text-3xl font-bold text-white text-center lg:text-left">Featured Projects</h2>
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

      {/* --- FOOTER --- */}
      <footer className="w-full max-w-5xl mt-24 border-t border-slate-800 pt-8 pb-12 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} Shafayatur Rahman. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="https://github.com/I-amAnonymous" target="_blank" className="hover:text-cyan-400 transition-colors">GitHub</a>
          <a href="https://linkedin.com/in/shafayatur" target="_blank" className="hover:text-cyan-400 transition-colors">LinkedIn</a>
          <a href="mailto:shafayaturrahman1@gmail.com" className="hover:text-cyan-400 transition-colors">Email</a>
        </div>
      </footer>
    </main>
  );
}
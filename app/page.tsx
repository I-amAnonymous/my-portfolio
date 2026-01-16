"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";

// --- 1. THE "HACKER" SCRAMBLE TEXT COMPONENT (Binary Edition) ---
const ScrambleText = () => {
  const [text, setText] = useState("SHAFAYATUR RAHMAN");
  const TARGET_TEXT = "SHAFAYATUR RAHMAN";
  const CYCLES_PER_LETTER = 2;
  const SHUFFLE_TIME = 60; // Slower shuffle (was 40)
  
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

// --- 2. SMOOTH CINEMATIC ROTATE COMPONENT (Slower & Smoother) ---
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
    // 1. Trigger Entry Animation (Slide Up + Fade In)
    const entryTimer = setTimeout(() => {
      setAnimationClass("opacity-100 translate-y-0 blur-0");
    }, 100);

    // 2. Trigger Exit Animation (Slide Up + Fade Out)
    // STAY VISIBLE LONGER: Increased to 4000ms (4 seconds)
    const exitTimer = setTimeout(() => {
      setAnimationClass("opacity-0 -translate-y-4 blur-sm");
    }, 4000); 

    // 3. Change Text & Reset Position
    // CYCLE TOTAL TIME: Increased to 5000ms (5 seconds)
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
    // SLOWER MOVEMENT: changed duration-700 to duration-1000
    <span className={`inline-block transition-all duration-1000 ease-out transform ${animationClass} text-cyan-400 font-bold`}>
      {phrases[index]}
    </span>
  );
};

// --- 3. THE DATA ---
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

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-24 bg-[#0f172a] overflow-hidden">
      
      {/* --- HERO SECTION --- */}
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex mb-24 mt-10">
        
        {/* Text Content */}
        <div className="text-center lg:text-left lg:w-1/2">
          <p className="mb-4 inline-block border border-slate-700 bg-slate-800 px-3 py-1 rounded-full text-xs font-semibold text-cyan-400">
            Available for hire
          </p>
          
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white md:text-6xl min-h-[60px]">
             Hi, I'm <br className="md:hidden" />
             <ScrambleText />
          </h1>

          {/* DYNAMIC DESCRIPTION SECTION */}
          <div className="mb-8 text-lg text-slate-400 md:text-xl max-w-2xl min-h-[80px] flex flex-col justify-center lg:block">
            <p className="mt-2 leading-relaxed">
               I am a <SmoothRotate />
            </p>
          </div>

          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center lg:justify-start">
            <a 
              href="#projects" 
              className="rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              View My Work
            </a>
            <a 
              href="https://github.com/I-amAnonymous" 
              target="_blank"
              rel="noopener noreferrer" 
              className="rounded-lg border border-slate-700 bg-slate-800 px-6 py-3 text-white font-medium hover:bg-slate-700 transition-colors"
            >
              GitHub Profile
            </a>
          </div>
        </div>
        
        {/* --- DYNAMIC PROFILE PICTURE SECTION --- */}
        <div className="hidden lg:block relative lg:w-1/2 flex justify-end items-center">
           
           {/* 1. Background Ambience */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-cyan-500/30 to-blue-500/30 blur-[60px] rounded-full"></div>
           
           {/* 2. The Outer GLOWING Scanner Ring */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border-2 border-cyan-400/60 shadow-[0_0_20px_rgba(34,211,238,0.5)] animate-[spin_10s_linear_infinite]">
              {/* The glowing dot on the ring */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyan-100 rounded-full shadow-[0_0_15px_4px_rgba(34,211,238,0.8)]"></div>
           </div>

           {/* 3. The Inner Pulsing Ring */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[290px] h-[290px] rounded-full border border-blue-500/30 animate-pulse"></div>

           {/* 4. The Actual Image Container */}
           <div className="relative z-10 mx-auto h-72 w-72 rounded-full border-4 border-slate-800 bg-slate-800 overflow-hidden shadow-2xl">
             <Image 
               src="/profile.jpg" 
               alt="Shafayatur Rahman"
               fill
               className="object-cover"
               priority
             />
           </div>
        </div>

      </div>

      {/* --- ABOUT SECTION --- */}
      <section className="w-full max-w-5xl mb-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-6">About Me</h2>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              I am a final-year Computer Science student at <strong className="text-cyan-400">BRAC University</strong>, 
              passionate about bridging the gap between software development and system security.
            </p>
            <p>
              My journey involves more than just building websites; I focus on understanding the underlying systems. 
              Whether I am architecting a full-stack e-commerce platform with <strong className="text-white">Next.js</strong> or 
              writing Python scripts to <strong className="text-white">detect system intrusions</strong>, I enjoy solving complex engineering problems.
            </p>
            <p>
              When I'm not coding, I'm usually exploring Linux internals, learning about network security, or preparing for my next hackathon.
            </p>
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
            <div className="flex flex-wrap gap-2">
              {[
                "JavaScript (ES6+)", 
                "React & Next.js", 
                "Node.js", 
                "Python", 
                "Supabase", 
                "PostgreSQL", 
                "Tailwind CSS",
                "Git & GitHub",
                "Linux / Bash"
              ].map((skill) => (
                <span key={skill} className="px-3 py-1 text-xs rounded-full border border-slate-700 text-slate-300">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- PROJECTS SECTION --- */}
      <section id="projects" className="w-full max-w-5xl">
        <h2 className="mb-12 text-3xl font-bold text-white text-center lg:text-left">
          Featured Projects
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <a 
              key={index} 
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-xl border border-slate-800 bg-slate-900/50 p-6 hover:bg-slate-800/50 hover:border-cyan-500/50 transition-all duration-300"
            >
              <h3 className="mb-2 text-xl font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
                {project.title}
              </h3>
              <p className="mb-4 text-sm text-slate-400">
                {project.description}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span key={tech} className="text-xs font-medium text-cyan-200 bg-cyan-900/30 px-2 py-1 rounded">
                    {tech}
                  </span>
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
          <a href="https://github.com/I-amAnonymous" target="_blank" className="hover:text-cyan-400 transition-colors">
            GitHub
          </a>
          <a href="https://linkedin.com/in/shafayatur" target="_blank" className="hover:text-cyan-400 transition-colors">
            LinkedIn
          </a>
          <a href="mailto:shafayaturrahman1@gmail.com" className="hover:text-cyan-400 transition-colors">
            Email
          </a>
        </div>
      </footer>

    </main>
  );
}
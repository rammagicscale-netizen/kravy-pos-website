"use client";

import React from "react";
import { 
  ShieldCheck, 
  Lock, 
  Users, 
  Database, 
  ArrowRight, 
  CheckCircle2, 
  ShieldAlert,
  Zap,
  Layout,
  Server,
  Share2,
  Code,
  Key,
  Eye,
  Activity,
  UserCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function StaffAccessDocsPage() {
  const { user } = useUser();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (user) {
      fetch("/api/user/me")
        .then(res => res.json())
        .then(data => {
          if (data.role === "ADMIN") {
            setIsAdmin(true);
          } else {
            router.push("/dashboard");
          }
        })
        .catch(() => router.push("/dashboard"));
    }
  }, [user, router]);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const sections = [
    {
      title: "1. Core Architecture (Buniyad)",
      icon: <Server className="text-indigo-500" size={24} />,
      content: "Kravy POS ek 'Seller-Centric' data scoping model use karta hai. Sab kuch Seller (Owner) ke account ke gird ghoomta hai.",
      hinglish: "Iska matlab hai ki data hamesha 'Owner' ke account se linked hota hai. Staff sirf wahi dekh sakta hai jo Owner allow karta hai.",
      points: [
        "getEffectiveClerkId() function automatically detect karta hai user role.",
        "Internal routing: Staff requests silently redirect hoti hain owner context mein.",
        "Isolation Guarantee: Ek seller ka staff kabhi doosre seller ka data nahi dekh payega."
      ]
    },
    {
      title: "2. Identity Mapping (Pehchaan)",
      icon: <UserCheck className="text-orange-500" size={24} />,
      content: "Staff members have their own logins but act on a shared business context.",
      hinglish: "Staff member ki apni identity hoti hai for login, par jab wo order leta hai ya bill banata hai, database mein Owner ka context use hota hai.",
      points: [
        "Clerk ID usage: Login authentication ke liye Clerk ID use hota hai.",
        "Owner ID mapping: Database mein hum `ownerId` field se tracking karte hain.",
        "Role-Based Visibility: UI bits toggle hote hain backend permissions ke base pe."
      ]
    },
    {
      title: "3. Access Control Terminal",
      icon: <Zap className="text-emerald-500" size={24} />,
      content: "Sellers have ultimate control over their staff's digital workspace.",
      hinglish: "Seller dashboard se on-the-fly permissions badal sakta hai. Bina server restart ya code change ke permissions update ho jati hain.",
      points: [
        "Live Permission Toggles: Visibility settings instant apply hoti hain.",
        "Password Resets: Staff password sync directly with Clerk API.",
        "Allowed Paths System: Frontend sidebar dynamically filter hota hai user settings se."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Header Section */}
        <header className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-200"
          >
            <ShieldCheck size={14} /> Master technical docs
          </motion.div>
          <div className="space-y-2">
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">
              Staff Access <span className="text-indigo-600">Deep-Dive</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium max-w-3xl leading-relaxed italic">
              A comprehensive technical guide to Kravy POS security, identity resolution, and data isolation strategies.
            </p>
          </div>
        </header>

        {/* Deep Logic Section (The Code Part) */}
        <div className="grid lg:grid-cols-2 gap-10">
           <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                <Code size={120} />
              </div>
              
              <h2 className="text-3xl font-black mb-6 flex items-center gap-4">
                 <Lock className="text-indigo-400" />
                 Logic: getEffectiveClerkId()
              </h2>
              
              <p className="text-slate-400 font-medium mb-8 leading-relaxed">
                 Kravy POS ka sabse important backend security layer. Yeh function decide karta hai ki database query kiske account ke liye execute hogi.
              </p>

              <div className="space-y-6">
                 <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                    <div className="text-xs font-black uppercase text-indigo-400 mb-2">Algorithm Flow</div>
                    <ol className="space-y-3 text-sm font-bold">
                       <li className="flex gap-3"><span className="text-white/30">01</span> Pehle current login ID check karo.</li>
                       <li className="flex gap-3"><span className="text-white/30">02</span> DB mein dekho is user ka koi 'Owner' hai?</li>
                       <li className="flex gap-3"><span className="text-white/30">03</span> Agar Role = Staff, toh Owner ki ID return karo.</li>
                       <li className="flex gap-3"><span className="text-white/30">04</span> Har database call mein yeh ID context ki tarah use hogi.</li>
                    </ol>
                 </div>
                 
                 <div className="flex items-center gap-3 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                    <ShieldAlert className="text-indigo-400 shrink-0" size={20} />
                    <p className="text-[10px] font-bold text-indigo-200">
                      TECHNICAL SECURITY: Is logic se data leaks impossible hain kyunki staff member ke paas kabhi power hi nahi hoti owner ID override karne ki.
                    </p>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 flex flex-col justify-center shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                <Layout size={150} />
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-6 flex items-center gap-4">
                 <Eye className="text-orange-500" />
                 Hinglish Overview
              </h2>
              <div className="space-y-6 text-slate-600">
                 <p className="font-bold text-lg leading-relaxed">
                    Simple bhasha mein: Staff member login to abhi bhi apni email se hi karta hai, lekin billing aur menu management mein uski powers limited hoti hain.
                 </p>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <div className="text-[10px] font-black uppercase text-slate-400 mb-1">Staff Access</div>
                       <div className="text-sm font-black text-slate-900">Only Operations</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <div className="text-[10px] font-black uppercase text-slate-400 mb-1">Owner Control</div>
                       <div className="text-sm font-black text-slate-900">Full Visibility</div>
                    </div>
                 </div>
                 <p className="text-sm italic font-medium leading-relaxed">
                    "Owner can control visibility of almost 20+ modules from the access control terminal. Instant sync ensures system security remains robust."
                 </p>
              </div>
           </div>
        </div>

        {/* Detailed Sections Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {sections.map((section, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm hover:shadow-2xl transition-all group"
            >
              <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
                 {section.icon}
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">{section.title}</h3>
              <p className="text-sm text-slate-500 font-medium mb-4 leading-relaxed line-clamp-2">
                {section.content}
              </p>
              <div className="p-4 bg-indigo-50/50 rounded-2xl mb-8">
                 <div className="text-[10px] font-black uppercase text-indigo-400 mb-2">Deep Note (Hinglish)</div>
                 <p className="text-xs text-indigo-900 font-bold leading-relaxed">{section.hinglish}</p>
              </div>
              <ul className="space-y-4">
                 {section.points.map((pt, j) => (
                   <li key={j} className="flex items-start gap-3 text-[11px] font-black text-slate-700 leading-tight">
                      <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                      {pt}
                   </li>
                 ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Audit & Logs */}
        <div className="bg-slate-50 rounded-[3rem] p-12 border border-slate-200 flex flex-col md:flex-row items-center gap-12">
           <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                <Activity size={14} /> Audit Trail Monitoring
              </div>
              <h2 className="text-4xl font-black text-slate-900 leading-tight">Activity Logging for <span className="text-indigo-600">Total Transparency.</span></h2>
              <p className="text-slate-600 font-medium text-lg leading-relaxed">
                System har action (create/edit/delete) track karta hai. Log list mein exact user ID store hoti hai, par Owner in logs ko view kar sakta hai pure business context mein.
              </p>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Secure Logging</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">DB Persisted</span>
                 </div>
              </div>
           </div>
           <div className="w-full md:w-[400px] aspect-square bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden p-8 flex flex-col gap-4">
              <div className="h-4 bg-slate-100 rounded-full w-3/4"></div>
              <div className="h-4 bg-slate-50 rounded-full w-full"></div>
              <div className="h-4 bg-slate-100 rounded-full w-1/2"></div>
              <div className="flex-1 border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-center">
                 <Activity className="text-slate-100" size={100} />
              </div>
           </div>
        </div>

        {/* Documentation Footer */}
        <footer className="pt-20 pb-10 flex flex-col items-center text-center space-y-8 border-t border-slate-200">
           <div className="w-16 h-16 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-200">
              <ShieldCheck size={32} />
           </div>
           <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900">End of Technical Overview</h3>
              <p className="text-slate-500 font-medium">Have questions? Contact the terminal development team.</p>
           </div>
           <div className="flex gap-4">
             <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-slate-200 group flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95">
               <Share2 size={14} className="group-hover:rotate-12 transition-transform" /> Print Technical Spec
             </button>
             <button onClick={() => router.push("/dashboard/help")} className="px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all flex items-center gap-2">
               <Book size={14} /> Back to Help Center
             </button>
           </div>
        </footer>

      </div>
    </div>
  );
}

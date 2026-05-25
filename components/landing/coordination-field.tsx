"use client";

import { motion } from "framer-motion";

const nodes = [
  "left-[14%] top-[24%]",
  "left-[39%] top-[18%]",
  "right-[18%] top-[31%]",
  "left-[23%] bottom-[24%]",
  "right-[28%] bottom-[30%]",
];

export function CoordinationField() {
  return (
    <div className="pointer-events-none absolute inset-x-5 top-8 h-[72%] overflow-hidden rounded-lg border border-white/[0.06] bg-graphite-900/35">
      <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(156,45,255,0.16)_0%,transparent_34%,rgba(45,136,255,0.14)_58%,rgba(56,231,255,0.14)_100%)]" />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0_39px,rgba(255,255,255,0.045)_40px),repeating-linear-gradient(90deg,transparent_0_39px,rgba(56,231,255,0.035)_40px)]" />

      <motion.div
        aria-hidden="true"
        className="absolute left-[12%] top-[20%] h-px w-[76%] bg-gradient-to-r from-transparent via-aurora-300/50 to-transparent"
        animate={{ opacity: [0.22, 0.72, 0.28] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute left-[22%] top-[54%] h-px w-[56%] bg-gradient-to-r from-transparent via-aurora-600/40 to-transparent"
        animate={{ opacity: [0.18, 0.58, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute left-[18%] top-[20%] h-[34%] w-px bg-aurora-300/28" />
      <div className="absolute right-[24%] top-[20%] h-[34%] w-px bg-white/12" />

      {nodes.map((position, index) => (
        <motion.span
          key={position}
          aria-hidden="true"
          className={`absolute ${position} h-2.5 w-2.5 rounded-[2px] border border-cyan-200/50 bg-aurora-400/25 shadow-aurora-soft`}
          animate={{ opacity: [0.35, 1, 0.35], scale: [1, 1.18, 1] }}
          transition={{
            duration: 3.2,
            delay: index * 0.28,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

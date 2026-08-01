import React from 'react';
import { RadioTower, Wifi, Phone, Signal, Globe } from 'lucide-react';

export const NetworkBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-slate-50 dark:bg-slate-950 bg-sky-gradient transform-gpu">
      <div className="absolute inset-0 bg-network-pattern opacity-40 dark:opacity-20 pointer-events-none" />
      
      {/* Interconnected Constellation Mesh SVG */}
      <svg className="absolute inset-0 w-full h-full opacity-30 dark:opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="netGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Constellation Lines */}
        <line x1="10%" y1="15%" x2="35%" y2="25%" stroke="url(#netGrad1)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="35%" y1="25%" x2="60%" y2="15%" stroke="url(#netGrad1)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="60%" y1="15%" x2="85%" y2="25%" stroke="url(#netGrad1)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="35%" y1="25%" x2="50%" y2="50%" stroke="url(#netGrad1)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="50%" y1="50%" x2="20%" y2="70%" stroke="url(#netGrad1)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="50%" y1="50%" x2="80%" y2="75%" stroke="url(#netGrad1)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="20%" y1="70%" x2="45%" y2="85%" stroke="url(#netGrad1)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="80%" y1="75%" x2="45%" y2="85%" stroke="url(#netGrad1)" strokeWidth="1" strokeDasharray="4 4" />

        {/* Node Points */}
        {[
          { x: '10%', y: '15%' },
          { x: '35%', y: '25%' },
          { x: '60%', y: '15%' },
          { x: '85%', y: '25%' },
          { x: '50%', y: '50%' },
          { x: '20%', y: '70%' },
          { x: '80%', y: '75%' },
          { x: '45%', y: '85%' },
        ].map((node, i) => (
          <g key={i}>
            <circle cx={node.x} cy={node.y} r="5" fill="#38BDF8" opacity="0.6" />
            <circle cx={node.x} cy={node.y} r="2" fill="#FFFFFF" />
          </g>
        ))}
      </svg>
      
      {/* Floating Subtle Ambient Icons */}
      <div className="absolute top-[10%] left-[10%] text-sky-500/10 dark:text-sky-400/5 pointer-events-none">
        <RadioTower size={120} strokeWidth={1} />
      </div>
      <div className="absolute top-[20%] right-[15%] text-blue-500/10 dark:text-blue-400/5 pointer-events-none">
        <Wifi size={100} strokeWidth={1} />
      </div>
      <div className="absolute bottom-[30%] left-[20%] text-indigo-500/10 dark:text-indigo-400/5 pointer-events-none">
        <Signal size={140} strokeWidth={1} />
      </div>
      <div className="absolute bottom-[10%] right-[25%] text-cyan-500/10 dark:text-cyan-400/5 pointer-events-none">
        <Phone size={90} strokeWidth={1} />
      </div>
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 text-sky-600/5 dark:text-sky-300/5 pointer-events-none">
        <Globe size={250} strokeWidth={0.5} />
      </div>
      
      {/* Subtle Network Nodes */}
      <div className="absolute top-[30%] left-[40%] w-3 h-3 rounded-full bg-sky-400/20" />
      <div className="absolute bottom-[40%] right-[30%] w-4 h-4 rounded-full bg-blue-400/20" />
      <div className="absolute top-[60%] left-[60%] w-2 h-2 rounded-full bg-indigo-400/20" />
    </div>
  );
};

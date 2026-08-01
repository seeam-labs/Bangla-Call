import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, Minimize2, ChevronDown, ChevronUp, Share2 } from 'lucide-react';
import { Language } from '../types';
import { useToast } from './Toast';
import { copyToClipboard } from '../lib/clipboard';

interface WidgetProps {
  id: string;
  titleBn: string;
  titleEn: string;
  icon: React.ReactNode;
  lang: Language;
  children: React.ReactNode;
  className?: string;
  defaultCollapsed?: boolean;
}

export const Widget: React.FC<WidgetProps> = ({ id, titleBn, titleEn, icon, lang, children, className = '', defaultCollapsed = false }) => {
  const isBn = lang === 'bn';
  const { showToast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);

  useEffect(() => {
    setIsCollapsed(defaultCollapsed);
  }, [defaultCollapsed]);
  
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === `#${id}`) {
        setIsHighlighted(true);
        setIsCollapsed(false);
        setTimeout(() => setIsHighlighted(false), 3000);
        
        // Scroll into view
        setTimeout(() => {
          widgetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    };

    handleHashChange(); // Check on mount
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [id]);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    copyToClipboard(url).then(() => {
      showToast(
        isBn ? 'লিঙ্ক কপি করা হয়েছে' : 'Link Copied',
        isBn ? 'উইজেটের লিঙ্ক ক্লিপবোর্ডে কপি করা হয়েছে' : 'Widget link copied to clipboard',
        'success'
      );
    });
  };

  const handleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMaximized(!isMaximized);
    if (!isMaximized) {
      setIsCollapsed(false);
    }
  };

  const handleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isMaximized) {
      setIsCollapsed(!isCollapsed);
    }
  };

  // Base classes for the widget container
  const baseClasses = `bg-white dark:bg-slate-900 rounded-2xl border ${
    isHighlighted ? 'border-brand-primary shadow-[0_0_15px_rgba(14,165,233,0.5)]' : 'border-slate-200 dark:border-slate-800'
  } overflow-hidden flex flex-col transition-all duration-300 shadow-sm hover:shadow-md w-full min-w-0 max-w-full ${className}`;

  if (isMaximized) {
    return (
      <>
        {/* Placeholder in the grid to maintain layout */}
        <div className={className} style={{ minHeight: '200px' }} />
        
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            onClick={() => setIsMaximized(false)}
          />
          
          {/* Maximized Widget */}
          <motion.div
            layoutId={`widget-${id}`}
            className="relative z-10 w-full h-full max-w-7xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="text-brand-primary/80 flex items-center">{icon}</div>
                <h3 className="font-medium text-sm text-slate-700 dark:text-slate-200">
                  {isBn ? titleBn : titleEn}
                </h3>
              </div>
              
              <div className="flex items-center gap-1">
                <button onClick={handleShare} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded transition-colors" title="Share">
                  <Share2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={handleMaximize} className="p-1 text-brand-primary rounded transition-colors" title="Restore">
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
              {children}
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <motion.div
      id={id}
      layoutId={`widget-${id}`}
      ref={widgetRef}
      className={baseClasses}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-colors cursor-pointer select-none group"
        onClick={handleCollapse}
      >
        <div className="flex items-center gap-2">
          <div className="text-brand-primary/80 flex items-center">{icon}</div>
          <h3 className="font-medium text-sm text-slate-700 dark:text-slate-200 group-hover:text-brand-primary transition-colors">
            {isBn ? titleBn : titleEn}
          </h3>
        </div>
        
        <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
          <button onClick={handleShare} className="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-md transition-colors" title="Share">
            <Share2 className="w-4 h-4" />
          </button>
          <button onClick={handleMaximize} className="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-md transition-colors" title="Maximize">
            <Maximize2 className="w-4 h-4" />
          </button>
          <button onClick={handleCollapse} className="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-md transition-colors" title={isCollapsed ? "Expand" : "Collapse"}>
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>
      
      {/* Content */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="h-full flex flex-col relative w-full min-w-0 max-w-full">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

import React from 'react';
import { Rabbit, Sparkles, MessageCircle } from 'lucide-react';

export const Logo: React.FC = () => {
  return (
    <div className="relative group/logo">
        {/* Animated Container */}
        <div className="bg-gradient-to-br from-rose-500 to-red-600 dark:from-indigo-600 dark:to-purple-800 p-2.5 rounded-2xl shadow-lg shadow-rose-500/30 dark:shadow-indigo-500/30 text-white transform group-hover/logo:scale-110 transition-all duration-300 z-10 relative flex items-center justify-center">
            {/* Base Icon: Rabbit for "Small Animal" + "Agile Miner" metaphor */}
            <Rabbit className="w-6 h-6 fill-white/10" />
            
            {/* Overlay Icon: Sparkles for "Magic/AI" */}
            <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 fill-yellow-300 animate-pulse" />
            
            {/* Overlay Icon: Message for "Comments" */}
            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-0.5 shadow-sm">
                <MessageCircle className="w-3 h-3 text-rose-500 dark:text-indigo-500" />
            </div>
        </div>
    </div>
  );
};

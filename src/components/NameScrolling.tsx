import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Guide } from '../types';

interface NameScrollingProps {
  guides: Guide[];
  isScrolling: boolean;
  onComplete: (winners: Guide[]) => void;
  winnerCount: number;
}

export const NameScrolling: React.FC<NameScrollingProps> = ({
  guides,
  isScrolling,
  onComplete,
  winnerCount
}) => {
  const [currentName, setCurrentName] = useState('');
  const [phase, setPhase] = useState<'delay' | 'scrolling' | 'slowing'>('delay');
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    if (!isScrolling || guides.length === 0) return;

    setPhase('delay');
    setTimeLeft(10);
    setCurrentName('Get ready for the magic...');

    // Countdown phase
    const countdownInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setPhase('scrolling');
          startScrolling();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const startScrolling = () => {
      let nameIndex = 0;
      let speed = 50;
      
      const scrollNames = () => {
        setCurrentName(guides[nameIndex].name);
        nameIndex = (nameIndex + 1) % guides.length;
        
        // Gradually slow down after 3 seconds
        if (speed < 300) {
          speed = Math.min(speed + 8, 300);
        }
        
        const timer = setTimeout(scrollNames, speed);
        
        // Stop after reaching max speed and select winners
        if (speed >= 300) {
          setPhase('slowing');
          clearTimeout(timer);
          setTimeout(() => {
            // Weighted random selection logic
            const winners: Guide[] = [];
            const availableGuides = [...guides];
            
            for (let i = 0; i < winnerCount && availableGuides.length > 0; i++) {
              const totalWeight = availableGuides.reduce((sum, guide) => sum + guide.totalTickets, 0);
              let random = Math.random() * totalWeight;
              
              let selectedIndex = 0;
              for (let j = 0; j < availableGuides.length; j++) {
                random -= availableGuides[j].totalTickets;
                if (random <= 0) {
                  selectedIndex = j;
                  break;
                }
              }
              
              const winner = availableGuides.splice(selectedIndex, 1)[0];
              winners.push(winner);
            }
            
            onComplete(winners);
          }, 1000);
        }
        
        return timer;
      };

      scrollNames();
    };

    return () => {
      clearInterval(countdownInterval);
    };
  }, [isScrolling, guides, onComplete, winnerCount]);

  if (!isScrolling) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900/95 via-pink-900/95 to-blue-900/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          className="w-32 h-32 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl"
        >
          <motion.div
            animate={{ rotate: [0, -360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 bg-white rounded-full flex items-center justify-center"
          >
            <span className="text-4xl">🎰</span>
          </motion.div>
        </motion.div>

        {phase === 'delay' ? (
          <motion.h2
            animate={{ 
              scale: [1, 1.05, 1],
              textShadow: [
                "0 0 20px rgba(255,255,255,0.5)",
                "0 0 40px rgba(255,255,255,0.8)",
                "0 0 20px rgba(255,255,255,0.5)"
              ]
            }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-5xl font-bold text-white mb-8"
          >
            🎲 STARTING IN {timeLeft} 🎲
          </motion.h2>
        ) : (
          <motion.h2
            animate={{ 
              scale: [1, 1.05, 1],
              textShadow: [
                "0 0 20px rgba(255,255,255,0.5)",
                "0 0 40px rgba(255,255,255,0.8)",
                "0 0 20px rgba(255,255,255,0.5)"
              ]
            }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-5xl font-bold text-white mb-8"
          >
            🎲 DRAWING WINNERS 🎲
          </motion.h2>
        )}

        <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-8 border border-white/30 min-w-[500px] max-w-[600px]">
          <motion.div
            key={currentName}
            initial={{ y: 50, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="text-2xl md:text-3xl font-bold text-white break-words leading-tight"
          >
            {currentName || 'Preparing...'}
          </motion.div>
        </div>

        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white/80 mt-6 text-lg"
        >
          {phase === 'delay' ? '✨ Building suspense... ✨' : '✨ The magic is happening... ✨'}
        </motion.p>
      </div>
    </div>
  );
};
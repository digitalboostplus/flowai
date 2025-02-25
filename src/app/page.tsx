'use client';

import { motion, useAnimationControls } from 'framer-motion';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { WorkflowBuilder } from '@/components/WorkflowBuilder';
import { Login } from '@/components/Login';
import { SpinnerGap, Brain, Robot, Sparkle, Lightning } from '@phosphor-icons/react';
import { Navbar } from '@/components/Navbar';

const FloatingIcon = ({ icon, index }: { icon: string; index: number }) => {
  const controls = useAnimationControls();

  useEffect(() => {
    const glowColors = [
      'rgba(59, 130, 246, 0.8)', // blue
      'rgba(139, 92, 246, 0.8)', // purple
      'rgba(236, 72, 153, 0.8)', // pink
      'rgba(34, 197, 94, 0.8)', // green
    ];

    const animate = async () => {
      await controls.start({
        x: [0, Math.sin(index) * 150, -Math.sin(index) * 150, 0],
        y: [0, Math.cos(index) * 150, -Math.cos(index) * 150, 0],
        opacity: [0.4, 0.8, 0.8, 0.4],
        filter: [
          `drop-shadow(0 0 30px ${glowColors[0]}) brightness(1.2)`,
          `drop-shadow(0 0 35px ${glowColors[1]}) brightness(1.4)`,
          `drop-shadow(0 0 35px ${glowColors[2]}) brightness(1.4)`,
          `drop-shadow(0 0 30px ${glowColors[3]}) brightness(1.2)`,
        ],
        transition: {
          duration: 12 + index * 2,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }
      });
    };

    animate();
  }, [controls, index]);

  const getIconColor = () => {
    switch(icon) {
      case 'Brain': return 'text-blue-400';
      case 'Robot': return 'text-purple-400';
      case 'Sparkle': return 'text-pink-400';
      case 'Lightning': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getPosition = () => {
    switch(index) {
      case 0: return { left: '15%', top: '40%' };
      case 1: return { left: '35%', top: '55%' };
      case 2: return { left: '65%', top: '45%' };
      case 3: return { left: '85%', top: '60%' };
      default: return { left: '50%', top: '50%' };
    }
  };

  return (
    <motion.div
      animate={controls}
      className={`absolute ${getIconColor()}`}
      style={{
        ...getPosition(),
        filter: 'drop-shadow(0 0 30px rgba(59, 130, 246, 0.8))',
      }}
    >
      {icon === 'Brain' && <Brain size={72} weight="duotone" />}
      {icon === 'Robot' && <Robot size={72} weight="duotone" />}
      {icon === 'Sparkle' && <Sparkle size={72} weight="duotone" />}
      {icon === 'Lightning' && <Lightning size={72} weight="duotone" />}
    </motion.div>
  );
};

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SpinnerGap className="animate-spin text-blue-500" size={32} weight="bold" />
      </div>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-black">
        <Navbar />
        
        <div className="relative overflow-hidden min-h-screen">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-black via-blue-950/20 to-purple-950/20 animate-gradient" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black" />
          
          {/* Floating elements */}
          <div className="absolute inset-0">
            {['Brain', 'Robot', 'Sparkle', 'Lightning'].map((icon, i) => (
              <FloatingIcon key={icon} icon={icon} index={i} />
            ))}
          </div>

          {/* Hero content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <motion.h1 
                className="text-4xl sm:text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                AI-Powered Workflows
                <br />
                Made Simple
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mt-6 text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto"
              >
                Transform your ideas into powerful automated workflows. From marketing campaigns to 
                business processes, let AI help you build and optimize your automation.
              </motion.p>

              <Login />
            </motion.div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <div className="pt-20">
        <WorkflowBuilder />
      </div>
    </main>
  );
}

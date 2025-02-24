'use client';

import { motion } from 'framer-motion';
import { SignOut, User } from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';

export function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-lg border-b border-gray-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0"
            >
              <span className="text-xl font-bold text-white cursor-pointer">
                FlowAI
              </span>
            </motion.div>
          </div>
          
          <div className="flex items-center gap-4">
            {!user && (
              <nav className="hidden md:flex items-center gap-6">
                <NavLink>Features</NavLink>
                <NavLink>Pricing</NavLink>
                <NavLink>Blog</NavLink>
              </nav>
            )}
            
            <div className="flex items-center gap-4">
              {user && (
                <>
                  <div className="flex items-center gap-2 text-gray-300">
                    <User size={20} weight="bold" />
                    <span className="hidden md:inline">{user.email}</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={signOut}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                  >
                    <SignOut size={20} weight="bold" />
                    <span className="hidden md:inline">Sign Out</span>
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

function NavLink({ children }: { children: React.ReactNode }) {
  return (
    <motion.span
      whileHover={{ y: -2 }}
      className="text-gray-400 hover:text-white transition-colors cursor-pointer"
    >
      {children}
    </motion.span>
  );
} 
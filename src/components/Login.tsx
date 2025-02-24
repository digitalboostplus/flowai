import { motion } from 'framer-motion';
import { GoogleLogo } from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';

export function Login() {
  const { signInWithGoogle } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="mt-10 flex justify-center"
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={signInWithGoogle}
        className="flex items-center justify-center gap-3 px-8 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
      >
        <GoogleLogo size={24} weight="bold" />
        Sign in with Google
      </motion.button>
    </motion.div>
  );
} 
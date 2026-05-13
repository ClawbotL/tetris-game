'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const Candle = dynamic(() => import('./components/Candle'), {
  ssr: false,
  loading: () => <div className="w-36 h-72 bg-gray-300 rounded-t-3xl rounded-b-lg animate-pulse" />,
});

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[var(--background)] text-[var(--foreground)] font-sans">
      {/* Hero Section */}
      <main className="flex flex-col items-center gap-12 max-w-4xl w-full text-center">
        {/* Animated Heading */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <h1 className="font-serif text-6xl sm:text-7xl md:text-8xl font-bold tracking-tighter text-[var(--primary)] mb-4">
            Burning Candle
          </h1>
          <p className="text-lg sm:text-xl text-[var(--foreground)]/80 font-light max-w-2xl mx-auto">
            A warm, elegant, and atmospheric experience.
          </p>
        </motion.div>

        {/* Candle Component */}
        <Candle />
      </main>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';

const Particle = ({ delay, size, xOffset }: { delay: number; size: number; xOffset: number }) => {
  return (
    <motion.div
      className="absolute rounded-full bg-yellow-400/60"
      style={{ width: size, height: size, left: `calc(50% + ${xOffset}px)` }}
      initial={{ y: 0, opacity: 0 }}
      animate={{
        y: [-20, -150, -200],
        opacity: [0, 0.8, 0],
        scale: [1, 1.5, 0],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: delay,
      }}
    />
  );
};

export default function Candle() {
  return (
    <div className="relative flex flex-col items-center">
      {/* Floating Particles */}
      {[...Array(8)].map((_, i) => (
        <Particle
          key={i}
          delay={i * 0.5}
          size={4 + Math.random() * 6}
          xOffset={-40 + Math.random() * 80}
        />
      ))}

      {/* Glow */}
      <motion.div
        className="absolute -top-20 w-64 h-64 bg-radial-gradient from-yellow-400/40 via-orange-400/20 to-transparent rounded-full blur-3xl"
        animate={{
          scale: [1, 1.1, 0.95, 1],
          opacity: [0.5, 0.7, 0.6, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Candle Body */}
      <motion.div
        className="relative w-32 h-64 bg-gradient-to-b from-[#D2691E] to-[#8B4513] rounded-t-3xl rounded-b-lg shadow-2xl overflow-hidden"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Wax Drips */}
        <motion.div
          className="absolute -top-2 left-4 w-6 h-8 bg-gradient-to-b from-[#D2691E] to-[#CD853F] rounded-b-full"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -top-2 right-6 w-5 h-7 bg-gradient-to-b from-[#D2691E] to-[#CD853F] rounded-b-full"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute -top-2 left-16 w-4 h-6 bg-gradient-to-b from-[#D2691E] to-[#CD853F] rounded-b-full"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />

        {/* Candle Top (Melted) */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#F4A460] to-[#D2691E] rounded-t-3xl" />
      </motion.div>

      {/* Wick */}
      <motion.div
        className="absolute top-8 w-1 h-10 bg-gray-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      />

      {/* Flame */}
      <motion.div
        className="absolute -top-12"
        animate={{
          scale: [1, 1.1, 0.95, 1.05, 1],
          rotate: [0, 2, -2, 1, 0],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Outer Flame */}
        <motion.div
          className="absolute -left-6 -top-4 w-12 h-20 bg-gradient-to-t from-yellow-400 via-orange-400 to-red-500 rounded-full blur-md opacity-80"
          animate={{
            scale: [1, 1.05, 0.98, 1.02, 1],
            opacity: [0.7, 0.9, 0.75, 0.85, 0.7],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* Inner Flame */}
        <motion.div
          className="relative w-6 h-12 bg-gradient-to-t from-yellow-200 via-yellow-300 to-white rounded-full"
          animate={{
            scale: [1, 1.08, 0.97, 1.03, 1],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>

      {/* Candle Holder */}
      <motion.div
        className="absolute -bottom-16 w-48 h-8 bg-gradient-to-b from-gray-700 to-gray-900 rounded-lg shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {/* Holder Base Detail */}
        <div className="absolute inset-x-2 top-0 h-2 bg-gradient-to-b from-gray-600 to-gray-700 rounded-t-md" />
      </motion.div>
    </div>
  );
}

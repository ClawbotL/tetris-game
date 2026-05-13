'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';

// Simple seeded random generator for deterministic particles
const seededRandom = (seed: number) => {
  let t = seed + 0x6D2B79F5;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};

const Particle = ({ delay, size, xOffset, isLit, seed }: { delay: number; size: number; xOffset: number; isLit: boolean; seed: number }) => {
  if (!isLit) return null;
  const duration = useMemo(() => 3 + seededRandom(seed) * 2, [seed]);
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
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    />
  );
};

export default function Candle() {
  const [isLit, setIsLit] = useState(true);

  // Generate deterministic particles
  const particles = useMemo(() => {
    return [...Array(12)].map((_, i) => {
      const seed = i * 12345;
      return {
        key: i,
        delay: i * 0.4,
        size: 3 + seededRandom(seed) * 7,
        xOffset: -50 + seededRandom(seed + 1) * 100,
        seed,
      };
    });
  }, []);

  return (
    <div className="relative flex flex-col items-center gap-8">
      {/* Floating Particles */}
      {particles.map((p) => (
        <Particle
          key={p.key}
          delay={p.delay}
          size={p.size}
          xOffset={p.xOffset}
          isLit={isLit}
          seed={p.seed}
        />
      ))}

      {/* Glow */}
      <AnimatePresence>
        {isLit && (
          <motion.div
            className="absolute -top-24 w-80 h-80 bg-radial-gradient from-yellow-400/50 via-orange-400/25 to-transparent rounded-full blur-3xl"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{
              scale: [1, 1.1, 0.95, 1.05, 1],
              opacity: [0.6, 0.8, 0.7, 0.75, 0.6],
            }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </AnimatePresence>

      {/* Candle Body */}
      <motion.div
        className="relative w-36 h-72 bg-gradient-to-b from-[#D2691E] to-[#8B4513] rounded-t-3xl rounded-b-lg shadow-2xl overflow-hidden"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Wax Drips */}
        <motion.div
          className="absolute -top-3 left-5 w-7 h-10 bg-gradient-to-b from-[#D2691E] to-[#CD853F] rounded-b-full"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -top-2 right-7 w-6 h-9 bg-gradient-to-b from-[#D2691E] to-[#CD853F] rounded-b-full"
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute -top-3 left-18 w-5 h-8 bg-gradient-to-b from-[#D2691E] to-[#CD853F] rounded-b-full"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />

        {/* Melted Wax Pool on Top */}
        <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-[#F4A460] via-[#DEB887] to-[#D2691E] rounded-t-3xl" />
        <div className="absolute top-4 left-8 right-8 h-6 bg-[#F4A460] rounded-full opacity-80" />
      </motion.div>

      {/* Wick */}
      <motion.div
        className="absolute top-8 w-1.5 h-12 bg-gradient-to-b from-gray-700 to-gray-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      />

      {/* Smoke (when extinguished) */}
      <AnimatePresence>
        {!isLit && (
          <div className="absolute -top-24">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-4 h-4 bg-gray-400/40 rounded-full blur-md"
                style={{ left: -20 + i * 10 }}
                initial={{ y: 0, opacity: 0, scale: 0.5 }}
                animate={{
                  y: -80 - i * 20,
                  opacity: [0, 0.6, 0],
                  scale: [0.5, 1.5, 2],
                  rotate: -10 + i * 5,
                }}
                transition={{
                  duration: 2 + i * 0.5,
                  repeat: Infinity,
                  ease: 'easeOut',
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Flame */}
      <AnimatePresence>
        {isLit && (
          <motion.div
            className="absolute -top-14"
            animate={{
              scale: [1, 1.15, 0.92, 1.08, 1],
              rotate: [0, 3, -3, 2, 0],
            }}
            transition={{
              duration: 0.7,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {/* Outer Flame (biggest, most transparent) */}
            <motion.div
              className="absolute -left-8 -top-6 w-16 h-28 bg-gradient-to-t from-yellow-500/60 via-orange-500/40 to-red-600/30 rounded-full blur-lg"
              animate={{
                scale: [1, 1.1, 0.95, 1.05, 1],
                opacity: [0.6, 0.8, 0.65, 0.75, 0.6],
              }}
              transition={{
                duration: 0.9,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            {/* Middle Flame */}
            <motion.div
              className="absolute -left-5 -top-3 w-10 h-22 bg-gradient-to-t from-yellow-400 via-orange-400 to-red-500 rounded-full blur-md opacity-90"
              animate={{
                scale: [1, 1.08, 0.96, 1.04, 1],
                opacity: [0.8, 0.95, 0.85, 0.9, 0.8],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            {/* Inner Flame (brightest) */}
            <motion.div
              className="relative w-7 h-14 bg-gradient-to-t from-yellow-200 via-yellow-300 to-white rounded-full"
              animate={{
                scale: [1, 1.12, 0.94, 1.06, 1],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Candle Holder */}
      <motion.div
        className="absolute -bottom-20 w-56 h-10 bg-gradient-to-b from-gray-600 to-gray-900 rounded-lg shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {/* Holder Base Detail */}
        <div className="absolute inset-x-3 top-0 h-3 bg-gradient-to-b from-gray-500 to-gray-700 rounded-t-md" />
        <div className="absolute inset-x-1 bottom-0 h-2 bg-gray-800 rounded-b-md" />
      </motion.div>

      {/* Toggle Button */}
      <motion.button
        className="mt-24 px-8 py-3 bg-[var(--cta)] text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsLit(!isLit)}
      >
        {isLit ? 'Put Out Flame' : 'Relight Candle'}
      </motion.button>
    </div>
  );
}

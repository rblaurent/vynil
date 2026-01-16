import { motion } from 'framer-motion';

interface TonearmProps {
  isPlaying: boolean;
  progress: number; // 0 to 1 (album progress)
  scale?: number;
}

// Tonearm angles (degrees) - more dramatic range for visibility
const REST_ANGLE = -35; // Off record, resting to the right
const START_ANGLE = 0; // Outer edge of record
const END_ANGLE = 40; // Near center of record (40 degree sweep)

export function Tonearm({ isPlaying, progress, scale = 1 }: TonearmProps) {
  // Calculate target angle based on playback state and progress
  const targetAngle = isPlaying
    ? START_ANGLE + (END_ANGLE - START_ANGLE) * progress
    : REST_ANGLE;

  // Helper to scale pixel values
  const s = (px: number) => Math.round(px * scale);

  return (
    <motion.div
      className="absolute"
      style={{
        width: s(220),
        height: s(24),
        top: s(70),
        right: s(30),
        transformOrigin: 'right center',
      }}
      animate={{ rotate: targetAngle }}
      transition={{
        type: 'spring',
        stiffness: 50,
        damping: 15,
      }}
    >
      {/* Tonearm base/pivot - at the right end */}
      <div
        className="absolute rounded-full bg-gradient-to-b from-gray-500 to-gray-700"
        style={{
          width: s(36),
          height: s(36),
          right: s(-8),
          top: s(-6),
          boxShadow: `0 ${s(4)}px ${s(8)}px rgba(0, 0, 0, 0.5), inset 0 ${s(2)}px ${s(4)}px rgba(255, 255, 255, 0.1)`,
        }}
      />

      {/* Counterweight - near the pivot */}
      <div
        className="absolute rounded-full bg-gradient-to-b from-gray-400 to-gray-600"
        style={{
          width: s(28),
          height: s(28),
          right: s(35),
          top: s(-2),
          boxShadow: `0 ${s(2)}px ${s(4)}px rgba(0, 0, 0, 0.4)`,
        }}
      />

      {/* Tonearm main tube */}
      <div
        className="absolute bg-gradient-to-b from-gray-300 via-gray-400 to-gray-300 rounded-full"
        style={{
          width: s(160),
          height: s(6),
          left: s(30),
          top: s(9),
          boxShadow: `0 ${s(2)}px ${s(4)}px rgba(0, 0, 0, 0.3)`,
        }}
      />

      {/* Headshell - angled piece at the end */}
      <div
        className="absolute bg-gradient-to-b from-gray-400 to-gray-600"
        style={{
          width: s(35),
          height: s(16),
          left: 0,
          top: s(4),
          borderRadius: `${s(3)}px`,
          transform: 'rotate(-15deg)',
          transformOrigin: 'right center',
          boxShadow: `0 ${s(2)}px ${s(4)}px rgba(0, 0, 0, 0.4)`,
        }}
      />

      {/* Cartridge */}
      <div
        className="absolute bg-gray-800"
        style={{
          width: s(18),
          height: s(12),
          left: s(2),
          top: s(12),
          borderRadius: `${s(2)}px`,
          transform: 'rotate(-15deg)',
        }}
      />

      {/* Stylus/Needle holder */}
      <div
        className="absolute bg-gradient-to-b from-gray-400 to-gray-600"
        style={{
          width: s(3),
          height: s(14),
          left: s(8),
          top: s(18),
          transform: 'rotate(-15deg)',
          transformOrigin: 'top center',
        }}
      />

      {/* Diamond stylus tip */}
      <div
        className="absolute"
        style={{
          width: 0,
          height: 0,
          left: s(5),
          top: s(30),
          borderLeft: `${s(4)}px solid transparent`,
          borderRight: `${s(4)}px solid transparent`,
          borderTop: `${s(6)}px solid #e0e0e0`,
          filter: `drop-shadow(0 ${s(1)}px ${s(2)}px rgba(0,0,0,0.5))`,
        }}
      />
    </motion.div>
  );
}

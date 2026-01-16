import { motion } from 'framer-motion';
import type { SpotifyAlbum } from '../types/spotify';

interface VinylRecordProps {
  album: SpotifyAlbum | null;
  isPlaying: boolean;
  size?: number;
}

export function VinylRecord({ album, isPlaying, size = 400 }: VinylRecordProps) {
  const labelSize = size * 0.35; // 35% of vinyl diameter for center label

  return (
    <div
      className="relative rounded-full"
      style={{
        width: size,
        height: size,
        // Static drop shadow - does NOT rotate
        boxShadow: `0 ${size * 0.02}px ${size * 0.05}px rgba(0, 0, 0, 0.5)`,
      }}
    >
      {/* Rotating vinyl disc */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
        transition={
          isPlaying
            ? {
                duration: 1.8, // 33⅓ RPM
                repeat: Infinity,
                ease: 'linear',
              }
            : {
                duration: 0.5,
                ease: 'easeOut',
              }
        }
      >
        {/* Vinyl Base - Black with grooves */}
        <div
          className="absolute inset-0 rounded-full bg-black vinyl-grooves"
          style={{
            boxShadow: `inset 0 0 ${size * 0.05}px rgba(0, 0, 0, 0.8)`,
          }}
        />

        {/* Outer ring highlight */}
        <div
          className="absolute rounded-full"
          style={{
            inset: 2,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        />

        {/* Inner groove area (darker) */}
        <div
          className="absolute rounded-full bg-black/30"
          style={{
            top: '15%',
            left: '15%',
            right: '15%',
            bottom: '15%',
          }}
        />

        {/* === Visual irregularities for rotation visibility === */}

        {/* Small surface imperfection 1 */}
        <div
          className="absolute rounded-full"
          style={{
            width: size * 0.008,
            height: size * 0.008,
            top: '25%',
            left: '60%',
            background: 'rgba(255,255,255,0.06)',
          }}
        />

        {/* Small surface imperfection 2 */}
        <div
          className="absolute rounded-full"
          style={{
            width: size * 0.006,
            height: size * 0.006,
            top: '70%',
            left: '35%',
            background: 'rgba(255,255,255,0.05)',
          }}
        />

        {/* Subtle wear line - thin radial scratch */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: size * 0.15,
            height: 1,
            top: '38%',
            left: '20%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
            transform: 'rotate(-25deg)',
          }}
        />

        {/* Dust speck 1 */}
        <div
          className="absolute"
          style={{
            width: size * 0.004,
            height: size * 0.004,
            top: '45%',
            left: '80%',
            background: 'rgba(180,180,180,0.15)',
            borderRadius: '50%',
          }}
        />

        {/* Dust speck 2 */}
        <div
          className="absolute"
          style={{
            width: size * 0.005,
            height: size * 0.005,
            top: '65%',
            left: '22%',
            background: 'rgba(180,180,180,0.12)',
            borderRadius: '50%',
          }}
        />

        {/* Label edge ring - slight color variation */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: labelSize + 4,
            height: labelSize + 4,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        />

        {/* Center Label */}
        <div
          className="absolute rounded-full overflow-hidden flex items-center justify-center"
          style={{
            width: labelSize,
            height: labelSize,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.5)',
          }}
        >
          {album?.images[0] ? (
            <img
              src={album.images[0].url}
              alt={album.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-spotify-green to-green-700 flex items-center justify-center">
              <svg
                className="w-1/2 h-1/2 text-black/30"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
          )}
        </div>

        {/* Center spindle hole */}
        <div
          className="absolute rounded-full bg-spotify-dark"
          style={{
            width: size * 0.025,
            height: size * 0.025,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.8)',
          }}
        />
      </motion.div>

      {/* Static shine effect - does NOT rotate */}
      <div className="absolute inset-0 rounded-full vinyl-shine pointer-events-none" />
    </div>
  );
}

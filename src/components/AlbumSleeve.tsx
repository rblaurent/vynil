import { motion } from 'framer-motion';
import type { SpotifyAlbum } from '../types/spotify';

interface AlbumSleeveProps {
  album: SpotifyAlbum | null;
  size?: number;
}

export function AlbumSleeve({ album, size = 350 }: AlbumSleeveProps) {
  // Slight rotation for human touch
  const rotation = -0.8;

  // Scale factor based on size (350 is the base)
  const scale = size / 350;
  const s = (px: number) => Math.round(px * scale);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, rotate: 0 }}
      animate={{ opacity: 1, x: 0, rotate: rotation }}
      exit={{ opacity: 0, x: -20 }}
      className="relative"
      style={{ width: size, height: size }}
    >
      {/* Sleeve - clean cardboard look */}
      <div
        className="relative w-full h-full overflow-hidden"
        style={{
          borderRadius: s(4),
          boxShadow: `
            ${s(8)}px ${s(8)}px ${s(24)}px rgba(0, 0, 0, 0.6),
            ${s(2)}px ${s(2)}px ${s(8)}px rgba(0, 0, 0, 0.4)
          `,
        }}
      >
        {/* Album art */}
        {album?.images[0] ? (
          <img
            src={album.images[0].url}
            alt={album.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-spotify-card flex items-center justify-center">
            <svg
              className="w-1/4 h-1/4 text-gray-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
        )}

        {/* Subtle sleeve opening hint on right - just a shadow */}
        <div
          className="absolute top-0 bottom-0 right-0 pointer-events-none"
          style={{
            width: s(12),
            background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.4))',
          }}
        />
      </div>

      {/* Album Info below sleeve */}
      {album && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            marginTop: s(16),
            paddingLeft: s(4),
            paddingRight: s(4),
            transform: `rotate(${-rotation}deg)`,
          }}
        >
          <h3
            className="text-white font-semibold truncate"
            style={{ fontSize: s(18) }}
            title={album.name}
          >
            {album.name}
          </h3>
          <p className="text-gray-400 truncate" style={{ fontSize: s(14) }}>
            {album.artists.map(a => a.name).join(', ')}
          </p>
          <p className="text-gray-500" style={{ fontSize: s(12), marginTop: s(4) }}>
            {album.release_date?.split('-')[0]} • {album.total_tracks} tracks
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

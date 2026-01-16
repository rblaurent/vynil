import { VinylRecord } from './VinylRecord';
import { Tonearm } from './Tonearm';
import { AlbumSleeve } from './AlbumSleeve';
import type { SpotifyAlbum } from '../types/spotify';

interface TurntableProps {
  album: SpotifyAlbum | null;
  isPlaying: boolean;
  progress: number;
}

// Scale factor for the entire turntable unit (1.0 = original size)
const SCALE = 1.8;

export function Turntable({ album, isPlaying, progress }: TurntableProps) {
  // Helper to scale pixel values
  const s = (px: number) => Math.round(px * SCALE);

  const vinylSize = s(350);
  const sleeveSize = vinylSize; // Sleeve matches vinyl size

  return (
    <div className="flex items-center" style={{ gap: s(32) }}>
      {/* Album Sleeve on the left */}
      <div className="flex-shrink-0">
        <AlbumSleeve album={album} size={sleeveSize} />
      </div>

      {/* Turntable Unit */}
      <div className="relative flex-shrink-0">
        {/* Turntable Base */}
        <div
          className="relative rounded-lg"
          style={{
            width: vinylSize + s(150),
            height: vinylSize + s(100),
            background: 'linear-gradient(to bottom right, #1a1a1a, #252525, #1a1a1a)',
            boxShadow: `
              0 ${s(20)}px ${s(40)}px rgba(0, 0, 0, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 0.1),
              inset 0 -1px 0 rgba(0, 0, 0, 0.3)
            `,
            borderRadius: s(8),
          }}
        >
          {/* Woodgrain Accent */}
          <div
            className="absolute left-0 top-0 bottom-0 rounded-l-lg"
            style={{
              width: s(12),
              background: 'linear-gradient(180deg, #5a3d2b 0%, #3d2a1d 50%, #5a3d2b 100%)',
              borderTopLeftRadius: s(8),
              borderBottomLeftRadius: s(8),
            }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 rounded-r-lg"
            style={{
              width: s(12),
              background: 'linear-gradient(180deg, #5a3d2b 0%, #3d2a1d 50%, #5a3d2b 100%)',
              borderTopRightRadius: s(8),
              borderBottomRightRadius: s(8),
            }}
          />

          {/* Platter */}
          <div
            className="absolute rounded-full"
            style={{
              width: vinylSize + s(20),
              height: vinylSize + s(20),
              left: s(40),
              top: s(40),
              background: 'linear-gradient(to bottom, #3a3a3a, #2a2a2a)',
              boxShadow: `
                0 ${s(4)}px ${s(12)}px rgba(0, 0, 0, 0.5),
                inset 0 ${s(2)}px ${s(4)}px rgba(255, 255, 255, 0.1)
              `,
            }}
          />

          {/* Vinyl Record */}
          <div
            className="absolute"
            style={{
              left: s(50),
              top: s(50),
            }}
          >
            <VinylRecord album={album} isPlaying={isPlaying} size={vinylSize} />
          </div>

          {/* Tonearm */}
          <Tonearm isPlaying={isPlaying} progress={progress} scale={SCALE} />

          {/* Power/Speed Indicator Light */}
          <div
            className={`absolute rounded-full transition-colors duration-300 ${
              isPlaying ? 'bg-spotify-green' : 'bg-gray-600'
            }`}
            style={{
              width: s(8),
              height: s(8),
              right: s(30),
              bottom: s(20),
              boxShadow: isPlaying ? `0 0 ${s(8)}px #1DB954` : 'none',
            }}
          />

          {/* Speed label */}
          <div
            className="absolute font-mono"
            style={{
              right: s(45),
              bottom: s(17),
              color: '#4a4a4a',
              fontSize: s(12),
            }}
          >
            33⅓
          </div>
        </div>
      </div>
    </div>
  );
}

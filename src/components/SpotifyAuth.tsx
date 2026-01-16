import { motion } from 'framer-motion';

interface SpotifyAuthProps {
  onLogin: () => void;
  error: string | null;
}

export function SpotifyAuth({ onLogin, error }: SpotifyAuthProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-spotify-dark">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        {/* Vinyl Icon */}
        <motion.div
          className="w-32 h-32 mx-auto mb-8 relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-full h-full rounded-full bg-black vinyl-grooves">
            <div className="absolute inset-0 rounded-full vinyl-shine" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-spotify-green flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-black" />
            </div>
          </div>
        </motion.div>

        <h1 className="text-4xl font-bold text-white mb-4">Vinyl Player</h1>
        <p className="text-gray-400 mb-8 max-w-md">
          Experience your Spotify library like never before. Watch your albums spin on a virtual turntable.
        </p>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200"
          >
            {error}
          </motion.div>
        )}

        <motion.button
          onClick={onLogin}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-spotify-green text-black font-semibold rounded-full hover:bg-green-400 transition-colors"
        >
          Connect with Spotify
        </motion.button>

        <p className="mt-6 text-sm text-gray-500">
          Requires Spotify Premium for playback
        </p>
      </motion.div>
    </div>
  );
}

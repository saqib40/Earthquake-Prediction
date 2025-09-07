import { motion } from "framer-motion";
import { Link } from 'react-router-dom';

// --- Helper Components & Icons ---

const SeismographIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-indigo-400">
        <path d="M14 12H2"/><path d="M2 12l2-3 2 6 2-9 2 5h2"/><path d="m18 8 3 7 3-7"/>
    </svg>
);

/**
 * Renders the animated background SVG paths.
 * The core animation logic and path calculations are preserved from the original.
 */
function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full" viewBox="0 0 696 316" fill="none">
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.03}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

const Navbar = () => {
    return (
        <header className="fixed top-0 left-0 right-0 z-20 bg-gray-900/50 backdrop-blur-sm">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center space-x-2">
                        <SeismographIcon />
                        <span className="font-bold text-white text-lg">QuakePredict</span>
                    </Link>
                    <div className="flex items-center space-x-4">
                        <Link to="/login" className="text-gray-300 hover:text-white transition-colors text-sm font-semibold">
                            Sign In
                        </Link>
                        <Link to="/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-indigo-500 transition-colors">
                            Sign Up
                        </Link>
                    </div>
                </div>
            </nav>
        </header>
    );
};


// --- Main Landing Page Component ---

export default function LandingPage() {
  const title = "Predict Earthquakes with AI";
  const words = title.split(" ");

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-gray-900 font-sans text-gray-400">
      <Navbar />
      <FloatingPaths position={1} />
      <FloatingPaths position={-1} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-gradient-to-r from-gray-200 via-gray-400 to-gray-600 bg-clip-text text-transparent mb-8">
            {words.map((word, wordIndex) => (
              <span key={wordIndex} className="inline-block mr-4 last:mr-0">
                {word.split("").map((letter, letterIndex) => (
                  <motion.span
                    key={`${wordIndex}-${letterIndex}`}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: wordIndex * 0.1 + letterIndex * 0.03,
                      type: "spring",
                      stiffness: 150,
                      damping: 25,
                    }}
                    className="inline-block"
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>
          
          <Link to="/login" className="group inline-block relative p-[2px] rounded-full bg-gradient-to-b from-gray-700/50 to-gray-900/50 shadow-lg transition-shadow hover:shadow-xl hover:shadow-indigo-500/20">
            <button className="rounded-full px-8 py-5 text-lg font-semibold bg-gray-900/80 backdrop-blur-md text-white transition-transform group-hover:-translate-y-0.5">
                <span className="opacity-90 group-hover:opacity-100 transition-opacity">
                    Get Started
                </span>
                <span className="ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all">
                    &rarr;
                </span>
            </button>
          </Link>

        </motion.div>
      </div>
    </div>
  );
}


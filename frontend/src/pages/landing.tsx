import { motion } from "framer-motion";
import React from 'react';

interface FloatingPathsProps {
  position: number;
  isDarkMode: boolean;
}

function FloatingPaths({ position, isDarkMode }: FloatingPathsProps) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    color: `rgba(15,23,42,${0.1 + i * 0.03})`,
    width: 0.5 + i * 0.03,
  }));

  const svgStyles: React.CSSProperties = {
    width: "100%",
    height: "100%",
    color: isDarkMode ? "#ffffff" : "#0f172a",
  };

  const floatingPathsContainerStyles: React.CSSProperties = {
    position: "absolute",
    inset: "0",
    pointerEvents: "none",
  };

  return (
    <div style={floatingPathsContainerStyles}>
      <svg style={svgStyles} viewBox="0 0 696 316" fill="none">
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

interface BackgroundPathsProps {
  title?: string;
}

export default function BackgroundPaths({ title = "Earthquake Predictor" }: BackgroundPathsProps) {
  const words = title.split(" ");
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [isHovering, setIsHovering] = React.useState(false);

  const containerStyles: React.CSSProperties = {
    position: "relative",
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: isDarkMode ? "#18181b" : "#ffffff",
    fontFamily: "'Open Sans', sans-serif", // Apply the font here
  };

  const innerContainerStyles: React.CSSProperties = {
    position: "relative", // To stack above the background paths
    zIndex: 10,
    maxWidth: "64rem",
    margin: "0 auto",
    paddingLeft: "1rem",
    paddingRight: "1rem",
    textAlign: "center",
  };

  const mdInnerContainerStyles: React.CSSProperties = {
    paddingLeft: "1.5rem",
    paddingRight: "1.5rem",
  };

  const headingMotionStyles: React.CSSProperties = {
    maxWidth: "40rem",
    margin: "0 auto",
  };

  const headingStyles: React.CSSProperties = {
    fontSize: "3.7rem", // Increased font size (you can adjust further)
    fontWeight: "bold",
    marginBottom: "2rem",
    letterSpacing: "-0.025em",
    fontFamily: "'Open Sans', sans-serif",
    backgroundImage: isDarkMode
      ? "linear-gradient(to right, #e0e0e0, #d4d4d480)" // Slightly darker shade for dark mode
      : "linear-gradient(to right, #262626, #4a4a4a80)", // Slightly darker shade for light mode
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent", // Keep text transparent to show the gradient
  };

  const letterStyles: React.CSSProperties = {
    display: "inline-block",
    color: "transparent",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    backgroundImage: isDarkMode
      ? "linear-gradient(to right, #ffffff, #ffffff80)"
      : "linear-gradient(to right, #18181b, #44403c80)",
  };

  const buttonWrapperStyles: React.CSSProperties = {
    display: "inline-block",
    position: "relative",
    backgroundImage: isDarkMode
      ? "linear-gradient(to bottom, #ffffff1a, #0000001a)"
      : "linear-gradient(to bottom, #0000001a, #ffffff1a)",
    padding: "1px",
    borderRadius: "1.25rem",
    overflow: "hidden",
    boxShadow: isHovering
      ? "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
      : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    transition: "box-shadow 0.3s ease-in-out",
  };

  const buttonStyles: React.CSSProperties = {
    borderRadius: "1.15rem",
    paddingLeft: "2rem",
    paddingRight: "2rem",
    paddingTop: "1.5rem",
    paddingBottom: "1.5rem",
    fontSize: "1.125rem",
    fontWeight: 600,
    backdropFilter: "blur(10px)",
    backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.95)" : "rgba(255, 255, 255, 0.95)",
    color: isDarkMode ? "#ffffff" : "#000000",
    transition: "all 0.3s ease-in-out",
    border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.1)",
    transform: isHovering ? "translateY(-0.125rem)" : "translateY(0)",
    boxShadow: isHovering
      ? isDarkMode
        ? "0 4px 6px -1px rgba(209, 213, 219, 0.5), 0 2px 4px -1px rgba(209, 213, 219, 0.25)"
        : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
      : "none",
    fontFamily: "'Open Sans', sans-serif", // Apply to the button too
  };

  const discoverSpanStyles: React.CSSProperties = {
    opacity: isHovering ? 1 : 0.9,
    transition: "opacity 0.3s ease-in-out",
  };

  const arrowSpanStyles: React.CSSProperties = {
    marginLeft: "0.75rem",
    opacity: isHovering ? 1 : 0.7,
    transform: isHovering ? "translateX(0.375rem)" : "translateX(0)",
    transition: "all 0.3s ease-in-out",
  };

  return (
    <div style={containerStyles}>
      <FloatingPaths position={1} isDarkMode={isDarkMode} />
      <FloatingPaths position={-1} isDarkMode={isDarkMode} />

      <div style={{ ...innerContainerStyles, ...(window.innerWidth >= 768 ? mdInnerContainerStyles : {}) }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          style={headingMotionStyles}
        >
          <h1 style={headingStyles}>
            {words.map((word, wordIndex) => (
              <span key={wordIndex} style={{ display: "inline-block", marginRight: wordIndex === words.length - 1 ? 0 : "1rem" }}>
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
                    style={letterStyles}
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>

          <div
            className="group"
            style={buttonWrapperStyles}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <button style={buttonStyles}>
              <span style={discoverSpanStyles}>Get Started</span>
              <span style={arrowSpanStyles}>→</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
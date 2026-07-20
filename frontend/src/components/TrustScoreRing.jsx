import { motion } from "framer-motion";

export default function TrustScoreRing({ score, isLoading }) {
  // Score mapping logic
  const getTrustDetails = (s) => {
    if (s >= 80) return { color: "#00C853", label: "High Trust" };
    if (s >= 60) return { color: "#00E676", label: "Good" };
    if (s >= 40) return { color: "#FFC300", label: "Medium Risk" };
    if (s >= 30) return { color: "#FF8A00", label: "High Risk" };
    return { color: "#FF4B4B", label: "Critical Risk" };
  };

  const { color, label } = getTrustDetails(score);

  // SVG Math
  const size = 200;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // If loading, we set offset to full circumference (empty ring)
  const targetOffset = isLoading ? circumference : circumference - (score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-[250px] mx-auto">
      {/* SVG Ring container */}
      <div className="relative w-full aspect-square flex items-center justify-center">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full transform -rotate-90"
          aria-hidden="true"
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(43, 52, 69, 0.05)" // Ink color at 5% opacity
            strokeWidth={strokeWidth}
          />
          {/* Dynamic Animated Stroke */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: targetOffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ transform: "translateZ(0)" }} // Hardware acceleration to prevent WebKit frame drops
          />
        </svg>

        {/* Inner Text Center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isLoading ? (
            <motion.div
              className="w-16 h-8 bg-gray-200 rounded animate-pulse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          ) : (
            <>
              <motion.span 
                className="text-5xl font-bold tracking-tighter text-ink"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                {score}
              </motion.span>
              <motion.span 
                className="text-xs font-semibold uppercase tracking-wider mt-1"
                style={{ color }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
                {label}
              </motion.span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

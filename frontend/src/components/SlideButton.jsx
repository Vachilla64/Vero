import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { ChevronRight, Check } from "lucide-react";

export default function SlideButton({ label = "Slide to send", onComplete, className = "" }) {
  const containerRef = useRef(null);
  const [maxDrag, setMaxDrag] = useState(200);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const x = useMotionValue(0);

  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      setMaxDrag(Math.max(100, containerWidth - 58));
    }
  }, []);

  const textOpacity = useTransform(x, [0, maxDrag * 0.6], [1, 0]);
  const progressWidth = useTransform(x, (latest) => `${latest + 25}px`);

  const handleDragEnd = (_, info) => {
    if (info.offset.x >= maxDrag * 0.7) {
      setIsConfirmed(true);
      x.set(maxDrag);
      if (onComplete) {
        onComplete();
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative h-[56px] w-full bg-trust-high rounded-full p-[4px] flex items-center justify-between overflow-hidden shadow-[0_12px_28px_rgba(0,200,83,0.3)] select-none ${className}`}
    >
      {/* Dynamic Drag Progress Fill */}
      <motion.div
        style={{ width: progressWidth }}
        className="absolute left-0 top-0 bottom-0 bg-white/20 rounded-full pointer-events-none"
      />

      {/* Label Text */}
      <motion.span
        style={{ opacity: textOpacity }}
        className="absolute inset-0 flex items-center justify-center font-semibold text-[16px] text-white pointer-events-none pl-6 tracking-wide"
      >
        {label}
      </motion.span>

      {/* Drag Handle */}
      <motion.div
        drag={isConfirmed ? false : "x"}
        dragConstraints={{ left: 0, right: maxDrag }}
        dragElastic={0.05}
        dragSnapToOrigin={!isConfirmed}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="z-10 w-[48px] h-[48px] rounded-full bg-white text-trust-high flex items-center justify-center cursor-grab active:cursor-grabbing shadow-[0_4px_12px_rgba(0,0,0,0.15)] shrink-0 transition-shadow"
      >
        {isConfirmed ? (
          <Check size={24} strokeWidth={3} className="text-trust-high" />
        ) : (
          <ChevronRight size={24} strokeWidth={2.8} className="text-trust-high ml-0.5" />
        )}
      </motion.div>
    </div>
  );
}

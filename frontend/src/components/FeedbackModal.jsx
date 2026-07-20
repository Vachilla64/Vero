import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FACES = [
  { id: 'angry', color: '#FF4B4B', bgClass: 'bg-risk-critical', bgLightClass: 'bg-risk-critical/20', borderClass: 'border-risk-critical', label: 'Angry', icon: '😠' },
  { id: 'upset', color: '#FF8A00', bgClass: 'bg-risk-high', bgLightClass: 'bg-risk-high/20', borderClass: 'border-risk-high', label: 'Upset', icon: '🙁' },
  { id: 'neutral', color: '#FFC300', bgClass: 'bg-risk-neutral', bgLightClass: 'bg-risk-neutral/20', borderClass: 'border-risk-neutral', label: 'Neutral', icon: '😐' },
  { id: 'happy', color: '#00E676', bgClass: 'bg-trust-good', bgLightClass: 'bg-trust-good/20', borderClass: 'border-trust-good', label: 'Happy', icon: '🙂' },
  { id: 'excited', color: '#00C853', bgClass: 'bg-trust-high', bgLightClass: 'bg-trust-high/20', borderClass: 'border-trust-high', label: 'Excited', icon: '🤩' },
];

export default function FeedbackModal({ isOpen, onClose, onSubmit }) {
  const [selected, setSelected] = useState(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="bg-surface w-full max-w-sm rounded-[32px] p-8 shadow-app relative z-10 flex flex-col items-center text-center"
      >
        <div className="w-full flex justify-between items-center mb-6">
          <div className="w-6"></div>
          <h2 className="font-bold text-xl text-ink">Feedback</h2>
          <button onClick={onClose} className="w-6 font-bold text-slate hover:text-ink">⋮</button>
        </div>

        <p className="text-slate font-medium text-sm mb-8">Rate your experience</p>

        {/* Big Icon Display */}
        <div className={`w-32 h-32 rounded-full flex items-center justify-center text-6xl mb-12 transition-all duration-300 relative ${selected !== null ? FACES[selected].bgLightClass : 'bg-[#F4F6F9]'}`}>
          <span className="relative z-10" style={{ filter: selected !== null ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' : 'none' }}>
            {selected !== null ? FACES[selected].icon : '😶'}
          </span>
          {/* Decorative rays for excited */}
          {selected === 4 && (
            <div className={`absolute inset-0 border-[4px] border-dashed rounded-full animate-spin-slow opacity-30 ${FACES[4].borderClass}`}></div>
          )}
        </div>

        {/* Rating Faces */}
        <div className="flex justify-between w-full mb-3 gap-2">
          {FACES.map((face, index) => (
            <button
              key={face.id}
              onClick={() => setSelected(index)}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-300 transform ${face.bgClass} ${selected === index ? 'scale-110 shadow-card' : 'scale-100 opacity-60 hover:opacity-100 hover:scale-105'}`}
            >
              {face.icon}
            </button>
          ))}
        </div>
        
        {/* Color Bar */}
        <div className="w-full h-1.5 rounded-full bg-canvas flex overflow-hidden mb-2">
          {FACES.map((face, index) => (
            <div key={face.id} className={`h-full flex-1 ${face.bgClass} ${selected === null || selected === index ? 'opacity-100' : 'opacity-20'}`}></div>
          ))}
        </div>

        {/* Labels */}
        <div className="flex justify-between w-full mb-8">
          {FACES.map((face, index) => (
            <span key={face.id} className={`text-[10px] font-bold uppercase transition-colors duration-300 ${selected === index ? 'text-ink' : 'text-slate'}`}>
              {face.label}
            </span>
          ))}
        </div>

        <button 
          onClick={() => onSubmit(FACES[selected])}
          disabled={selected === null}
          className={`w-full font-bold py-4 rounded-full text-surface transition-all duration-300 ${selected !== null ? 'bg-ink shadow-card' : 'bg-canvas text-slate cursor-not-allowed'}`}
        >
          Submit
        </button>
      </motion.div>
    </div>
  );
}

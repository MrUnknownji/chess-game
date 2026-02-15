import React, { useRef, useEffect, useMemo } from "react";
import { Move } from "../utils/types";
import { motion } from "framer-motion";
import { FaHistory } from "react-icons/fa";

interface MoveHistoryProps {
  moves: Move[];
  currentMoveIndex: number;
  onMoveSelect: (index: number) => void;
}

const MoveHistory: React.FC<MoveHistoryProps> = ({
  moves,
  currentMoveIndex,
  onMoveSelect,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [moves.length]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const movePairs = useMemo(() => {
    const pairs: { white?: Move; black?: Move; index: number }[] = [];
    for (let i = 0; i < moves.length; i += 2) {
      pairs.push({
        white: moves[i],
        black: moves[i + 1],
        index: i,
      });
    }
    return pairs;
  }, [moves]);

  return (
    <motion.div
      className="glass-panel p-0 w-full overflow-hidden flex flex-col h-[320px] shadow-xl"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex items-center justify-between p-4 bg-slate-800/50 border-b border-white/5">
        <div className="flex items-center gap-2">
          <FaHistory className="text-slate-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Move History
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-500 bg-slate-900/50 px-2 py-1 rounded">
          {moves.length} MOVES
        </span>
      </div>

      <div className="flex-1 overflow-y-auto thin-scrollbar bg-slate-900/20" ref={scrollContainerRef}>
        {movePairs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 italic p-8 gap-2 opacity-50">
             <FaHistory className="text-3xl mb-2" />
             <span className="text-sm">Game has not started</span>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-800/30 text-xs font-semibold text-slate-500 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-4 py-2 w-16 text-center">#</th>
                <th className="px-4 py-2">White</th>
                <th className="px-4 py-2">Black</th>
              </tr>
            </thead>
            <tbody className="text-sm font-mono divide-y divide-white/5">
              {movePairs.map((pair, i) => (
                <tr
                  key={i}
                  className="hover:bg-white/5 transition-colors group"
                >
                  <td className="px-4 py-2 text-center text-slate-500 text-xs bg-slate-800/20 font-bold border-r border-white/5">
                    {i + 1}
                  </td>
                  <td className="p-1">
                    {pair.white && (
                      <button
                        className={`w-full text-left px-3 py-1.5 rounded transition-all ${currentMoveIndex === pair.index
                            ? "bg-indigo-500/20 text-indigo-200 font-bold shadow-[inset_3px_0_0_0_#6366f1]"
                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                          }`}
                        onClick={() => onMoveSelect(pair.index)}
                      >
                        {pair.white.san}
                      </button>
                    )}
                  </td>
                  <td className="p-1">
                    {pair.black && (
                      <button
                        className={`w-full text-left px-3 py-1.5 rounded transition-all ${currentMoveIndex === pair.index + 1
                            ? "bg-indigo-500/20 text-indigo-200 font-bold shadow-[inset_3px_0_0_0_#6366f1]"
                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                          }`}
                        onClick={() => onMoveSelect(pair.index + 1)}
                      >
                        {pair.black.san}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  );
};

export default MoveHistory;

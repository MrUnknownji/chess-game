import React, { useRef, useEffect, useMemo } from "react";
import { Move } from "../utils/types";
import { motion } from "framer-motion";

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
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [moves]);

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
      className="glass-panel p-5 w-full"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-100">
          Move History
        </h3>
        {moves.length > 0 && (
          <span className="text-xs text-slate-500 font-medium">
            {moves.length} {moves.length === 1 ? 'move' : 'moves'}
          </span>
        )}
      </div>
      <div
        ref={scrollContainerRef}
        className="overflow-y-auto thin-scrollbar"
        style={{ maxHeight: "200px", width: "100%" }}
      >
        <div className="space-y-1">
          {movePairs.length === 0 ? (
            <div className="text-center text-slate-500 italic py-8 text-sm">
              No moves yet
            </div>
          ) : (
            movePairs.map((pair, i) => (
              <div
                key={i}
                className="flex text-sm items-center hover:bg-slate-700/30 rounded-md px-2 py-1.5 transition-colors"
              >
                <span className="w-8 text-slate-500 font-medium text-right mr-3 flex-shrink-0 text-xs">
                  {i + 1}.
                </span>
                <div className="flex gap-2 flex-1">
                  {pair.white && (
                    <button
                      className={`px-2.5 py-1 rounded font-mono text-xs font-medium transition-all ${currentMoveIndex === pair.index
                          ? "bg-slate-600/60 text-white"
                          : "text-slate-300 hover:bg-slate-700/40 hover:text-white"
                        }`}
                      onClick={() => onMoveSelect(pair.index)}
                    >
                      {pair.white.san}
                    </button>
                  )}
                  {pair.black && (
                    <button
                      className={`px-2.5 py-1 rounded font-mono text-xs font-medium transition-all ${currentMoveIndex === pair.index + 1
                          ? "bg-slate-600/60 text-white"
                          : "text-slate-300 hover:bg-slate-700/40 hover:text-white"
                        }`}
                      onClick={() => onMoveSelect(pair.index + 1)}
                    >
                      {pair.black.san}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MoveHistory;

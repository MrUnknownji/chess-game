import React from "react";
import { motion } from "framer-motion";
import { FaChess } from "react-icons/fa";

const Header: React.FC = () => {
  return (
    <motion.header
      className="w-full text-center mb-8 px-4"
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
    >
      <div className="inline-flex items-center gap-4 mb-2">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="text-5xl text-indigo-400 opacity-80"
        >
          <FaChess />
        </motion.div>
        <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
          CHESS MASTER
        </h1>
      </div>
      <motion.p
        className="text-lg text-slate-400 font-medium tracking-wide"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        Experience the next generation of chess
      </motion.p>
    </motion.header>
  );
};

export default Header;

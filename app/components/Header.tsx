import React from "react";
import { motion } from "framer-motion";

const Header: React.FC = () => {
  return (
    <motion.header
      className="w-full text-center mb-8 px-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-2 tracking-tight">
        Chess Master
      </h1>
      <p className="text-sm text-slate-400">
        Think ahead, play smart
      </p>
    </motion.header>
  );
};

export default Header;

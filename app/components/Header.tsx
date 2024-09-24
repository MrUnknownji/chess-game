import React from "react";
import { motion } from "framer-motion";

const Header: React.FC = () => {
  const headerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: custom * 0.2,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  return (
    <motion.header
      className="w-full text-center mb-8 px-4"
      initial="hidden"
      animate="visible"
      variants={headerVariants}
    >
      <motion.h1
        className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2"
        variants={textVariants}
        custom={0}
      >
        ChessMaster Royale
      </motion.h1>
      <motion.p
        className="text-base sm:text-lg text-gray-600 italic"
        variants={textVariants}
        custom={1}
      >
        {`"In the game of chess, as in life, forethought wins."`}
      </motion.p>
      <motion.p
        className="text-xs sm:text-sm text-gray-500 mt-2"
        variants={textVariants}
        custom={2}
      >
        Created by Sandeep Kumar
      </motion.p>
    </motion.header>
  );
};

export default Header;

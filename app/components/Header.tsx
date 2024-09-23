import React from "react";

const Header: React.FC = () => {
  return (
    <header className="w-full text-center mb-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">
        ChessMaster Royale
      </h1>
      <p className="text-lg text-gray-600 italic">
        {`"In the game of chess, as in life, forethought wins."`}
      </p>
      <p className="text-sm text-gray-500 mt-2">Created by Sandeep Kumar</p>
    </header>
  );
};

export default Header;

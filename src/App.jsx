import React, { useState } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { bookNames } from '@/data/bookNames';
import SlideshowPage from '@/components/SlideshowPage';

const HomePage = () => {
  const navigate = useNavigate();

  const selectBook = (bookIndex) => {
    navigate(`/book/${bookIndex}`);
  };

  return (
    <div className="relative min-h-screen bg-white py-8 px-4 overflow-hidden">
      {/* Decorative Christian Emoji Background - only on large screens */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-10 select-none text-7xl hidden sm:grid grid-cols-3 grid-rows-2 gap-8 place-items-center rotate-12">
        <span>✝️</span>
        <span>🕊️</span>
        <span>📖</span>
        <span>🙏</span>
        <span>✨</span>
        <span>✝️</span>
      </div>
      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
            RFGC Ministries
          </h1>
          <p className="text-lg font-medium">
            உன் விசுவாசம் உன்னை இரட்சித்தது
          </p>
        </motion.div>
        {/* No hardcoded verse text here */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Old Testament */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-center mb-6">
                பழைய ஏற்பாடு
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {bookNames.slice(0, 39).map((book, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="text-sm h-auto py-3 px-2 transition-colors"
                    onClick={() => selectBook(index)}
                  >
                    {book}
                  </Button>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* New Testament */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-center mb-6">
                புதிய ஏற்பாடு
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {bookNames.slice(39, 66).map((book, index) => (
                  <Button
                    key={index + 39}
                    variant="outline"
                    className="text-sm h-auto py-3 px-2 transition-colors"
                    onClick={() => selectBook(index + 39)}
                  >
                    {book}
                  </Button>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const SlideshowWrapper = () => {
  const { id } = useParams();
  const bookIndex = parseInt(id, 10);
  if (isNaN(bookIndex) || bookIndex < 0 || bookIndex >= bookNames.length) {
    return <div>Invalid book selection</div>;
  }
  return <SlideshowPage bookIndex={bookIndex} />;
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/book/:id" element={<SlideshowWrapper />} />
    </Routes>
  );
};

export default App;
import { useEffect, useState } from "react";
import Papa from "papaparse";
import { bookNames } from "@/data/bookNames";
import { bookNameMap } from "@/data/bookNameMap";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function groupVersesByChapter(verses) {
  const chapters = {};
  verses.forEach((verse, idx) => {
    const chapter = verse["Chapter"];
    if (!chapters[chapter]) chapters[chapter] = [];
    chapters[chapter].push({ ...verse, _index: idx });
  });
  return chapters;
}

function SlideshowPage({ bookIndex }) {
  const [verses, setVerses] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [csvBookNumber, setCsvBookNumber] = useState(null);
  const [expandedChapter, setExpandedChapter] = useState(null);

  useEffect(() => {
    fetch("/ta_irv.csv")
      .then(res => res.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            const tamilBookName = bookNames[bookIndex];
            const englishBookName = Object.keys(bookNameMap)
              .find(key => bookNameMap[key] === tamilBookName);

            const filtered = results.data.filter(row =>
              (row["Book Name"] || "").trim() === englishBookName
            );
            setVerses(filtered);
            setCurrentIndex(0); // Reset to first verse when book changes
            // Set the Book Number from the first verse (CSV is 1-based, bookNames is 0-based)
            if (filtered.length > 0 && filtered[0]["Book Number"]) {
              setCsvBookNumber(parseInt(filtered[0]["Book Number"], 10));
            } else {
              setCsvBookNumber(null);
            }
            // Expand the first chapter by default
            if (filtered.length > 0) {
              setExpandedChapter(filtered[0]["Chapter"]);
            }
          }
        });
      });
  }, [bookIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'Home') {
        setCurrentIndex(0);
      } else if (e.key === 'End') {
        setCurrentIndex(verses.length - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line
  }, [verses.length, currentIndex]);

  if (verses.length === 0) return <div>Loading...</div>;
  const verse = verses[currentIndex];
  if (!verse) return <div>Loading...</div>;

  // Use Book Number from CSV to display the correct book name
  const displayBookName = (csvBookNumber && bookNames[csvBookNumber - 1]) || bookNames[bookIndex];

  // Group verses by chapter for nav bar
  const chapters = groupVersesByChapter(verses);
  const chapterNumbers = Object.keys(chapters);
  const currentChapter = verse["Chapter"];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < verses.length - 1 ? prev + 1 : prev));
  };

  const goToChapter = (chapter) => {
    setExpandedChapter(expandedChapter === chapter ? null : chapter);
  };

  const goToVerse = (idx, chapter) => {
    setCurrentIndex(idx);
    setExpandedChapter(chapter);
  };

  return (
    <div className="min-h-screen bg-white flex flex-row items-start justify-center p-4 pb-32">
      {/* Left Nav Bar */}
      <div className="w-64 max-h-[80vh] overflow-y-auto bg-white rounded-xl shadow-lg mr-8 p-4 sticky top-8">
        <h2 className="text-2xl font-bold mb-4 text-center">{displayBookName}</h2>
        <ul>
          {chapterNumbers.map((chapter) => (
            <li key={chapter} className="mb-2">
              <button
                className={`w-full text-left font-semibold py-1 px-2 rounded transition-colors ${currentChapter === chapter ? 'bg-black text-white' : ''}`}
                onClick={() => goToChapter(chapter)}
              >
                {`Chapter ${chapter}`}
              </button>
              {expandedChapter === chapter && (
                <ul className="ml-4 mt-1">
                  {chapters[chapter].map((v) => (
                    <li key={v["Verse"]}>
                      <button
                        className={`block w-full text-left py-0.5 px-2 rounded text-sm transition-colors ${currentIndex === v._index ? 'bg-black text-white font-bold' : ''}`}
                        onClick={() => goToVerse(v._index, chapter)}
                      >
                        வசனம் {v["Verse"]}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
      {/* Verse Card and Controls */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="relative w-full h-full min-h-screen mb-8 flex flex-col items-center justify-center max-w-full">
          {/* Emoji Overlay - only on large screens */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-10 select-none text-7xl hidden sm:grid grid-cols-3 grid-rows-2 gap-8 place-items-center rotate-12">
            <span>✝️</span>
            <span>🕊️</span>
            <span>📖</span>
            <span>🙏</span>
            <span>✨</span>
            <span>✝️</span>
          </div>
          <Card className="relative z-10 rounded-2xl shadow-2xl p-12 w-full h-full bg-white border flex flex-col items-center justify-center max-w-full">
            <div className="flex flex-col items-center justify-center w-full h-full text-center">
              <p className="text-4xl md:text-5xl font-bold leading-normal text-black mb-8 break-words text-center drop-shadow-lg">
                {verse["Text"]}
              </p>
              <p className="text-2xl font-semibold text-black text-center">
                {displayBookName} {verse["Chapter"]}:{verse["Verse"]}
              </p>
            </div>
          </Card>
        </div>
        <div className="mt-2 text-sm text-black text-center">
          வசனம் {currentIndex + 1} / {verses.length}
        </div>
      </div>
      {/* Fixed bottom navigation */}
      <div className="fixed bottom-0 left-0 w-full flex justify-center bg-white py-6 z-50">
        <div className="flex gap-8">
          <Button onClick={goToPrevious} disabled={currentIndex === 0} variant="outline" size="lg">
            முந்தைய
          </Button>
          <Button onClick={goToNext} disabled={currentIndex === verses.length - 1} variant="outline" size="lg">
            அடுத்தது
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SlideshowPage; 
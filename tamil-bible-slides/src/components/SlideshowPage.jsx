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
            setExpandedChapter(filtered.length > 0 ? filtered[0]["Chapter"] : null);
          }
        });
      });
  }, [bookIndex]);

  if (verses.length === 0) return <div>Loading...</div>;

  const verse = verses[currentIndex];
  const chapters = groupVersesByChapter(verses);
  const chapterNumbers = Object.keys(chapters);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
    const prevVerse = verses[currentIndex - 1];
    if (prevVerse) setExpandedChapter(prevVerse["Chapter"]);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < verses.length - 1 ? prev + 1 : prev));
    const nextVerse = verses[currentIndex + 1];
    if (nextVerse) setExpandedChapter(nextVerse["Chapter"]);
  };

  const goToVerse = (idx) => {
    setCurrentIndex(idx);
    setExpandedChapter(verses[idx]["Chapter"]);
  };

  const handleChapterClick = (chapter) => {
    setExpandedChapter(expandedChapter === chapter ? null : chapter);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-row items-start justify-center p-4">
      {/* Left Nav Bar */}
      <div className="w-64 max-h-[80vh] overflow-y-auto bg-white rounded-xl shadow-lg mr-8 p-4 sticky top-8">
        <h2 className="text-2xl font-bold mb-2 text-center">{bookNames[bookIndex]}</h2>
        <h3 className="text-xl font-bold mb-4 text-center">அத்தியாயங்கள்</h3>
        <ul>
          {chapterNumbers.map((chapter) => (
            <li key={chapter} className="mb-2">
              <button
                className={`w-full text-left font-semibold py-1 px-2 rounded transition-colors ${expandedChapter === chapter ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'}`}
                onClick={() => handleChapterClick(chapter)}
              >
                அத்தியாயம் {chapter}
              </button>
              {expandedChapter === chapter && (
                <ul className="ml-4 mt-1">
                  {chapters[chapter].map((v) => (
                    <li key={v["Verse"]}>
                      <button
                        className={`block w-full text-left py-0.5 px-2 rounded text-sm transition-colors ${currentIndex === v._index ? 'bg-indigo-500 text-white font-bold' : 'hover:bg-indigo-50'}`}
                        onClick={() => goToVerse(v._index)}
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
      <div className="flex-1 flex flex-col items-center">
        <Card className="rounded-2xl shadow-xl p-8 max-w-2xl w-full mb-6">
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold leading-snug text-gray-800 mb-4">
              {verse["Text"]}
            </p>
            <p className="text-lg font-semibold text-gray-600">
              {bookNames[bookIndex]} {verse["Chapter"]}:{verse["Verse"]}
            </p>
          </div>
        </Card>
        <div className="flex gap-4 mt-4">
          <Button onClick={goToPrevious} disabled={currentIndex === 0} variant="outline">
            முந்தைய
          </Button>
          <Button onClick={goToNext} disabled={currentIndex === verses.length - 1} variant="outline">
            அடுத்தது
          </Button>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          வசனம் {currentIndex + 1} / {verses.length}
        </div>
      </div>
    </div>
  );
}

export default SlideshowPage; 
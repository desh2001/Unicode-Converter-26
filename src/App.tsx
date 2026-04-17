import React, { useState, useEffect } from 'react';
import { Moon, Sun, Copy, Trash2, BookOpen, X } from 'lucide-react';
import { convertSinglishToUnicode, convertUnicodeToLegacy, consonants, independentVowels } from './utils/converter';

function App() {
  const [singlish, setSinglish] = useState('');
  const [unicode, setUnicode] = useState('');
  const [legacy, setLegacy] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showCharMap, setShowCharMap] = useState(false);
  
  // Initialize theme
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleSinglishChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const rawText = e.target.value;
    setSinglish(rawText);
    const convertedUnicode = convertSinglishToUnicode(rawText);
    setUnicode(convertedUnicode);
    setLegacy(convertUnicodeToLegacy(convertedUnicode));
  };

  const handleClear = () => {
    setSinglish('');
    setUnicode('');
    setLegacy('');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-300">
      {/* Decorative gradient backgrounds for glassmorphism effect */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400 opacity-20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-pink-400 opacity-20 blur-[100px] pointer-events-none" />
      
      {/* Header */}
      <header className="glass sticky top-0 z-10 mx-auto max-w-6xl mt-4 px-6 py-4 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            සි
          </div>
          <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
            Sinhala Converter
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowCharMap(!showCharMap)}
            className="p-2.5 rounded-xl glass-input hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Character Map"
          >
            <BookOpen size={20} className="text-[var(--text-color)]" />
          </button>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2.5 rounded-xl glass-input hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-600" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">


        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold opacity-80">Real-time Translator</h2>
          <button 
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 glass-input rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <Trash2 size={16} /> Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Area */}
          <div className="flex flex-col gap-2 relative">
            <label className="text-sm font-medium opacity-70 ml-1">
              Singlish Input (Type English Here)
            </label>
            <textarea
              value={singlish}
              onChange={handleSinglishChange}
              placeholder="Start typing slowly... e.g., 'ammaa', 'kohomada'"
              className="w-full h-48 md:h-64 p-5 rounded-2xl glass glass-input focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none text-lg transition-all"
            />
          </div>

          {/* Output Area (Unicode) */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end">
              <label className="text-sm font-medium opacity-70 ml-1">Sinhala Unicode Output</label>
            </div>
            <div className="relative group h-48 md:h-64">
              <textarea
                readOnly
                value={unicode}
                placeholder="සිංහල යුනිකෝඩ් ප්‍රතිදානය..."
                className="w-full h-full p-5 rounded-2xl glass glass-input focus:outline-none resize-none text-xl bg-opacity-50 dark:bg-opacity-20 transition-all"
              />
              {unicode && (
                <button 
                  onClick={() => handleCopy(unicode)}
                  className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-black/50 backdrop-blur-sm rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors opacity-0 group-hover:opacity-100"
                  title="Copy Unicode"
                >
                  <Copy size={18} className="text-purple-600 dark:text-purple-400" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Legacy Output Area */}
        <div className="mt-8 flex flex-col gap-2">
          <label className="text-sm font-medium opacity-70 ml-1">Legacy Font Output (ASCII / FM Abhaya)</label>
          <div className="relative group">
            <textarea
              readOnly
              value={legacy}
              placeholder="Legacy font string..."
              className="w-full h-24 p-5 rounded-2xl glass glass-input focus:outline-none resize-none font-mono text-lg transition-all"
            />
            {legacy && (
              <button 
                onClick={() => handleCopy(legacy)}
                className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-black/50 backdrop-blur-sm rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/50 transition-colors opacity-0 group-hover:opacity-100"
                title="Copy Legacy"
              >
                <Copy size={18} className="text-pink-600 dark:text-pink-400" />
              </button>
            )}
          </div>
          <p className="text-xs opacity-60 ml-2 mt-1">
            Note: Copy this text and paste it into older applications like MS Word with an FM or Legacy font applied.
          </p>
        </div>
      </main>

      {/* Character Map Sidebar */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-80 glass border-l border-white/20 transform transition-transform duration-300 ease-in-out ${
          showCharMap ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Character Map</h3>
            <button 
              onClick={() => setShowCharMap(false)}
              className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-6 text-sm">
              <div>
                <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-3 border-b border-purple-200 dark:border-purple-900 pb-1">Vowels & Modifiers</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(independentVowels).map(([key, val]) => (
                    <div key={key} className="flex justify-between p-2 rounded glass-input">
                      <span className="font-mono">{key === '\\n' ? '\\n' : key === '\\h' ? '\\h' : key === '\\R' ? '\\R' : key}</span>
                      <span className="font-bold">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-pink-600 dark:text-pink-400 mb-3 border-b border-pink-200 dark:border-pink-900 pb-1">Consonants</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(consonants).map(([key, val]) => (
                    <div key={key} className="flex justify-between p-2 rounded glass-input">
                      <span className="font-mono">{key.replace(/\\/g, '\\\\')}</span>
                      <span className="font-bold">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Overlay for sidebar */}
      {showCharMap && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity" 
          onClick={() => setShowCharMap(false)}
        />
      )}
    </div>
  );
}

export default App;

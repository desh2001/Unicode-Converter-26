import React, { useState, useEffect } from 'react';
import { Copy, Trash2, BookOpen, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { convertSinglishToUnicode, convertUnicodeToLegacy, consonants, independentVowels } from './utils/converter';

function AmbientBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#0f172a]">
      <motion.div
        className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full filter blur-[100px] opacity-20 bg-purple-600"
        animate={{ x: ["0%", "10%", "0%"], y: ["0%", "15%", "0%"], scale: [1, 1.1, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full filter blur-[100px] opacity-20 bg-blue-600"
        animate={{ x: ["0%", "-15%", "0%"], y: ["0%", "-10%", "0%"], scale: [1, 1.05, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[30%] left-[30%] w-[50vw] h-[50vw] rounded-full filter blur-[120px] opacity-15 bg-indigo-500"
        animate={{ x: ["0%", "5%", "0%"], y: ["0%", "-15%", "0%"], scale: [1, 1.15, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function App() {
  const [singlish, setSinglish] = useState('');
  const [unicode, setUnicode] = useState('');
  const [legacy, setLegacy] = useState('');
  const [showCharMap, setShowCharMap] = useState(false);
  const [activeTab, setActiveTab] = useState<'unicode' | 'legacy'>('unicode');

  // Copy success states
  const [copiedUnicode, setCopiedUnicode] = useState(false);
  const [copiedLegacy, setCopiedLegacy] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const handleCopy = (text: string, type: 'unicode' | 'legacy') => {
    navigator.clipboard.writeText(text);
    
    // Trigger checkmark swap
    if (type === 'unicode') setCopiedUnicode(true);
    else setCopiedLegacy(true);

    // Trigger Toast
    setToastMessage('Copied to clipboard!');

    // Reset timeouts
    setTimeout(() => {
      if (type === 'unicode') setCopiedUnicode(false);
      else setCopiedLegacy(false);
    }, 2000);

    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <div className="min-h-screen relative font-sans text-slate-100 pb-10">
      {/* Live Active Background */}
      <AmbientBackground />
      
      {/* Toast Notification */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="bg-indigo-600/90 backdrop-blur-md text-white px-5 py-2.5 rounded-full shadow-lg shadow-indigo-500/20 flex items-center gap-2 border border-indigo-500/50"
            >
              <Check size={16} />
              <span className="text-sm font-medium tracking-wide">{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 flex flex-col min-h-screen p-4">
        {/* Header */}
        <header className="glass sticky top-4 mx-auto w-full px-6 py-4 rounded-2xl flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-indigo-400 font-bold text-xl border border-white/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              සි
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight">
              Sinhala <span className="text-indigo-400 font-medium">Converter</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCharMap(!showCharMap)}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 text-indigo-300 shadow-sm"
              title="Character Map"
            >
              <BookOpen size={20} />
            </motion.button>
          </div>
        </header>

        {/* Main Workspace Layout */}
        <main className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
          
          {/* LEFT: Input Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-4 p-6 glass rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl"
          >
            <div className="flex justify-between items-center px-1">
              <label className="text-sm font-medium text-indigo-300 tracking-wider uppercase">
                Singlish Input
              </label>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-pink-400 bg-pink-500/10 rounded-lg hover:bg-pink-500/20 transition-all border border-pink-500/20"
              >
                <Trash2 size={14} /> Clear
              </motion.button>
            </div>
            <textarea
              value={singlish}
              onChange={handleSinglishChange}
              placeholder="Start typing slowly... (e.g., 'kohomada')"
              className="w-full flex-1 min-h-[300px] p-5 rounded-2xl bg-black/20 focus:bg-black/30 border border-white/5 focus:border-indigo-400/50 outline-none resize-none text-lg transition-all focus:ring-4 focus:ring-indigo-500/20 placeholder:text-slate-500/50"
            />
          </motion.div>

          {/* RIGHT: Output Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-4 p-6 glass rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl"
          >
            {/* Tabs Header */}
            <div className="flex items-center gap-2 p-1 bg-black/20 rounded-xl border border-white/5">
              <button
                onClick={() => setActiveTab('unicode')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === 'unicode' 
                    ? 'bg-indigo-500/20 text-indigo-200 border-indigo-500/30 border shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                Sinhala Unicode
              </button>
              <button
                onClick={() => setActiveTab('legacy')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === 'legacy' 
                    ? 'bg-pink-500/20 text-pink-200 border-pink-500/30 border shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                Legacy (FM Abhaya)
              </button>
            </div>

            {/* Tab Content Wrapper */}
            <div className="relative flex-1 min-h-[300px] mt-2 group">
              <AnimatePresence mode="wait">
                {activeTab === 'unicode' ? (
                  <motion.div
                    key="unicode-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0"
                  >
                    <textarea
                      readOnly
                      value={unicode}
                      placeholder="සිංහල යුනිකෝඩ්..."
                      className="w-full h-full p-5 rounded-2xl bg-black/20 border border-white/5 outline-none resize-none text-2xl transition-all text-slate-100 placeholder:text-slate-500/40"
                    />
                    {unicode && (
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCopy(unicode, 'unicode')}
                        className="absolute bottom-4 right-4 p-3 bg-indigo-500 glass backdrop-blur-md border border-white/20 rounded-xl hover:bg-indigo-400 transition-colors shadow-lg flex items-center justify-center text-white"
                        title="Copy Unicode"
                      >
                        <AnimatePresence mode="wait">
                          {copiedUnicode ? (
                            <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                              <Check size={20} />
                            </motion.div>
                          ) : (
                            <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                              <Copy size={20} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="legacy-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0"
                  >
                    <textarea
                      readOnly
                      value={legacy}
                      placeholder="Legacy font string..."
                      style={{ fontFamily: "'Bindumathi', 'FMAbhaya', sans-serif" }}
                      className="w-full h-full p-5 rounded-2xl bg-black/20 border border-white/5 outline-none resize-none text-2xl transition-all text-slate-300 placeholder:text-slate-500/40"
                    />
                    {legacy && (
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCopy(legacy, 'legacy')}
                        className="absolute bottom-4 right-4 p-3 bg-pink-500 glass backdrop-blur-md border border-white/20 rounded-xl hover:bg-pink-400 transition-colors shadow-lg flex items-center justify-center text-white"
                        title="Copy Legacy"
                      >
                        <AnimatePresence mode="wait">
                          {copiedLegacy ? (
                            <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                              <Check size={20} />
                            </motion.div>
                          ) : (
                            <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                              <Copy size={20} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

        </main>
      </div>

      {/* Character Map Sidebar */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-80 bg-slate-900/90 backdrop-blur-2xl border-l border-white/10 transform transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          showCharMap ? 'translate-x-0 shadow-[-20px_0_40px_rgba(0,0,0,0.5)]' : 'translate-x-full'
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-100">Character Map</h3>
            <button 
              onClick={() => setShowCharMap(false)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors border border-transparent hover:border-white/5"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-6 text-sm">
              <div>
                <h4 className="font-semibold text-indigo-400 mb-3 border-b border-indigo-900/50 pb-1 uppercase tracking-wider text-[11px]">Vowels & Modifiers</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(independentVowels).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center p-2 rounded-lg bg-black/20 border border-white/5 hover:border-indigo-500/30 transition-colors">
                      <span className="font-mono text-slate-400">{key === '\\n' ? '\\n' : key === '\\h' ? '\\h' : key === '\\R' ? '\\R' : key}</span>
                      <span className="font-bold text-slate-100 text-base">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-pink-400 mb-3 border-b border-pink-900/50 pb-1 uppercase tracking-wider text-[11px]">Consonants</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(consonants).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center p-2 rounded-lg bg-black/20 border border-white/5 hover:border-pink-500/30 transition-colors">
                      <span className="font-mono text-slate-400">{key.replace(/\\/g, '\\\\')}</span>
                      <span className="font-bold text-slate-100 text-base">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Overlay for sidebar */}
      <AnimatePresence>
        {showCharMap && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40" 
            onClick={() => setShowCharMap(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;

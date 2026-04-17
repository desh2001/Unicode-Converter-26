import React, { useState } from 'react';
import { Copy, Trash2, BookOpen, X, Check, Zap } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { convertSinglishToUnicode, convertUnicodeToLegacy, restoreLegacyPunctuation, consonants, independentVowels } from './utils/converter';
import logo from './assets/akshara.logo.png';

/**
 * Parses a legacy string that may contain PUA-marked punctuation (U+E021–U+E07E)
 * into segments: FM-Abhaya-encoded Sinhala vs. original ASCII punctuation.
 */
function renderLegacyText(text: string): React.ReactNode[] {
  const segments: { content: string; system: boolean }[] = [];
  let buf = '';
  let bufSystem = false;
  let started = false;

  for (const char of text) {
    const code = char.codePointAt(0)!;
    const isSystem = code >= 0xE021 && code <= 0xE07E;
    if (!started) { bufSystem = isSystem; started = true; }
    if (isSystem !== bufSystem) {
      segments.push({ content: buf, system: bufSystem });
      buf = '';
      bufSystem = isSystem;
    }
    buf += isSystem ? String.fromCodePoint(code - 0xE000) : char;
  }
  if (buf) segments.push({ content: buf, system: bufSystem });

  return segments.map((seg, i) => (
    <span
      key={i}
      style={seg.system ? { fontFamily: "'Inter', Arial, sans-serif", fontSize: 20  } : {}}
    >
      {seg.content}
    </span>
  ));
}


/* ─────────────────────────────────────────
   Rich Animated Background
───────────────────────────────────────── */
function AmbientBackground() {
  const orbs = [
    { color: '#7c3aed', size: '72vw', top: '-15%', left: '-12%',  dur: 26, dx: ['0%','12%','0%'], dy: ['0%','18%','0%'] },
    { color: '#2563eb', size: '60vw', top: '55%',  left: '55%',   dur: 32, dx: ['0%','-14%','0%'], dy: ['0%','-12%','0%'] },
    { color: '#db2777', size: '48vw', top: '20%',  left: '30%',   dur: 22, dx: ['0%','8%','0%'],  dy: ['0%','-18%','0%'] },
    { color: '#0891b2', size: '38vw', top: '70%',  left: '5%',    dur: 28, dx: ['0%','10%','0%'], dy: ['0%','-8%','0%'] },
    { color: '#4f46e5', size: '30vw', top: '5%',   left: '60%',   dur: 18, dx: ['0%','-10%','0%'],dy: ['0%','12%','0%'] },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, #0f0c29 0%, #060818 60%, #000000 100%)' }}>
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: orb.size,
            height: orb.size,
            top: orb.top,
            left: orb.left,
            borderRadius: '50%',
            background: orb.color,
            filter: 'blur(110px)',
            opacity: 0.18,
          }}
          animate={{ x: orb.dx, y: orb.dy, scale: [1, 1.12, 1] }}
          transition={{ duration: orb.dur, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Shimmer grid overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />

      {/* Top shine */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '80%', height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.4), rgba(99,102,241,0.4), transparent)',
      }} />
    </div>
  );
}

/* ─────────────────────────────────────────
   Floating Orb (mouse-reactive)
───────────────────────────────────────── */
function GlowCursor() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  React.useEffect(() => {
    const move = (e: MouseEvent) => { x.set(e.clientX - 200); y.set(e.clientY - 200); };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <motion.div
      style={{ x, y, position: 'fixed', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 1 }}
    />
  );
}

/* ─────────────────────────────────────────
   Main App
───────────────────────────────────────── */
function App() {
  const [singlish, setSinglish] = useState('');
  const [unicode, setUnicode] = useState('');
  const [legacy, setLegacy] = useState('');
  const [showCharMap, setShowCharMap] = useState(false);
  const [activeTab, setActiveTab] = useState<'unicode' | 'legacy'>('unicode');
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

  const handleClear = () => { setSinglish(''); setUnicode(''); setLegacy(''); };

  const handleCopy = (text: string, type: 'unicode' | 'legacy') => {
    navigator.clipboard.writeText(text);
    if (type === 'unicode') setCopiedUnicode(true); else setCopiedLegacy(true);
    setToastMessage('Copied to clipboard!');
    setTimeout(() => { if (type === 'unicode') setCopiedUnicode(false); else setCopiedLegacy(false); }, 2000);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 8px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
  };

  const headerStyle: React.CSSProperties = {
    background: 'rgba(10,8,30,0.6)',
    backdropFilter: 'blur(32px)',
    WebkitBackdropFilter: 'blur(32px)',
    border: '1px solid rgba(139,92,246,0.2)',
    boxShadow: '0 4px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)',
  };

  const textareaStyle: React.CSSProperties = {
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.06)',
    color: '#e2e8f0',
    outline: 'none',
    resize: 'none',
    transition: 'all 0.3s',
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', fontFamily: "'Inter', sans-serif", color: '#e2e8f0', overflowX: 'hidden' }}>
      <AmbientBackground />
      <GlowCursor />

      {/* ── Toast ── */}
      <div style={{ position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 200, pointerEvents: 'none' }}>
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.9 }}
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.9))',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(139,92,246,0.5)',
                borderRadius: 999,
                padding: '10px 20px',
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
                color: '#fff', fontSize: 14, fontWeight: 500,
              }}
            >
              <Check size={15} />
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ position: 'relative', zIndex: 10, maxWidth: 1200, margin: '0 auto', padding: '16px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* ── Header ── */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ ...headerStyle, borderRadius: 20, padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, position: 'sticky', top: 12 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <motion.div
              whileHover={{ scale: 1.08, rotate: 3 }}
              style={{
                width: 42, height: 42, borderRadius: 12,
                background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 20px rgba(139,92,246,0.3)',
                overflow: 'hidden', padding: 3,
              }}
            >
              <img src={logo} alt="Akshara" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </motion.div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, lineHeight: 1, letterSpacing: '-0.5px',
                background: 'linear-gradient(90deg, #a78bfa, #818cf8, #e879f9)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Akshara
              </h1>
              <p style={{ margin: 0, fontSize: 10, color: 'rgba(148,163,184,0.7)', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 1 }}>
                Sinhala Converter
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Char count badge */}
            {singlish && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)',
                  borderRadius: 8, padding: '4px 12px', fontSize: 12, color: '#a78bfa',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <Zap size={12} />
                {unicode.length} chars
              </motion.div>
            )}
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 24px rgba(139,92,246,0.3)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCharMap(!showCharMap)}
              style={{
                background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)',
                borderRadius: 12, padding: '10px', cursor: 'pointer',
                color: '#a78bfa', display: 'flex', alignItems: 'center',
                transition: 'all 0.2s',
              }}
              title="Character Map"
            >
              <BookOpen size={18} />
            </motion.button>
          </div>
        </motion.header>

        {/* ── Sub-heading ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: 32 }}
        >
          <p style={{ color: 'rgba(148,163,184,0.6)', fontSize: 14, letterSpacing: 0.5 }}>
            Type in Singlish — get instant Sinhala Unicode & Legacy font output
          </p>
        </motion.div>

        {/* ── Main Grid ── */}
        <main style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, paddingBottom: 32 }}>

          {/* LEFT: Input */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            style={{ ...cardStyle, borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #a78bfa, #818cf8)', boxShadow: '0 0 8px #a78bfa' }} />
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#a78bfa' }}>
                  Singlish Input
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClear}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', fontSize: 12, fontWeight: 600,
                  color: '#f472b6', background: 'rgba(244,114,182,0.1)',
                  border: '1px solid rgba(244,114,182,0.2)', borderRadius: 8, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Trash2 size={13} /> Clear
              </motion.button>
            </div>

            <textarea
              value={singlish}
              onChange={handleSinglishChange}
              placeholder="Start typing..."
              style={{
                ...textareaStyle,
                width: '100%', flex: 1, minHeight: 320,
                padding: 20, borderRadius: 16, fontSize: 18,
                lineHeight: 1.7, boxSizing: 'border-box',
              }}
              onFocus={e => {
                e.currentTarget.style.border = '1px solid rgba(139,92,246,0.5)';
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(139,92,246,0.1)';
              }}
              onBlur={e => {
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />

            {/* Bottom hint */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['sha → ශ', 'kru → කෘ', 'shrii → ශ්‍රී'].map((hint) => (
                <span key={hint} style={{
                  fontSize: 11, color: 'rgba(148,163,184,0.5)',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 6, padding: '3px 8px',
                }}>
                  {hint}
                </span>
              ))}
            </div>
          </motion.div>

          {/* RIGHT: Output */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            style={{ ...cardStyle, borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            {/* Tab switcher */}
            <div style={{
              display: 'flex', gap: 6, padding: 6,
              background: 'rgba(0,0,0,0.3)', borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.05)',
            }}>
              {(['unicode', 'legacy'] as const).map(tab => {
                const isActive = activeTab === tab;
                const accent = tab === 'unicode' ? '#818cf8' : '#e879f9';
                return (
                  <motion.button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      flex: 1, padding: '9px 12px', borderRadius: 10,
                      fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      letterSpacing: 0.5, transition: 'all 0.25s',
                      border: isActive ? `1px solid ${accent}44` : '1px solid transparent',
                      background: isActive ? `${accent}1a` : 'transparent',
                      color: isActive ? accent : 'rgba(148,163,184,0.6)',
                      boxShadow: isActive ? `0 0 16px ${accent}22` : 'none',
                    }}
                  >
                    {tab === 'unicode' ? 'Sinhala Unicode' : 'Legacy (FM Abhaya)'}
                  </motion.button>
                );
              })}
            </div>

            {/* Output area */}
            <div style={{ position: 'relative', flex: 1, minHeight: 300 }}>
              <AnimatePresence mode="wait">
                {activeTab === 'unicode' ? (
                  <motion.div
                    key="unicode"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    style={{ position: 'absolute', inset: 0 }}
                  >
                    <textarea
                      readOnly
                      value={unicode}
                      placeholder="සිංහල යුනිකෝඩ්..."
                      style={{
                        ...textareaStyle,
                        width: '100%', height: '100%', padding: 20,
                        borderRadius: 16, fontSize: 26, lineHeight: 1.7,
                        boxSizing: 'border-box', color: '#e2e8f0',
                      }}
                    />
                    {unicode && (
                      <motion.button
                        whileHover={{ scale: 1.07, boxShadow: '0 0 24px rgba(99,102,241,0.5)' }}
                        whileTap={{ scale: 0.93 }}
                        onClick={() => handleCopy(unicode, 'unicode')}
                        style={{
                          position: 'absolute', bottom: 14, right: 14,
                          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                          border: '1px solid rgba(139,92,246,0.4)',
                          borderRadius: 12, padding: 12, cursor: 'pointer',
                          color: '#fff', display: 'flex', alignItems: 'center',
                          boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
                        }}
                      >
                        <AnimatePresence mode="wait">
                          {copiedUnicode
                            ? <motion.div key="ck" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check size={18} /></motion.div>
                            : <motion.div key="cp" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Copy size={18} /></motion.div>}
                        </AnimatePresence>
                      </motion.button>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="legacy"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    style={{ position: 'absolute', inset: 0 }}
                  >
                    {/* Mixed-font div: FM Abhaya for Sinhala, system font for original punctuation */}
                    <div
                      style={{
                        ...textareaStyle,
                        width: '100%', height: '100%', padding: 20,
                        borderRadius: 16, fontSize: 26, lineHeight: 1.7,
                        boxSizing: 'border-box', color: '#f0d9ff',
                        fontFamily: "'Bindumathi', 'FMAbhaya', sans-serif",
                        overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                        userSelect: 'text',
                      }}
                    >
                      {legacy
                        ? renderLegacyText(legacy)
                        : <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: 'rgba(148,163,184,0.3)' }}>ghsma lrkak wrUkak</span>
                      }
                    </div>
                    {legacy && (
                      <motion.button
                        whileHover={{ scale: 1.07, boxShadow: '0 0 24px rgba(232,121,249,0.5)' }}
                        whileTap={{ scale: 0.93 }}
                        onClick={() => handleCopy(restoreLegacyPunctuation(legacy), 'legacy')}
                        style={{
                          position: 'absolute', bottom: 14, right: 14,
                          background: 'linear-gradient(135deg, #a21caf, #e879f9)',
                          border: '1px solid rgba(232,121,249,0.4)',
                          borderRadius: 12, padding: 12, cursor: 'pointer',
                          color: '#fff', display: 'flex', alignItems: 'center',
                          boxShadow: '0 4px 16px rgba(232,121,249,0.3)',
                        }}
                      >
                        <AnimatePresence mode="wait">
                          {copiedLegacy
                            ? <motion.div key="ck" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check size={18} /></motion.div>
                            : <motion.div key="cp" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Copy size={18} /></motion.div>}
                        </AnimatePresence>
                      </motion.button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </main>

        {/* ── Footer ── */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ textAlign: 'center', paddingBottom: 16, color: 'rgba(100,116,139,0.5)', fontSize: 12 }}
        >
          Akshara · Singlish → Sinhala · Built by Desh ❤️
        </motion.footer>
      </div>

      {/* ── Character Map Sidebar ── */}
      <AnimatePresence>
        {showCharMap && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(2,4,20,0.65)', backdropFilter: 'blur(6px)', zIndex: 40 }}
            onClick={() => setShowCharMap(false)}
          />
        )}
      </AnimatePresence>

      <div
        style={{
          position: 'fixed', inset: '0 0 0 auto', zIndex: 50, width: 320,
          background: 'rgba(6,4,24,0.85)', backdropFilter: 'blur(32px)',
          borderLeft: '1px solid rgba(139,92,246,0.2)',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.6)',
          transform: showCharMap ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.4s cubic-bezier(0.2,0.8,0.2,1)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700,
              background: 'linear-gradient(90deg, #a78bfa, #818cf8)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Character Map
            </h3>
            <button
              onClick={() => setShowCharMap(false)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#94a3b8', display: 'flex' }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#818cf8' }}>
                Vowels &amp; Modifiers
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {Object.entries(independentVowels).map(([key, val]) => (
                  <div key={key} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 10px', borderRadius: 10,
                    background: 'rgba(129,140,248,0.05)', border: '1px solid rgba(129,140,248,0.1)',
                  }}>
                    <span style={{ fontFamily: 'monospace', color: '#94a3b8', fontSize: 13 }}>{key}</span>
                    <span style={{ fontWeight: 700, fontSize: 16, color: '#e2e8f0' }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ margin: '0 0 12px 0', fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#e879f9' }}>
                Consonants
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {Object.entries(consonants).map(([key, val]) => (
                  <div key={key} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 10px', borderRadius: 10,
                    background: 'rgba(232,121,249,0.05)', border: '1px solid rgba(232,121,249,0.1)',
                  }}>
                    <span style={{ fontFamily: 'monospace', color: '#94a3b8', fontSize: 13 }}>{key.replace(/\\/g, '\\\\')}</span>
                    <span style={{ fontWeight: 700, fontSize: 16, color: '#e2e8f0' }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

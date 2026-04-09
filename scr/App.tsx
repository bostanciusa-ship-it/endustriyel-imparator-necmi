import React, { useState, useEffect, useRef } from 'react';

/** * --- SES MOTORU ---
 */
const playSfx = (type: 'click' | 'buy' | 'collect' | 'plane' | 'alert' | 'success') => {
  try {
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    const now = ctx.currentTime;

    if (type === 'click') {
      osc.frequency.setValueAtTime(150, now); gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1); osc.start(); osc.stop(now + 0.1);
    } else if (type === 'buy') {
      osc.frequency.setValueAtTime(440, now); gain.gain.setValueAtTime(0.03, now);
      osc.start(); osc.stop(now + 0.3);
    } else if (type === 'alert') {
      osc.type = 'square'; osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(110, now + 0.1); gain.gain.setValueAtTime(0.05, now);
      osc.start(); osc.stop(now + 0.4);
    } else if (type === 'success') {
      osc.frequency.setValueAtTime(523, now); osc.frequency.setValueAtTime(659, now + 0.1);
      gain.gain.setValueAtTime(0.04, now); osc.start(); osc.stop(now + 0.3);
    } else if (type === 'plane') {
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(50, now);
      gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(0.02, now + 2.5);
      gain.gain.linearRampToValueAtTime(0, now + 5); osc.start(); osc.stop(now + 5);
    }
  } catch (e) {}
};

// --- GÖRSEL BİLEŞENLER ---
const DubaIcon = () => (
  <svg width="60" height="75" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 0 12px rgba(255,165,0,0.6))' }}>
    <path d="M10 100 L90 100 L85 110 L15 110 Z" fill="#222" />
    <path d="M30 100 L40 20 L60 20 L70 100 Z" fill="#FF4500" />
    <path d="M36 52 L64 52 L67 68 L33 68 Z" fill="white" opacity="0.9" />
  </svg>
);

const BackgroundGrid = () => (
  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.1, zIndex: 0, pointerEvents: 'none' }}>
    <defs><pattern id="dotPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="#3b82f6" /></pattern></defs>
    <rect width="100%" height="100%" fill="url(#dotPattern)" />
  </svg>
);

function App() {
  const [pass, setPass] = useState("");
  const [isLogged, setIsLogged] = useState(false);
  const [mode, setMode] = useState<"HOCA" | "NECMI" | null>(null);
  const [cash, setCash] = useState(250); 
  const [stock, setStock] = useState(0);   
  const [logs, setLogs] = useState<{id: number, text: string}[]>([]);
  const [nargile, setNargile] = useState<{id: number, x: number, y: number} | null>(null);
  const [planeActive, setPlaneActive] = useState(false); 
  const [duba, setDuba] = useState<{id: number, x: number, y: number, dropping: boolean} | null>(null);
  const [levels, setLevels] = useState({ clickPower: 1, autoWorker: 0, marketing: 1, factorySize: 1 });
  
  // Kriz Durumları
  const [activeEvent, setActiveEvent] = useState<{ type: 'TAX' | 'STRIKE' | 'RAID', endTime: number } | null>(null);
  const [strikeActive, setStrikeActive] = useState(false);

  const lastNargileRef = useRef(Date.now());
  const lastPlaneRef = useRef(Date.now());

  const addLog = (msg: string) => setLogs(prev => [{ id: Date.now(), text: msg }, ...prev].slice(0, 5));

  const checkPass = () => {
    const input = pass.trim().toUpperCase();
    if (input === "B123B123") { setMode("NECMI"); setIsLogged(true); addLog("Patron sahaya indi!"); }
    else if (input === "3689") { setMode("HOCA"); setIsLogged(true); addLog("Akademik izleme aktif."); }
    else { alert("Kod Yanlış!"); setPass(""); }
  };

  const upgInfo = {
    clickPower: { title: "🚀 TIK GÜCÜ", hocaDesc: "Birim verimlilik.", necmiDesc: "Daha sert bas.", base: 200 },
    autoWorker: { title: "🤖 İŞÇİ", hocaDesc: "Otomasyon sistemi.", necmiDesc: "Eleman al.", base: 500 },
    marketing: { title: "📈 PAZARLAMA", hocaDesc: "Satış hızı.", necmiDesc: "Malları okut.", base: 600 },
    factorySize: { title: "🏗️ DEPO", hocaDesc: "Kapasite artışı.", necmiDesc: "Holdingi büyüt.", base: 650 }
  };

  const getCost = (type: keyof typeof levels) => {
    const base = upgInfo[type].base;
    const lv = levels[type];
    const power = lv === 0 ? 0 : (type === 'autoWorker' ? lv : lv - 1);
    return Math.floor(base * Math.pow(1.25, power));
  };

  const resolveEvent = (success: boolean) => {
    if (!activeEvent) return;
    if (success) {
      playSfx('success');
      addLog(mode === 'HOCA' ? "✅ Risk yönetimi başarılı." : "🔥 Kriz çözüldü patron!");
    } else {
      playSfx('alert');
      const penalty = Math.floor(cash * 0.15);
      setCash(c => Math.max(0, c - penalty));
      addLog(mode === 'HOCA' ? `❌ Operasyonel kayıp: -${penalty}$` : `❌ Ceza yedik: -${penalty}$`);
    }
    setActiveEvent(null);
    setStrikeActive(false);
  };

  useEffect(() => {
    if (!isLogged) return;
    const tick = setInterval(() => {
      // 1. Üretim (Grevde Durur)
      if (!strikeActive) {
        setStock(s => {
          const max = levels.factorySize * 40;
          return levels.autoWorker > 0 && s < max ? Math.min(s + (levels.autoWorker * 0.25), max) : s;
        });
      }
      // 2. Satış
      setCash(c => {
        let cur = 0; setStock(s => { cur = s; return s; });
        if (cur >= 0.1) {
          const sale = Math.min(cur, 0.7 + (levels.marketing * 0.45));
          setStock(s => Math.max(0, s - sale));
          return c + (sale * 18);
        }
        return c;
      });
      // 3. Rastgele Etkinlikler
      const now = Date.now();
      if (mode === "NECMI" && now - lastNargileRef.current > 120000 && !nargile) {
        setNargile({ id: now, x: Math.random() * 80 + 5, y: Math.random() * 60 + 15 });
        setTimeout(() => { setNargile(null); lastNargileRef.current = Date.now(); }, 8000);
      }
      if (now - lastPlaneRef.current > 50000 && !planeActive) {
        setPlaneActive(true); playSfx('plane');
        setTimeout(() => {
          setDuba({ id: now, x: Math.random() * 70 + 15, y: Math.random() * 40 + 30, dropping: true });
          setTimeout(() => setDuba(prev => prev ? { ...prev, dropping: false } : null), 1500);
        }, 2500);
        setTimeout(() => { setPlaneActive(false); lastPlaneRef.current = Date.now(); }, 5500);
      }
      // 4. Kriz Tetikleyici
      if (!activeEvent && Math.random() < 0.02) {
        const types: ('TAX' | 'STRIKE' | 'RAID')[] = ['TAX', 'STRIKE', 'RAID'];
        const sel = types[Math.floor(Math.random() * types.length)];
        playSfx('alert');
        setActiveEvent({ type: sel, endTime: Date.now() + 6000 });
        if (sel === 'STRIKE') setStrikeActive(true);
      }
      if (activeEvent && Date.now() > activeEvent.endTime) resolveEvent(false);
    }, 1000);
    return () => clearInterval(tick);
  }, [isLogged, levels, activeEvent, strikeActive, mode, planeActive, nargile]);

  const card = { background: 'rgba(30, 30, 40, 0.8)', backdropFilter: 'blur(12px)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' };

  if (!isLogged) return (
    <div style={{ backgroundColor: '#0f172a', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontFamily: 'sans-serif' }}>
      <BackgroundGrid /><div style={{ ...card, width: '320px', textAlign: 'center', zIndex: 10 }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>NECMİ HOLDİNG V4</h1>
        <input type="text" value={pass} onChange={(e) => setPass(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkPass()} placeholder="Erişim Kodu" style={{ width: '80%', padding: '12px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '8px', marginBottom: '15px', textAlign: 'center' }} />
        <button onClick={checkPass} style={{ width: '85%', padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>GİRİŞ</button>
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#020617', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', padding: '20px', position: 'relative', overflow: 'hidden' }}>
      <BackgroundGrid />
      
      {/* KRİZ PANELİ */}
      {activeEvent && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: '#ef4444', padding: '20px', borderRadius: '15px', zIndex: 1000, textAlign: 'center', minWidth: '350px', border: '2px solid white', boxShadow: '0 0 30px rgba(239, 68, 68, 0.5)' }}>
          <h2 style={{ margin: 0 }}>{activeEvent.type === 'TAX' ? (mode === 'HOCA' ? '⚖️ MEVZUAT DENETİMİ' : '⚖️ VERGİ DENETİMİ') : activeEvent.type === 'STRIKE' ? (mode === 'HOCA' ? '🪧 ENDÜSTRİYEL EYLEM' : '🪧 İŞÇİ GREVİ') : (mode === 'HOCA' ? '🚨 RİSK ANALİZİ' : '🚨 POLİS BASKINI')}</h2>
          <p>Süre: {Math.max(0, Math.ceil((activeEvent.endTime - Date.now()) / 1000))}s</p>
          <button onClick={() => { if (activeEvent.type === 'STRIKE') setCash(c => Math.max(0, c - 100)); resolveEvent(true); }} style={{ padding: '10px 20px', background: 'white', color: 'black', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            {activeEvent.type === 'TAX' ? (mode === 'HOCA' ? 'BELGELERİ İBRAZ ET' : 'RÜŞVET VER') : activeEvent.type === 'STRIKE' ? (mode === 'HOCA' ? 'MUTABAKAT (-100$)' : 'BAKLAVA ISMARLA (-100$)') : (mode === 'HOCA' ? 'GÜVENLİĞİ SAĞLA' : 'EVRAKLARI YAK!')}
          </button>
        </div>
      )}

      {planeActive && <div style={{ position: 'absolute', top: '10%', left: '-100px', fontSize: '4rem', animation: 'fly 5.5s linear forwards', zIndex: 50 }}>✈️</div>}
      {duba && <div onClick={() => { if (!duba.dropping) { playSfx('collect'); setCash(c => c + 50); setDuba(null); addLog("💰 Duba toplandı!"); } }} style={{ position: 'absolute', left: `${duba.x}%`, top: `${duba.y}%`, zIndex: 60, animation: duba.dropping ? 'drop 1.5s ease-out forwards' : 'float 3s infinite ease-in-out' }}><div style={{ position: 'relative' }}>{duba.dropping && <span style={{ position: 'absolute', top: '-40px', left: '10px', fontSize: '2rem' }}>🪂</span>}<DubaIcon /></div></div>}

      <header style={{ position: 'relative', zIndex: 10, marginBottom: '30px' }}>
        <h1 style={{ color: '#3b82f6', margin: 0 }}>{mode === "HOCA" ? "Süreç Yönetim Paneli" : "Necmi Holding A.Ş."}</h1>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px', position: 'relative', zIndex: 10 }}>
        <div style={card}>KASA<br/><span style={{ color: '#22c55e', fontSize: '1.8rem', fontWeight: 'bold' }}>${Math.floor(cash).toLocaleString()}</span></div>
        <div style={card}>STOK<br/><span style={{ color: '#eab308', fontSize: '1.8rem', fontWeight: 'bold' }}>{stock.toFixed(1)} / {levels.factorySize * 40}</span></div>
      </div>

      <button onClick={() => { if (!strikeActive && stock < levels.factorySize * 40) { setCash(c => c + 10); setStock(s => s + levels.clickPower); playSfx('click'); } }} style={{ padding: '20px 50px', background: strikeActive ? '#475569' : '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '40px', position: 'relative', zIndex: 10 }}>
        {strikeActive ? "⚠️ ÜRETİM DURDU" : "🏭 ÜRETİMİ TETİKLE"}
      </button>

      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', position: 'relative', zIndex: 10 }}>
        {(Object.keys(upgInfo) as Array<keyof typeof levels>).map(k => {
          const cost = getCost(k);
          return (
            <div key={k} onClick={() => { if (cash >= cost) { setCash(c => c - cost); setLevels(l => ({ ...l, [k]: l[k] + 1 })); playSfx('buy'); addLog(`${upgInfo[k].title} yükseltildi.`); } }} style={{ ...card, cursor: 'pointer' }}>
              <div style={{ color: '#818cf8', fontWeight: 'bold' }}>{upgInfo[k].title} (Lv {levels[k]})</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', minHeight: '35px' }}>{mode === "HOCA" ? upgInfo[k].hocaDesc : upgInfo[k].necmiDesc}</div>
              <div style={{ color: '#22c55e', fontSize: '1.3rem', marginTop: '10px' }}>${cost.toLocaleString()}</div>
            </div>
          );
        })}
      </div>

      {nargile && mode === "NECMI" && <div onClick={() => { playSfx('collect'); setCash(c => c + 200); setNargile(null); }} style={{ position: 'absolute', left: `${nargile.x}%`, top: `${nargile.y}%`, background: '#f59e0b', padding: '10px 20px', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', zIndex: 70, animation: 'pulse 1s infinite' }}>🌬️ NARGİLE ÇEK (+200$)</div>}

      <div style={{ marginTop: '40px', opacity: 0.6, fontSize: '0.9rem' }}>{logs.map(log => <div key={log.id}>{log.text}</div>)}</div>
      <footer style={{ marginTop: '20px', color: '#334155' }}>v4.2.0 - {mode} MODE</footer>
      <style>{`
        @keyframes fly { 0% { left: -150px; } 100% { left: 110%; } }
        @keyframes drop { 0% { transform: translateY(-600px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
      `}</style>
    </div>
  );
}

export default App;

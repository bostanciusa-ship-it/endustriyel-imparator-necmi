import React, { useState, useEffect, useRef } from 'react';

// ASLA PATLAMAYAN ÖZEL TASARIM SVG DUBA
const DubaCizimi = () => (
  <svg width="65" height="85" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 0 12px rgba(255,165,0,0.6))' }}>
    <path d="M10 100 L90 100 L85 110 L15 110 Z" fill="#222" />
    <path d="M30 100 L40 20 L60 20 L70 100 Z" fill="#FF4500" />
    <path d="M36 52 L64 52 L67 68 L33 68 Z" fill="white" opacity="0.9" />
    <path d="M40 20 L60 20 L61 26 L39 26 Z" fill="#333" />
  </svg>
);

function App() {
  const [_c, _sc] = useState(100); 
  const [_p, _sp] = useState(0);   
  const [_logs, _setLogs] = useState<{id: number, text: string}[]>([]); 
  const [_nargile, _setNargile] = useState<{id: number, x: number, y: number} | null>(null);
  const [_plane, _setPlane] = useState(false); 
  const [_duba, _setDuba] = useState<{id: number, x: number, y: number} | null>(null);
  const [_isTaxing, _setIsTaxing] = useState(false);

  const lastNargileTime = useRef(Date.now());
  const lastPlaneTime = useRef(Date.now());

  // GELİŞMİŞ SES MOTORU
  const playSound = (freq: number, type: OscillatorType = 'sine', duration: number = 0.1) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
      // Temizlik
      setTimeout(() => ctx.close(), duration * 1000 + 100);
    } catch (e) { console.log("Ses motoru beklemede..."); }
  };

  const [_levels, _setLevels] = useState({
    clickPower: 1,
    autoWorker: 0,
    marketing: 1,
    factorySize: 1 
  });

  // MALİYET VE KAZANÇ HESAPLARI
  const getCost = (type: keyof typeof _levels, base: number) => Math.floor(base * Math.pow(2.4, _levels[type]));
  const clickGain = _levels.clickPower * 10;
  const autoProdRate = _levels.autoWorker * 0.25; 
  const salePrice = 6 + (_levels.marketing * 4); 
  const storageLimit = _levels.factorySize * 35; 

  const addLog = (msg: string) => {
    const newLog = { id: Date.now(), text: msg };
    _setLogs(prev => [newLog, ...prev].slice(0, 5));
  };

  const handleWork = () => {
    if (_p < storageLimit) {
      playSound(500, 'sine', 0.05);
      _sc(prev => prev + clickGain);
      _sp(prev => prev + 1);
    } else {
      addLog("🚨 DEPO DOLU PATRON!");
    }
  };

  const spawnPlane = () => {
    if (_plane) return;
    _setPlane(true);
    playSound(180, 'sawtooth', 0.6);
    addLog("✈️ Kargo uçağı geçiyor...");
    setTimeout(() => {
      _setDuba({ id: Date.now(), x: Math.random() * 65 + 15, y: Math.random() * 35 + 15 });
    }, 2200);
    setTimeout(() => {
      _setPlane(false);
      lastPlaneTime.current = Date.now();
    }, 4800);
  };

  const spawnNargile = () => {
    const id = Date.now();
    _setNargile({ id, x: Math.random() * 80 + 5, y: Math.random() * 55 + 15 });
    playSound(1500, 'sine', 0.4);
    addLog("🌬️ Nadir Nargile Borusu masada!");
    setTimeout(() => {
        _setNargile(prev => prev?.id === id ? null : prev);
        lastNargileTime.current = Date.now();
    }, 7000); 
  };

  const buyUpgrade = (type: keyof typeof _levels, baseCost: number) => {
    const cost = getCost(type, baseCost);
    if (_c >= cost) {
      playSound(800, 'sine', 0.2);
      _sc(prev => prev - cost);
      _setLevels(prev => ({ ...prev, [type]: prev[type] + 1 }));
      // Maliye kontrolü
      if (Math.random() < 0.12 && _c > 1500) {
        _setIsTaxing(true);
        const tax = Math.floor(_c * 0.09);
        _sc(prev => prev - tax);
        addLog(`🚨 MALİYE BASKINI! ${tax}$ kesildi!`);
        setTimeout(() => _setIsTaxing(false), 1200);
      } else {
        addLog("✅ Yatırım başarılı.");
      }
    } else {
      playSound(120, 'square', 0.4);
      addLog("🚨 AKBİL YETERSİZ REİS!"); 
    }
  };

  useEffect(() => {
    const mainTick = setInterval(() => {
      if (autoProdRate > 0) _sp(prev => (prev < storageLimit ? prev + autoProdRate : prev));
      _sc(prev => {
        if (_p >= 1) { _sp(stok => stok - 1); return prev + salePrice; }
        return prev;
      });
      const now = Date.now();
      // Nargile süresi 120 saniyeye (2 dakika) çekildi
      if (now - lastNargileTime.current > 120000 && !_nargile) spawnNargile();
      if (now - lastPlaneTime.current > 60000 && !_plane) spawnPlane();
    }, 1000);
    return () => clearInterval(mainTick);
  }, [_p, autoProdRate, salePrice, storageLimit, _nargile, _plane]);

  return (
    <div style={{ color: 'white', padding: '20px', textAlign: 'center', backgroundColor: _isTaxing ? '#3d1212' : '#0b0b0f', transition: 'background-color 0.5s ease', minHeight: '100vh', fontFamily: 'sans-serif', position: 'relative', overflow: 'hidden' }}>
      
      <header style={{ marginBottom: '35px' }}>
        <h1 style={{ color: '#3b82f6', fontSize: '2.5rem', marginBottom: '5px', textShadow: '0 0 20px rgba(59,130,246,0.3)' }}>Necmi Holding BETA 🚧</h1>
        <div style={{ color: '#4b5563', fontSize: '0.8rem', letterSpacing: '3px' }}>INDUSTRIAL IMPERIUM</div>
      </header>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '40px' }}>
        <div style={statCard}>KASA<br/><span style={{color: '#4ade80', fontSize: '1.8rem', fontWeight: 'bold'}}>${_c.toLocaleString()}</span></div>
        <div style={statCard}>STOK<br/><span style={{color: '#fbbf24', fontSize: '1.8rem', fontWeight: 'bold'}}>{_p.toFixed(1)} / {storageLimit}</span></div>
      </div>

      <button onClick={handleWork} style={mainBtn}>🏭 FABRİKAYI ŞAHLANDIR</button>

      {_plane && <div style={{ position: 'absolute', top: '15%', left: '-100px', fontSize: '5.5rem', animation: 'fly 4.8s linear forwards', zIndex: 100 }}>✈️</div>}

      {_duba && (
        <div onClick={() => { playSound(1000, 'sine', 0.1); _sc(prev => prev + 1); _setDuba(null); addLog("🚧 +1$ Duba kurtarıldı."); }} 
             style={{ position: 'absolute', left: `${_duba.x}%`, top: `${_duba.y}%`, cursor: 'pointer', zIndex: 1001, animation: 'bob 2s infinite' }}>
          <DubaCizimi />
        </div>
      )}

      {_nargile && (
        <div onClick={() => { playSound(1600, 'sine', 0.3); _sc(prev => prev + 150); _setNargile(null); addLog("🌬️ +150$ Nargile Borusu!"); }} 
             style={nargileBox(_nargile.x, _nargile.y)}>
          🌬️ NARGİLE BORUSU
        </div>
      )}

      <div style={{ maxWidth: '950px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '25px' }}>
        {Object.entries(_levels).map(([key, lv]) => (
          <button key={key} onClick={() => buyUpgrade(key as any, key === 'clickPower' ? 150 : key === 'autoWorker' ? 600 : key === 'marketing' ? 200 : 400)} style={upgCard}>
            <div style={{fontWeight: 'bold', color: '#6366f1', marginBottom: '8px'}}>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</div>
            <div style={{fontSize: '0.8rem', color: '#9ca3af', marginBottom: '10px'}}>Seviye {lv}</div>
            <div style={{color: '#4ade80', fontSize: '1.1rem'}}>${getCost(key as any, 150).toLocaleString()}</div>
          </button>
        ))}
      </div>

      <footer style={{ marginTop: '50px', borderTop: '1px solid #1f2937', paddingTop: '20px' }}>
        {_logs.map(log => <div key={log.id} style={{ color: log.text.includes('AKBİL') ? '#f87171' : '#6b7280', fontSize: '0.9rem', padding: '3px' }}>{log.text}</div>)}
      </footer>

      <style>{`
        @keyframes fly { from { left: -20%; } to { left: 120%; } }
        @keyframes bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-40px); } }
        @keyframes pulse { from { transform: scale(1); } to { transform: scale(1.1); box-shadow: 0 0 40px #fbbf24; } }
      `}</style>
    </div>
  );
}

const statCard = { background: '#16161e', padding: '25px', borderRadius: '20px', minWidth: '160px', border: '1px solid #23232e', boxShadow: '0 8px 16px rgba(0,0,0,0.4)' };
const mainBtn = { padding: '30px 70px', fontSize: '1.6rem', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '40px', transition: 'all 0.2s', boxShadow: '0 12px 24px rgba(37,99,235,0.3)' };
const upgCard = { padding: '25px', background: '#16161e', border: '1px solid #2d2d39', borderRadius: '20px', color: 'white', cursor: 'pointer', transition: 'all 0.3s' };
const nargileBox = (x:number, y:number): React.CSSProperties => ({ position: 'absolute', left: `${x}%`, top: `${y}%`, padding: '20px 35px', backgroundColor: '#fbbf24', color: '#000', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', zIndex: 1001, animation: 'pulse 0.9s infinite alternate' });

export default App;

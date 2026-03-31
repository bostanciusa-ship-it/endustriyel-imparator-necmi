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
  const [_c, _sc] = useState(250); // Patron başlarken biraz harçlık lazım
  const [_p, _sp] = useState(0);   
  const [_logs, _setLogs] = useState<{id: number, text: string}[]>([]); 
  const [_nargile, _setNargile] = useState<{id: number, x: number, y: number} | null>(null);
  const [_plane, _setPlane] = useState(false); 
  const [_duba, _setDuba] = useState<{id: number, x: number, y: number} | null>(null);

  const lastNargileTime = useRef(Date.now());
  const lastPlaneTime = useRef(Date.now());

  const playSound = (freq: number, type: OscillatorType = 'sine', duration: number = 0.1) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
      setTimeout(() => ctx.close(), duration * 1000 + 100);
    } catch (e) { console.log("Ses pasif."); }
  };

  const [_levels, _setLevels] = useState({
    clickPower: 1,
    autoWorker: 0,
    marketing: 1,
    factorySize: 1 
  });

  // FİYATLANDIRMA DATA OBJESİ
  const upgInfo = {
    clickPower: { title: "🚀 TIK GÜCÜ", desc: "daha sert bas", base: 200 },
    autoWorker: { title: "🤖 İŞÇİ", desc: "çok yavaş bir köle", base: 500 },
    marketing: { title: "📈 PAZARLAMA", desc: "yalan söylemeyi öğren", base: 600 },
    factorySize: { title: "🏗️ DEPO", desc: "yer aç patron", base: 650 }
  };

  // ÇEYREK ARTIŞ HESABI (Fiyat her seviyede %25 artar)
  const getCost = (type: keyof typeof _levels) => {
    const base = upgInfo[type].base;
    const lv = _levels[type];
    // Formül: Başlangıç Fiyatı * (1.25 ^ (Seviye - Başlangıç Seviyesi))
    // Eğer seviye 0 ise (İşçi gibi), ilk alım base fiyat olur.
    const effectiveLv = lv === 0 ? 0 : (type === 'autoWorker' ? lv : lv - 1);
    return Math.floor(base * Math.pow(1.25, effectiveLv));
  };

  const clickGain = _levels.clickPower * 10;
  const autoProdRate = _levels.autoWorker * 0.3; 
  const salePrice = 10 + (_levels.marketing * 5); 
  const storageLimit = _levels.factorySize * 40; 

  const addLog = (msg: string) => {
    const newLog = { id: Date.now(), text: msg };
    _setLogs(prev => [newLog, ...prev].slice(0, 5));
  };

  const handleWork = () => {
    if (_p < storageLimit) {
      playSound(440, 'sine', 0.05);
      _sc(prev => prev + clickGain);
      _sp(prev => prev + 1);
    } else {
      addLog("🚨 DEPO DOLDU!");
    }
  };

  const spawnPlane = () => {
    if (_plane) return;
    _setPlane(true);
    playSound(150, 'sawtooth', 0.5);
    addLog("✈️ Kargo uçağı süzülüyor...");
    setTimeout(() => _setDuba({ id: Date.now(), x: Math.random() * 65 + 15, y: Math.random() * 35 + 15 }), 2000);
    setTimeout(() => { _setPlane(false); lastPlaneTime.current = Date.now(); }, 4800);
  };

  const spawnNargile = () => {
    const id = Date.now();
    _setNargile({ id, x: Math.random() * 80 + 5, y: Math.random() * 55 + 15 });
    playSound(1200, 'sine', 0.3);
    addLog("🌬️ Nadir Nargile belirdi!");
    setTimeout(() => { _setNargile(prev => prev?.id === id ? null : prev); lastNargileTime.current = Date.now(); }, 7000); 
  };

  const buyUpgrade = (type: keyof typeof _levels) => {
    const cost = getCost(type);
    if (_c >= cost) {
      playSound(880, 'sine', 0.2);
      _sc(prev => prev - cost);
      _setLevels(prev => ({ ...prev, [type]: prev[type] + 1 }));
      addLog(`✅ ${upgInfo[type].title} seviye atladı!`);
    } else {
      playSound(100, 'square', 0.3);
      addLog(`🚨 NAKİT EKSİK! (Gereken: $${cost})`); 
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
      if (now - lastNargileTime.current > 120000 && !_nargile) spawnNargile();
      if (now - lastPlaneTime.current > 60000 && !_plane) spawnPlane();
    }, 1000);
    return () => clearInterval(mainTick);
  }, [_p, autoProdRate, salePrice, storageLimit, _nargile, _plane]);

  return (
    <div style={{ color: 'white', padding: '20px', textAlign: 'center', backgroundColor: '#0d0d12', minHeight: '100vh', fontFamily: 'sans-serif', position: 'relative', overflow: 'hidden' }}>
      
      <header style={{ marginBottom: '35px' }}>
        <h1 style={{ color: '#3b82f6', fontSize: '2.5rem', marginBottom: '5px' }}>Necmi Holding BETA 🚧</h1>
        <div style={{ color: '#4b5563', fontSize: '0.8rem', letterSpacing: '4px' }}>INDUSTRIAL STRATEGY</div>
      </header>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '40px' }}>
        <div style={statCard}>KASA<br/><span style={{color: '#4ade80', fontSize: '1.8rem'}}>${_c.toLocaleString()}</span></div>
        <div style={statCard}>STOK<br/><span style={{color: '#fbbf24', fontSize: '1.8rem'}}>{_p.toFixed(1)} / {storageLimit}</span></div>
      </div>

      <button onClick={handleWork} style={mainBtn}>🏭 FABRİKAYI ŞAHLANDIR</button>

      {_plane && <div style={{ position: 'absolute', top: '15%', left: '-100px', fontSize: '5rem', animation: 'fly 4.8s linear forwards', zIndex: 100 }}>✈️</div>}

      {_duba && (
        <div onClick={() => { playSound(1000, 'sine', 0.1); _sc(prev => prev + 1); _setDuba(null); addLog("🚧 +1$ Geldi."); }} 
             style={{ position: 'absolute', left: `${_duba.x}%`, top: `${_duba.y}%`, cursor: 'pointer', zIndex: 1001, animation: 'bob 2s infinite' }}>
          <DubaCizimi />
        </div>
      )}

      {_nargile && (
        <div onClick={() => { playSound(1400, 'sine', 0.3); _sc(prev => prev + 150); _setNargile(null); addLog("🌬️ +150$ Nargile!"); }} 
             style={nargileStyle(_nargile.x, _nargile.y)}>
          🌬️ NARGİLE BORUSU
        </div>
      )}

      <div style={{ maxWidth: '950px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '25px' }}>
        {(Object.keys(upgInfo) as Array<keyof typeof upgInfo>).map((key) => (
          <button key={key} onClick={() => buyUpgrade(key)} style={upgCard}>
            <div style={{fontWeight: 'bold', color: '#6366f1', marginBottom: '4px'}}>{upgInfo[key].title} (Lv {_levels[key]})</div>
            <div style={{fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic', marginBottom: '10px'}}>{upgInfo[key].desc}</div>
            <div style={{color: '#4ade80', fontSize: '1.2rem', fontWeight: 'bold'}}>${getCost(key).toLocaleString()}</div>
          </button>
        ))}
      </div>

      <footer style={{ marginTop: '50px', borderTop: '1px solid #1f2937', padding: '30px 0' }}>
        {_logs.map(log => <div key={log.id} style={{ color: log.text.includes('🚨') ? '#f87171' : '#6b7280', fontSize: '0.9rem', padding: '2px' }}>{log.text}</div>)}
        
        <div style={{ marginTop: '25px', fontSize: '0.8rem', color: '#374151', fontWeight: 'bold' }}>
          NECMI HOLDING BETA v3.8.4
        </div>
      </footer>

      <style>{`
        @keyframes fly { from { left: -20%; } to { left: 120%; } }
        @keyframes bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-40px); } }
        @keyframes pulse { from { transform: scale(1); } to { transform: scale(1.1); box-shadow: 0 0 40px #fbbf24; } }
      `}</style>
    </div>
  );
}

const statCard = { background: '#16161e', padding: '25px', borderRadius: '20px', minWidth: '160px', border: '1px solid #23232e' };
const mainBtn = { padding: '30px 70px', fontSize: '1.6rem', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '40px', boxShadow: '0 10px 20px rgba(0,0,0,0.4)' };
const upgCard = { padding: '25px', background: '#16161e', border: '1px solid #2d2d39', borderRadius: '20px', color: 'white', cursor: 'pointer', width: '100%' };
const nargileStyle = (x:number, y:number): React.CSSProperties => ({ position: 'absolute', left: `${x}%`, top: `${y}%`, padding: '20px 35px', backgroundColor: '#fbbf24', color: '#000', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', zIndex: 1001, animation: 'pulse 0.9s infinite alternate' });

export default App;

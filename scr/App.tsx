import React, { useState, useEffect, useRef } from 'react';

// PATLAMAYAN SVG DUBA TASARIMI
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

  const [_levels, _setLevels] = useState({
    clickPower: 1,
    autoWorker: 0,
    marketing: 1,
    factorySize: 1 
  });

  // EKONOMİK PARAMETRELER
  const getCost = (type: keyof typeof _levels, base: number) => Math.floor(base * Math.pow(2.4, _levels[type]));
  const clickGain = _levels.clickPower * 10;
  const autoProdRate = _levels.autoWorker * 0.25; 
  const salePrice = 6 + (_levels.marketing * 4); 
  const storageLimit = _levels.factorySize * 35; 

  const addLog = (msg: string) => {
    const newLog = { id: Date.now(), text: msg };
    _setLogs(prev => [newLog, ...prev].slice(0, 5));
  };

  const spawnPlane = () => {
    if (_plane) return;
    _setPlane(true);
    addLog("✈️ Kargo uçağı yaklaşıyor...");
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
    _setNargile({ id, x: Math.random() * 75 + 10, y: Math.random() * 55 + 15 });
    addLog("🌬️ Nargile Borusu masada!");
    setTimeout(() => {
        _setNargile(prev => prev?.id === id ? null : prev);
        lastNargileTime.current = Date.now();
    }, 9000);
  };

  const buyUpgrade = (type: keyof typeof _levels, baseCost: number) => {
    const cost = getCost(type, baseCost);
    if (_c >= cost) {
      _sc(prev => prev - cost);
      _setLevels(prev => ({ ...prev, [type]: prev[type] + 1 }));
      if (Math.random() < 0.15 && _c > 1000) {
        _setIsTaxing(true);
        const tax = Math.floor(_c * 0.08);
        _sc(prev => prev - tax);
        addLog(`🚨 MALİYE BASKINI! ${tax}$ kesildi!`);
        setTimeout(() => _setIsTaxing(false), 1000);
      } else {
        addLog("✅ Yatırım onaylandı.");
      }
    } else {
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
      if (now - lastNargileTime.current > 40000 && !_nargile) spawnNargile();
      if (now - lastPlaneTime.current > 55000 && !_plane) spawnPlane();
    }, 1000);
    return () => clearInterval(mainTick);
  }, [_p, autoProdRate, salePrice, storageLimit, _nargile, _plane]);

  // CSS OBJELERİ (SATIR SAYISINI KORUR)
  const containerStyle: React.CSSProperties = {
    color: 'white', padding: '20px', textAlign: 'center', 
    backgroundColor: _isTaxing ? '#451a1a' : '#0d0d12', 
    transition: 'background-color 0.4s ease', minHeight: '100vh', 
    fontFamily: 'sans-serif', position: 'relative', overflow: 'hidden'
  };

  const statCard: React.CSSProperties = { background: '#1c1c24', padding: '20px', borderRadius: '16px', minWidth: '150px', border: '1px solid #2d2d39' };
  const mainBtn: React.CSSProperties = { padding: '25px 60px', fontSize: '1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '30px' };

  return (
    <div style={containerStyle}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#3b82f6', fontSize: '2.2rem' }}>Necmi Holding BETA 🚧</h1>
        <p style={{ color: '#6b7280' }}>Endüstriyel İmparatorluk Simülasyonu</p>
      </header>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
        <div style={statCard}>KASA<br/><span style={{color: '#4ade80', fontSize: '1.5rem'}}>${_c.toLocaleString()}</span></div>
        <div style={statCard}>STOK<br/><span style={{color: '#fbbf24', fontSize: '1.5rem'}}>{_p.toFixed(1)} / {storageLimit}</span></div>
      </div>

      <button onClick={() => { if (_p < storageLimit) { _sc(prev => prev + clickGain); _sp(prev => prev + 1); } }} style={mainBtn}>
        🏭 FABRİKAYI ŞAHLANDIR
      </button>

      {_plane && <div style={{ position: 'absolute', top: '12%', left: '-100px', fontSize: '5rem', animation: 'fly 4.8s linear forwards', zIndex: 100 }}>✈️</div>}

      {_duba && (
        <div onClick={() => { _sc(prev => prev + 1); _setDuba(null); addLog("🚧 Duba kurtarıldı! +1$"); }} 
             style={{ position: 'absolute', left: `${_duba.x}%`, top: `${_duba.y}%`, cursor: 'pointer', zIndex: 1001, animation: 'bob 2.5s infinite ease-in-out' }}>
          <DubaCizimi />
        </div>
      )}

      {_nargile && (
        <div onClick={() => { _sc(prev => prev + 200); _setNargile(null); addLog("🌬️ Köz getirildi! +200$"); }} 
             style={{ position: 'absolute', left: `${_nargile.x}%`, top: `${_nargile.y}%`, padding: '18px 30px', backgroundColor: '#fbbf24', color: '#1a1a1a', borderRadius: '60px', cursor: 'pointer', fontWeight: 'bold', zIndex: 1001, animation: 'pulse 1.2s infinite alternate' }}>
          🌬️ Nargile Borusu
        </div>
      )}

      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <button onClick={() => buyUpgrade('clickPower', 150)} style={{ padding: '20px', background: '#1c1c24', border: '1px solid #333', borderRadius: '15px', color: 'white', cursor: 'pointer' }}>
          <div style={{fontWeight: 'bold', color: '#9ca3af'}}>🚀 TIK GÜCÜ (Lv {_levels.clickPower})</div>
          <div style={{color: '#4ade80'}}>${getCost('clickPower', 150).toLocaleString()}</div>
        </button>
        <button onClick={() => buyUpgrade('autoWorker', 600)} style={{ padding: '20px', background: '#1c1c24', border: '1px solid #333', borderRadius: '15px', color: 'white', cursor: 'pointer' }}>
          <div style={{fontWeight: 'bold', color: '#9ca3af'}}>🤖 OTOMASYON (Lv {_levels.autoWorker})</div>
          <div style={{color: '#4ade80'}}>${getCost('autoWorker', 600).toLocaleString()}</div>
        </button>
        <button onClick={() => buyUpgrade('marketing', 200)} style={{ padding: '20px', background: '#1c1c24', border: '1px solid #333', borderRadius: '15px', color: 'white', cursor: 'pointer' }}>
          <div style={{fontWeight: 'bold', color: '#9ca3af'}}>📈 PAZARLAMA (Lv {_levels.marketing})</div>
          <div style={{color: '#4ade80'}}>${getCost('marketing', 200).toLocaleString()}</div>
        </button>
        <button onClick={() => buyUpgrade('factorySize', 400)} style={{ padding: '20px', background: '#1c1c24', border: '1px solid #333', borderRadius: '15px', color: 'white', cursor: 'pointer' }}>
          <div style={{fontWeight: 'bold', color: '#9ca3af'}}>🏗️ KAPASİTE (Lv {_levels.factorySize})</div>
          <div style={{color: '#4ade80'}}>${getCost('factorySize', 400).toLocaleString()}</div>
        </button>
      </div>

      <footer style={{ marginTop: '40px', background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '15px' }}>
        {_logs.map(log => (
          <div key={log.id} style={{ color: log.text.includes('AKBİL') ? '#ff4d4d' : '#a1a1aa', fontSize: '0.9rem', padding: '2px 0' }}>
             {log.text}
          </div>
        ))}
      </footer>

      <style>{`
        @keyframes fly { from { left: -20%; } to { left: 120%; } }
        @keyframes bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-30px); } }
        @keyframes pulse { from { transform: scale(1); } to { transform: scale(1.05); } }
      `}</style>
    </div>
  );
}

export default App;

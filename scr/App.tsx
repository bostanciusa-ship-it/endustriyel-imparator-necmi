import React, { useState, useEffect, useRef } from 'react';

// ASLA PATLAMAYAN ÖZEL TASARIM SVG DUBA
const DubaCizimi = () => (
  <svg width="65" height="85" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 0 10px rgba(255,165,0,0.5))' }}>
    <path d="M10 100 L90 100 L85 110 L15 110 Z" fill="#222" />
    <path d="M30 100 L40 20 L60 20 L70 100 Z" fill="#FF4500" />
    <path d="M36 52 L64 52 L67 68 L33 68 Z" fill="white" opacity="0.9" />
  </svg>
);

// HAREKETLİ ARKA PLAN PARÇACIKLARI
const BackgroundGrid = () => (
  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.2 }}>
    <defs>
      <pattern id="dotPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.5" fill="#3b82f6" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#dotPattern)" animation="drift 60s linear infinite" />
  </svg>
);

function App() {
  const [pass, setPass] = useState("");
  const [isLogged, setIsLogged] = useState(false);
  const [mode, setMode] = useState<"HOCA" | "NECMI" | null>(null);
  
  const [_c, _sc] = useState(250); 
  const [_p, _sp] = useState(0);   
  const [_logs, _setLogs] = useState<{id: number, text: string}[]>([]); 
  const [_nargile, _setNargile] = useState<{id: number, x: number, y: number} | null>(null);
  const [_plane, _setPlane] = useState(false); 
  const [_duba, _setDuba] = useState<{id: number, x: number, y: number} | null>(null);

  const lastNargileTime = useRef(Date.now());
  const lastPlaneTime = useRef(Date.now());

  const checkPass = () => {
    if (pass === "B123B123") { setMode("NECMI"); setIsLogged(true); }
    else if (pass === "3689") { setMode("HOCA"); setIsLogged(true); }
    else { alert("Yanlış Şifre!"); setPass(""); }
  };

  const playSound = (freq: number) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  };

  const [_levels, _setLevels] = useState({ clickPower: 1, autoWorker: 0, marketing: 1, factorySize: 1 });

  const upgInfo = {
    clickPower: { title: "🚀 TIK GÜCÜ", hocaDesc: "verimlilik artışı", necmiDesc: "daha sert bas", base: 200 },
    autoWorker: { title: "🤖 İŞÇİ", hocaDesc: "otomasyon birimi", necmiDesc: "çok yavaş bir köle", base: 500 },
    marketing: { title: "📈 PAZARLAMA", hocaDesc: "stratejik tanıtım", necmiDesc: "yalan söylemeyi öğren", base: 600 },
    factorySize: { title: "🏗️ DEPO", hocaDesc: "envanter kapasitesi", necmiDesc: "yer aç patron", base: 650 }
  };

  const getCost = (type: keyof typeof _levels) => {
    const base = upgInfo[type].base;
    const lv = _levels[type];
    const effectiveLv = lv === 0 ? 0 : (type === 'autoWorker' ? lv : lv - 1);
    return Math.floor(base * Math.pow(1.25, effectiveLv));
  };

  const handleWork = () => {
    if (_p < _levels.factorySize * 40) {
      playSound(440);
      _sc(p => p + (_levels.clickPower * 10));
      _sp(p => p + 1);
    }
  };

  const buyUpgrade = (type: keyof typeof _levels) => {
    const cost = getCost(type);
    if (_c >= cost) {
      playSound(880);
      _sc(p => p - cost);
      _setLevels(p => ({ ...p, [type]: p[type] + 1 }));
    }
  };

  useEffect(() => {
    if (!isLogged) return;
    const tick = setInterval(() => {
      if (_levels.autoWorker > 0) _sp(p => (p < (_levels.factorySize * 40) ? p + (_levels.autoWorker * 0.3) : p));
      _sc(c => {
        if (_p >= 1) { _sp(s => s - 1); return c + (10 + (_levels.marketing * 5)); }
        return c;
      });
      const now = Date.now();
      if (mode === "NECMI" && now - lastNargileTime.current > 120000 && !_nargile) {
        _setNargile({ id: Date.now(), x: Math.random() * 80 + 5, y: Math.random() * 55 + 15 });
        setTimeout(() => { _setNargile(null); lastNargileTime.current = Date.now(); }, 7000);
      }
      if (now - lastPlaneTime.current > 60000 && !_plane) {
        set_plane();
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [isLogged, _p, mode, _levels]);

  const set_plane = () => {
    _setPlane(true);
    setTimeout(() => _setDuba({ id: Date.now(), x: Math.random() * 70 + 15, y: Math.random() * 40 + 20 }), 2000);
    setTimeout(() => { _setPlane(false); lastPlaneTime.current = Date.now(); }, 5000);
  };

  // STİL OBJELERİ (Glassmorphism Efekti)
  const panelStyle = { backgroundColor: '#0b0b0f', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white', fontFamily: 'sans-serif', position: 'relative' as 'relative', overflow: 'hidden' };
  const inputStyle = { padding: '15px', borderRadius: '10px', border: '1px solid #333', marginBottom: '10px', textAlign: 'center' as 'center', background: 'rgba(255,255,255,0.05)', color: 'white' };
  
  const glassCard = { background: 'rgba(22, 22, 30, 0.6)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', padding: '20px', borderRadius: '15px', minWidth: '140px', border: '1px solid rgba(255,255,255,0.08)' };
  const upgCardStyle = { background: 'rgba(22, 22, 30, 0.4)', backdropFilter: 'blur(5px)', padding: '20px', borderRadius: '15px', color: 'white', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s' };

  if (!isLogged) {
    return (
      <div style={panelStyle}>
        <BackgroundGrid />
        <div style={{...glassCard, padding: '40px', textAlign: 'center', zIndex: 10}}>
          <h2 style={{letterSpacing: '2px', marginBottom: '20px'}}>HOLDİNG ERİŞİM PANELİ</h2>
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Şifre Giriniz..." style={inputStyle} />
          <button onClick={checkPass} style={{ padding: '12px 40px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>GİRİŞ YAP</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ color: 'white', padding: '20px', textAlign: 'center', backgroundColor: '#09090b', minHeight: '100vh', fontFamily: 'sans-serif', position: 'relative', overflow: 'hidden' }}>
      <BackgroundGrid />
      
      <header style={{position: 'relative', zIndex: 10}}>
        <h1 style={{ color: '#3b82f6', textShadow: '0 0 15px rgba(59,130,246,0.5)' }}>Necmi Holding {mode === "HOCA" ? "Eğitim Portalı" : "BETA 🚧"}</h1>
        <p style={{color: '#6b7280', fontSize: '0.9rem', letterSpacing: '1px'}}>{mode === "HOCA" ? "Endüstriyel Verimlilik Simülasyonu" : "Raconunu Koy, Paranı Al"}</p>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', margin: '30px 0', position: 'relative', zIndex: 10 }}>
        <div style={glassCard}>KASA<br/><span style={{color: '#4ade80', fontSize: '1.6rem', fontWeight: 'bold'}}>${_c.toLocaleString()}</span></div>
        <div style={glassCard}>STOK<br/><span style={{color: '#fbbf24', fontSize: '1.6rem', fontWeight: 'bold'}}>{_p.toFixed(1)} / {(_levels.factorySize * 40)}</span></div>
      </div>

      <button onClick={handleWork} style={mainBtn}>🏭 ÜRETİMİ BAŞLAT</button>

      {_nargile && mode === "NECMI" && (
        <div onClick={() => { _sc(p => p + 150); _setNargile(null); }} style={nargileStyle(_nargile.x, _nargile.y)}>🌬️ NARGİLE BORUSU</div>
      )}

      {_duba && (
        <div onClick={() => { _sc(p => p + 1); _setDuba(null); }} style={{ position: 'absolute', left: `${_duba.x}%`, top: `${_duba.y}%`, cursor: 'pointer', zIndex: 100, animation: 'bob 2s infinite' }}>
          <DubaCizimi />
        </div>
      )}

      <div style={{ maxWidth: '950px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', position: 'relative', zIndex: 10 }}>
        {(Object.keys(upgInfo) as Array<keyof typeof upgInfo>).map((key) => (
          <button key={key} onClick={() => buyUpgrade(key)} style={upgCardStyle} className="upgrade-card">
            <div style={{fontWeight: 'bold', color: '#6366f1'}}>{upgInfo[key].title} (Lv {_levels[key]})</div>
            <div style={{fontSize: '0.7rem', color: '#9ca3af', fontStyle: 'italic'}}>{mode === "HOCA" ? upgInfo[key].hocaDesc : upgInfo[key].necmiDesc}</div>
            <div style={{color: '#4ade80', marginTop: '8px', fontSize: '1.1rem'}}>${getCost(key).toLocaleString()}</div>
          </button>
        ))}
      </div>

      <footer style={{ marginTop: '50px', color: '#3f3f46', fontSize: '0.8rem', position: 'relative', zIndex: 10 }}>
        NECMI HOLDING v3.9.1 - MODE: {mode}
      </footer>

      <style>{`
        @keyframes bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-30px); } }
        @keyframes pulse { from { transform: scale(1); box-shadow: 0 0 10px #fbbf24; } to { transform: scale(1.1); box-shadow: 0 0 30px #fbbf24; } }
        @keyframes drift { from { transform: translate(0, 0); } to { transform: translate(40px, 40px); } }
        .upgrade-card:hover { transform: translateY(-5px); background: rgba(22, 22, 30, 0.7) !important; border-color: rgba(59,130,246,0.3) !important; }
      `}</style>
    </div>
  );
}

const mainBtn = { padding: '20px 60px', fontSize: '1.4rem', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '30px', position: 'relative' as 'relative', zIndex: 10, boxShadow: '0 10px 20px rgba(0,0,0,0.3)' };
const nargileStyle = (x:number, y:number): React.CSSProperties => ({ position: 'absolute', left: `${x}%`, top: `${y}%`, padding: '15px 30px', backgroundColor: '#fbbf24', color: '#000', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', zIndex: 101, animation: 'pulse 0.8s infinite alternate' });

export default App;

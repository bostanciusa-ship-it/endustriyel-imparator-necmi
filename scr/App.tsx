import React, { useState, useEffect, useRef } from 'react';

// GELİŞTİRİLMİŞ DUBA (Artık daha belirgin)
const DubaCizimi = () => (
  <svg width="60" height="75" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 0 12px rgba(255,165,0,0.6))' }}>
    <path d="M10 100 L90 100 L85 110 L15 110 Z" fill="#222" />
    <path d="M30 100 L40 20 L60 20 L70 100 Z" fill="#FF4500" />
    <path d="M36 52 L64 52 L67 68 L33 68 Z" fill="white" opacity="0.9" />
  </svg>
);

const BackgroundGrid = () => (
  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.15 }}>
    <defs>
      <pattern id="dotPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.5" fill="#3b82f6" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#dotPattern)" />
  </svg>
);

function App() {
  const [pass, setPass] = useState("");
  const [isLogged, setIsLogged] = useState(false);
  const [mode, setMode] = useState<"HOCA" | "NECMI" | null>(null);
  
  const [_c, _sc] = useState(250); 
  const [_p, _sp] = useState(0);   
  const [_nargile, _setNargile] = useState<{id: number, x: number, y: number} | null>(null);
  const [_plane, _setPlane] = useState(false); 
  const [_duba, _setDuba] = useState<{id: number, x: number, y: number, dropping: boolean} | null>(null);

  const lastNargileTime = useRef(Date.now());
  const lastPlaneTime = useRef(Date.now());

  const checkPass = () => {
    if (pass.toUpperCase() === "B123B123") { setMode("NECMI"); setIsLogged(true); }
    else if (pass === "3689") { setMode("HOCA"); setIsLogged(true); }
    else { alert("Erişim Reddedildi!"); setPass(""); }
  };

  const [_levels, _setLevels] = useState({ clickPower: 1, autoWorker: 0, marketing: 1, factorySize: 1 });

  const upgInfo = {
    clickPower: { title: "🚀 TIK GÜCÜ", hocaDesc: "Endüstriyel manuel verimlilik.", necmiDesc: "Daha sert bas, daha çok kazan.", base: 200 },
    autoWorker: { title: "🤖 İŞÇİ", hocaDesc: "Süreç otomasyon birimi.", necmiDesc: "Çok yavaş bir köle.", base: 500 },
    marketing: { title: "📈 PAZARLAMA", hocaDesc: "Kurumsal tanıtım stratejisi.", necmiDesc: "Yalan söylemeyi öğren.", base: 600 },
    factorySize: { title: "🏗️ DEPO", hocaDesc: "Lojistik depolama alanı.", necmiDesc: "Holdinge yer aç patron.", base: 650 }
  };

  const getCost = (type: keyof typeof _levels) => {
    const base = upgInfo[type].base;
    const lv = _levels[type];
    const effectiveLv = lv === 0 ? 0 : (type === 'autoWorker' ? lv : lv - 1);
    return Math.floor(base * Math.pow(1.25, effectiveLv));
  };

  const spawnPlaneAndDuba = () => {
    if (_plane) return;
    _setPlane(true);
    
    // Uçak tam ortadayken (2.5 saniye sonra) duba düşsün
    setTimeout(() => {
      const dropX = Math.random() * 60 + 20;
      const dropY = Math.random() * 40 + 30;
      _setDuba({ id: Date.now(), x: dropX, y: dropY, dropping: true });
      
      // 1.5 saniye sonra düşme animasyonu bitsin ve tıklanabilir olsun
      setTimeout(() => {
        _setDuba(prev => prev ? { ...prev, dropping: false } : null);
      }, 1500);
    }, 2500);

    // Uçak ekranı 5 saniyede terk etsin
    setTimeout(() => {
      _setPlane(false);
      lastPlaneTime.current = Date.now();
    }, 5000);
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
      
      if (now - lastPlaneTime.current > 45000 && !_plane) {
        spawnPlaneAndDuba();
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [isLogged, _p, mode, _levels, _plane]);

  const glassCard = { background: 'rgba(22, 22, 30, 0.7)', backdropFilter: 'blur(10px)', padding: '20px', borderRadius: '15px', minWidth: '140px', border: '1px solid rgba(255,255,255,0.1)' };

  if (!isLogged) {
    return (
      <div style={{ backgroundColor: '#0b0b0f', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white', fontFamily: 'sans-serif', position: 'relative' }}>
        <BackgroundGrid />
        <div style={{...glassCard, padding: '40px', textAlign: 'center', zIndex: 10}}>
          <h2 style={{letterSpacing: '2px', marginBottom: '20px'}}>HOLDİNG ERİŞİM PANELİ</h2>
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Erişim Kodu..." style={{ padding: '15px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: 'white', marginBottom: '10px', textAlign: 'center' }} />
          <br/>
          <button onClick={checkPass} style={{ padding: '12px 40px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>GİRİŞ</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ color: 'white', padding: '20px', textAlign: 'center', backgroundColor: '#09090b', minHeight: '100vh', fontFamily: 'sans-serif', position: 'relative', overflow: 'hidden' }}>
      <BackgroundGrid />
      
      {/* UÇAK ANİMASYONU */}
      {_plane && (
        <div style={{ position: 'absolute', top: '15%', left: '-150px', fontSize: '5rem', animation: 'planeFly 5s linear forwards', zIndex: 100 }}>
          ✈️
        </div>
      )}

      {/* DÜŞEN DUBA ANİMASYONU */}
      {_duba && (
        <div 
          onClick={() => { if(!_duba.dropping) { _sc(p => p + 1); _setDuba(null); } }} 
          style={{ 
            position: 'absolute', 
            left: `${_duba.x}%`, 
            top: `${_duba.y}%`, 
            cursor: _duba.dropping ? 'default' : 'pointer', 
            zIndex: 100,
            animation: _duba.dropping ? 'dubaDrop 1.5s ease-out forwards' : 'bob 2s infinite'
          }}
        >
          <div style={{ position: 'relative' }}>
            {_duba.dropping && <span style={{ position: 'absolute', top: '-40px', left: '10px', fontSize: '2rem' }}>🪂</span>}
            <DubaCizimi />
          </div>
        </div>
      )}

      <header style={{position: 'relative', zIndex: 10}}>
        <h1 style={{ color: '#3b82f6' }}>{mode === "HOCA" ? "Necmi Holding Eğitim Portalı" : "Necmi Holding BETA 🚧"}</h1>
        <p style={{color: '#6b7280'}}>{mode === "HOCA" ? "Sistem Analizi ve Süreç Optimizasyonu" : "Raconunu Koy, Paranı Al"}</p>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', margin: '30px 0', position: 'relative', zIndex: 10 }}>
        <div style={glassCard}>KASA<br/><span style={{color: '#4ade80', fontSize: '1.6rem'}}>${_c.toLocaleString()}</span></div>
        <div style={glassCard}>STOK<br/><span style={{color: '#fbbf24', fontSize: '1.6rem'}}>{_p.toFixed(1)} / {(_levels.factorySize * 40)}</span></div>
      </div>

      <button onClick={() => { if(_p < _levels.factorySize * 40) { _sc(p => p + (_levels.clickPower * 10)); _sp(p => p + 1); } }} style={{ padding: '20px 60px', fontSize: '1.4rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '30px', position: 'relative', zIndex: 10 }}>🏭 ÜRETİMİ BAŞLAT</button>

      {_nargile && mode === "NECMI" && (
        <div onClick={() => { _sc(p => p + 150); _setNargile(null); }} style={{ position: 'absolute', left: `${_nargile.x}%`, top: `${_nargile.y}%`, padding: '15px 30px', backgroundColor: '#fbbf24', color: '#000', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', zIndex: 101, animation: 'pulse 0.8s infinite' }}>🌬️ NARGİLE BORUSU</div>
      )}

      <div style={{ maxWidth: '950px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', position: 'relative', zIndex: 10 }}>
        {(Object.keys(upgInfo) as Array<keyof typeof upgInfo>).map((key) => (
          <button key={key} onClick={() => {
            const cost = getCost(key);
            if (_c >= cost) { _sc(p => p - cost); _setLevels(p => ({ ...p, [key]: p[key] + 1 })); }
          }} style={{...glassCard, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)'}}>
            <div style={{fontWeight: 'bold', color: '#6366f1'}}>{upgInfo[key].title} (Lv {_levels[key]})</div>
            <div style={{fontSize: '0.75rem', color: '#9ca3af', marginTop: '5px', minHeight: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
               {mode === "HOCA" ? upgInfo[key].hocaDesc : upgInfo[key].necmiDesc}
            </div>
            <div style={{color: '#4ade80', marginTop: '10px', fontSize: '1.2rem'}}>${getCost(key).toLocaleString()}</div>
          </button>
        ))}
      </div>

      <footer style={{ marginTop: '50px', color: '#3f3f46', fontSize: '0.8rem', position: 'relative', zIndex: 10 }}>
        {mode === "NECMI" ? `NECMI HOLDING v3.9.4 - MODE: ${mode}` : "NECMI HOLDING - Endüstriyel Simülasyon"}
      </footer>

      <style>{`
        @keyframes planeFly {
          0% { left: -150px; transform: scaleX(1); }
          100% { left: 110%; transform: scaleX(1); }
        }
        @keyframes dubaDrop {
          0% { transform: translateY(-500px) scale(0.5); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        @keyframes pulse { from { transform: scale(1); } to { transform: scale(1.1); } }
      `}</style>
    </div>
  );
}

export default App;

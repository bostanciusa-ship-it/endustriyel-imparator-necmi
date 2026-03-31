import React, { useState, useEffect, useRef } from 'react';

// ARTIK HARİCİ VE SAĞLAM BİR LİNK KULLANIYORUZ
const DUBA_URL = "https://i.postimg.cc/85M7S7S7/duba.png"; 

function App() {
  const [_c, _sc] = useState(100); 
  const [_p, _sp] = useState(0);   
  const [_ns, _sns] = useState<{id: number, text: string}[]>([]); 
  const [_nargile, _setNargile] = useState<{id: number, x: number, y: number} | null>(null);
  const [_plane, _setPlane] = useState(false); 
  const [_duba, _setDuba] = useState<{id: number, x: number, y: number} | null>(null);

  const lastNargileTime = useRef(Date.now());
  const lastPlaneTime = useRef(Date.now());

  const [_levels, _setLevels] = useState({
    clickPower: 1,
    autoWorker: 0,
    marketing: 1,
    factorySize: 1 
  });

  const getCost = (type: keyof typeof _levels, base: number) => Math.floor(base * Math.pow(2.5, _levels[type]));
  const clickGain = _levels.clickPower * 10;
  const autoProdRate = _levels.autoWorker * 0.2; 
  const salePrice = 5 + (_levels.marketing * 3); 
  const storageLimit = _levels.factorySize * 30; 

  const _an = (msg: string) => {
    _sns(prev => [...prev.slice(-3), { id: Date.now(), text: msg }]);
  };

  const spawnPlane = () => {
    if (_plane) return;
    _setPlane(true);
    _an("✈️ Uçak geçiyor, duba bırakıldı!");
    
    // Uçak tam tepedeyken duba düşer
    setTimeout(() => {
      _setDuba({ id: Date.now(), x: Math.random() * 60 + 20, y: Math.random() * 30 + 15 });
    }, 2000);

    setTimeout(() => {
      _setPlane(false);
      lastPlaneTime.current = Date.now();
    }, 4500);
  };

  const spawnNargile = () => {
    const id = Date.now();
    _setNargile({ id, x: Math.random() * 70 + 10, y: Math.random() * 60 + 10 });
    _an("🌬️ Nargile Borusu masada!");
    setTimeout(() => {
        _setNargile(prev => prev?.id === id ? null : prev);
        lastNargileTime.current = Date.now();
    }, 8000);
  };

  const buyUpgrade = (type: keyof typeof _levels, baseCost: number) => {
    const cost = getCost(type, baseCost);
    if (_c >= cost) {
      _sc(prev => prev - cost);
      _setLevels(prev => ({ ...prev, [type]: prev[type] + 1 }));
      _an("Yatırım yapıldı!");
    } else {
      _an("KASA BOŞ!"); 
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
      // Test için süreleri kısalttım patron:
      if (now - lastNargileTime.current > 30000) { if (!_nargile) spawnNargile(); } 
      if (now - lastPlaneTime.current > 40000) { if (!_plane) spawnPlane(); }
    }, 1000);
    return () => clearInterval(mainTick);
  }, [_p, autoProdRate, salePrice, storageLimit, _nargile, _plane]);

  return (
    <div style={{ color: 'white', padding: '20px', textAlign: 'center', backgroundColor: '#0a0a0c', minHeight: '100vh', fontFamily: 'sans-serif', position: 'relative', overflow: 'hidden' }}>
      <h2 style={{ color: '#3b82f6', marginBottom: '20px' }}>Necmi Holding v3.7.2 🚧</h2>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
        <div style={statBox}>Kasa: <br/><span style={{color: '#4ade80'}}>${_c.toLocaleString()}</span></div>
        <div style={statBox}>Stok: <br/><span style={{color: '#fbbf24'}}>{_p.toFixed(1)} / {storageLimit}</span></div>
      </div>

      <button onClick={() => { if (_p < storageLimit) { _sc(prev => prev + clickGain); _sp(prev => prev + 1); } }} style={mainBtn}>🏭 FABRİKAYI ÇALIŞTIR</button>

      {/* UÇAK */}
      {_plane && <div style={{ position: 'absolute', top: '10%', left: '-100px', fontSize: '4.5rem', animation: 'fly 4.5s linear forwards', zIndex: 90 }}>✈️</div>}

      {/* DUBA - GARANTİLİ GÖSTERİM */}
      {_duba && (
        <div 
          onClick={() => { _sc(prev => prev + 1); _setDuba(null); _an("🚧 +1$ Duba toplandı!"); }}
          style={{ position: 'absolute', left: `${_duba.x}%`, top: `${_duba.y}%`, cursor: 'pointer', zIndex: 999 }}
        >
          <img 
            src={DUBA_URL} 
            alt="🚧" 
            style={{ width: '70px', height: 'auto', animation: 'bob 2s infinite', display: 'block' }}
            onError={(e) => {
              // Eğer resim linki yine patlarsa görsel yerine turuncu bir kutu çıkar
              (e.target as any).style.display = 'none';
              (e.target as any).parentElement.innerHTML = '<div style="width:40px; height:60px; background:orange; border-radius:5px; border:2px solid white;"></div>';
            }}
          />
        </div>
      )}

      {/* NARGİLE BORUSU */}
      {_nargile && (
        <div 
          onClick={() => { _sc(prev => prev + 200); _setNargile(null); _an("🌬️ +200$ Nargile Borusu"); }} 
          style={{ position: 'absolute', left: `${_nargile.x}%`, top: `${_nargile.y}%`, padding: '15px 25px', backgroundColor: '#fbbf24', color: '#1a1a1a', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', zIndex: 999, boxShadow: '0 0 30px #fbbf24', animation: 'pulse 1s infinite alternate' }}
        >
          🌬️ Nargile Borusu
        </div>
      )}

      {/* PANEL */}
      <div style={{ maxWidth: '800px', margin: '30px auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <button onClick={() => buyUpgrade('clickPower', 150)} style={upgBtn}>
          <div style={upgTitle}>🚀 Tık Gücü (Lv {_levels.clickPower})</div>
          <div style={upgDesc}>daha sert bas</div>
          <div style={upgPrice}>Fiyat: ${getCost('clickPower', 150).toLocaleString()}</div>
        </button>
        <button onClick={() => buyUpgrade('autoWorker', 600)} style={upgBtn}>
          <div style={upgTitle}>🤖 İşçi (Lv {_levels.autoWorker})</div>
          <div style={upgDesc}>çok yavaş bir köle</div>
          <div style={upgPrice}>Fiyat: ${getCost('autoWorker', 600).toLocaleString()}</div>
        </button>
        <button onClick={() => buyUpgrade('marketing', 200)} style={upgBtn}>
          <div style={upgTitle}>📈 Pazarlama (Lv {_levels.marketing})</div>
          <div style={upgDesc}>yalan söylemeyi öğren</div>
          <div style={upgPrice}>Fiyat: ${getCost('marketing', 200).toLocaleString()}</div>
        </button>
        <button onClick={() => buyUpgrade('factorySize', 400)} style={upgBtn}>
          <div style={upgTitle}>🏗️ Depo (Lv {_levels.factorySize})</div>
          <div style={upgDesc}>yer aç patron</div>
          <div style={upgPrice}>Fiyat: ${getCost('factorySize', 400).toLocaleString()}</div>
        </button>
      </div>

      <div style={{ marginTop: '20px', color: '#6b7280', fontSize: '0.8rem' }}>
        {_ns.map(n => <div key={n.id}>⚡ {n.text}</div>)}
      </div>

      <style>{`
        @keyframes fly { from { left: -15%; } to { left: 115%; } }
        @keyframes bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-30px); } }
        @keyframes pulse { from { transform: scale(1); } to { transform: scale(1.1); } }
      `}</style>
    </div>
  );
}

const statBox = { background: '#1e1e24', padding: '15px', borderRadius: '10px', minWidth: '130px', border: '1px solid #333' };
const mainBtn = { padding: '25px 50px', fontSize: '1.4rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '20px' };
const upgBtn = { display: 'flex', flexDirection: 'column' as any, alignItems: 'center', justifyContent: 'center', padding: '15px', background: '#1e1e24', color: 'white', border: '1px solid #444', borderRadius: '12px', cursor: 'pointer' };
const upgTitle = { fontWeight: 'bold', fontSize: '1rem', marginBottom: '4px' };
const upgDesc = { fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic', marginBottom: '8px' };
const upgPrice = { color: '#4ade80', fontWeight: 'bold', fontSize: '0.9rem' };

export default App;

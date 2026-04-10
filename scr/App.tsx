import React, { useState, useEffect, useRef } from 'react';

/** * --- SES MOTORU --- */
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
      osc.start(); osc.stop(now + 0.1); 
    } else if (type === 'alert') { 
      osc.type = 'square'; osc.frequency.setValueAtTime(220, now);
      gain.gain.setValueAtTime(0.05, now); osc.start(); osc.stop(now + 0.4); 
    } else if (type === 'success') { 
      osc.frequency.setValueAtTime(523, now); gain.gain.setValueAtTime(0.04, now);
      osc.start(); osc.stop(now + 0.3); 
    } else if (type === 'buy') {
      osc.frequency.setValueAtTime(440, now); gain.gain.setValueAtTime(0.03, now);
      osc.start(); osc.stop(now + 0.2);
    }
  } catch (e) {}
};

const DubaIcon = () => (
  <svg width="50" height="60" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 100 L90 100 L85 110 L15 110 Z" fill="#222" /><path d="M30 100 L40 20 L60 20 L70 100 Z" fill="#FF4500" />
    <path d="M36 52 L64 52 L67 68 L33 68 Z" fill="white" opacity="0.8" />
  </svg>
);

function App() {
  const [pass, setPass] = useState("");
  const [isLogged, setIsLogged] = useState(false);
  const [mode, setMode] = useState<"HOCA" | "NECMI" | null>(null);
  const [cash, setCash] = useState(250); 
  const [stock, setStock] = useState(0);   
  const [levels, setLevels] = useState({ clickPower: 1, autoWorker: 0, marketing: 1, factorySize: 1 });
  
  // BORSA & KRİZ DURUMLARI
  const [marketPrice, setMarketPrice] = useState(18);
  const [priceTrend, setPriceTrend] = useState<'up' | 'down'>('up');
  const [activeEvent, setActiveEvent] = useState<{ type: 'TAX' | 'STRIKE' | 'RAID', endTime: number } | null>(null);
  const [strikeActive, setStrikeActive] = useState(false);
  const [secondsUntilNextEvent, setSecondsUntilNextEvent] = useState(120);

  const [planeActive, setPlaneActive] = useState(false);
  const [duba, setDuba] = useState<{x: number, y: number, dropping: boolean} | null>(null);

  const checkPass = () => {
    const input = pass.trim().toUpperCase();
    if (input === "B123B123") setMode("NECMI"), setIsLogged(true);
    else if (input === "3689") setMode("HOCA"), setIsLogged(true);
    else alert("Kod Hatalı!");
  };

  const resolveEvent = (success: boolean) => {
    if (!activeEvent) return;
    if (success) playSfx('success');
    else { playSfx('alert'); setCash(c => Math.max(0, c * 0.9)); }
    setActiveEvent(null);
    setStrikeActive(false);
    setSecondsUntilNextEvent(120);
  };

  useEffect(() => {
    if (!isLogged) return;

    // BORSA DÖNGÜSÜ (Her 5 saniyede fiyat dalgalanır)
    const marketInterval = setInterval(() => {
      setMarketPrice(prev => {
        const change = (Math.random() * 12 - 6); // -6$ ile +6$ arası sert dalga
        const newPrice = Math.max(12, Math.min(48, prev + change));
        setPriceTrend(newPrice > prev ? 'up' : 'down');
        return newPrice;
      });
    }, 5000);

    // OYUN DÖNGÜSÜ
    const tick = setInterval(() => {
      // 1. Üretim (Grev kontrolü)
      if (!strikeActive) {
        setStock(s => Math.min(s + (levels.autoWorker * 0.25), levels.factorySize * 40));
      }

      // 2. Satış (Artık borsa fiyatından satıyoruz)
      setCash(c => {
        let cur = 0; setStock(s => { cur = s; return s; });
        const sale = Math.min(cur, 0.7 + (levels.marketing * 0.45));
        if (sale > 0) {
          setStock(s => Math.max(0, s - sale));
          return c + (sale * marketPrice); 
        }
        return c;
      });

      // 3. Kriz Zamanlayıcısı
      if (!activeEvent) {
        setSecondsUntilNextEvent(prev => {
          if (prev <= 1) {
            const types: ('TAX' | 'STRIKE' | 'RAID')[] = ['TAX', 'STRIKE', 'RAID'];
            const sel = types[Math.floor(Math.random() * types.length)];
            playSfx('alert');
            setActiveEvent({ type: sel, endTime: Date.now() + 8000 });
            if (sel === 'STRIKE') setStrikeActive(true);
            return 120;
          }
          return prev - 1;
        });
      }

      if (activeEvent && Date.now() > activeEvent.endTime) resolveEvent(false);
    }, 1000);

    return () => { clearInterval(marketInterval); clearInterval(tick); };
  }, [isLogged, levels, activeEvent, strikeActive, marketPrice]);

  const cardStyle = { background: 'rgba(30, 30, 45, 0.85)', backdropFilter: 'blur(10px)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' };

  if (!isLogged) return (
    <div style={{ background: '#0f172a', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontFamily: 'sans-serif' }}>
      <div style={{ ...cardStyle, width: '300px', textAlign: 'center' }}>
        <h2>NECMİ HOLDİNG</h2>
        <input type="text" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && checkPass()} placeholder="Erişim Kodu" style={{ width: '85%', padding: '10px', background: '#1e293b', border: 'none', color: 'white', borderRadius: '8px', marginBottom: '15px', textAlign: 'center' }} />
        <button onClick={checkPass} style={{ width: '90%', padding: '10px', background: '#3b82f6', color: 'white', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', border: 'none' }}>SİSTEME GİR</button>
      </div>
    </div>
  );

  return (
    <div style={{ background: '#020617', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', padding: '20px', position: 'relative' }}>
      
      {/* KRİZ PANELİ */}
      {activeEvent && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: '#ef4444', padding: '20px', borderRadius: '15px', zIndex: 1000, textAlign: 'center', border: '3px solid white', boxShadow: '0 0 30px rgba(239, 68, 68, 0.6)' }}>
          <h2 style={{ margin: 0 }}>{activeEvent.type === 'STRIKE' ? '🪧 İŞ BIRAKMA' : activeEvent.type === 'TAX' ? '⚖️ VERGİ DENETİMİ' : '🚨 BASKIN'}</h2>
          <button onClick={() => { if(activeEvent.type === 'STRIKE') setCash(c => Math.max(0, c - 100)); resolveEvent(true); }} style={{ marginTop: '10px', padding: '10px 25px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '8px', border: 'none' }}>SORUNU ÇÖZ</button>
        </div>
      )}

      {/* HEADER & BORSA */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ color: '#3b82f6', margin: 0 }}>{mode === 'NECMI' ? "Necmi Holding A.Ş." : "Endüstriyel Verimlilik"}</h1>
          <p style={{ color: '#94a3b8', margin: 0 }}>Borsa ve Piyasa Takip Ekranı</p>
        </div>
        <div style={{ ...cardStyle, textAlign: 'right', border: `1px solid ${priceTrend === 'up' ? '#22c55e' : '#ef4444'}` }}>
          <small style={{ color: '#94a3b8' }}>{mode === 'HOCA' ? "PİYASA DEĞERİ" : "MALIN FİYATI"}</small>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: priceTrend === 'up' ? '#22c55e' : '#ef4444' }}>
            ${marketPrice.toFixed(2)} {priceTrend === 'up' ? '▲' : '▼'}
          </div>
        </div>
      </header>

      {/* ANA DURUM PANELI */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
        <div style={{ ...cardStyle, minWidth: '180px' }}>KASA<br/><span style={{ color: '#22c55e', fontSize: '2rem', fontWeight: 'bold' }}>${Math.floor(cash).toLocaleString()}</span></div>
        <div style={{ ...cardStyle, minWidth: '180px' }}>STOK<br/><span style={{ color: '#eab308', fontSize: '2rem', fontWeight: 'bold' }}>{stock.toFixed(1)} / {levels.factorySize * 40}</span></div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <button 
          onClick={() => { if(!strikeActive) { setCash(c => c + 10); setStock(s => Math.min(s + levels.clickPower, levels.factorySize * 40)); playSfx('click'); } }} 
          style={{ padding: '25px 70px', fontSize: '1.6rem', fontWeight: 'bold', background: strikeActive ? '#475569' : '#3b82f6', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer', boxShadow: '0 8px 0 #1d4ed8' }}
        >
          {strikeActive ? "🚨 GREV DEVAM EDİYOR" : "🏭 ÜRETİMİ TETİKLE"}
        </button>
      </div>

      {/* MARKET */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', maxWidth: '1100px', margin: '0 auto' }}>
        {Object.entries(levels).map(([k, v]) => {
          const cost = Math.floor(200 * Math.pow(1.25, v));
          return (
            <div key={k} onClick={() => { if(cash >= cost) { setCash(c => c - cost); setLevels(l => ({...l, [k]: (l as any)[k] + 1})); playSfx('buy'); } }} style={{ ...cardStyle, cursor: 'pointer', transition: '0.2s' }}>
              <div style={{ color: '#818cf8', fontWeight: 'bold', marginBottom: '10px' }}>{k.toUpperCase()} (Lv {v})</div>
              <div style={{ fontSize: '1.4rem', color: '#22c55e' }}>${cost.toLocaleString()}</div>
            </div>
          );
        })}
      </div>

      {/* ALT BİLGİ & SAYAÇ */}
      <div style={{ position: 'fixed', bottom: '15px', right: '15px', opacity: 0.4, fontSize: '0.8rem', textAlign: 'right' }}>
        Sonraki Kriz: {Math.floor(secondsUntilNextEvent / 60)}:{(secondsUntilNextEvent % 60).toString().padStart(2, '0')}<br/>
        v4.3.0 Borsa Sürümü
      </div>
    </div>
  );
}

export default App;

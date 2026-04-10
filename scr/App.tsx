import React, { useState, useEffect, useRef } from 'react';

/** * --- GELİŞMİŞ SES MOTORU (Web Audio API) ---
 * Dış dosyaya ihtiyaç duymaz, tarayıcıda sesi sentezler.
 */
const playSfx = (type: 'click' | 'buy' | 'collect' | 'alert' | 'success' | 'marketUp' | 'marketDown') => {
  try {
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    const now = ctx.currentTime;

    switch (type) {
      case 'click': // Üretim Tıklaması
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.1);
        osc.start(); osc.stop(now + 0.1);
        break;
      case 'buy': // Satın Alma
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(); osc.stop(now + 0.2);
        break;
      case 'alert': // KRİZ! (Sirene benzer)
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.5);
        gain.gain.setValueAtTime(0.05, now);
        osc.start(); osc.stop(now + 0.5);
        break;
      case 'success': // Kriz Çözüldü
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.setValueAtTime(700, now + 0.1);
        osc.frequency.setValueAtTime(900, now + 0.2);
        gain.gain.setValueAtTime(0.05, now);
        osc.start(); osc.stop(now + 0.3);
        break;
      case 'marketUp': // Borsa Yükselişi
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.1);
        osc.start(); osc.stop(now + 0.1);
        break;
      case 'marketDown': // Borsa Düşüşü
        osc.frequency.setValueAtTime(220, now);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.1);
        osc.start(); osc.stop(now + 0.1);
        break;
    }
  } catch (e) { console.error("Ses çalınamadı", e); }
};

function App() {
  const [pass, setPass] = useState("");
  const [isLogged, setIsLogged] = useState(false);
  const [mode, setMode] = useState<"HOCA" | "NECMI" | null>(null);
  const [cash, setCash] = useState(250); 
  const [stock, setStock] = useState(0);   
  const [levels, setLevels] = useState({ clickPower: 1, autoWorker: 0, marketing: 1, factorySize: 1 });
  
  const [marketPrice, setMarketPrice] = useState(18);
  const [priceTrend, setPriceTrend] = useState<'up' | 'down'>('up');
  const [activeEvent, setActiveEvent] = useState<{ type: 'TAX' | 'STRIKE' | 'RAID', endTime: number } | null>(null);
  const [strikeActive, setStrikeActive] = useState(false);
  const [secondsUntilNextEvent, setSecondsUntilNextEvent] = useState(120);

  const checkPass = () => {
    const input = pass.trim().toUpperCase();
    if (input === "B123B123" || input === "3689") {
      setMode(input === "B123B123" ? "NECMI" : "HOCA");
      setIsLogged(true);
      playSfx('success');
    } else alert("Erişim Kodu Hatalı!");
  };

  const resolveEvent = (success: boolean) => {
    if (!activeEvent) return;
    if (success) {
        playSfx('success');
    } else {
        playSfx('alert');
        setCash(c => Math.max(0, c * 0.9));
    }
    setActiveEvent(null);
    setStrikeActive(false);
    setSecondsUntilNextEvent(120);
  };

  useEffect(() => {
    if (!isLogged) return;

    // BORSA DÖNGÜSÜ
    const marketInterval = setInterval(() => {
      setMarketPrice(prev => {
        const change = (Math.random() * 12 - 6);
        const newPrice = Math.max(12, Math.min(48, prev + change));
        const trend = newPrice > prev ? 'up' : 'down';
        setPriceTrend(trend);
        // Borsa sesini tetikle
        playSfx(trend === 'up' ? 'marketUp' : 'marketDown');
        return newPrice;
      });
    }, 5000);

    const tick = setInterval(() => {
      if (!strikeActive) {
        setStock(s => Math.min(s + (levels.autoWorker * 0.25), levels.factorySize * 40));
      }
      setCash(c => {
        let cur = 0; setStock(s => { cur = s; return s; });
        const sale = Math.min(cur, 0.7 + (levels.marketing * 0.45));
        if (sale > 0) {
          setStock(s => Math.max(0, s - sale));
          return c + (sale * marketPrice); 
        }
        return c;
      });

      if (!activeEvent) {
        setSecondsUntilNextEvent(prev => {
          if (prev <= 1) {
            const types: ('TAX' | 'STRIKE' | 'RAID')[] = ['TAX', 'STRIKE', 'RAID'];
            const sel = types[Math.floor(Math.random() * types.length)];
            playSfx('alert'); // Kriz sesi
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
        <input type="text" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && checkPass()} placeholder="Giriş Kodu" style={{ width: '85%', padding: '12px', background: '#1e293b', border: 'none', color: 'white', borderRadius: '8px', marginBottom: '15px', textAlign: 'center' }} />
        <button onClick={checkPass} style={{ width: '90%', padding: '12px', background: '#3b82f6', color: 'white', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', border: 'none' }}>SİSTEMİ AÇ</button>
      </div>
    </div>
  );

  return (
    <div style={{ background: '#020617', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', padding: '20px' }}>
      
      {activeEvent && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: '#ef4444', padding: '20px', borderRadius: '15px', zIndex: 1000, textAlign: 'center', border: '3px solid white', boxShadow: '0 0 30px rgba(239, 68, 68, 0.6)' }}>
          <h2 style={{ margin: 0 }}>{activeEvent.type === 'STRIKE' ? '🪧 GREV' : activeEvent.type === 'TAX' ? '⚖️ DENETİM' : '🚨 BASKIN'}</h2>
          <button onClick={() => { if(activeEvent.type === 'STRIKE') setCash(c => Math.max(0, c - 100)); resolveEvent(true); }} style={{ marginTop: '10px', padding: '10px 25px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '8px', border: 'none', background: 'white' }}>MÜDAHALE ET</button>
        </div>
      )}

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ color: '#3b82f6', margin: 0 }}>{mode === 'NECMI' ? "Necmi Holding A.Ş." : "Akademik Panel"}</h1>
        </div>
        <div style={{ ...cardStyle, border: `2px solid ${priceTrend === 'up' ? '#22c55e' : '#ef4444'}` }}>
          <small style={{ color: '#94a3b8' }}>BORSA DEĞERİ</small>
          <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: priceTrend === 'up' ? '#22c55e' : '#ef4444' }}>
            ${marketPrice.toFixed(2)} {priceTrend === 'up' ? '▲' : '▼'}
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
        <div style={cardStyle}>KASA<br/><span style={{ color: '#22c55e', fontSize: '1.8rem', fontWeight: 'bold' }}>${Math.floor(cash).toLocaleString()}</span></div>
        <div style={cardStyle}>STOK<br/><span style={{ color: '#eab308', fontSize: '1.8rem', fontWeight: 'bold' }}>{stock.toFixed(1)} / {levels.factorySize * 40}</span></div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <button 
          onClick={() => { if(!strikeActive) { setCash(c => c + 10); setStock(s => Math.min(s + levels.clickPower, levels.factorySize * 40)); playSfx('click'); } }} 
          style={{ padding: '20px 60px', fontSize: '1.4rem', fontWeight: 'bold', background: strikeActive ? '#475569' : '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 6px 0 #1d4ed8' }}
        >
          {strikeActive ? "⚠️ GREV DURDURDU" : "🏭 ÜRETİME BAS"}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
        {Object.entries(levels).map(([k, v]) => {
          const cost = Math.floor(200 * Math.pow(1.25, v));
          return (
            <div key={k} onClick={() => { if(cash >= cost) { setCash(c => c - cost); setLevels(l => ({...l, [k]: (l as any)[k] + 1})); playSfx('buy'); } }} style={{ ...cardStyle, cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ color: '#818cf8', fontSize: '0.8rem', marginBottom: '5px' }}>{k.toUpperCase()} (Lv {v})</div>
              <div style={{ fontSize: '1.2rem', color: '#22c55e' }}>${cost.toLocaleString()}</div>
            </div>
          );
        })}
      </div>

      <div style={{ position: 'fixed', bottom: '15px', right: '15px', opacity: 0.3, fontSize: '0.7rem' }}>
        Sonraki Olay: {Math.floor(secondsUntilNextEvent / 60)}:{(secondsUntilNextEvent % 60).toString().padStart(2, '0')} | v4.3.1 Audio
      </div>
    </div>
  );
}

export default App;

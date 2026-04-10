import React, { useState, useEffect, useRef } from 'react';

// ==========================================================
// 1. SES MOTORU VE EFEKTLER (PROFESYONEL SENTEZLEYİCİ)
// ==========================================================
const playSfx = (type: string) => {
  try {
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const now = ctx.currentTime;

    if (type === 'click') {
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.1);
      osc.start();
      osc.stop(now + 0.1);
    } 
    else if (type === 'buy') {
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(880, now + 0.3);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start();
      osc.stop(now + 0.3);
    }
    else if (type === 'alert') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.6);
      gain.gain.setValueAtTime(0.05, now);
      osc.start();
      osc.stop(now + 0.6);
    }
    else if (type === 'success') {
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      osc.frequency.setValueAtTime(783.99, now + 0.2);
      gain.gain.setValueAtTime(0.05, now);
      osc.start();
      osc.stop(now + 0.4);
    }
    else if (type === 'marketUp') {
      osc.frequency.setValueAtTime(900, now);
      gain.gain.setValueAtTime(0.02, now);
      osc.start(); osc.stop(now + 0.05);
    }
    else if (type === 'marketDown') {
      osc.frequency.setValueAtTime(150, now);
      gain.gain.setValueAtTime(0.02, now);
      osc.start(); osc.stop(now + 0.05);
    }
  } catch (error) {
    console.warn("Audio Context başlatılamadı.");
  }
};

// ==========================================================
// 2. ANA UYGULAMA BİLEŞENİ
// ==========================================================
export default function App() {
  // --- KULLANICI VE GİRİŞ DURUMLARI ---
  const [pass, setPass] = useState("");
  const [isLogged, setIsLogged] = useState(false);
  const [mode, setMode] = useState<"HOCA" | "NECMI" | null>(null);

  // --- EKONOMİK DURUMLAR ---
  const [cash, setCash] = useState(250);
  const [stock, setStock] = useState(0);
  const [marketPrice, setMarketPrice] = useState(18.00);
  const [priceTrend, setPriceTrend] = useState<'up' | 'down'>('up');

  // --- GELİŞTİRME SEVİYELERİ (AYRI AYRI TANIMLANDI) ---
  const [lvlClick, setLvlClick] = useState(1);
  const [lvlWorker, setLvlWorker] = useState(0);
  const [lvlMarketing, setLvlMarketing] = useState(1);
  const [lvlFactory, setLvlFactory] = useState(1);
  const [lvlTruck, setLvlTruck] = useState(0); // YENİ: YÜK KAMYONU

  // --- OLAY VE ZAMANLAYICI DURUMLARI ---
  const [activeEvent, setActiveEvent] = useState<{ type: string, endTime: number } | null>(null);
  const [strikeActive, setStrikeActive] = useState(false);
  const [eventCountdown, setEventCountdown] = useState(120);

  // --- LOG SİSTEMİ ---
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (text: string) => {
    setLogs(prev => [text, ...prev].slice(0, 5));
  };

  // --- GİRİŞ KONTROLÜ ---
  const handleLogin = () => {
    const key = pass.trim().toUpperCase();
    if (key === "B123B123") {
      setMode("NECMI");
      setIsLogged(true);
      playSfx('success');
      addLog("Necmi Holding CEO girişi yapıldı.");
    } else if (key === "3689") {
      setMode("HOCA");
      setIsLogged(true);
      playSfx('success');
      addLog("Akademik Panel aktif edildi.");
    } else {
      alert("ERİŞİM ENGELLENDİ!");
    }
  };

  // --- SATIN ALMA FONKSİYONLARI (AYRI AYRI) ---
  const buyClickPower = () => {
    const cost = Math.floor(200 * Math.pow(1.25, lvlClick - 1));
    if (cash >= cost) {
      setCash(c => c - cost);
      setLvlClick(l => l + 1);
      playSfx('buy');
      addLog("Üretim hattı optimize edildi.");
    }
  };

  const buyWorker = () => {
    const cost = Math.floor(500 * Math.pow(1.25, lvlWorker));
    if (cash >= cost) {
      setCash(c => c - cost);
      setLvlWorker(l => l + 1);
      playSfx('buy');
      addLog("Yeni işçi işe alındı.");
    }
  };

  const buyMarketing = () => {
    const cost = Math.floor(600 * Math.pow(1.25, lvlMarketing - 1));
    if (cash >= cost) {
      setCash(c => c - cost);
      setLvlMarketing(l => l + 1);
      playSfx('buy');
      addLog("Reklam kampanyası başlatıldı.");
    }
  };

  const buyFactory = () => {
    const cost = Math.floor(650 * Math.pow(1.25, lvlFactory - 1));
    if (cash >= cost) {
      setCash(c => c - cost);
      setLvlFactory(l => l + 1);
      playSfx('buy');
      addLog("Depo alanı genişletildi.");
    }
  };

  const buyTruck = () => {
    const cost = Math.floor(800 * Math.pow(1.35, lvlTruck));
    if (cash >= cost) {
      setCash(c => c - cost);
      setLvlTruck(l => l + 1);
      playSfx('buy');
      addLog("Lojistik filosu güçlendirildi.");
    }
  };

  // --- KRİZ ÇÖZME ---
  const handleResolve = () => {
    if (!activeEvent) return;
    if (activeEvent.type === 'STRIKE') {
      if (cash >= 100) {
        setCash(c => c - 100);
        playSfx('success');
        addLog("Grev baklava ile tatlıya bağlandı.");
      } else {
        alert("Yeterli paran yok!");
        return;
      }
    } else {
      playSfx('success');
      addLog("Kriz başarıyla yönetildi.");
    }
    setActiveEvent(null);
    setStrikeActive(false);
    setEventCountdown(120);
  };

  // --- ANA OYUN DÖNGÜSÜ ---
  useEffect(() => {
    if (!isLogged) return;

    // BORSA: Her 5 saniyede bir fiyat değişimi
    const marketTicker = setInterval(() => {
      setMarketPrice(prev => {
        const change = (Math.random() * 10 - 5);
        const newPrice = Math.max(10, Math.min(50, prev + change));
        const trend = newPrice > prev ? 'up' : 'down';
        setPriceTrend(trend);
        playSfx(trend === 'up' ? 'marketUp' : 'marketDown');
        return newPrice;
      });
    }, 5000);

    // SANİYE TIKLAMASI: Üretim, Satış ve Olaylar
    const mainTick = setInterval(() => {
      // 1. OTOMATİK ÜRETİM
      if (!strikeActive) {
        setStock(prevStock => {
          const maxStock = lvlFactory * 40;
          const newStock = prevStock + (lvlWorker * 0.25);
          return Math.min(newStock, maxStock);
        });
      }

      // 2. OTOMATİK SATIŞ (PAZARLAMA + KAMYON)
      setCash(prevCash => {
        let currentStock = 0;
        setStock(s => { currentStock = s; return s; });
        
        // Satış hızı hesaplama
        const baseSale = 0.7;
        const marketingBonus = lvlMarketing * 0.45;
        const truckBonus = lvlTruck * 1.0; // Kamyon ciddi hız katar
        const totalSaleSpeed = baseSale + marketingBonus + truckBonus;
        
        const actualSale = Math.min(currentStock, totalSaleSpeed);
        
        if (actualSale > 0) {
          setStock(s => Math.max(0, s - actualSale));
          return prevCash + (actualSale * marketPrice);
        }
        return prevCash;
      });

      // 3. KRİZ SAYACI
      if (!activeEvent) {
        setEventCountdown(prev => {
          if (prev <= 1) {
            const roll = Math.random();
            let eventType = 'TAX';
            if (roll > 0.66) eventType = 'STRIKE';
            else if (roll > 0.33) eventType = 'RAID';
            
            playSfx('alert');
            setActiveEvent({ type: eventType, endTime: Date.now() + 8000 });
            if (eventType === 'STRIKE') setStrikeActive(true);
            addLog(`DİKKAT: ${eventType} MEYDANA GELDİ!`);
            return 120;
          }
          return prev - 1;
        });
      }

      // Kriz Zaman Aşımı
      if (activeEvent && Date.now() > activeEvent.endTime) {
        playSfx('alert');
        setCash(c => Math.max(0, c * 0.85));
        addLog("Kriz yönetilemedi, ağır ceza kesildi!");
        setActiveEvent(null);
        setStrikeActive(false);
        setEventCountdown(120);
      }
    }, 1000);

    return () => {
      clearInterval(marketTicker);
      clearInterval(mainTick);
    };
  }, [isLogged, lvlWorker, lvlMarketing, lvlFactory, lvlTruck, strikeActive, activeEvent, marketPrice]);

  // --- GÖRÜNÜM (JSX) ---
  if (!isLogged) {
    return (
      <div style={{ backgroundColor: '#0f172a', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontFamily: 'Arial' }}>
        <div style={{ background: '#1e293b', padding: '40px', borderRadius: '20px', textAlign: 'center', border: '2px solid #3b82f6' }}>
          <h1 style={{ letterSpacing: '2px' }}>NECMİ HOLDİNG A.Ş.</h1>
          <p style={{ opacity: 0.7 }}>Kurumsal Erişim Paneli v4.4.5</p>
          <input 
            type="password" 
            value={pass} 
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Erişim Şifresi"
            style={{ width: '100%', padding: '15px', marginTop: '20px', borderRadius: '10px', border: 'none', textAlign: 'center', fontSize: '1.2rem' }}
          />
          <button 
            onClick={handleLogin}
            style={{ width: '100%', padding: '15px', marginTop: '20px', borderRadius: '10px', border: 'none', backgroundColor: '#3b82f6', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
          >
            SİSTEME BAĞLAN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#020617', minHeight: '100vh', color: 'white', fontFamily: 'Segoe UI, sans-serif', padding: '30px' }}>
      
      {/* ÜST PANEL */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #1e293b', paddingBottom: '20px', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#3b82f6' }}>{mode === 'NECMI' ? "PATRON NECMİ" : "AKADEMİK PANEL"}</h1>
          <div style={{ color: '#94a3b8' }}>Gelecek Olay: {Math.floor(eventCountdown / 60)}:{String(eventCountdown % 60).padStart(2, '0')}</div>
        </div>
        
        <div style={{ background: '#1e293b', padding: '15px 30px', borderRadius: '15px', border: `2px solid ${priceTrend === 'up' ? '#22c55e' : '#ef4444'}` }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>GÜNCEL PİYASA DEĞERİ</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: priceTrend === 'up' ? '#22c55e' : '#ef4444' }}>
            ${marketPrice.toFixed(2)} {priceTrend === 'up' ? '▲' : '▼'}
          </div>
        </div>
      </div>

      {/* KRİZ UYARISI */}
      {activeEvent && (
        <div style={{ backgroundColor: '#ef4444', padding: '20px', borderRadius: '15px', marginBottom: '30px', textAlign: 'center', animation: 'pulse 1s infinite' }}>
          <h2 style={{ margin: 0 }}>🚨 ACİL DURUM: {activeEvent.type} 🚨</h2>
          <p>Krizin sona ermesine {Math.max(0, Math.ceil((activeEvent.endTime - Date.now()) / 1000))} saniye kaldı!</p>
          <button onClick={handleResolve} style={{ padding: '10px 30px', fontSize: '1.1rem', fontWeight: 'bold', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'white', color: '#ef4444' }}>
            {activeEvent.type === 'STRIKE' ? "BAKLAVA DAĞIT (-100$)" : "KRİZİ YÖNET"}
          </button>
        </div>
      )}

      {/* ANA İSTATİSTİKLER */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
        <div style={{ background: 'linear-gradient(145deg, #1e293b, #0f172a)', padding: '30px', borderRadius: '20px', textAlign: 'center' }}>
          <div style={{ color: '#94a3b8' }}>TOPLAM NAKİT</div>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#22c55e' }}>${Math.floor(cash).toLocaleString()}</div>
        </div>
        <div style={{ background: 'linear-gradient(145deg, #1e293b, #0f172a)', padding: '30px', borderRadius: '20px', textAlign: 'center' }}>
          <div style={{ color: '#94a3b8' }}>STOK DURUMU</div>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#eab308' }}>{stock.toFixed(1)} / {lvlFactory * 40}</div>
        </div>
      </div>

      {/* ÜRETİM BUTONU */}
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <button 
          onClick={() => {
            if (!strikeActive && stock < (lvlFactory * 40)) {
              setStock(prev => Math.min(prev + lvlClick, lvlFactory * 40));
              playSfx('click');
            }
          }}
          style={{ 
            padding: '30px 80px', fontSize: '2rem', fontWeight: 'bold', borderRadius: '20px', border: 'none',
            backgroundColor: (strikeActive || stock >= lvlFactory * 40) ? '#475569' : '#3b82f6',
            color: 'white', cursor: 'pointer', boxShadow: '0 10px 0 #1d4ed8', transition: '0.1s'
          }}
        >
          {strikeActive ? "⚠️ GREV VAR" : stock >= (lvlFactory * 40) ? "📦 DEPO DOLU" : "🏭 ÜRETİME BAS"}
        </button>
      </div>

      {/* MARKET / GELİŞTİRMELER */}
      <h2 style={{ borderLeft: '5px solid #3b82f6', paddingLeft: '15px', marginBottom: '20px' }}>HOLDİNG GELİŞTİRMELERİ</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        
        {/* TIK GÜCÜ */}
        <div onClick={buyClickPower} style={{ background: '#1e293b', padding: '20px', borderRadius: '15px', cursor: 'pointer', border: '1px solid #3b82f6' }}>
          <div style={{ fontWeight: 'bold' }}>🚀 TIK GÜCÜ (Lv {lvlClick})</div>
          <div style={{ color: '#22c55e', fontSize: '1.2rem' }}>${Math.floor(200 * Math.pow(1.25, lvlClick - 1)).toLocaleString()}</div>
        </div>

        {/* İŞÇİ */}
        <div onClick={buyWorker} style={{ background: '#1e293b', padding: '20px', borderRadius: '15px', cursor: 'pointer', border: '1px solid #3b82f6' }}>
          <div style={{ fontWeight: 'bold' }}>🤖 OTOMATİK İŞÇİ (Lv {lvlWorker})</div>
          <div style={{ color: '#22c55e', fontSize: '1.2rem' }}>${Math.floor(500 * Math.pow(1.25, lvlWorker)).toLocaleString()}</div>
        </div>

        {/* PAZARLAMA */}
        <div onClick={buyMarketing} style={{ background: '#1e293b', padding: '20px', borderRadius: '15px', cursor: 'pointer', border: '1px solid #3b82f6' }}>
          <div style={{ fontWeight: 'bold' }}>📈 PAZARLAMA (Lv {lvlMarketing})</div>
          <div style={{ color: '#22c55e', fontSize: '1.2rem' }}>${Math.floor(600 * Math.pow(1.25, lvlMarketing - 1)).toLocaleString()}</div>
        </div>

        {/* DEPO */}
        <div onClick={buyFactory} style={{ background: '#1e293b', padding: '20px', borderRadius: '15px', cursor: 'pointer', border: '1px solid #3b82f6' }}>
          <div style={{ fontWeight: 'bold' }}>🏗️ DEPO KAPASİTESİ (Lv {lvlFactory})</div>
          <div style={{ color: '#22c55e', fontSize: '1.2rem' }}>${Math.floor(650 * Math.pow(1.25, lvlFactory - 1)).toLocaleString()}</div>
        </div>

        {/* KAMYON (YENİ) */}
        <div onClick={buyTruck} style={{ background: '#1e293b', padding: '20px', borderRadius: '15px', cursor: 'pointer', border: '1px solid #fbbf24' }}>
          <div style={{ fontWeight: 'bold', color: '#fbbf24' }}>🚚 YÜK KAMYONU (Lv {lvlTruck})</div>
          <div style={{ color: '#22c55e', fontSize: '1.2rem' }}>${Math.floor(800 * Math.pow(1.35, lvlTruck)).toLocaleString()}</div>
          <small style={{ color: '#94a3b8' }}>Satış hızını devasa artırır.</small>
        </div>

      </div>

      {/* ALT LOGLAR */}
      <div style={{ marginTop: '50px', backgroundColor: '#0f172a', padding: '15px', borderRadius: '10px', border: '1px solid #1e293b' }}>
        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '10px' }}>HOLDİNG İŞLEM KAYITLARI</div>
        {logs.map((log, index) => (
          <div key={index} style={{ fontSize: '0.9rem', marginBottom: '5px', color: index === 0 ? '#3b82f6' : '#64748b' }}>
            {">"} {log}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

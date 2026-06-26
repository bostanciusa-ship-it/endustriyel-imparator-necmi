import React, { useState, useEffect } from 'react';

interface SaveSlot {
  id: number;
  label: string;
  savedAt: string | null;
}

export default function App() {
  // --- EKRAN KONTROL STATE'LERİ (INTRO) ---
  const [showIntro, setShowIntro] = useState<boolean>(true);

  // --- TEMEL EKONOMİ STATE'LERİ ---
  const [money, setMoney] = useState<number>(295);
  const [stock, setStock] = useState<number>(7.5);
  const [maxStock, setMaxStock] = useState<number>(40);
  const [stockPrice, setStockPrice] = useState<number>(18.08);
  const [priceTrend, setPriceTrend] = useState<'up' | 'down'>('up');
  
  // --- CANLI BORSA GRAFİĞİ GEÇMİŞİ (ÇİZGİ İÇİN 7 NOKTA) ---
  const [priceHistory, setPriceHistory] = useState<number[]>([12, 15, 14, 18, 16, 22, 18.08]);

  // --- GELİŞTİRME SEVİYELERİ ---
  const [clickLvl, setClickLvl] = useState<number>(1);
  const [workerLvl, setWorkerLvl] = useState<number>(0);
  const [truckLvl, setTruckLvl] = useState<number>(0);
  const [marketingLvl, setMarketingLvl] = useState<number>(1);
  const [storageLvl, setStorageLvl] = useState<number>(1);

  // --- ZAMANLAYICILAR VE DÖNGÜLER ---
  const [deliveryTimer, setDeliveryTimer] = useState<number>(3);
  const [crisisTimer, setCrisisTimer] = useState<number>(117);
  const [luckyTimer, setLuckyTimer] = useState<number>(57);
  const [activeSlot, setActiveSlot] = useState<number>(1);

  // --- ALTIN TIR MEKANİĞİ ---
  const [goldTruckActive, setGoldTruckActive] = useState<boolean>(false);
  const [goldTruckMultiplier, setGoldTruckMultiplier] = useState<number>(1);
  const [goldTruckTimer, setGoldTruckTimer] = useState<number>(0);

  // --- KUMAR ODASI & REHBER ---
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [gambleAmount, setGambleAmount] = useState<string>('50');
  const [gambleMessage, setGambleMessage] = useState<string>('');
  const [isGambleSuccess, setIsGambleSuccess] = useState<boolean | null>(null);
  const [showTutorial, setShowTutorial] = useState<boolean>(true);

  // --- KAYIT SLOTLARI ---
  const [slots, setSlots] = useState<SaveSlot[]>([
    { id: 1, label: 'SLOT 1', savedAt: 'Aktif Otomatik' },
    { id: 2, label: 'SLOT 2', savedAt: null },
    { id: 3, label: 'SLOT 3', savedAt: null },
  ]);

  const targetMoney = 1000000;
  const isGameOver = money >= targetMoney;
  const moneyToTarget = Math.max(0, targetMoney - money);

  const costs = {
    click: 200 * clickLvl,
    worker: 500 * (workerLvl + 1),
    truck: 550 * (truckLvl + 1),
    marketing: 600 * marketingLvl,
    storage: 650 * storageLvl,
  };

  // Oyun Ana Döngüsü
  useEffect(() => {
    if (isGameOver || showIntro) return;
    const interval = setInterval(() => {
      if (workerLvl > 0) {
        setStock(prev => Math.min(maxStock, prev + (workerLvl * 0.2)));
      }
      setDeliveryTimer(prev => {
        if (prev <= 1) {
          setStock(currentStock => {
            const soldAmount = currentStock;
            const revenue = soldAmount * stockPrice * (1 + (marketingLvl * 0.05)) * goldTruckMultiplier;
            setMoney(m => m + revenue);
            return 0;
          });
          return Math.max(1, 3 - (truckLvl * 0.2));
        }
        return prev - 1;
      });
      setCrisisTimer(prev => {
        if (prev <= 1) {
          setStockPrice(p => {
            const drop = Math.random() * 5 + 2;
            setPriceTrend('down');
            const newPrice = Math.max(5, Number((p - drop).toFixed(2)));
            setPriceHistory(hist => [...hist.slice(-6), newPrice]);
            return newPrice;
          });
          return 120;
        }
        return prev - 1;
      });
      setLuckyTimer(prev => {
        if (prev <= 1) {
          setStockPrice(p => {
            const change = (Math.random() * 4 - 1.5);
            setPriceTrend(change >= 0 ? 'up' : 'down');
            const newPrice = Math.max(5, Number((p + change).toFixed(2)));
            setPriceHistory(hist => [...hist.slice(-6), newPrice]);
            return newPrice;
          });
          if (!goldTruckActive && Math.random() < 0.25) {
            setGoldTruckActive(true);
            setGoldTruckMultiplier(5);
            setGoldTruckTimer(15);
          }
          return 60;
        }
        return prev - 1;
      });
      setGoldTruckTimer(prev => {
        if (prev <= 1) { setGoldTruckActive(false); setGoldTruckMultiplier(1); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [workerLvl, maxStock, stockPrice, marketingLvl, truckLvl, goldTruckMultiplier, goldTruckActive, isGameOver, showIntro]);

  const handleManualProduction = () => setStock(prev => Math.min(maxStock, prev + clickLvl));

  const buyUpgrade = (type: 'click' | 'worker' | 'truck' | 'marketing' | 'storage') => {
    const cost = costs[type];
    if (money >= cost) {
      setMoney(prev => prev - cost);
      if (type === 'click') setClickLvl(p => p + 1);
      if (type === 'worker') setWorkerLvl(p => p + 1);
      if (type === 'truck') setTruckLvl(p => p + 1);
      if (type === 'marketing') setMarketingLvl(p => p + 1);
      if (type === 'storage') { setStorageLvl(p => p + 1); setMaxStock(p => p + 20); }
    }
  };

  const handleRollDice = () => {
    const amount = Number(gambleAmount);
    if (isNaN(amount) || amount <= 0 || money < amount) return;
    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceResult(roll);
    if (roll <= 3) {
      setMoney(prev => Math.max(0, prev - amount));
      setIsGambleSuccess(false);
      setGambleMessage(`Zar ${roll} geldi! Yeraltı çetesi parana çöktü, -$${amount.toLocaleString()}!`);
    } else {
      setMoney(prev => prev + amount);
      setIsGambleSuccess(true);
      setGambleMessage(`Zar ${roll} geldi! Masayı patlattın, +$${amount.toLocaleString()} kazandın!`);
    }
  };

  const saveGame = (slotId: number) => {
    setActiveSlot(slotId);
    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, savedAt: new Date().toLocaleTimeString() } : s));
    alert(`Oyun SLOT ${slotId} üzerine kaydedildi!`);
  };

  const generateSvgPath = () => {
    const width = 280;
    const height = 110;
    const minP = 5;
    const maxP = 30;
    const points = priceHistory.map((price, idx) => {
      const x = (idx / (priceHistory.length - 1)) * width;
      const y = height - (((price - minP) / (maxP - minP)) * height);
      return `${x},${y}`;
    });
    return points.join(' ');
  };

  const s = {
    body: { backgroundColor: '#020617', color: '#f8fafc', fontFamily: 'sans-serif', padding: '16px', minHeight: '100vh', display: 'flex', flexDirection: 'column' } as React.CSSProperties,
    header: { borderBottom: '1px solid #1e293b', paddingBottom: '16px', marginBottom: '16px' },
    title: { color: '#f59e0b', fontSize: '24px', fontWeight: '900', margin: 0 },
    subtitle: { color: '#818cf8', fontSize: '14px', fontWeight: 'bold', margin: '4px 0 0 0' },
    targetBarOuter: { width: '100%', backgroundColor: '#020617', height: '12px', borderRadius: '999px', border: '1px solid #1e293b', overflow: 'hidden', marginTop: '6px' },
    card: { backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b', flex: '1 1 300px' },
    btnManual: { width: '100%', backgroundColor: '#f59e0b', color: '#020617', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: '900', cursor: 'pointer', fontSize: '14px', marginTop: '12px' } as React.CSSProperties,
    btnUpgrade: { backgroundColor: '#1e293b', color: '#f59e0b', border: '1px solid #334155', padding: '8px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
    footer: { borderTop: '1px solid #1e293b', paddingTop: '16px', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#475569' }
  };

  // ==========================================
  // 🎬 ANIMASYONLU INTRO EKRANI (CSS ENJEKTE EDİLDİ)
  // ==========================================
  if (showIntro) {
    return (
      <div style={{ backgroundColor: '#020617', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '20px' }}>
        {/* Neon Parlama ve Titreme Animasyon CSS'i */}
        <style>{`
          @keyframes neonGlow {
            0%, 100% { border-color: #f59e0b; box-shadow: 0 0 20px rgba(245, 158, 11, 0.3), inset 0 0 10px rgba(245, 158, 11, 0.2); }
            50% { border-color: #ff0055; box-shadow: 0 0 40px rgba(255, 0, 85, 0.6), inset 0 0 20px rgba(255, 0, 85, 0.3); }
          }
          @keyframes pulseText {
            0%, 100% { transform: scale(1); text-shadow: 0 0 10px rgba(245, 158, 11, 0.5); }
            50% { transform: scale(1.02); text-shadow: 0 0 25px rgba(255, 0, 85, 0.9); color: #fff; }
          }
          .animated-container {
            animation: neonGlow 3s infinite ease-in-out;
            background: radial-gradient(circle at center, #1e1b4b 0%, #0f172a 100%);
          }
          .animated-title {
            animation: pulseText 2s infinite ease-in-out;
          }
        `}</style>

        <div className="animated-container" style={{ border: '3px solid #f59e0b', padding: '45px', borderRadius: '16px', maxWidth: '600px', width: '100%', textTransform: 'uppercase', textAlign: 'center' }}>
          <h1 className="animated-title" style={{ color: '#f59e0b', fontSize: '36px', fontWeight: '900', margin: '0 0 10px 0', letterSpacing: '2px', transition: 'all 0.3s' }}>
            NECMİ'NİN YÜKSELİŞİ
          </h1>
          <h3 style={{ color: '#38bdf8', fontSize: '15px', margin: '0 0 30px 0', fontWeight: 'bold', letterSpacing: '1px' }}>
            v7.5 Klasik Operasyon Hattı
          </h3>
          
          <div style={{ backgroundColor: 'rgba(2, 6, 23, 0.8)', padding: '20px', borderRadius: '8px', border: '1px solid #1e293b', textAlign: 'left', fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6', textTransform: 'none', marginBottom: '35px' }}>
            <p style={{ margin: '0 0 10px 0' }}>📦 <strong>Sıfırdan Zirveye:</strong> Gecekondunun gizli garajından başla, tüm lojistik ağını eline al.</p>
            <p style={{ margin: '0 0 10px 0' }}>📈 <strong>Borsa Takibi:</strong> Gerçek zamanlı dalgalanan borsa fiyat grafiğini incele, yatırımlarını katla.</p>
            <p style={{ margin: 0 }}>🎯 <strong style={{ color: '#f43f5e' }}>Büyük Hedef:</strong> Tam <strong>1.000.000$</strong> nakit paraya ulaşıp Ahmet'in lojistik merkezini haritadan silmek!</p>
          </div>

          <button onClick={() => setShowIntro(false)} style={{ backgroundColor: '#f59e0b', color: '#020617', border: 'none', padding: '18px 32px', borderRadius: '8px', fontSize: '18px', fontWeight: '900', cursor: 'pointer', width: '100%', letterSpacing: '1px', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)' }}>
            İMPARATORLUĞU BAŞLAT Reis →
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // 🏆 OUTRO EKRANI (ZAFER)
  // ==========================================
  if (isGameOver) {
    return (
      <div style={{ backgroundColor: '#020617', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '20px' }}>
        <div style={{ backgroundColor: '#0f172a', border: '4px solid #10b981', padding: '40px', borderRadius: '16px', maxWidth: '600px', width: '100%', textAlign: 'center', boxShadow: '0 0 40px rgba(16, 185, 129, 0.3)' }}>
          <span style={{ fontSize: '64px' }}>👑</span>
          <h1 style={{ color: '#10b981', fontSize: '36px', fontWeight: '900', margin: '16px 0 8px 0', textTransform: 'uppercase' }}>BÜYÜK ZAFER!</h1>
          <h2 style={{ color: '#f59e0b', fontSize: '24px', fontWeight: 'bold', margin: '0 0 24px 0' }}>Kasa: ${money.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
          
          <div style={{ backgroundColor: '#020617', padding: '20px', borderRadius: '8px', border: '1px solid #1e293b', fontSize: '15px', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '30px' }}>
            <p style={{ margin: '0 0 12px 0', fontWeight: 'bold', color: '#38bdf8' }}>AHMET'İN BİNALARI RESMEN BASILDI!</p>
            <p style={{ margin: 0 }}>Necmi sıfırdan başladığı bu yolda 1 Milyon Dolarlık devasa bir bütçeye ulaştı. Ahmet'in tüm lojistik üsleri ele geçirildi, rakipler piyasadan silindi. Global lojistik pazarının tek hakimi artık İmparator Necmi!</p>
          </div>

          <button onClick={() => { setMoney(295); setStock(7.5); setClickLvl(1); setWorkerLvl(0); setTruckLvl(0); setMarketingLvl(1); setStorageLvl(1); }} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '16px 32px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', width: '100%', textTransform: 'uppercase' }}>
            İmparatorluğu Yeniden Kur (Sıfırla) 🔄
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // 🎮 ANA OYUN PANELİ
  // ==========================================
  return (
    <div style={s.body}>
      
      {/* REHBER MODAL */}
      {showTutorial && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2,6,23,0.95)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#0f172a', border: '2px solid #a855f7', padding: '24px', borderRadius: '12px', maxWidth: '400px', width: '100%' }}>
            <h2 style={{ color: '#c084fc', margin: '0 0 12px 0', fontWeight: '900' }}>🎰 YERALTI KUMAR REHBERİ</h2>
            <p style={{ fontSize: '14px', color: '#cbd5e1' }}>Zarlar tamamen şansa dayalı döner reis. Kurallar basittir:</p>
            <div style={{ backgroundColor: '#020617', padding: '12px', borderRadius: '6px', border: '1px solid #1e293b', fontSize: '12px', margin: '12px 0' }}>
              <p style={{ color: '#f43f5e', margin: '4px 0' }}>❌ 1, 2 veya 3 Gelirse: Parayı çete alır, batarsın!</p>
              <p style={{ color: '#10b981', margin: '4px 0' }}>💰 4, 5 veya 6 Gelirse: Parayı 2'ye katlarsın!</p>
            </div>
            <button onClick={() => setShowTutorial(false)} style={{ width: '100%', backgroundColor: '#9333ea', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Riskleri Anladım, Başlat! →</button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={s.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={s.title}>NECMİ'NİN GLOBAL LOJİSTİK ÜSSÜ</h1>
            <p style={s.subtitle}>{money >= 500000 ? '🏢 SİBER GLOBAL KOMPLEKS' : money >= 100000 ? '🏭 ENDÜSTRİYEL ENTEGRE TESİS' : '🏚️ GECEKONDU LOJİSTİK ÜSSÜ'}</p>
          </div>
          <div style={{ backgroundColor: '#0f172a', padding: '6px 12px', borderRadius: '4px', border: '1px solid #1e293b', fontSize: '12px' }}>
            ⏱️ Şans Döngüsü: <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{luckyTimer}sn</span>
          </div>
        </div>

        <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '8px', marginTop: '12px', border: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold' }}>
            <span style={{ color: '#94a3b8' }}>🎯 HEDEF: Ahmet'in Binasını Basmak</span>
            <span style={{ color: '#f43f5e' }}>Kalan: ${moneyToTarget.toLocaleString()}</span>
          </div>
          <div style={s.targetBarOuter}>
            <div style={{ backgroundColor: '#f59e0b', height: '100%', width: `${Math.min(100, (money / targetMoney) * 100)}%` }} />
          </div>
        </div>
      </header>

      {/* GRID SİSTEMİ */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* SOL: KASA VE RİSK ODASI */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={s.card}>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0' }}>💵 Necmi's Cash Flow</p>
            <h2 style={{ fontSize: '32px', color: '#10b981', fontWeight: '900', margin: '4px 0 12px 0' }}>${money.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
            
            <div style={{ backgroundColor: '#020617', padding: '10px', borderRadius: '6px', border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
              <span>Stok Durumu:</span>
              <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{stock.toFixed(1)} / {maxStock}</span>
            </div>
            <div style={{ backgroundColor: '#020617', padding: '10px', borderRadius: '6px', border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span>🚚 Sevkiyat Süresi:</span>
              <span style={{ color: '#818cf8', fontWeight: 'bold' }}>{deliveryTimer}sn</span>
            </div>

            <button onClick={handleManualProduction} style={s.btnManual}>📦 Manuel Üretim Yap</button>
          </div>

          <div style={{ backgroundColor: '#1e1b4b', padding: '12px', borderRadius: '12px', border: '2px solid #6366f1' }}>
            <h3 style={{ fontSize: '12px', color: '#818cf8', fontWeight: '900', margin: '0 0 8px 0' }}>🎰 YERALTI RİSK ODASI</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="number" value={gambleAmount} onChange={(e) => setGambleAmount(e.target.value)} style={{ backgroundColor: '#020617', border: '1px solid #1e293b', padding: '8px', color: '#fff', borderRadius: '4px', fontSize: '12px', width: '50%' }} />
              <button onClick={handleRollDice} style={{ width: '50%', backgroundColor: '#4f46e5', color: '#fff', border: 'none', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>ZAR AT</button>
            </div>
            {diceResult !== null && (
              <div style={{ backgroundColor: '#020617', padding: '6px', borderRadius: '4px', marginTop: '8px', fontSize: '11px', color: isGambleSuccess ? '#10b981' : '#f43f5e', textAlign: 'center' }}>
                🎲 {gambleMessage}
              </div>
            )}
          </div>
        </div>

        {/* ORTA: UPGRADES */}
        <div style={s.card}>
          <h3 style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '900', margin: '0 0 12px 0' }}>YATIRIM VE GELİŞTİRME FIRSATLARI</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { id: 'click', title: 'Üretim Gücü', desc: `Tık Başına Üretim (LVL ${clickLvl})`, cost: costs.click },
              { id: 'worker', title: 'Otomasyon Hattı', desc: `Otomatik İşçi (LVL ${workerLvl})`, cost: costs.worker },
              { id: 'truck', title: 'Lojistik Operasyonu', desc: `🚚 Yük Kamyonu (LVL ${truckLvl})`, cost: costs.truck },
              { id: 'marketing', title: 'Pazarlama Stratejisi', desc: `Reklam Kampanyası (LVL ${marketingLvl})`, cost: costs.marketing },
              { id: 'storage', title: 'Depolama Altyapısı', desc: `Maksimum Hacim (LVL ${storageLvl})`, cost: costs.storage }
            ].map((up) => (
              <div key={up.id} style={{ backgroundColor: '#020617', padding: '10px', borderRadius: '6px', border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{up.title}</div>
                  <div style={{ fontSize: '10px', color: '#475569' }}>{up.desc}</div>
                </div>
                <button onClick={() => buyUpgrade(up.id as any)} disabled={money < up.cost} style={{ ...s.btnUpgrade, opacity: money < up.cost ? 0.4 : 1 }}>
                  ${up.cost}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SAĞ: ÖZEL ÇİZGİ BORSA GRAFİĞİ */}
        <div style={s.card}>
          <h3 style={{ fontSize: '12px', color: '#10b981', fontWeight: '900', margin: '0 0 8px 0' }}>📈 CANLI ÇİZGİ BORSA GRAFİĞİ</h3>
          <div style={{ height: '120px', backgroundColor: '#020617', borderRadius: '6px', border: '1px solid #1e293b', padding: '8px', position: 'relative' }}>
            <span style={{ position: 'absolute', top: '4px', left: '6px', fontSize: '8px', color: '#334155' }}>MAX: $30</span>
            <span style={{ position: 'absolute', bottom: '4px', left: '6px', fontSize: '8px', color: '#334155' }}>MIN: $5</span>
            
            <svg style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <polyline
                fill="none"
                stroke={priceTrend === 'up' ? '#10b981' : '#f43f5e'}
                strokeWidth="3"
                points={generateSvgPath()}
                style={{ transition: 'all 0.5s ease' }}
              />
            </svg>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '12px', borderTop: '1px solid #1e293b', paddingTop: '8px' }}>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>GÜNCEL HİSSE DEĞERİ</span>
            <span style={{ fontSize: '24px', fontWeight: '900', color: priceTrend === 'up' ? '#10b981' : '#f43f5e' }}>
              ${stockPrice} {priceTrend === 'up' ? '▲ KAZANÇ' : '▼ DÜŞÜŞ'}
            </span>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer style={s.footer}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>KAYIT:</span>
          {slots.map(slot => (
            <button key={slot.id} onClick={() => saveGame(slot.id)} style={{ backgroundColor: activeSlot === slot.id ? '#4f46e5' : '#0f172a', color: '#fff', border: '1px solid #1e293b', fontSize: '10px', padding: '4px 8px', cursor: 'pointer', borderRadius: '4px' }}>
              💾 {slot.label}
            </button>
          ))}
        </div>
        <div>NECMİ'NİN YÜKSELİŞİ v7.5 | Kriz: {crisisTimer}s</div>
      </footer>

    </div>
  );
}

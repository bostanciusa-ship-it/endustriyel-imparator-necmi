import React, { useState, useEffect } from 'react';

interface SaveSlot {
  id: number;
  label: string;
  savedAt: string | null;
}

interface Review {
  username: string;
  rating: number;
  comment: string;
  date: string;
}

export default function App() {
  // --- TEMEL EKONOMİ STATE'LERİ ---
  const [money, setMoney] = useState<number>(295);
  const [stock, setStock] = useState<number>(7.5);
  const [maxStock, setMaxStock] = useState<number>(40);
  const [stockPrice, setStockPrice] = useState<number>(18.08);
  const [priceTrend, setPriceTrend] = useState<'up' | 'down'>('up');
  
  // --- CANLI BORSA GRAFİĞİ GEÇMİŞİ ---
  const [priceHistory, setPriceHistory] = useState<number[]>([15, 16, 14, 17, 18.08]);

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

  // --- KUMAR ODASI & ÖĞRETİCİ STATE'LERİ ---
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [gambleAmount, setGambleAmount] = useState<string>('50');
  const [gambleMessage, setGambleMessage] = useState<string>('');
  const [isGambleSuccess, setIsGambleSuccess] = useState<boolean | null>(null);
  
  const [showTutorial, setShowTutorial] = useState<boolean>(true);
  const [tutorialStep, setTutorialStep] = useState<number>(1);
  const [acceptRisks, setAcceptRisks] = useState<boolean>(false);

  // --- PUANLAMA & YORUM STATE'LERİ ---
  const [reviewName, setReviewName] = useState<string>('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviews, setReviews] = useState<Review[]>([
    { username: 'SigmaNecmi', rating: 5, comment: 'Ahmet titriyor, lojistik üssü harika olmuş!', date: '16:40' },
    { username: 'KralYolcu', rating: 5, comment: 'Tırları uçuruyorum reis eline sağlık.', date: '17:12' }
  ]);

  // --- KAYIT SLOTLARI ---
  const [slots, setSlots] = useState<SaveSlot[]>([
    { id: 1, label: 'SLOT 1', savedAt: 'Aktif Otomatik' },
    { id: 2, label: 'SLOT 2', savedAt: null },
    { id: 3, label: 'SLOT 3', savedAt: null },
  ]);

  // --- HEDEF TANIMI ---
  const targetMoney = 1000000;
  const isGameOver = money >= targetMoney;
  const moneyToTarget = Math.max(0, targetMoney - money);

  // --- GELİŞTİRME MALİYETLERİ ---
  const costs = {
    click: 200 * clickLvl,
    worker: 500 * (workerLvl + 1),
    truck: 550 * (truckLvl + 1),
    marketing: 600 * marketingLvl,
    storage: 650 * storageLvl,
  };

  // --- OYUN DÖNGÜLERİ ---
  useEffect(() => {
    if (isGameOver) return;

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
            setPriceHistory(hist => [...hist.slice(-4), newPrice]);
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
            setPriceHistory(hist => [...hist.slice(-4), newPrice]);
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
        if (prev <= 1) {
          setGoldTruckActive(false);
          setGoldTruckMultiplier(1);
          return 0;
        }
        return prev - 1;
      });

    }, 1000);

    return () => clearInterval(interval);
  }, [workerLvl, maxStock, stockPrice, marketingLvl, truckLvl, goldTruckMultiplier, goldTruckActive, isGameOver]);

  const handleManualProduction = () => {
    setStock(prev => Math.min(maxStock, prev + clickLvl));
  };

  const buyUpgrade = (type: 'click' | 'worker' | 'truck' | 'marketing' | 'storage') => {
    const cost = costs[type];
    if (money >= cost) {
      setMoney(prev => prev - cost);
      if (type === 'click') setClickLvl(p => p + 1);
      if (type === 'worker') setWorkerLvl(p => p + 1);
      if (type === 'truck') setTruckLvl(p => p + 1);
      if (type === 'marketing') setMarketingLvl(p => p + 1);
      if (type === 'storage') {
        setStorageLvl(p => p + 1);
        setMaxStock(p => p + 20);
      }
    }
  };

  const handleRollDice = () => {
    const amount = Number(gambleAmount);
    if (isNaN(amount) || amount <= 0) {
      setGambleMessage('Geçerli bir miktar gir reis!');
      return;
    }
    if (money < amount) {
      setGambleMessage('Kasanda bu kadar nakit yok!');
      return;
    }

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

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewName.length < 3 || reviewName.length > 16) {
      alert('İsim en az 3, en fazla 16 harf olmalıdır reis!');
      return;
    }

    const newReview: Review = {
      username: reviewName,
      rating: reviewRating,
      comment: reviewComment || 'Puanım tam reis!',
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setReviews([newReview, ...reviews]);
    setReviewName('');
    setReviewComment('');
    alert('Yorumun başarıyla listeye eklendi!');
  };

  const saveGame = (slotId: number) => {
    setActiveSlot(slotId);
    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, savedAt: new Date().toLocaleTimeString() } : s));
    alert(`Oyun başarıyla SLOT ${slotId} üzerine kaydedildi!`);
  };

  const getCompanyStatus = () => {
    if (money >= 500000) return '🏢 SİBER GLOBAL KOMPLEKS';
    if (money >= 100000) return '🏭 ENDÜSTRİYEL ENTEGRE TESİS';
    if (money >= 10000) return '🏪 BÖLGESEL DAĞITIM MERKEZİ';
    return '🏚️ GECEKONDU LOJİSTİK ÜSSÜ';
  };

  // --- İNLINE STİLLER (TAILWIND BAĞIMSIZ GARANTİ TASARIM) ---
  const s = {
    body: { backgroundColor: '#020617', color: '#f8fafc', fontFamily: 'sans-serif', padding: '16px', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between' } as React.CSSProperties,
    header: { borderBottom: '1px solid #1e293b', paddingBottom: '16px', marginBottom: '16px' },
    title: { color: '#f59e0b', fontSize: '24px', fontWeight: '900', margin: 0 },
    subtitle: { color: '#818cf8', fontSize: '14px', fontWeight: 'bold', margin: '4px 0 0 0' },
    targetBarOuter: { width: '100%', backgroundColor: '#020617', height: '12px', borderRadius: '999px', border: '1px solid #1e293b', overflow: 'hidden', marginTop: '6px' },
    grid: { display: 'grid', gridTemplateColumns: 'window.innerWidth > 768 ? "1fr 1fr 1fr" : "1fr"', gap: '16px', marginBottom: '16px' },
    card: { backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b' },
    btnManual: { width: '100%', backgroundColor: '#f59e0b', color: '#020617', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: '900', cursor: 'pointer', fontSize: '14px', marginTop: '12px', textTransform: 'uppercase' } as React.CSSProperties,
    btnUpgrade: { backgroundColor: '#1e293b', color: '#f59e0b', border: '1px solid #334155', padding: '8px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
    input: { backgroundColor: '#020617', border: '1px solid #1e293b', padding: '8px', color: '#fff', borderRadius: '4px', fontSize: '12px' },
    reviewSection: { backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px', border: '1px solid #6366f1', marginTop: '16px' },
    reviewCard: { backgroundColor: '#020617', padding: '10px', borderRadius: '6px', border: '1px solid #1e293b', marginBottom: '8px' },
    footer: { borderTop: '1px solid #1e293b', paddingTop: '16px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#475569' }
  };

  return (
    <div style={s.body}>
      
      {/* REHBER MODAL */}
      {showTutorial && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2,6,23,0.95)', zIndex: 999, display: 'flex', alignItems: 'center', justifyOrigin: 'center', justifyContent: 'center', padding: '16px' }}>
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

      {/* ALTIN TIR BANNER */}
      {goldTruckActive && (
        <div style={{ backgroundColor: '#f59e0b', color: '#020617', textAlign: 'center', padding: '8px', fontWeight: '900', borderRadius: '6px', marginBottom: '12px', fontSize: '12px' }}>
          🚚 ALTIN TIR AKTİF! KAZANÇ 5'E KATLIYOR! ({goldTruckTimer}sn)
        </div>
      )}

      {/* HEADER */}
      <header style={s.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={s.title}>NECMİ'NİN GLOBAL LOJİSTİK ÜSSÜ</h1>
            <p style={s.subtitle}>{getCompanyStatus()}</p>
          </div>
          <div style={{ backgroundColor: '#0f172a', padding: '6px 12px', borderRadius: '4px', border: '1px solid #1e293b', fontSize: '12px' }}>
            ⏱️ Şans Döngüsü: <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{luckyTimer}sn</span>
          </div>
        </div>

        <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '8px', marginTop: '12px', border: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold' }}>
            <span style={{ color: '#94a3b8' }}>🎯 HEDEF: Ahmet'in Binasını Basmak</span>
            <span style={{ color: '#f43f5e' }}>Kalan: ${moneyToTarget.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div style={s.targetBarOuter}>
            <div style={{ backgroundColor: '#f59e0b', height: '100%', width: `${Math.min(100, (money / targetMoney) * 100)}%`, transition: 'width 0.5s' }} />
          </div>
        </div>
      </header>

      {/* OYUN ALANI (3 SÜTUN) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* SOL PANEL: KASA VE KUMAR */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={s.card}>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 4px 0', fontWeight: 'bold' }}>💵 Necmi'nin Kasası</p>
            <h2 style={{ fontSize: '32px', color: '#10b981', fontWeight: '900', margin: '0 0 12px 0' }}>${money.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <div style={{ backgroundColor: '#020617', padding: '10px', borderRadius: '6px', flex: 1, border: '1px solid #1e293b' }}>
                <span style={{ fontSize: '10px', color: '#64748b', block: 'true' }}>Borsa Değeri</span>
                <span style={{ fontWeight: '900', color: priceTrend === 'up' ? '#10b981' : '#f43f5e' }}>${stockPrice} {priceTrend === 'up' ? '▲' : '▼'}</span>
              </div>
              <div style={{ backgroundColor: '#020617', padding: '10px', borderRadius: '6px', flex: 1, border: '1px solid #1e293b' }}>
                <span style={{ fontSize: '10px', color: '#64748b', block: 'true' }}>Stok Durumu</span>
                <span style={{ fontWeight: '900', color: '#38bdf8' }}>{stock.toFixed(1)} / {maxStock}</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#020617', padding: '10px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', border: '1px solid #1e293b' }}>
              <span>🚚 Otomatik Sevkiyat:</span>
              <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{deliveryTimer}sn</span>
            </div>

            <button onClick={handleManualProduction} style={s.btnManual}>📦 Manuel Üretim Yap</button>
          </div>

          {/* KUMAR ODASI */}
          <div style={{ backgroundColor: '#1e1b4b', padding: '12px', borderRadius: '12px', border: '2px solid #6366f1' }}>
            <h3 style={{ fontSize: '12px', color: '#818cf8', fontWeight: '900', margin: '0 0 8px 0' }}>🎰 YERALTI RİSK ODASI</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="number" value={gambleAmount} onChange={(e) => setGambleAmount(e.target.value)} style={{ ...s.input, width: '50%' }} />
              <button onClick={handleRollDice} style={{ width: '50%', backgroundColor: '#4f46e5', color: '#fff', border: 'none', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>ZAR AT</button>
            </div>
            {diceResult !== null && (
              <div style={{ backgroundColor: '#020617', padding: '6px', borderRadius: '4px', marginTop: '8px', fontSize: '11px', border: '1px solid #312e81', color: isGambleSuccess ? '#10b981' : '#f43f5e', textAlign: 'center' }}>
                🎲 Zar: {diceResult} | {gambleMessage.split('!')[1] || gambleMessage}
              </div>
            )}
          </div>
        </div>

        {/* ORTA PANEL: GELİŞTİRMELER */}
        <div style={{ flex: '1 1 350px', ...s.card }}>
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

        {/* SAĞ PANEL: BORSA GRAFİĞİ */}
        <div style={{ flex: '1 1 300px', ...s.card, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '12px', color: '#10b981', fontWeight: '900', margin: '0 0 8px 0' }}>📈 CANLI BORSA GRAFİĞİ</h3>
            <div style={{ height: '140px', backgroundColor: '#020617', borderRadius: '6px', border: '1px solid #1e293b', padding: '8px', display: 'flex', alignItems: 'end', gap: '4px', position: 'relative' }}>
              <span style={{ position: 'absolute', top: '4px', left: '6px', fontSize: '8px', color: '#334155' }}>MAX: $30</span>
              <span style={{ position: 'absolute', bottom: '4px', left: '6px', fontSize: '8px', color: '#334155' }}>MIN: $5</span>
              {priceHistory.map((price, idx) => {
                const hPct = Math.min(100, Math.max(15, ((price - 5) / 25) * 100));
                return (
                  <div key={idx} style={{ flex: 1, backgroundColor: priceTrend === 'up' ? '#065f46' : '#991b1b', height: `${hPct}%`, borderRadius: '4px 4px 0 0', borderTop: priceTrend === 'up' ? '2px solid #10b981' : '2px solid #f43f5e' }} />
                );
              })}
            </div>
          </div>
          <div style={{ backgroundColor: '#020617', padding: '8px', borderRadius: '6px', border: '1px solid #1e293b', fontSize: '11px', color: '#64748b', textAlign: 'center', marginTop: '12px' }}>
            💡 Fiyatlar tavan yaptığında elindeki stoklar tırlarla otomatik satılır, kasayı doldurursun!
          </div>
        </div>

      </div>

      {/* --- KESİN GÖRÜNÜR YORUM VE PUANLAMA ALANI --- */}
      <section style={s.reviewSection}>
        <h3 style={{ fontSize: '14px', color: '#818cf8', fontWeight: '900', margin: '0 0 12px 0' }}>⭐ OYUNCU PUANLAMA & YORUM ALANI</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* FORMA ALANI */}
          <form onSubmit={handleAddReview} style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" maxLength={16} value={reviewName} onChange={(e) => setReviewName(e.target.value)} placeholder="İsmin (3-16 Harf)" style={{ ...s.input, flex: 2 }} required />
              <select value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))} style={{ ...s.input, flex: 1, color: '#f59e0b', fontWeight: 'bold' }}>
                <option value="5">5 Yıldız</option>
                <option value="4">4 Yıldız</option>
                <option value="3">3 Yıldız</option>
                <option value="2">2 Yıldız</option>
                <option value="1">1 Yıldız</option>
              </select>
            </div>
            <textarea maxLength={500} value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Yorumunu patlat reis..." style={{ ...s.input, height: '60px', resize: 'none' }} required />
            <button type="submit" style={{ backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>YORUMU LİSTEYE EKLE</button>
          </form>

          {/* LİSTE ALANI */}
          <div style={{ flex: '1 1 400px', backgroundColor: '#020617', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b', maxHeight: '140px', overflowY: 'auto' }}>
            {reviews.map((rev, i) => (
              <div key={i} style={s.reviewCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold', color: '#818cf8' }}>
                  <span>👤 {rev.username}</span>
                  <span style={{ color: '#f59e0b' }}>{rev.rating} ★ <span style={{ color: '#475569', fontSize: '9px' }}>({rev.date})</span></span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '11px', margin: '4px 0 0 0', backgroundColor: '#0f172a', padding: '6px', borderRadius: '4px' }}>{rev.comment}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FOOTER & KAYIT */}
      <footer style={s.footer}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', fontWeight: 'bold' }}>📍 KAYIT AL:</span>
          {slots.map(slot => (
            <button key={slot.id} onClick={() => saveGame(slot.id)} style={{ backgroundColor: activeSlot === slot.id ? '#4f46e5' : '#0f172a', color: activeSlot === slot.id ? '#fff' : '#94a3b8', border: '1px solid #1e293b', fontSize: '10px', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
              💾 {slot.label} {slot.savedAt && `(${slot.savedAt.split(' ')[0]})`}
            </button>
          ))}
        </div>
        <div>NECMİ'NİN YÜKSELİŞİ v7.3.3 | Kriz: {crisisTimer}s</div>
      </footer>

    </div>
  );
}

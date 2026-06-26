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
    { username: 'SigmaNecmi', rating: 5, comment: 'Ahmet titriyor, lojistik üssü harika olmuş!', date: '16:40' }
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
    if (reviewComment.length > 500) {
      alert('Yorum maksimum 500 karakter olabilir!');
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
    alert('Değerlendirmen panelle birleşti!');
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

  if (isGameOver) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.15)_0%,transparent_70%)] animate-pulse" />
        
        <div className="max-w-2xl w-full bg-slate-900 border-2 border-amber-500 rounded-2xl p-8 shadow-2xl shadow-amber-500/20 text-center relative z-10 space-y-6">
          <div className="text-6xl animate-bounce">🏆</div>
          <h1 className="text-3xl md:text-4xl font-black text-amber-500 tracking-widest uppercase">
            İNTİKAM ALINDI: BAFRA BASILDI!
          </h1>
          
          <p className="text-slate-300 text-sm md:text-base leading-relaxed text-justify bg-slate-950 p-4 rounded-xl border border-slate-800">
            Necmi $1.000.000 bütçeye ulaştığı an küllerinden doğan lojistik tır ordusunu topladı. Ahmet'in 
            görkemli siber binasının önüne yüzlerce tır dizildi! Ahmet pencerelerden bakıp neye uğradığını 
            şaşırırken, Necmi elindeki kahvesiyle "Biz bitti demeden bitmez aslanım" diyerek raconunu kesti. 
            Gecekondudan başlayan bu endüstriyel imparatorluk artık tüm küresel piyasayı domine ediyor!
          </p>

          <div className="border-t border-slate-800 pt-6">
            <h3 className="text-lg font-bold text-indigo-400 mb-2">⭐ Oyunu Puanla & Adını Yazdır</h3>
            <form onSubmit={handleAddReview} className="space-y-3 text-left max-w-md mx-auto">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">İsim (3-16 Harf)</label>
                <input 
                  type="text"
                  maxLength={16}
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  placeholder="Kralİsim"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Puan</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setReviewRating(num)}
                      className={`text-xl transition ${reviewRating >= num ? 'text-amber-400' : 'text-slate-600'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Yorum (Maks 500 Karakter)</label>
                <textarea 
                  maxLength={500}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 h-16 resize-none"
                  placeholder="Oyun hakkındaki efsane yorumun..."
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded text-xs uppercase tracking-wider transition"
              >
                Puanı Gönder
              </button>
            </form>
          </div>

          <div className="max-h-40 overflow-y-auto space-y-2 text-left pt-4 border-t border-slate-800">
            {reviews.map((rev, i) => (
              <div key={i} className="bg-slate-950 p-2.5 rounded border border-slate-800 text-xs">
                <div className="flex justify-between font-bold text-indigo-400 font-mono text-[11px]">
                  <span>{rev.username}</span>
                  <span className="text-amber-400">{rev.rating} ★</span>
                </div>
                <p className="text-slate-400 mt-1 text-[11px] leading-tight">{rev.comment}</p>
              </div>
            ))}
          </div>

          <button onClick={() => window.location.reload()} className="text-xs text-slate-500 hover:text-slate-300 transition underline pt-4 block mx-auto">
            İmparatorluğu Yeniden Kur
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      
      {showTutorial && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-purple-500 rounded-xl p-6 max-w-md w-full shadow-2xl shadow-purple-500/20">
            <h2 className="text-xl font-black uppercase tracking-wider text-purple-400 mb-4">🎰 Yeraltı Kumar Rehberi</h2>
            {tutorialStep === 1 ? (
              <div>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">Zarlar tamamen şansa dayalı döner reis. Kurallar basittir:</p>
                <ul className="space-y-2 text-xs text-slate-400 mb-6 bg-slate-950 p-3 rounded border border-slate-800">
                  <li className="text-rose-400">❌ <strong>1, 2 veya 3 Gelirse:</strong> Parayı çete alır, batarsın!</li>
                  <li className="text-emerald-400">💰 <strong>4, 5 veya 6 Gelirse:</strong> Parayı 2'ye katlarsın!</li>
                </ul>
                <button onClick={() => setTutorialStep(2)} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg transition-all">Riskleri Anladım →</button>
              </div>
            ) : (
              <div>
                <p className="text-slate-300 text-sm mb-4">Kumar odasındaki tüm sorumluluk Necmi'ye aittir.</p>
                <label className="flex items-start gap-3 bg-slate-950 p-3 rounded border border-slate-800 mb-6 cursor-pointer select-none">
                  <input type="checkbox" checked={acceptRisks} onChange={(e) => setAcceptRisks(e.target.checked)} className="mt-1 accent-purple-500 h-4 w-4" />
                  <span className="text-xs text-slate-400">Kaybetmeyi de katlamayı da kabul ediyorum.</span>
                </label>
                <div className="flex gap-2">
                  <button onClick={() => { setShowTutorial(false); setAcceptRisks(true); }} className="flex-1 bg-slate-800 text-slate-400 font-bold py-2 rounded text-xs">Geç</button>
                  <button disabled={!acceptRisks} onClick={() => setShowTutorial(false)} className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 text-white font-bold py-2 rounded text-xs">Kumarı Aktif Et</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {goldTruckActive && (
        <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 text-center py-2 px-4 rounded-md font-black text-xs tracking-widest animate-pulse shadow-lg mb-4">
          🚚 ALTIN TIR AKTİF! KAZANÇ 5'E KATLIYOR! ({goldTruckTimer}sn)
        </div>
      )}

      <header className="border-b border-slate-800 pb-4 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-black text-amber-500 tracking-wider">NECMİ'NİN GLOBAL LOJİSTİK ÜSSÜ</h1>
            <p className="text-xs font-bold text-indigo-400 mt-0.5">{getCompanyStatus()}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] bg-slate-900 px-2 py-1 rounded text-slate-400 border border-slate-800">⏱️ Şans: {luckyTimer}sn</span>
          </div>
        </div>

        <div className="mt-4 bg-slate-900 p-3 rounded-lg border border-slate-800">
          <div className="flex justify-between items-center mb-1.5 text-xs font-bold">
            <span className="text-slate-400">🎯 TARGET: Ahmet'in Binasını Basmak</span>
            <span className="text-rose-400 font-mono">Kalan: ${moneyToTarget.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div className="bg-gradient-to-r from-rose-600 to-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (money / targetMoney) * 100)}%` }} />
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
        
        <section className="flex flex-col gap-4">
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col justify-between flex-1">
            <div>
              <div className="mb-4">
                <p className="text-xs font-bold text-slate-400 mb-1">💵 Necmi'nin Kasası</p>
                <h2 className="text-3xl font-black text-emerald-400 font-mono">${money.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] block font-bold text-slate-500">Borsa Değeri</span>
                  <span className={`text-base font-black font-mono mt-0.5 block ${priceTrend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    ${stockPrice} {priceTrend === 'up' ? '▲' : '▼'}
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] block font-bold text-slate-500">Stok Durumu</span>
                  <span className="text-base font-black text-blue-400 font-mono block mt-0.5">{stock.toFixed(1)} / {maxStock}</span>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded border border-slate-800 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400">🚚 Sevkiyat Süresi:</span>
                <span className="font-mono text-blue-400 text-sm bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{deliveryTimer}sn</span>
              </div>
            </div>

            <button onClick={handleManualProduction} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-4 rounded-xl shadow-lg transition-all uppercase tracking-wider text-sm mt-4">
              📦 Manuel Üretim Yap
            </button>
          </div>

          <div className="bg-purple-950/20 p-3 rounded-xl border-2 border-purple-500/30 flex flex-col justify-between">
            <div>
              <h3 className="text-[11px] font-black text-purple-400 tracking-wider uppercase mb-1">🎰 Yeraltı Risk Odası</h3>
              <div className="flex gap-2 items-center mb-2">
                <input type="number" value={gambleAmount} onChange={(e) => setGambleAmount(e.target.value)} placeholder="Miktar" className="w-1/2 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-purple-300 focus:outline-none" />
                <button onClick={handleRollDice} className="w-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black py-1 rounded text-[10px] uppercase">Zar At</button>
              </div>
              {diceResult !== null && (
                <div className={`p-1.5 rounded border text-center text-[10px] ${isGambleSuccess ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                  🎲 {diceResult} | {gambleMessage.split('!')[1] || gambleMessage}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <h3 className="text-xs font-black text-slate-400 tracking-wider uppercase mb-3">Yatırım Ve Geliştirme Fırsatları</h3>
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {[
              { id: 'click', title: 'Üretim Gücü', desc: `Tık Başına Üretim (LVL ${clickLvl})`, cost: costs.click },
              { id: 'worker', title: 'Otomasyon Hattı', desc: `Otomatik İşçi (LVL ${workerLvl})`, cost: costs.worker },
              { id: 'truck', title: 'Lojistik Operasyonu', desc: `🚚 Yük Kamyonu (LVL ${truckLvl})`, cost: costs.truck },
              { id: 'marketing', title: 'Pazarlama Stratejisi', desc: `Reklam Kampanyası (LVL ${marketingLvl})`, cost: costs.marketing },
              { id: 'storage', title: 'Depolama Altyapısı', desc: `Maksimum Hacim (LVL ${storageLvl})`, cost: costs.storage }
            ].map((up) => (
              <div key={up.id} className="bg-slate-950 p-3 rounded border border-slate-800 flex justify-between items-center">
                <div>
                  <p className="text-xs font-black uppercase text-slate-200">{up.title}</p>
                  <p className="text-[10px] text-slate-500">{up.desc}</p>
                </div>
                <button onClick={() => buyUpgrade(up.id as any)} disabled={money < up.cost} className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 text-amber-400 text-xs font-bold py-2 px-3 rounded border border-slate-700 transition">
                  ${up.cost}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-xs font-black text-emerald-400 tracking-wider uppercase mb-2">📈 Canlı Borsa Grafiği</h3>
            
            <div className="h-28 bg-slate-950 rounded-lg border border-slate-800 p-2 flex items-end justify-between gap-1 relative overflow-hidden mb-3">
              <div className="absolute top-1 left-2 text-[8px] text-slate-600 font-mono">MAX: $30</div>
              <div className="absolute bottom-1 left-2 text-[8px] text-slate-600 font-mono">MIN: $5</div>
              
              {priceHistory.map((price, idx) => {
                const heightPercent = Math.min(100, Math.max(10, ((price - 5) / 25) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end">
                    <div style={{ height: `${heightPercent}%` }} className={`w-full rounded-t transition-all duration-500 ${priceTrend === 'up' ? 'bg-gradient-to-t from-emerald-950 to-emerald-500' : 'bg-gradient-to-t from-rose-950 to-rose-500'}`} />
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-800 pt-2">
              <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-wider mb-2">⭐ Oyuncu Yorumları</h4>
              <form onSubmit={handleAddReview} className="space-y-2 mb-2">
                <div className="flex gap-1.5">
                  <input type="text" maxLength={16} value={reviewName} onChange={(e) => setReviewName(e.target.value)} placeholder="İsim (3-16)" className="w-2/3 bg-slate-950 border border-slate-800 rounded p-1 text-[10px] text-slate-200 focus:outline-none" required />
                  <select value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))} className="w-1/3 bg-slate-950 border border-slate-800 rounded p-1 text-[10px] text-amber-400">
                    <option value="5">5 ★</option>
                    <option value="4">4 ★</option>
                    <option value="3">3 ★</option>
                    <option value="2">2 ★</option>
                    <option value="1">1 ★</option>
                  </select>
                </div>
                <input type="text" maxLength={500} value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Yorum yaz reis (Maks 500 harf)..." className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-[10px] text-slate-200 focus:outline-none" />
                <button type="submit" className="w-full bg-indigo-600 text-white font-black py-1 rounded text-[9px] uppercase">Yorumu Gönder</button>
              </form>

              <div className="max-h-20 overflow-y-auto space-y-1">
                {reviews.map((rev, i) => (
                  <div key={i} className="bg-slate-950 p-1.5 rounded border border-slate-800 text-[9px] leading-tight">
                    <span className="font-bold text-amber-400">{rev.username} ({rev.rating}★):</span> <span className="text-slate-400">{rev.comment}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

      </main>

      <footer className="border-t border-slate-800 pt-4 mt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase">📍 Aktif Kanal:</span>
          <div className="flex gap-1">
            {slots.map(slot => (
              <button key={slot.id} onClick={() => saveGame(slot.id)} className={`text-[10px] font-bold px-2.5 py-1 rounded border transition ${activeSlot === slot.id ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
                💾 {slot.label} {slot.savedAt && `(${slot.savedAt.split(' ')[0]})`}
              </button>
            ))}
          </div>
        </div>
        <div className="text-[10px] font-bold font-mono text-slate-600 flex items-center gap-2">
          <span>NECMİ'NİN YÜKSELİŞİ v7.3.1</span>
          <span>|</span>
          <span>Kriz Döngüsü: {crisisTimer}s</span>
        </div>
      </footer>

    </div>
  );
}

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
    { username: 'KralYolcu', rating: 5, comment: 'Borsa grafiğini izlerken tırları uçuruyorum reis eline sağlık.', date: '17:12' }
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
    alert('Yorumun ve puanın listeye eklendi!');
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

          <div className="border-t border-slate-800 pt-6 text-left max-w-md mx-auto">
            <h3 className="text-lg font-bold text-center text-indigo-400 mb-2">⭐ Oyunu Puanla & Adını Yazdır</h3>
            <form onSubmit={handleAddReview} className="space-y-3">
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
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 h-

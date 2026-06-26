import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Package, Truck, Target, 
  Wallet, ChevronUp, RefreshCw, AlertTriangle, Play, CheckCircle, HelpCircle, Save
} from 'lucide-react';

interface SaveSlot {
  id: number;
  label: string;
  savedAt: string | null;
}

export default function App() {
  // --- TEMEL EKONOMİ STATE'LERİ ---
  const [money, setMoney] = useState<number>(295);
  const [stock, setStock] = useState<number>(7.5);
  const [maxStock, setMaxStock] = useState<number>(40);
  const [stockPrice, setStockPrice] = useState<number>(18.08);
  const [priceTrend, setPriceTrend] = useState<'up' | 'down'>('up');
  
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

  // --- KAYIT SLOTLARI ---
  const [slots, setSlots] = useState<SaveSlot[]>([
    { id: 1, label: 'SLOT 1', savedAt: 'Aktif Otomatik' },
    { id: 2, label: 'SLOT 2', savedAt: null },
    { id: 3, label: 'SLOT 3', savedAt: null },
  ]);

  // --- HEDEF TANIMI ---
  const targetMoney = 1000000;
  const moneyToTarget = Math.max(0, targetMoney - money);

  // --- GELİŞTİRME MALİYETLERİ ---
  const costs = {
    click: 200 * clickLvl,
    worker: 500 * (workerLvl + 1),
    truck: 550 * (truckLvl + 1),
    marketing: 600 * marketingLvl,
    storage: 650 * storageLvl,
  };

  // --- OYUN DÖNGÜLERİ (EFFECTS) ---
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Otomatik İşçi Üretimi
      if (workerLvl > 0) {
        setStock(prev => Math.min(maxStock, prev + (workerLvl * 0.2)));
      }

      // 2. Kamyon Sevkiyat Sayacı
      setDeliveryTimer(prev => {
        if (prev <= 1) {
          // Satış Gerçekleşiyor
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

      // 3. Kriz Döngüsü Sayacı
      setCrisisTimer(prev => {
        if (prev <= 1) {
          setStockPrice(p => {
            const drop = Math.random() * 5 + 2;
            setPriceTrend('down');
            return Math.max(5, Number((p - drop).toFixed(2)));
          });
          return 120;
        }
        return prev - 1;
      });

      // 4. Şans Sayacı & Borsa Dalgalanması
      setLuckyTimer(prev => {
        if (prev <= 1) {
          setStockPrice(p => {
            const change = (Math.random() * 4 - 1.5);
            setPriceTrend(change >= 0 ? 'up' : 'down');
            return Math.max(5, Number((p + change).toFixed(2)));
          });

          // %25 İhtimalle Altın Tır Çıkma Şansı
          if (!goldTruckActive && Math.random() < 0.25) {
            setGoldTruckActive(true);
            setGoldTruckMultiplier(5);
            setGoldTruckTimer(15); // 15 saniye x5 çılgınlığı
          }

          return 60;
        }
        return prev - 1;
      });

      // 5. Altın Tır Geri Sayımı
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
  }, [workerLvl, maxStock, stockPrice, marketingLvl, truckLvl, goldTruckMultiplier, goldTruckActive]);

  // --- AKSİYONLAR ---
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

  // --- KUMAR ZAR ATMA MEKANİĞİ ---
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
      // BATTIK
      setMoney(prev => Math.max(0, prev - amount));
      setIsGambleSuccess(false);
      setGambleMessage(`Zar ${roll} geldi! Yeraltı çetesi parana çöktü, -$${amount.toLocaleString()}!`);
    } else {
      // KATLADIK
      setMoney(prev => prev + amount);
      setIsGambleSuccess(true);
      setGambleMessage(`Zar ${roll} geldi! Masayı patlattın, +$${amount.toLocaleString()} kazandın!`);
    }
  };

  const saveGame = (slotId: number) => {
    setActiveSlot(slotId);
    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, savedAt: new Date().toLocaleTimeString() } : s));
    alert(`Oyun başarıyla SLOT ${slotId} üzerine kaydedildi!`);
  };

  // --- DİNAMİK ŞİRKET UNVANI ---
  const getCompanyStatus = () => {
    if (money >= 500000) return '🏢 SİBER GLOBAL KOMPLEKS';
    if (money >= 100000) return '🏭 ENDÜSTRİYEL ENTEGRE TESİS';
    if (money >= 10000) return '🏪 BÖLGESEL DAĞITIM MERKEZİ';
    return '🏚️ GECEKONDU LOJİSTİK ÜSSÜ';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      
      {/* ÖĞRETİCİ MODAL (KUMAR KORUMASI) */}
      {showTutorial && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-purple-500 rounded-xl p-6 max-w-md w-full shadow-2xl shadow-purple-500/20">
            <div className="flex items-center gap-3 text-purple-400 mb-4">
              <HelpCircle className="w-8 h-8 animate-pulse" />
              <h2 className="text-xl font-black uppercase tracking-wider">Yeraltı Kumar Rehberi</h2>
            </div>

            {tutorialStep === 1 && (
              <div>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  Necmi'nin yeraltı odasında zarlar tamamen şansa dayalı döner reis. Kurallar basittir:
                </p>
                <ul className="space-y-2 text-xs text-slate-400 mb-6 bg-slate-950 p-3 rounded border border-slate-800">
                  <li className="flex items-center gap-2 text-rose-400">❌ <strong className="text-rose-300">1, 2 veya 3 Gelirse:</strong> Koyduğun tüm parayı çete üter, batarsın!</li>
                  <li className="flex items-center gap-2 text-emerald-400">💰 <strong className="text-emerald-300">4, 5 veya 6 Gelirse:</strong> Koyduğun parayı tam 2'ye katlar, kasayı uçurursun!</li>
                </ul>
                <div className="flex justify-between items-center text-xs text-amber-400 font-semibold mb-4 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                  ⚠️ UYARI: Dikkat et, tüm paranı tek zara basarsan Ahmet'e basacak bina bulamazsın!
                </div>
                <button 
                  onClick={() => setTutorialStep(2)}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg transition-all"
                >
                  Riskleri Anladım, İlerle →
                </button>
              </div>
            )}

            {tutorialStep === 2 && (
              <div>
                <p className="text-slate-300 text-sm mb-4">
                  Yeraltı kumar odasında kaybolan paraların sorumluluğu tamamen Necmi'nin kararlılığına aittir. Sistemi açmak için onay vermelisin.
                </p>
                <label className="flex items-start gap-3 bg-slate-950 p-3 rounded border border-slate-800 mb-6 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={acceptRisks} 
                    onChange={(e) => setAcceptRisks(e.target.checked)}
                    className="mt-1 accent-purple-500 h-4 w-4"
                  />
                  <span className="text-xs text-slate-400 leading-tight">
                    Kumar odasındaki zar mekaniğinin tamamen şans olduğunu biliyorum, batmayı da katlamayı da kabul ediyorum.
                  </span>
                </label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setShowTutorial(false); setAcceptRisks(true); }}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold py-2 rounded text-xs transition"
                  >
                    Öğreticiyi Geç
                  </button>
                  <button 
                    disabled={!acceptRisks}
                    onClick={() => setShowTutorial(false)}
                    className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 disabled:text-purple-400 text-white font-bold py-2 rounded text-xs transition-all flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" /> Kumarı Aktif Et
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ALTIN TIR BİLDİRİMİ BAR */}
      {goldTruckActive && (
        <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 text-center py-2 px-4 rounded-md font-black text-xs tracking-widest animate-pulse shadow-lg flex items-center justify-center gap-2 mb-4">
          <Truck className="w-5 h-5 animate-bounce" /> 
          ALTIN TIR AKTİF! SEVKİYATLAR KAZANCI 5'E KATLIYOR! ({goldTruckTimer}sn)
        </div>
      )}

      {/* ÜST PANEL */}
      <header className="border-b border-slate-800 pb-4 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-black text-amber-500 tracking-wider">NECMİ'NİN GLOBAL LOJİSTİK ÜSSÜ</h1>
            <p className="text-xs font-bold text-indigo-400 tracking-wide mt-0.5">{getCompanyStatus()}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] bg-slate-900 px-2 py-1 rounded text-slate-400 font-mono border border-slate-800">
              ⏱️ Şans Sayacı: {luckyTimer}sn
            </span>
          </div>
        </div>

        {/* HEDEF VE BAR */}
        <div className="mt-4 bg-slate-900 p-3 rounded-lg border border-slate-800">
          <div className="flex justify-between items-center mb-1.5 text-xs font-bold">
            <span className="text-slate-400 flex items-center gap-1">
              <Target className="w-4 h-4 text-rose-500" /> TARGET: Ahmet'in Binasını Basmak
            </span>
            <span className="text-rose-400 font-mono">Kalan: ${moneyToTarget.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          </div>
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div 
              className="bg-gradient-to-r from-rose-600 to-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (money / targetMoney) * 100)}%` }}
            />
          </div>
        </div>
      </header>

      {/* ANA EKONOMİ PANELİ */}
      <main className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
        
        {/* SOL: FİNANS & DURUM */}
        <section className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <p className="text-xs font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider mb-1">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" /> Necmi'nin Kasası
              </p>
              <h2 className="text-3xl font-black text-emerald-400 font-mono">
                ${money.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] block font-bold text-slate-500 uppercase">Borsa Değeri</span>
                <span className={`text-base font-black font-mono flex items-center gap-1 mt-0.5 ${priceTrend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  ${stockPrice} {priceTrend === 'up' ? <ChevronUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] block font-bold text-slate-500 uppercase">Stok Durumu</span>
                <span className="text-base font-black text-blue-400 font-mono block mt-0.5">
                  {stock.toFixed(1)} / {maxStock}
                </span>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded border border-slate-800 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-500 animate-pulse" /> Sevkiyata Kalan Süre:
              </span>
              <span className="font-mono text-blue-400 text-sm bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                {deliveryTimer}sn
              </span>
            </div>
          </div>

          <button 
            onClick={handleManualProduction}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-4 rounded-xl shadow-lg shadow-amber-500/10 transition-all duration-150 uppercase tracking-wider text-sm mt-4 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Package className="w-5 h-5" /> Manuel Üretim Yap
          </button>
        </section>

        {/* ORTA: YATIRIMLAR & GELİŞTİRMELER */}
        <section className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <h3 className="text-xs font-black text-slate-400 tracking-wider uppercase mb-3">Yatırım Ve Geliştirme Fırsatları</h3>
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            
            {/* TIK BAŞINA */}
            <div className="bg-slate-950 p-3 rounded border border-slate-800 flex justify-between items-center">
              <div>
                <p className="text-xs font-black uppercase text-slate-200">Üretim Gücü</p>
                <p className="text-[10px] text-slate-500">Tık Başına Üretim (LVL {clickLvl})</p>
              </div>
              <button 
                onClick={() => buyUpgrade('click')}
                disabled={money < costs.click}
                className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 text-amber-400 text-xs font-bold py-2 px-3 rounded border border-slate-700 transition"
              >
                ${costs.click}
              </button>
            </div>

            {/* OTOMATİK İŞÇİ */}
            <div className="bg-slate-950 p-3 rounded border border-slate-800 flex justify-between items-center">
              <div>
                <p className="text-xs font-black uppercase text-slate-200">Otomasyon Hattı</p>
                <p className="text-[10px] text-slate-500">Otomatik İşçi (LVL {workerLvl})</p>
              </div>
              <button 
                onClick={() => buyUpgrade('worker')}
                disabled={money < costs.worker}
                className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 text-amber-400 text-xs font-bold py-2 px-3 rounded border border-slate-700 transition"
              >
                ${costs.worker}
              </button>
            </div>

            {/* YÜK KAMYONU */}
            <div className="bg-slate-950 p-3 rounded border border-slate-800 flex justify-between items-center">
              <div>
                <p className="text-xs font-black uppercase text-slate-200">Lojistik Operasyonu</p>
                <p className="text-[10px] text-slate-500">🚚 Yük Kamyonu (LVL {truckLvl})</p>
              </div>
              <button 
                onClick={() => buyUpgrade('truck')}
                disabled={money < costs.truck}
                className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 text-amber-400 text-xs font-bold py-2 px-3 rounded border border-slate-700 transition"
              >
                ${costs.truck}
              </button>
            </div>

            {/* PAZARLAMA STRATEJİSİ */}
            <div className="bg-slate-950 p-3 rounded border border-slate-800 flex justify-between items-center">
              <div>
                <p className="text-xs font-black uppercase text-slate-200">Pazarlama Stratejisi</p>
                <p className="text-[10px] text-slate-500">Reklam Kampanyası (LVL {marketingLvl})</p>
              </div>
              <button 
                onClick={() => buyUpgrade('marketing')}
                disabled={money < costs.marketing}
                className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 text-amber-400 text-xs font-bold py-2 px-3 rounded border border-slate-700 transition"
              >
                ${costs.marketing}
              </button>
            </div>

            {/* DEPOLAMA */}
            <div className="bg-slate-950 p-3 rounded border border-slate-800 flex justify-between items-center">
              <div>
                <p className="text-xs font-black uppercase text-slate-200">Depolama Altyapısı</p>
                <p className="text-[10px] text-slate-500">Maksimum Hacim (LVL {storageLvl})</p>
              </div>
              <button 
                onClick={() => buyUpgrade('storage')}
                disabled={money < costs.storage}
                className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 text-amber-400 text-xs font-bold py-2 px-3 rounded border border-slate-700 transition"
              >
                ${costs.storage}
              </button>
            </div>

          </div>
        </section>

        {/* SAĞ: YERALTI KUMAR RISK ODASI */}
        <section className="bg-purple-950/20 p-4 rounded-xl border-2 border-purple-500/30 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-black text-purple-400 tracking-wider uppercase flex items-center gap-1">
                🎰 Yeraltı Risk Odası
              </h3>
              <button 
                onClick={() => { setTutorialStep(1); setShowTutorial(true); }}
                className="text-[10px] font-bold text-purple-300 underline hover:text-purple-200"
              >
                Kuralları Gör
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
              Zar atarak paranı katla. <span className="text-rose-400 font-semibold">1-3 arası zar batırır</span>, <span className="text-emerald-400 font-semibold">4-6 arası zar girdiğin parayı 2x yapar!</span>
            </p>

            <div className="bg-slate-950 p-3 rounded border border-purple-500/20 mb-4">
              <label className="text-[10px] font-bold text-purple-400 block uppercase mb-1">Zar Bahis Miktarı ($)</label>
              <input 
                type="number" 
                value={gambleAmount}
                onChange={(e) => setGambleAmount(e.target.value)}
                placeholder="Örn: 500"
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-sm font-mono text-purple-300 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* SONUÇ EKRANI */}
            {diceResult !== null && (
              <div className={`p-3 rounded border text-center mb-4 transition-all ${isGambleSuccess ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                <div className="text-2xl font-black mb-1">🎲 {diceResult}</div>
                <p className="text-[11px] font-medium leading-tight">{gambleMessage}</p>
              </div>
            )}
          </div>

          <button 
            onClick={handleRollDice}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black py-3.5 rounded-lg text-xs uppercase tracking-wider shadow-lg shadow-purple-500/10 active:scale-[0.98] transition"
          >
            Şansını Dene (Zar At)
          </button>
        </section>

      </main>

      {/* ALT PANEL: KAYIT VE SÜRÜM */}
      <footer className="border-t border-slate-800 pt-4 mt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">📍 Aktif Kanal:</span>
          <div className="flex gap-1">
            {slots.map(slot => (
              <button
                key={slot.id}
                onClick={() => saveGame(slot.id)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded border flex items-center gap-1 transition ${activeSlot === slot.id ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'}`}
              >
                <Save className="w-3 h-3" /> {slot.label} {slot.savedAt && `(${slot.savedAt.split(' ')[0]})`}
              </button>
            ))}
          </div>
        </div>
        <div className="text-[10px] font-bold font-mono text-slate-600 flex items-center gap-2">
          <span>NECMİ'NİN YÜKSELİŞİ v7.1.0</span>
          <span>|</span>
          <span>Kriz Döngüsü: {crisisTimer}s</span>
        </div>
      </footer>

    </div>
  );
}

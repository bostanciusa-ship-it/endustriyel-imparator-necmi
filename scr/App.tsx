import React, { useState, useEffect, useRef } from 'react';

/**
 * ============================================================================
 * 🔊 SİBER SES SENTEZLEYİCİ ÜNİTESİ
 * ============================================================================
 */
const playSfx = (type: string) => {
  try {
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    const startTime = context.currentTime;

    if (type === 'click') {
      oscillator.frequency.setValueAtTime(160, startTime);
      oscillator.frequency.exponentialRampToValueAtTime(30, startTime + 0.1);
      gainNode.gain.setValueAtTime(0.12, startTime);
      gainNode.gain.linearRampToValueAtTime(0, startTime + 0.1);
      oscillator.start();
      oscillator.stop(startTime + 0.1);
    } 
    else if (type === 'buy') {
      oscillator.frequency.setValueAtTime(220, startTime);
      oscillator.frequency.linearRampToValueAtTime(660, startTime + 0.2);
      gainNode.gain.setValueAtTime(0.1, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
      oscillator.start();
      oscillator.stop(startTime + 0.2);
    }
    else if (type === 'alert') {
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(330, startTime);
      oscillator.frequency.exponentialRampToValueAtTime(110, startTime + 0.4);
      gainNode.gain.setValueAtTime(0.06, startTime);
      oscillator.start();
      oscillator.stop(startTime + 0.4);
    }
  } catch (error) {
    console.warn("Ses engellendi.");
  }
};

export default function App() {
  // --- HİKAYE VE INTRO DURUMLARI ---
  const [introStage, setIntroStage] = useState(0); 
  const [introText, setIntroText] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // --- EKONOMİK DURUMLAR ---
  const [totalCash, setTotalCash] = useState(250);
  const [currentInventory, setCurrentInventory] = useState(0);
  const [currentMarketValue, setCurrentMarketValue] = useState(18.00);
  const [marketDirection, setMarketDirection] = useState<'up' | 'down'>('up');

  // --- GELİŞTİRME SEVİYELERİ ---
  const [lvlManualProduction, setLvlManualProduction] = useState(1);
  const [lvlAutomatedWorkers, setLvlAutomatedWorkers] = useState(0);
  const [lvlMarketingCampaigns, setLvlMarketingCampaigns] = useState(1);
  const [lvlStorageCapacity, setLvlStorageCapacity] = useState(1);
  const [lvlLogisticsTrucks, setLvlLogisticsTrucks] = useState(0);

  // --- SAYAÇLAR VE EVENT YÖNETİMİ ---
  const [incidentTimer, setIncidentTimer] = useState(120);
  const [activeIncident, setActiveIncident] = useState<{title: string, end: number} | null>(null);
  const [isStrikeActive, setIsStrikeActive] = useState(false);
  const [shipmentCountdown, setShipmentCountdown] = useState(3);

  const stateRef = useRef({ lvlMarketingCampaigns, lvlLogisticsTrucks, currentMarketValue, currentInventory, totalCash });
  
  useEffect(() => {
    stateRef.current = { lvlMarketingCampaigns, lvlLogisticsTrucks, currentMarketValue, currentInventory, totalCash };
    if (totalCash >= 1000000 && !gameWon) {
      setGameWon(true);
      playSfx('buy');
    }
  }, [lvlMarketingCampaigns, lvlLogisticsTrucks, currentMarketValue, currentInventory, totalCash, gameWon]);

  // --- DÜKKANDAN ÇIKTIKTAN SONRA KENDİ KENDİNE YEMİN ETME SENARYOSU ---
  const storyDialogs = [
    "📍 AHMET HOLDİNG - MERKEZ OFİS (KOVULMA ANI)...",
    "💼 Ahmet Bey: 'Duyduklarıma göre lojistiği büyütecekmişsin Necmi? Kamyon filosu falan... Gereksiz!'",
    "💼 Ahmet Bey: 'Burada kuralları ben koyarım Necmi! Kovuldun! Şimdi git o projelerini başka yerde sat!'",
    "🚪 *KAPISI ÇARPIP DÜKKANDAN ÇIKARSIN VE HOLDİNG BİNASININ ÖNÜNDE TEK BAŞINA KALIRSIN...*",
    "🔥 Necmi (Kendi Kendine): 'Eski patronumdan intikam almalıyım, milyoner olmalıyım! Sıfırdan başlayıp tam 1 MİLYON DOLAR yapacağım!'",
    "🚀 Necmi (Kendi Kendine): 'O 1 milyonu kasaya koyduğum gün, senin o köhne şirketi borsadan tamamen sileceğim Ahmet! İZLE VE GÖR!'"
  ];

  useEffect(() => {
    if (gameStarted) return;
    
    let charIndex = 0;
    setIntroText("");
    const currentLine = storyDialogs[introStage];

    const typingInterval = setInterval(() => {
      if (charIndex < currentLine.length) {
        setIntroText((prev) => prev + currentLine.charAt(charIndex));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        
        // Sahneler arası akış beklemesi (Yazı bitince 3.2 saniye bekler)
        setTimeout(() => {
          if (introStage < storyDialogs.length - 1) {
            setIntroStage(prev => prev + 1);
          } else {
            setGameStarted(true);
            playSfx('buy');
          }
        }, 3200);
      }
    }, 30);

    return () => clearInterval(typingInterval);
  }, [introStage, gameStarted]);

  // --- SEVİYE YÜKSELTME AKSİYONLARI ---
  const upgradeManualPower = () => {
    const requiredCapital = Math.floor(200 * Math.pow(1.25, lvlManualProduction - 1));
    if (totalCash >= requiredCapital) {
      setTotalCash(prev => prev - requiredCapital);
      setLvlManualProduction(prev => prev + 1);
      playSfx('buy');
    }
  };

  const hireAutomatedWorker = () => {
    const requiredCapital = Math.floor(500 * Math.pow(1.28, lvlAutomatedWorkers));
    if (totalCash >= requiredCapital) {
      setTotalCash(prev => prev - requiredCapital);
      setLvlAutomatedWorkers(prev => prev + 1);
      playSfx('buy');
    }
  };

  const expandMarketingDepth = () => {
    const requiredCapital = Math.floor(600 * Math.pow(1.22, lvlMarketingCampaigns - 1));
    if (totalCash >= requiredCapital) {
      setTotalCash(prev => prev - requiredCapital);
      setLvlMarketingCampaigns(prev => prev + 1);
      playSfx('buy');
    }
  };

  const expandWarehouseSpace = () => {
    const requiredCapital = Math.floor(650 * Math.pow(1.20, lvlStorageCapacity - 1));
    if (totalCash >= requiredCapital) {
      setTotalCash(prev => prev - requiredCapital);
      setLvlStorageCapacity(prev => prev + 1);
      playSfx('buy');
    }
  };

  const purchaseLogisticsTruck = () => {
    const requiredCapital = Math.floor(550 * Math.pow(1.35, lvlLogisticsTrucks));
    if (totalCash >= requiredCapital) {
      setTotalCash(prev => prev - requiredCapital);
      setLvlLogisticsTrucks(prev => prev + 1);
      playSfx('buy');
    }
  };

  const handleResolve = () => {
    if (!activeIncident) return;
    if (isStrikeActive && totalCash < 100) return;
    if (isStrikeActive) setTotalCash(c => c - 100);
    setActiveIncident(null);
    setIsStrikeActive(false);
    playSfx('buy');
  };

  // --- ENGINE TICKERS ---
  useEffect(() => {
    if (!gameStarted || gameWon) return;

    const marketFluxInterval = setInterval(() => {
      setCurrentMarketValue(oldPrice => {
        const volatility = (Math.random() * 8 - 4);
        const updatedPrice = Math.max(12, Math.min(48, oldPrice + volatility));
        setMarketDirection(updatedPrice > oldPrice ? 'up' : 'down');
        return updatedPrice;
      });
    }, 5000);

    const systemHeartbeat = setInterval(() => {
      if (!isStrikeActive) {
        setCurrentInventory(inventory => {
          const capacityLimit = lvlStorageCapacity * 40;
          const productionOutput = (lvlAutomatedWorkers * 0.25);
          return Math.min(inventory + productionOutput, capacityLimit);
        });
      }

      setShipmentCountdown(currentSec => {
        if (currentSec <= 1) {
          const currentRefData = stateRef.current;
          const unitsToSell = 1 + (currentRefData.lvlMarketingCampaigns * 0.25) + (currentRefData.lvlLogisticsTrucks * 0.5);
          
          setCurrentInventory(actualInventory => {
            const finalSoldAmount = Math.min(actualInventory, unitsToSell);
            if (finalSoldAmount > 0) {
              setTotalCash(cashPool => cashPool + (finalSoldAmount * currentRefData.currentMarketValue));
              return Math.max(0, actualInventory - finalSoldAmount);
            }
            return actualInventory;
          });
          return 3;
        }
        return currentSec - 1;
      });

      if (!activeIncident) {
        setIncidentTimer(prevTime => {
          if (prevTime <= 1) {
            playSfx('alert');
            const chance = Math.random();
            const incidentType = chance > 0.5 ? "MALİ DENETİM" : "İŞÇİ GREVİ";
            setActiveIncident({ title: incidentType, end: Date.now() + 8500 });
            if (incidentType === "İŞÇİ GREVİ") setIsStrikeActive(true);
            return 120;
          }
          return prevTime - 1;
        });
      }

      if (activeIncident && Date.now() > activeIncident.end) {
        setTotalCash(prev => Math.max(0, prev * 0.88));
        setActiveIncident(null);
        setIsStrikeActive(false);
        setIncidentTimer(120);
        playSfx('alert');
      }
    }, 1000);

    return () => { clearInterval(marketFluxInterval); clearInterval(systemHeartbeat); };
  }, [gameStarted, isStrikeActive, activeIncident, gameWon]);

  // --- EKRAN 1: SİNEMATİK INTRO EKRANI ---
  if (!gameStarted) {
    const isAhmetSpeaking = introStage <= 2;
    const isTransitionStage = introStage === 3;
    
    return (
      <div style={{ backgroundColor: '#020617', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#f8fafc', fontFamily: 'monospace', padding: '20px', textAlign: 'center', overflow: 'hidden', position: 'relative' }}>
        
        {/* Sinematik Arka Plan Efekti */}
        <div style={{ position: 'absolute', width: '500px', height: '500px', background: isTransitionStage ? 'radial-gradient(circle, rgba(234,179,8,0.08) 0%, rgba(0,0,0,0) 70%)' : isAhmetSpeaking ? 'radial-gradient(circle, rgba(239,68,68,0.1) 0%, rgba(0,0,0,0) 70%)' : 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(0,0,0,0) 70%)', transition: 'all 1s ease' }}></div>

        <div style={{ maxWidth: '700px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)', border: isTransitionStage ? '2px solid rgba(234,179,8,0.4)' : isAhmetSpeaking ? '2px solid rgba(239, 68, 68, 0.4)' : '2px solid rgba(59, 130, 246, 0.6)', padding: '45px', borderRadius: '24px', boxShadow: isTransitionStage ? '0 0 40px rgba(234,179,8,0.15)' : isAhmetSpeaking ? '0 0 40px rgba(239, 68, 68, 0.15)' : '0 0 50px rgba(59, 130, 246, 0.25)', transition: 'all 0.5s ease' }}>
          
          {/* Sahneye Göre Değişen İkonlar */}
          <div style={{ fontSize: '4.5rem', marginBottom: '25px' }}>
            {isTransitionStage ? "🚪🚶" : isAhmetSpeaking ? "👴💼" : "😡🔥"}
          </div>

          {/* Konuşan Kişi / Durum Etiketi */}
          <div style={{ fontSize: '0.9rem', color: '#64748b', letterSpacing: '2px', marginBottom: '10px', fontWeight: 'bold' }}>
            {isTransitionStage ? "SAHNE GEÇİŞİ" : isAhmetSpeaking ? "ESKİ PATRON: AHMET BEY" : "NECMİ (BİNANIN ÖNÜNDE TEK BAŞINA)"}
          </div>

          {/* Daktilo Efektli Metin Alanı */}
          <div style={{ minHeight: '140px', fontSize: '1.45rem', lineHeight: '1.65', color: isTransitionStage ? '#eab308' : isAhmetSpeaking ? '#f87171' : '#38bdf8', fontWeight: 500 }}>
            {introText}
          </div>

          {/* İlerleme Çubuğu */}
          <div style={{ width: '100%', height: '5px', background: '#1e293b', marginTop: '35px', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${((introStage + 1) / storyDialogs.length) * 100}%`, height: '100%', background: isTransitionStage ? '#eab308' : isAhmetSpeaking ? '#ef4444' : '#3b82f6', transition: 'width 0.4s ease' }}></div>
          </div>

          <div style={{ marginTop: '20px', color: '#475569', fontSize: '0.75rem' }}>
            METİN AKIŞI OTOMATİKTİR // İNTİKAM YAKLAŞIYOR
          </div>
        </div>
      </div>
    );
  }

  // --- EKRAN 2: ZAFER EKRANI ---
  if (gameWon) {
    return (
      <div style={{ backgroundColor: '#020617', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#f8fafc', fontFamily: 'monospace', textAlign: 'center' }}>
        <div style={{ background: 'linear-gradient(135deg, #064e3b 0%, #020617 100%)', border: '3px solid #22c55e', padding: '50px', borderRadius: '30px', boxShadow: '0 0 60px rgba(34, 197, 94, 0.4)', maxWidth: '650px' }}>
          <div style={{ fontSize: '5rem' }}>👑🚀</div>
          <h1 style={{ color: '#22c55e', fontSize: '2.6rem', margin: '20px 0', fontWeight: 'bold' }}>AHMET'TEN İNTİKAM ALINDI!</h1>
          <p style={{ fontSize: '1.25rem', lineHeight: '1.6', color: '#cbd5e1' }}>
            Hesabında tam <strong>${Math.floor(totalCash).toLocaleString()}</strong> var Necmi! Ahmet Bey'in holding hisselerini tabandan topladın, onu yönetim kurulundan kovdun ve kapının önüne koydun!
          </p>
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '15px', borderRadius: '12px', border: '1px solid #22c55e', color: '#34d399', fontSize: '1.1rem', margin: '25px 0', fontWeight: 'bold' }}>
            NECMİ HOLDİNG SEKTÖRÜN TEK HAKİMİ OLDU!
          </div>
          <button 
            onClick={() => window.location.reload()} 
            style={{ padding: '16px 35px', background: '#22c55e', color: '#020617', border: 'none', borderRadius: '14px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 5px 15px rgba(34,197,94,0.4)' }}
          >
            YENİDEN BAŞLAT VE AHMET'İ BİR DAHA EZ
          </button>
        </div>
      </div>
    );
  }

  // --- EKRAN 3: ANA OYUN ARBİTRAJI ---
  return (
    <div style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc', fontFamily: 'Segoe UI, sans-serif', padding: '40px' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #1e293b', paddingBottom: '20px', marginBottom: '40px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#3b82f6', letterSpacing: '1px' }}>NECMİ'NİN İNTİKAMI: GLOBAL LOJİSTİK</h2>
          <span style={{ color: '#fbbf24', fontSize: '0.9rem', fontWeight: 'bold' }}>🎯 HEDEF: $1.000.000 NAKİT BİRİKTİRİP AHMET'İ BATIRMAK!</span>
        </div>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ background: '#0f172a', padding: '15px 25px', borderRadius: '15px', border: '1px solid #3b82f6', textAlign: 'right' }}>
            <small style={{ color: '#64748b' }}>AHMET'İN İFLASINA KALAN</small>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
              ${Math.max(0, 1000000 - Math.floor(totalCash)).toLocaleString()}
            </div>
          </div>
          <div style={{ background: '#0f172a', padding: '15px 25px', borderRadius: '15px', border: `1px solid ${marketDirection === 'up' ? '#22c55e' : '#ef4444'}`, textAlign: 'right' }}>
            <small style={{ color: '#64748b' }}>BORSA DEĞERİ</small>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: marketDirection === 'up' ? '#22c55e' : '#ef4444' }}>
              ${currentMarketValue.toFixed(2)} {marketDirection === 'up' ? '▲' : '▼'}
            </div>
          </div>
        </div>
      </header>

      {activeIncident && (
        <div style={{ backgroundColor: '#7f1d1d', border: '2px solid #ef4444', padding: '25px', borderRadius: '20px', marginBottom: '40px', textAlign: 'center' }}>
          <h2 style={{ margin: 0, color: '#fecaca' }}>⚠️ KRİZ TESPİT EDİLDİ: {activeIncident.title}</h2>
          <button 
            onClick={handleResolve} 
            style={{ padding: '12px 40px', fontSize: '1.1rem', background: '#f8fafc', color: '#7f1d1d', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
          >
            KRİZE MÜDAHALE ET {isStrikeActive && "(-100$)"}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '30px', marginBottom: '50px' }}>
        <div style={{ flex: 1, background: '#0f172a', padding: '30px', borderRadius: '25px', border: '1px solid #1e293b', textAlign: 'center' }}>
          <div style={{ color: '#64748b', marginBottom: '10px' }}>NECMİ'NİN KASASI</div>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#22c55e' }}>${Math.floor(totalCash).toLocaleString()}</div>
          <div style={{ width: '100%', height: '6px', background: '#1e293b', borderRadius: '3px', marginTop: '10px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, (totalCash / 1000000) * 100)}%`, height: '100%', background: '#22c55e' }}></div>
          </div>
        </div>
        <div style={{ flex: 1, background: '#0f172a', padding: '30px', borderRadius: '25px', border: '1px solid #1e293b', textAlign: 'center' }}>
          <div style={{ color: '#64748b', marginBottom: '10px' }}>STOK DURUMU</div>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#eab308' }}>{currentInventory.toFixed(1)} / {lvlStorageCapacity * 40}</div>
          <div style={{ fontSize: '0.8rem', color: '#3b82f6', marginTop: '10px', fontWeight: 'bold' }}>🚚 SEVKİYATA KALAN SÜRE: {shipmentCountdown}sn</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <button 
          onClick={() => { if(!isStrikeActive && currentInventory < (lvlStorageCapacity * 40)) { setCurrentInventory(prev => Math.min(prev + lvlManualProduction, lvlStorageCapacity * 40)); playSfx('click'); } }}
          style={{ 
            padding: '35px 100px', fontSize: '1.8rem', fontWeight: 'bold', borderRadius: '25px', border: 'none',
            backgroundColor: (isStrikeActive || currentInventory >= lvlStorageCapacity * 40) ? '#334155' : '#3b82f6',
            color: 'white', cursor: 'pointer', boxShadow: '0 10px 0 #1d4ed8'
          }}
        >
          {isStrikeActive ? "GREV VAR: ÜRETİM DURDU" : currentInventory >= (lvlStorageCapacity * 40) ? "DEPO FULL: SEVKİYAT BEKLENİYOR" : "MANUEL ÜRETİM YAP"}
        </button>
      </div>

      <h3 style={{ marginBottom: '25px', color: '#3b82f6', borderLeft: '4px solid #3b82f6', paddingLeft: '15px' }}>YATIRIM VE GELİŞTİRME FIRSATLARI</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
        
        <div onClick={upgradeManualPower} style={{ background: '#0f172a', padding: '25px', borderRadius: '20px', cursor: 'pointer', border: '1px solid #1e293b' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>ÜRETİM GÜCÜ</div>
          <div style={{ fontSize: '1.1rem', margin: '5px 0' }}>TIK BAŞINA ÜRETİM (LVL {lvlManualProduction})</div>
          <div style={{ color: '#22c55e', fontWeight: 'bold' }}>MALİYET: ${Math.floor(200 * Math.pow(1.25, lvlManualProduction - 1))}</div>
        </div>

        <div onClick={hireAutomatedWorker} style={{ background: '#0f172a', padding: '25px', borderRadius: '20px', cursor: 'pointer', border: '1px solid #1e293b' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>OTOMASYON HATTI</div>
          <div style={{ fontSize: '1.1rem', margin: '5px 0' }}>OTOMATİK İŞÇİ (LVL {lvlAutomatedWorkers})</div>
          <div style={{ color: '#22c55e', fontWeight: 'bold' }}>MALİYET: ${Math.floor(500 * Math.pow(1.28, lvlAutomatedWorkers))}</div>
        </div>

        <div onClick={purchaseLogisticsTruck} style={{ background: '#0f172a', padding: '25px', borderRadius: '20px', cursor: 'pointer', border: '2px solid #fbbf24' }}>
          <div style={{ color: '#fbbf24', fontSize: '0.8rem' }}>LOJİSTİK OPERASYONU</div>
          <div style={{ fontSize: '1.1rem', margin: '5px 0' }}>🚚 YÜK KAMYONU (LVL {lvlLogisticsTrucks})</div>
          <div style={{ color: '#22c55e', fontWeight: 'bold' }}>MALİYET: ${Math.floor(550 * Math.pow(1.35, lvlLogisticsTrucks))}</div>
          <small style={{ color: '#64748b' }}>Hız: +0.5 Birim / 3 Saniye</small>
        </div>

        <div onClick={expandMarketingDepth} style={{ background: '#0f172a', padding: '25px', borderRadius: '20px', cursor: 'pointer', border: '1px solid #1e293b' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>PAZARLAMA STRATEJİSİ</div>
          <div style={{ fontSize: '1.1rem', margin: '5px 0' }}>REKLAM KAMPANYASI (LVL {lvlMarketingCampaigns})</div>
          <div style={{ color: '#22c55e', fontWeight: 'bold' }}>MALİYET: ${Math.floor(600 * Math.pow(1.22, lvlMarketingCampaigns - 1))}</div>
        </div>

        <div onClick={expandWarehouseSpace} style={{ background: '#0f172a', padding: '25px', borderRadius: '20px', cursor: 'pointer', border: '1px solid #1e293b' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>DEPOLAMA ALTYAPISI</div>
          <div style={{ fontSize: '1.1rem', margin: '5px 0' }}>MAKSİMUM HACİM (LVL {lvlStorageCapacity})</div>
          <div style={{ color: '#22c55e', fontWeight: 'bold' }}>MALİYET: ${Math.floor(650 * Math.pow(1.20, lvlStorageCapacity - 1))}</div>
        </div>

      </div>

      <footer style={{ marginTop: '60px', textAlign: 'center', color: '#334155', fontSize: '0.8rem' }}>
        NECMİ'NİN YÜKSELİŞİ v4.8.1 | Kriz Döngüsü: {incidentTimer}s
      </footer>
    </div>
  );
}

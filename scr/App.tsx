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
  
  // --- BASKIN (RAID) SİNEMATİK DURUMLARI ---
  const [raidStarted, setRaidStarted] = useState(false);
  const [raidStage, setRaidStage] = useState(0);
  const [raidText, setRaidText] = useState("");

  // --- EKONOMİK DURUMLAR ---
  const [totalCash, setTotalCash] = useState(250);
  const [currentInventory, setCurrentInventory] = useState(0);
  const [currentMarketValue, setCurrentMarketValue] = useState(18.00);
  const [marketDirection, setMarketDirection] = useState<'up' | 'down'>('up');

  // --- NATALİ DÖNER SİSTEMİ DURUMLARI ---
  const [isNataliHere, setIsNataliHere] = useState(false); // Natali dükkanda mı?
  const [nataliLeaveTimer, setNataliLeaveTimer] = useState(0); // Gitmesine kalan süre (30sn)
  const [nataliArrivalCheckTimer, setNataliArrivalCheckTimer] = useState(60); // 1 dakikalık kontrol sayacı
  const [donerBuffTimer, setDonerBuffTimer] = useState(0); // Satın alınan dönerin indirim süresi (60sn)

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

  const stateRef = useRef({ lvlMarketingCampaigns, lvlLogisticsTrucks, currentMarketValue, currentInventory, totalCash, raidStarted });
  
  useEffect(() => {
    stateRef.current = { lvlMarketingCampaigns, lvlLogisticsTrucks, currentMarketValue, currentInventory, totalCash, raidStarted };
    if (totalCash >= 1000000 && !raidStarted) {
      setRaidStarted(true);
      playSfx('buy');
    }
  }, [lvlMarketingCampaigns, lvlLogisticsTrucks, currentMarketValue, currentInventory, totalCash, raidStarted]);

  // --- DÜKKANDAN ÇIKTIKTAN SONRA KENDİ KENDİNE YEMİN ETME SENARYOSU ---
  const storyDialogs = [
    "📍 AHMET HOLDİNG - MERKEZ OFİS (KOVULMA ANI)...",
    "💼 Ahmet Bey: 'Duyduklarıma göre lojistiği büyütecekmişsin Necmi? Kamyon filosu falan... Gereksiz!'",
    "💼 Ahmet Bey: 'Burada kuralları ben koyarım Necmi! Kovuldun! Şimdi git o projelerini başka yerde sat!'",
    "🚪 *KAPISI ÇARPIP DÜKKANDAN ÇIKARSIN VE HOLDİNG BİNASININ ÖNÜNDE TEK BAŞINA KALIRSIN...*",
    "🔥 Necmi (Kendi Kendine): 'Eski patronumdan intikam almalıyım, milyoner olmalıyım! Sıfırdan başlayıp tam 1 MİLYON DOLAR yapacağım!'",
    "🚀 Necmi (Kendi Kendine): 'O 1 milyonu kasaya koyduğum gün, senin o köhne şirketi borsadan tamamen sileceğim ****** çocuğu! İZLE VE GÖR!'"
  ];

  // --- HOLDİNG BASKINI SİNEMATİK DİYALOGLARI ---
  const raidDialogs = [
    "🚨 ALARM! NECMİ LOJİSTİK TIR FİLOSU AHMET HOLDİNG KAPISINA DAYANDI! 🚨",
    "💥 GÜÜÜÜÜM! Necmi'nin satın aldığı dev tırlar holdingin ana giriş camlarını tuzla buz ederek içeri giriyor!",
    "🏃‍♂️ Güvenlikler kaçışıyor! Necmi, arkasında yüzlerce lojistik işçisiyle koridorları eze eze ilerliyor!",
    "🚪 ASANSÖR YUKARI ÇIKIYOR... 30. KAT... BAŞKANLIK OFİSİ KAPISI TEKMEYLE KIRILIYOR!",
    "👴💼 Ahmet Bey (Korkudan titreyerek): 'N-Necmi?! Bu tırlar... Bu adamlar kim?! Güvenlik!!'",
    "😡 Necmi: 'Demek kamyonlarım gereksizmiş he? Boş konuşuyordun, lojistiği küçümsüyordun...'",
    "🔥 Necmi: 'Al şunları ****** çocuğu!!'",
    "💸 *Necmi, çantasından çıkardığı tam 1 MİLYON DOLARLIK nakit balyalarını Ahmet Bey'in suratına, masasına ve üstüne fırlatır! Ofis adeta para yağmuruna tutulur!*",
    "📉 Necmi: 'Bitti Ahmet. Şirketinin tüm hisselerini satın aldım. Şimdi bu binayı tırlarımla dümdüz edeceğim, sen de sokağa döneceksin!'"
  ];

  // INTRO DAKTİLO EFEKTİ
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

  // BASKIN SİNEMATİK DAKTİLO EFEKTİ
  useEffect(() => {
    if (!raidStarted) return;
    let charIndex = 0;
    setRaidText("");
    const currentLine = raidDialogs[raidStage];

    const typingInterval = setInterval(() => {
      if (charIndex < currentLine.length) {
        setRaidText((prev) => prev + currentLine.charAt(charIndex));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          if (raidStage < raidDialogs.length - 1) {
            setRaidStage(prev => prev + 1);
          }
        }, 4000);
      }
    }, 35);
    return () => clearInterval(typingInterval);
  }, [raidStarted, raidStage]);

  // NATALİ'DEN DÖNER SATIN ALMA
  const buyDonerFromNatali = () => {
    if (isNataliHere && totalCash >= 100) {
      setTotalCash(prev => prev - 100);
      setDonerBuffTimer(60); // 1 dakika indirim buffı active
      setIsNataliHere(false); // Döner alınınca tezgahını toplar
      setNataliLeaveTimer(0);
      playSfx('buy');
    } else {
      playSfx('alert');
    }
  };

  // İNDİRİMLİ FİYAT HESAPLAMA (%10 INDIRIM)
  const getDiscountedCost = (baseCost: number) => {
    if (donerBuffTimer > 0) {
      return Math.floor(baseCost * 0.90);
    }
    return baseCost;
  };

  const costManual = getDiscountedCost(Math.floor(200 * Math.pow(1.25, lvlManualProduction - 1)));
  const costAutomation = getDiscountedCost(Math.floor(500 * Math.pow(1.28, lvlAutomatedWorkers)));
  const costMarketing = getDiscountedCost(Math.floor(600 * Math.pow(1.22, lvlMarketingCampaigns - 1)));
  const costStorage = getDiscountedCost(Math.floor(650 * Math.pow(1.20, lvlStorageCapacity - 1)));
  const costLogistics = getDiscountedCost(Math.floor(550 * Math.pow(1.35, lvlLogisticsTrucks)));

  const upgradeManualPower = () => {
    if (totalCash >= costManual) {
      setTotalCash(prev => prev - costManual);
      setLvlManualProduction(prev => prev + 1);
      playSfx('buy');
    }
  };

  const hireAutomatedWorker = () => {
    if (totalCash >= costAutomation) {
      setTotalCash(prev => prev - costAutomation);
      setLvlAutomatedWorkers(prev => prev + 1);
      playSfx('buy');
    }
  };

  const expandMarketingDepth = () => {
    if (totalCash >= costMarketing) {
      setTotalCash(prev => prev - costMarketing);
      setLvlMarketingCampaigns(prev => prev + 1);
      playSfx('buy');
    }
  };

  const expandWarehouseSpace = () => {
    if (totalCash >= costStorage) {
      setTotalCash(prev => prev - costStorage);
      setLvlStorageCapacity(prev => prev + 1);
      playSfx('buy');
    }
  };

  const purchaseLogisticsTruck = () => {
    if (totalCash >= costLogistics) {
      setTotalCash(prev => prev - costLogistics);
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

  // --- OYUN MOTORU DÖNGÜLERİ ---
  useEffect(() => {
    if (!gameStarted || stateRef.current.raidStarted) return;

    const marketFluxInterval = setInterval(() => {
      setCurrentMarketValue(oldPrice => {
        const volatility = (Math.random() * 8 - 4);
        const updatedPrice = Math.max(12, Math.min(48, oldPrice + volatility));
        setMarketDirection(updatedPrice > oldPrice ? 'up' : 'down');
        return updatedPrice;
      });
    }, 5000);

    const systemHeartbeat = setInterval(() => {
      // Döner İndirim Süresi Yönetimi
      setDonerBuffTimer(prev => (prev > 0 ? prev - 1 : 0));

      // Natali Dükkandaysa Kalma Süresini Azalt
      setNataliLeaveTimer(prev => {
        if (prev <= 1 && isNataliHere) {
          setIsNataliHere(false); // Süre bitti, Natali gitti
          return 0;
        }
        return prev > 0 ? prev - 1 : 0;
      });

      // --- 1 DAKİKADA BİR %25 İHTİMALLE NATALİ GELSİN SİSTEMİ ---
      setNataliArrivalCheckTimer(prevTime => {
        if (prevTime <= 1) {
          // 60 saniye bitti, zar atılıyor
          const rollDice = Math.random(); // 0 ile 1 arası sayı üretir
          if (rollDice <= 0.25 && !isNataliHere) {
            // %25 şans tuttu! Natali geliyor
            setIsNataliHere(true);
            setNataliLeaveTimer(30); // 30 saniye dükkanda kalacak
            playSfx('buy');
          }
          return 60; // Sayacı tekrar 1 dakikaya (60 saniye) kur
        }
        return prevTime - 1;
      });

      // Otomatik İşçi Üretimi
      if (!isStrikeActive) {
        setCurrentInventory(inventory => {
          const capacityLimit = lvlStorageCapacity * 40;
          const productionOutput = (lvlAutomatedWorkers * 0.25);
          return Math.min(inventory + productionOutput, capacityLimit);
        });
      }

      // Sevkiyat ve Satış Motoru
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

      // Kriz Yönetimi
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
  }, [gameStarted, isStrikeActive, activeIncident, lvlStorageCapacity, lvlAutomatedWorkers, isNataliHere]);

  // --- EKRAN 1: SİNEMATİK INTRO EKRANI ---
  if (!gameStarted) {
    const isAhmetSpeaking = introStage <= 2;
    const isTransitionStage = introStage === 3;
    
    return (
      <div style={{ backgroundColor: '#020617', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#f8fafc', fontFamily: 'monospace', padding: '20px', textAlign: 'center', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', width: '500px', height: '500px', background: isTransitionStage ? 'radial-gradient(circle, rgba(234,179,8,0.08) 0%, rgba(0,0,0,0) 70%)' : isAhmetSpeaking ? 'radial-gradient(circle, rgba(239,68,68,0.1) 0%, rgba(0,0,0,0) 70%)' : 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(0,0,0,0) 70%)', transition: 'all 1s ease' }}></div>
        <div style={{ maxWidth: '700px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)', border: isTransitionStage ? '2px solid rgba(234,179,8,0.4)' : isAhmetSpeaking ? '2px solid rgba(239, 68, 68, 0.4)' : '2px solid rgba(59, 130, 246, 0.6)', padding: '45px', borderRadius: '24px', boxShadow: isTransitionStage ? '0 0 40px rgba(234,179,8,0.15)' : isAhmetSpeaking ? '0 0 40px rgba(239, 68, 68, 0.15)' : '0 0 50px rgba(59, 130, 246, 0.25)', transition: 'all 0.5s ease' }}>
          <div style={{ fontSize: '4.5rem', marginBottom: '25px' }}>
            {isTransitionStage ? "🚪🚶" : isAhmetSpeaking ? "👴💼" : "😡🔥"}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#64748b', letterSpacing: '2px', marginBottom: '10px', fontWeight: 'bold' }}>
            {isTransitionStage ? "SAHNE GEÇİŞİ" : isAhmetSpeaking ? "ESKİ PATRON: AHMET BEY" : "NECMİ (BİNANIN ÖNÜNDE TEK BAŞINA)"}
          </div>
          <div style={{ minHeight: '140px', fontSize: '1.45rem', lineHeight: '1.65', color: isTransitionStage ? '#eab308' : isAhmetSpeaking ? '#f87171' : '#38bdf8', fontWeight: 500 }}>
            {introText}
          </div>
          <div style={{ width: '100%', height: '5px', background: '#1e293b', marginTop: '35px', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${((introStage + 1) / storyDialogs.length) * 100}%`, height: '100%', background: isTransitionStage ? '#eab308' : isAhmetSpeaking ? '#ef4444' : '#3b82f6', transition: 'width 0.4s ease' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // --- EKRAN 2: BÜYÜK HOLDİNG BASKINI SİNEMATİĞİ (1 MİLYON DOLAR ZAFERİ) ---
  if (raidStarted) {
    const isRaidAction = raidStage <= 3;
    const isAhmetScared = raidStage === 4;
    const isNecmiUltimate = raidStage >= 5 && raidStage <= 7;
    
    return (
      <div style={{ backgroundColor: '#020617', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#f8fafc', fontFamily: 'monospace', padding: '20px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', width: '100%', height: '100%', background: isNecmiUltimate ? 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(0,0,0,0) 80%)' : 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(0,0,0,0) 80%)', animation: 'pulse 2s infinite' }}></div>
        <div style={{ maxWidth: '750px', background: 'rgba(10, 15, 30, 0.95)', border: isNecmiUltimate ? '3px solid #22c55e' : '3px solid #ef4444', padding: '50px', borderRadius: '30px', boxShadow: isNecmiUltimate ? '0 0 60px rgba(34, 197, 94, 0.4)' : '0 0 60px rgba(239, 68, 68, 0.4)', zIndex: 10 }}>
          <div style={{ fontSize: '5.5rem', marginBottom: '20px' }}>
            {isRaidAction ? "🚚💥" : isAhmetScared ? "👴😰" : "💸😡"}
          </div>
          <h2 style={{ color: isNecmiUltimate ? '#22c55e' : '#ef4444', fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '20px' }}>
            {raidStage === 8 ? "👑 OPERASYON TAMAMLANDI" : "🔥 HOLDİNG BASKINI AXİSİ"}
          </h2>
          <div style={{ minHeight: '160px', fontSize: '1.5rem', lineHeight: '1.7', color: '#e2e8f0', fontWeight: 'bold' }}>
            {raidText}
          </div>
          {raidStage === raidDialogs.length - 1 ? (
            <button 
              onClick={() => window.location.reload()} 
              style={{ padding: '18px 45px', background: '#22c55e', color: '#020617', border: 'none', borderRadius: '16px', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer', marginTop: '30px', boxShadow: '0 8px 20px rgba(34,197,94,0.4)' }}
            >
              AHMET'İ YENİDEN SIFIRLAMAK İÇİN BAŞLAT
            </button>
          ) : (
            <div style={{ marginTop: '30px', color: '#475569', fontSize: '0.85rem', letterSpacing: '1px' }}>
              SİNEMATİK BASKIN DEVAM EDİYOR... ({raidStage + 1}/{raidDialogs.length})
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- EKRAN 3: ANA LOJİSTİK VE YÖNETİM MERKEZİ ---
  return (
    <div style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc', fontFamily: 'Segoe UI, sans-serif', padding: '40px' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #1e293b', paddingBottom: '20px', marginBottom: '40px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#3b82f6', letterSpacing: '1px' }}>NECMİ'NİN GLOBAL LOJİSTİK ÜSSÜ</h2>
          <span style={{ color: '#fbbf24', fontSize: '0.9rem', fontWeight: 'bold' }}>🎯 HEDEF: $1.000.000 BİRİKTİRİP AHMET'İN BİNASINI BASMAK!</span>
        </div>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {/* Arka plan radar göstergesi / Şans kontrolü */}
          <div style={{ fontSize: '0.8rem', color: '#475569', background: '#0b0f19', padding: '10px 15px', borderRadius: '10px', border: '1px solid #1e293b' }}>
            🌯 Natali Kontrolü: <strong>{nataliArrivalCheckTimer}sn</strong>
          </div>

          {donerBuffTimer > 0 && (
            <div style={{ background: 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)', padding: '15px 20px', borderRadius: '15px', border: '1px solid #ef4444', textAlign: 'center' }}>
              <small style={{ color: '#fecaca', fontWeight: 'bold' }}>🌯 DÖNER GÜCÜ ACTİVE</small>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#ffffff' }}>%10 İNDİRİM: {donerBuffTimer}sn</div>
            </div>
          )}
          <div style={{ background: '#0f172a', padding: '15px 25px', borderRadius: '15px', border: '1px solid #3b82f6', textAlign: 'right' }}>
            <small style={{ color: '#64748b' }}>BASKINA KALAN PARA</small>
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

      {/* --- %25 İHTİMALLE AÇILAN DİNAMİK NATALİ PANELİ --- */}
      {isNataliHere ? (
        <div style={{ background: 'linear-gradient(90deg, #1e1b4b 0%, #311042 100%)', border: '2px solid #d946ef', padding: '20px 30px', borderRadius: '20px', marginBottom: '35px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: 'pulse 1.5s infinite' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ fontSize: '3.5rem' }}>👩‍🍳🌯</div>
            <div>
              <h3 style={{ margin: 0, color: '#f472b6' }}>🔥 ŞANS ANLARI: Natali Dükkana Geldi!</h3>
              <p style={{ margin: '5px 0 0 0', color: '#cbd5e1', fontSize: '0.95rem' }}>
                Natali tezgahı kurdu ama acelesi var! <strong>{nataliLeaveTimer} saniye</strong> sonra gidecek. Sıcak döneri <strong>100$</strong>'a kap, 1 dakika boyunca tüm geliştirmeleri **%10 indirimle** patlat!
              </p>
            </div>
          </div>
          <button 
            onClick={buyDonerFromNatali}
            disabled={totalCash < 100}
            style={{ padding: '15px 35px', background: totalCash >= 100 ? '#ec4899' : '#3f1a3a', color: totalCash >= 100 ? '#ffffff' : '#64748b', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: totalCash >= 100 ? 'pointer' : 'not-allowed', boxShadow: totalCash >= 100 ? '0 4px 15px rgba(236,72,153,0.4)' : 'none' }}
          >
            Döner Satın Al ($100)
          </button>
        </div>
      ) : (
        <div style={{ background: '#090d16', border: '1px dashed #1e293b', padding: '15px 30px', borderRadius: '20px', marginBottom: '35px', color: '#475569', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>💤 Natali şu an başka dükkanlarda döner satıyor... (Her 1 dakikada bir %25 ihtimalle buraya uğrar).</span>
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
          <div style={{ color: '#22c55e', fontWeight: 'bold' }}>MALİYET: ${costManual}</div>
        </div>

        <div onClick={hireAutomatedWorker} style={{ background: '#0f172a', padding: '25px', borderRadius: '20px', cursor: 'pointer', border: '1px solid #1e293b' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>OTOMASYON HATTI</div>
          <div style={{ fontSize: '1.1rem', margin: '5px 0' }}>OTOMATİK İŞÇİ (LVL {lvlAutomatedWorkers})</div>
          <div style={{ color: '#22c55e', fontWeight: 'bold' }}>MALİYET: ${costAutomation}</div>
        </div>

        <div onClick={purchaseLogisticsTruck} style={{ background: '#0f172a', padding: '25px', borderRadius: '20px', cursor: 'pointer', border: '2px solid #fbbf24' }}>
          <div style={{ color: '#fbbf24', fontSize: '0.8rem' }}>LOJİSTİK OPERASYONU</div>
          <div style={{ fontSize: '1.1rem', margin: '5px 0' }}>🚚 YÜK KAMYONU (LVL {lvlLogisticsTrucks})</div>
          <div style={{ color: '#22c55e', fontWeight: 'bold' }}>MALİYET: ${costLogistics}</div>
          <small style={{ color: '#64748b' }}>Hız: +0.5 Birim / 3 Saniye</small>
        </div>

        <div onClick={expandMarketingDepth} style={{ background: '#0f172a', padding: '25px', borderRadius: '20px', cursor: 'pointer', border: '1px solid #1e293b' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>PAZARLAMA STRATEJİSİ</div>
          <div style={{ fontSize: '1.1rem', margin: '5px 0' }}>REKLAM KAMPANYASI (LVL {lvlMarketingCampaigns})</div>
          <div style={{ color: '#22c55e', fontWeight: 'bold' }}>MALİYET: ${costMarketing}</div>
        </div>

        <div onClick={expandWarehouseSpace} style={{ background: '#0f172a', padding: '25px', borderRadius: '20px', cursor: 'pointer', border: '1px solid #1e293b' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>DEPOLAMA ALTYAPISI</div>
          <div style={{ fontSize: '1.1rem', margin: '5px 0' }}>MAKSİMUM HACİM (LVL {lvlStorageCapacity})</div>
          <div style={{ color: '#22c55e', fontWeight: 'bold' }}>MALİYET: ${costStorage}</div>
        </div>

      </div>

      <footer style={{ marginTop: '60px', textAlign: 'center', color: '#334155', fontSize: '0.8rem' }}>
        NECMİ'NİN YÜKSELİŞİ v5.1.0 | Kriz Döngüsü: {incidentTimer}s
      </footer>
    </div>
  );
}

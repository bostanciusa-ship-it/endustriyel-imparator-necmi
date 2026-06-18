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
    else if (type === 'gold') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, startTime);
      oscillator.frequency.linearRampToValueAtTime(880, startTime + 0.3);
      gainNode.gain.setValueAtTime(0.15, startTime);
      oscillator.start();
      oscillator.stop(startTime + 0.3);
    }
  } catch (error) {
    console.warn("Ses engellendi.");
  }
};

interface SaveData {
  totalCash: number;
  currentInventory: number;
  currentMarketValue: number;
  lvlManualProduction: number;
  lvlAutomatedWorkers: number;
  lvlMarketingCampaigns: number;
  lvlStorageCapacity: number;
  lvlLogisticsTrucks: number;
  savedAt: string;
}

export default function App() {
  // --- MENÜ VE SAVE SİSTEMİ DURUMLARI ---
  const [isInMainMenu, setIsInMainMenu] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [slotsData, setSlotsData] = useState<{ [key: number]: SaveData | null }>({ 1: null, 2: null, 3: null });

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

  // --- COOKIE CLICKER MANTIĞI: ALTIN TIR DURUMLARI ---
  const [goldTruck, setGoldTruck] = useState<{ x: number; y: number } | null>(null);
  const [frenzyTimer, setFrenzyTimer] = useState(0); 

  // --- RISK ODASI (KUMARHANE) DURUMLARI ---
  const [gambleAmount, setGambleAmount] = useState(50);
  const [gambleResult, setGambleResult] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialDiceResult, setTutorialDiceResult] = useState<string | null>(null);

  // --- NATALİ SİSTEMİ DURUMLARI ---
  const [isNataliHere, setIsNataliHere] = useState(false); 
  const [nataliLeaveTimer, setNataliLeaveTimer] = useState(0); 
  const [nataliArrivalCheckTimer, setNataliArrivalCheckTimer] = useState(60); 
  const [donerBuffTimer, setDonerBuffTimer] = useState(0); 

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

  const stateRef = useRef({ lvlMarketingCampaigns, lvlLogisticsTrucks, currentMarketValue, currentInventory, totalCash, raidStarted, frenzyTimer });
  
  const getHQVisuals = () => {
    if (totalCash < 5000) return { name: "🏚️ Köhne Gecekondu Lojistik", color: '#64748b' };
    if (totalCash < 50000) return { name: "🏭 Prefabrik Dağıtım Merkezi", color: '#3b82f6' };
    if (totalCash < 250000) return { name: "🏢 Çelik Konstrüksiyon Plaza", color: '#a855f7' };
    return { name: "🌐 Siber Global Ahmet-Kıran Kompleksi", color: '#22c55e' };
  };

  useEffect(() => {
    const loadedSlots: { [key: number]: SaveData | null } = { 1: null, 2: null, 3: null };
    for (let i = 1; i <= 3; i++) {
      const saved = localStorage.getItem(`necmi_save_slot_${i}`);
      if (saved) {
        try { loadedSlots[i] = JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    setSlotsData(loadedSlots);
  }, [isInMainMenu]);

  useEffect(() => {
    stateRef.current = { lvlMarketingCampaigns, lvlLogisticsTrucks, currentMarketValue, currentInventory, totalCash, raidStarted, frenzyTimer };
    if (totalCash >= 1000000 && !raidStarted && gameStarted && !isInMainMenu) {
      setRaidStarted(true);
      playSfx('buy');
    }
  }, [lvlMarketingCampaigns, lvlLogisticsTrucks, currentMarketValue, currentInventory, totalCash, raidStarted, gameStarted, isInMainMenu, frenzyTimer]);

  const storyDialogs = [
    "📍 AHMET HOLDİNG - MERKEZ OFİS (KOVULMA ANI)...",
    "💼 Ahmet Bey: 'Duyduklarıma göre lojistiği büyütecekmişsin Necmi? Kamyon filosu falan... Gereksiz!'",
    "💼 Ahmet Bey: 'Burada kuralları ben koyarım Necmi! Kovuldun! Şimdi git o projelerini başka yerde sat!'",
    "🚪 *KAPISI ÇARPIP DÜKKANDAN ÇIKARSIN VE HOLDİNG BİNASININ ÖNÜNDE TEK BAŞINA KALIRSIN...*",
    "🔥 Necmi (Kendi Kendine): 'Eski patronumdan intikam almalıyım, milyoner olmalıyım! Sıfırdan başlayıp tam 1 MİLYON DOLAR yapacağım!'",
    "🚀 Necmi (Kendi Kendine): 'O 1 milyonu kasaya koyduğum gün, senin o köhne şirketi borsadan tamamen sileceğim ****** çocuğu! İZLE VE GÖR!'"
  ];

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

  const saveGame = () => {
    if (selectedSlot === null) return;
    const dataToSave: SaveData = {
      totalCash, currentInventory, currentMarketValue, lvlManualProduction,
      lvlAutomatedWorkers, lvlMarketingCampaigns, lvlStorageCapacity, lvlLogisticsTrucks,
      savedAt: new Date().toLocaleTimeString()
    };
    localStorage.setItem(`necmi_save_slot_${selectedSlot}`, JSON.stringify(dataToSave));
    playSfx('buy');
    setSlotsData(prev => ({ ...prev, [selectedSlot]: dataToSave }));
    alert(`Oyun Başarıyla Slot ${selectedSlot}'e Kaydedildi!`);
  };

  const handleStartGame = () => {
    if (selectedSlot === null) {
      playSfx('alert');
      alert("Lütfen oynamak veya sıfırdan başlamak için bir Slot seçin!");
      return;
    }
    playSfx('click');
    const slotData = slotsData[selectedSlot];
    if (slotData) {
      setTotalCash(slotData.totalCash);
      setCurrentInventory(slotData.currentInventory);
      setCurrentMarketValue(slotData.currentMarketValue);
      setLvlManualProduction(slotData.lvlManualProduction);
      setLvlAutomatedWorkers(slotData.lvlAutomatedWorkers);
      setLvlMarketingCampaigns(slotData.lvlMarketingCampaigns);
      setLvlStorageCapacity(slotData.lvlStorageCapacity);
      setLvlLogisticsTrucks(slotData.lvlLogisticsTrucks ?? 0);
      setIsInMainMenu(false);
      setGameStarted(true);
    } else {
      setTotalCash(250); setCurrentInventory(0); setLvlManualProduction(1);
      setLvlAutomatedWorkers(0); setLvlMarketingCampaigns(1); setLvlStorageCapacity(1); setLvlLogisticsTrucks(0);
      setIsInMainMenu(false); setIntroStage(0);
    }
  };

  const handleGoldTruckClick = () => {
    playSfx('gold');
    setFrenzyTimer(15); 
    setGoldTruck(null);
  };

  // --- GERÇEK KAZANÇ / BATMA KUMAR MEKANİZMASI ---
  const handleGamble = () => {
    if (totalCash < gambleAmount || gambleAmount <= 0) {
      playSfx('alert');
      setGambleResult("❌ Kasanda bu kadar nakit yok!");
      return;
    }
    playSfx('click');
    
    // 1 ile 6 arasında rastgele bir zar
    const dice = Math.floor(Math.random() * 6) + 1;
    
    if (dice >= 1 && dice <= 3) {
      // 1, 2, 3 gelirse: BATALIM!
      setTotalCash(prev => Math.max(0, prev - gambleAmount));
      setGambleResult(`🎲 Zar: ${dice} | 🟥 BATTIK! Kumar Pişmanlıktır. Kasadan -$${gambleAmount} uçtu.`);
      playSfx('alert');
    } else {
      // 4, 5, 6 gelirse: X2 KATLAYALIM!
      setTotalCash(prev => prev + gambleAmount);
      setGambleResult(`🎲 Zar: ${dice} | 🟩 KATLANDI! Şansın yaver gitti ve +$${gambleAmount} kazandın! (Ama unutma, kasa hep kazanır!)`);
      playSfx('buy');
    }
  };

  // --- ÜCRETSİZ / RİSKSİZ ÖĞRETİCİ ZARI ---
  const handleTutorialGamble = () => {
    playSfx('click');
    const dice = Math.floor(Math.random() * 6) + 1;
    if (dice >= 1 && dice <= 3) {
      setTutorialDiceResult(`🎲 Öğretici Zarı: ${dice} | 🟥 Bak gördün mü? 1-3 arası geldi ve SANAL paran battı! Gerçek olsaydı her şeyini kaybetmiştin.`);
    } else {
      setTutorialDiceResult(`🎲 Öğretici Zarı: ${dice} | 🟩 Şansına 4-6 arası geldi ve SANAL olarak X2 katladın. Ama gerçek riskte bu kadar şanslı olmayabilirsin!`);
    }
  };

  useEffect(() => {
    if (isInMainMenu || gameStarted) return;
    let charIndex = 0; setIntroText("");
    const currentLine = storyDialogs[introStage];
    const typingInterval = setInterval(() => {
      if (charIndex < currentLine.length) {
        setIntroText((prev) => prev + currentLine.charAt(charIndex));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          if (introStage < storyDialogs.length - 1) setIntroStage(prev => prev + 1);
          else { setGameStarted(true); playSfx('buy'); }
        }, 3200);
      }
    }, 30);
    return () => clearInterval(typingInterval);
  }, [introStage, gameStarted, isInMainMenu]);

  useEffect(() => {
    if (!raidStarted) return;
    let charIndex = 0; setRaidText("");
    const currentLine = raidDialogs[raidStage];
    const typingInterval = setInterval(() => {
      if (charIndex < currentLine.length) {
        setRaidText((prev) => prev + currentLine.charAt(charIndex));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          if (raidStage < raidDialogs.length - 1) setRaidStage(prev => prev + 1);
        }, 4000);
      }
    }, 35);
    return () => clearInterval(typingInterval);
  }, [raidStarted, raidStage]);

  const handleNataliYes = () => {
    if (totalCash >= 100) {
      setTotalCash(prev => prev - 100); setDonerBuffTimer(60); setIsNataliHere(false); setNataliLeaveTimer(0); playSfx('buy');
    } else { playSfx('alert'); }
  };

  const getDiscountedCost = (baseCost: number) => donerBuffTimer > 0 ? Math.floor(baseCost * 0.90) : baseCost;

  const costManual = getDiscountedCost(Math.floor(200 * Math.pow(1.25, lvlManualProduction - 1)));
  const costAutomation = getDiscountedCost(Math.floor(500 * Math.pow(1.28, lvlAutomatedWorkers)));
  const costMarketing = getDiscountedCost(Math.floor(600 * Math.pow(1.22, lvlMarketingCampaigns - 1)));
  const costStorage = getDiscountedCost(Math.floor(650 * Math.pow(1.20, lvlStorageCapacity - 1)));
  const costLogistics = getDiscountedCost(Math.floor(550 * Math.pow(1.35, lvlLogisticsTrucks)));

  const upgradeManualPower = () => { if (totalCash >= costManual) { setTotalCash(prev => prev - costManual); setLvlManualProduction(prev => prev + 1); playSfx('buy'); } };
  const hireAutomatedWorker = () => { if (totalCash >= costAutomation) { setTotalCash(prev => prev - costAutomation); setLvlAutomatedWorkers(prev => prev + 1); playSfx('buy'); } };
  const expandMarketingDepth = () => { if (totalCash >= costMarketing) { setTotalCash(prev => prev - costMarketing); setLvlMarketingCampaigns(prev => prev + 1); playSfx('buy'); } };
  const expandWarehouseSpace = () => { if (totalCash >= costStorage) { setTotalCash(prev => prev - costStorage); setLvlStorageCapacity(prev => prev + 1); playSfx('buy'); } };
  const purchaseLogisticsTruck = () => { if (totalCash >= costLogistics) { setTotalCash(prev => prev - costLogistics); setLvlLogisticsTrucks(prev => prev + 1); playSfx('buy'); } };

  const handleResolve = () => {
    if (!activeIncident) return;
    if (isStrikeActive && totalCash < 100) return;
    if (isStrikeActive) setTotalCash(c => c - 100);
    setActiveIncident(null); setIsStrikeActive(false); playSfx('buy');
  };

  useEffect(() => {
    if (isInMainMenu || !gameStarted || stateRef.current.raidStarted) return;

    const marketFluxInterval = setInterval(() => {
      setCurrentMarketValue(oldPrice => {
        const volatility = (Math.random() * 8 - 4);
        const updatedPrice = Math.max(12, Math.min(48, oldPrice + volatility));
        setMarketDirection(updatedPrice > oldPrice ? 'up' : 'down');
        return updatedPrice;
      });
    }, 5000);

    const goldTruckSpawnInterval = setInterval(() => {
      if (Math.random() < 0.35 && !goldTruck) {
        const randomX = Math.floor(Math.random() * (window.innerWidth - 120));
        const randomY = Math.floor(Math.random() * (window.innerHeight - 120));
        setGoldTruck({ x: randomX, y: randomY });
        setTimeout(() => setGoldTruck(null), 5000);
      }
    }, 25000);

    const systemHeartbeat = setInterval(() => {
      setDonerBuffTimer(prev => (prev > 0 ? prev - 1 : 0));
      setFrenzyTimer(prev => (prev > 0 ? prev - 1 : 0));

      setNataliLeaveTimer(prev => {
        if (prev <= 1 && isNataliHere) { setIsNataliHere(false); return 0; }
        return prev > 0 ? prev - 1 : 0;
      });

      setNataliArrivalCheckTimer(prevTime => {
        if (prevTime <= 1) {
          if (Math.random() <= 0.25 && !isNataliHere) {
            setIsNataliHere(true); setNataliLeaveTimer(30); playSfx('buy');
          }
          return 60; 
        }
        return prevTime - 1;
      });

      if (!isStrikeActive) {
        setCurrentInventory(inventory => {
          const capacityLimit = lvlStorageCapacity * 40;
          const isFrenzy = stateRef.current.frenzyTimer > 0;
          const productionOutput = (lvlAutomatedWorkers * 0.25) * (isFrenzy ? 5 : 1);
          return Math.min(inventory + productionOutput, capacityLimit);
        });
      }

      setShipmentCountdown(currentSec => {
        if (currentSec <= 1) {
          const currentRefData = stateRef.current;
          const isFrenzy = currentRefData.frenzyTimer > 0;
          const unitsToSell = (1 + (currentRefData.lvlMarketingCampaigns * 0.25) + (currentRefData.lvlLogisticsTrucks * 0.5)) * (isFrenzy ? 3 : 1);
          
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
        setActiveIncident(null); setIsStrikeActive(false); setIncidentTimer(120); playSfx('alert');
      }
    }, 1000);

    return () => { clearInterval(marketFluxInterval); clearInterval(systemHeartbeat); clearInterval(goldTruckSpawnInterval); };
  }, [gameStarted, isInMainMenu, isStrikeActive, activeIncident, lvlStorageCapacity, lvlAutomatedWorkers, isNataliHere, goldTruck]);

  if (isInMainMenu) {
    return (
      <div style={{ backgroundColor: '#020617', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#f8fafc', fontFamily: 'monospace', padding: '20px' }}>
        <div style={{ maxWidth: '650px', width: '100%', background: '#0f172a', border: '3px solid #3b82f6', padding: '40px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 0 40px rgba(59, 130, 246, 0.25)' }}>
          <h1 style={{ color: '#3b82f6', fontSize: '2.2rem', marginBottom: '10px', letterSpacing: '1px' }}>NECMİ'NİN YÜKSELİŞİ</h1>
          <p style={{ color: '#64748b', marginBottom: '30px', fontSize: '0.95rem' }}>Lütfen oynamak istediğiniz kayıt barını seçin:</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '35px' }}>
            {[1, 2, 3].map((slotNumber) => {
              const hasData = slotsData[slotNumber] !== null;
              const isSelected = selectedSlot === slotNumber;
              const data = slotsData[slotNumber];

              return (
                <div 
                  key={slotNumber}
                  onClick={() => { setSelectedSlot(slotNumber); playSfx('click'); }}
                  style={{
                    padding: '20px', borderRadius: '14px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease',
                    backgroundColor: isSelected ? '#1e293b' : '#090d16',
                    border: isSelected ? '2px solid #22c55e' : '2px solid #1e293b',
                    boxShadow: isSelected ? '0 0 15px rgba(34, 197, 148, 0.2)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: isSelected ? '#22c55e' : '#f8fafc', fontSize: '1.1rem' }}>
                      💾 SLOT {slotNumber} {isSelected && "• (SEÇİLDİ)"}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                      {hasData ? `Son Kayıt: ${data?.savedAt}` : "BOŞ YUVA"}
                    </span>
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#94a3b8' }}>
                    {hasData ? (
                      <div>💰 Kasa: <strong style={{ color: '#22c55e' }}>${Math.floor(data!.totalCash).toLocaleString()}</strong> | 📦 Stok: <strong>{data!.currentInventory.toFixed(0)} b.</strong></div>
                    ) : (
                      <span style={{ color: '#475569', fontStyle: 'italic' }}>Kayıtlı dosya yok.</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleStartGame}
            style={{
              width: '100%', padding: '20px', fontSize: '1.3rem', fontWeight: 'bold', border: 'none', borderRadius: '14px',
              backgroundColor: selectedSlot !== null ? '#22c55e' : '#334155', color: selectedSlot !== null ? '#020617' : '#64748b',
              cursor: selectedSlot !== null ? 'pointer' : 'not-allowed'
            }}
          >
            BAŞLAT / DEVAM ET
          </button>
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div style={{ backgroundColor: '#020617', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#f8fafc', fontFamily: 'monospace', padding: '20px', position: 'relative' }}>
        <button 
          onClick={() => { setGameStarted(true); playSfx('buy'); }}
          style={{ position: 'absolute', top: '30px', right: '30px', padding: '12px 30px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', borderRadius: '10px', color: '#fecaca', fontWeight: 'bold', cursor: 'pointer' }}
        >
          ⏭️ HİKAYEYİ GEÇ
        </button>
        <div style={{ maxWidth: '700px', background: 'rgba(15, 23, 42, 0.85)', border: '2px solid rgba(59, 130, 246, 0.6)', padding: '45px', borderRadius: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '4.5rem', marginBottom: '25px' }}>💼🚪</div>
          <div style={{ minHeight: '140px', fontSize: '1.45rem', lineHeight: '1.65', color: '#38bdf8' }}>{introText}</div>
        </div>
      </div>
    );
  }

  if (raidStarted) {
    return (
      <div style={{ backgroundColor: '#020617', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#f8fafc', fontFamily: 'monospace', padding: '20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '750px', background: 'rgba(10, 15, 30, 0.95)', border: '3px solid #22c55e', padding: '50px', borderRadius: '30px' }}>
          <div style={{ fontSize: '5.5rem', marginBottom: '20px' }}>💸👑</div>
          <div style={{ minHeight: '160px', fontSize: '1.5rem', color: '#e2e8f0', fontWeight: 'bold' }}>{raidText}</div>
          {raidStage === raidDialogs.length - 1 && (
            <button onClick={() => window.location.reload()} style={{ padding: '18px 45px', background: '#22c55e', color: '#020617', border: 'none', borderRadius: '16px', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer', marginTop: '30px' }}>
              MENÜYE DÖN
            </button>
          )}
        </div>
      </div>
    );
  }

  const hqInfo = getHQVisuals();

  return (
    <div style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc', fontFamily: 'Segoe UI, sans-serif', padding: '40px', paddingBottom: '120px', position: 'relative' }}>
      
      {/* 🎰 KUMAR ÖĞRETİCİSİ PANELİ (POP-UP OVERLAY) */}
      {showTutorial && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(2, 6, 23, 0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, padding: '20px' }}>
          <div style={{ maxWidth: '600px', width: '100%', background: '#0f172a', border: '3px dashed #a855f7', padding: '35px', borderRadius: '24px', textAlign: 'center', position: 'relative' }}>
            
            {/* SAĞ ÜSTTEKİ GEÇME TUŞU */}
            <button 
              onClick={() => { setShowTutorial(false); setTutorialDiceResult(null); playSfx('click'); }} 
              style={{ position: 'absolute', top: '20px', right: '20px', background: '#334155', color: '#94a3b8', border: 'none', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
            >
              ⏭️ ÖĞRETİCİSİ GEÇ
            </button>

            <h2 style={{ color: '#a855f7', marginTop: 0 }}>🎰 Necmi'nin Yeraltı Kumar Rehberi</h2>
            
            <div style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '12px', textAlign: 'left', fontSize: '0.95rem', lineHeight: '1.5', color: '#cbd5e1', marginBottom: '20px' }}>
              <p><strong>❓ Kumar Nedir ve Ne Yapar?</strong> Yavaş giden üretim sürecinden sıkıldıysan, kasandaki paranın bir kısmını riske atarak hızlıca zenginleşmeni ya da tamamen batmanı sağlayan tehlikeli bir yan odadır.</p>
              <p><strong>🎲 Kurallar Çok Basit:</strong> 1 ile 6 arasında rastgele bir zar atılır.</p>
              <ul>
                <li>🎲 <strong style={{ color: '#ef4444' }}>Zar 1, 2 veya 3 gelirse:</strong> Ortaya koyduğun tüm parayı kaybeder, <strong>BATARSIN!</strong></li>
                <li>🎲 <strong style={{ color: '#22c55e' }}>Zar 4, 5 veya 6 gelirse:</strong> Ortaya koyduğun para tam <strong>2 KATINA (X2)</strong> katlanır!</li>
              </ul>
              <p style={{ color: '#f43f5e', fontWeight: 'bold', textAlign: 'center', border: '1px dashed #f43f5e', padding: '8px', borderRadius: '8px', marginTop: '10px' }}>
                🚨 SPOILER (ÖNEMLİ UYARI): Kumar kesinlikle KÖTÜDÜR! Kasa her zaman %52 kazanma avantajına sahiptir. Ahmet'ten intikam alacağım diye tüm şirketi buraya yatırırsan donuna kadar batarsın reisim, dikkat et!
              </p>
            </div>

            <div style={{ background: '#020617', padding: '20px', borderRadius: '14px', border: '1px solid #475569', marginBottom: '15px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#eab308' }}>💸 Risksiz Bedava Deneme Zarı</h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 15px 0' }}>Sıfır maliyet, para kaybetmek yok. Şansını test et!</p>
              <button onClick={handleTutorialGamble} style={{ background: '#eab308', color: '#020617', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 'bold', cursor: 'pointer' }}>🎲 Zar At (Bedava)</button>
              {tutorialDiceResult && <div style={{ marginTop: '15px', fontWeight: 'bold', color: '#f8fafc', fontSize: '0.95rem' }}>{tutorialDiceResult}</div>}
            </div>

            <button 
              onClick={() => { setShowTutorial(false); setTutorialDiceResult(null); playSfx('buy'); }} 
              style={{ width: '100%', padding: '12px', background: '#22c55e', color: '#020617', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '1.05rem', cursor: 'pointer', marginTop: '10px' }}
            >
              KURALI ANLADIM, GERÇEK MASAYA GÖTÜR!
            </button>
          </div>
        </div>
      )}

      {goldTruck && (
        <div 
          onClick={handleGoldTruckClick}
          style={{
            position: 'absolute', left: `${goldTruck.x}px`, top: `${goldTruck.y}px`,
            fontSize: '3.5rem', cursor: 'pointer', zIndex: 10000,
            animation: 'bounce 0.5s infinite alternate', filter: 'drop-shadow(0 0 20px #eab308)',
            userSelect: 'none'
          }}
          title="ÇILGINLIK İÇİN TIKLA!"
        >
          ✨🚚✨
        </div>
      )}

      {frenzyTimer > 0 && (
        <div style={{ background: 'linear-gradient(90deg, #eab308, #ca8a04)', padding: '15px', borderRadius: '14px', textAlign: 'center', fontWeight: 'bold', color: '#020617', marginBottom: '25px', boxShadow: '0 0 25px rgba(234,179,8,0.5)', fontSize: '1.2rem', animation: 'pulse 1s infinite' }}>
          ⚡ X5 ÜRETİM VE SEVKİYAT ÇILGINLIĞI AKTİF! SÜRE: {frenzyTimer}sn ⚡
        </div>
      )}

      {isNataliHere && (
        <div style={{ background: '#1e1b4b', border: '2px solid #3b82f6', padding: '15px 25px', borderRadius: '12px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Natali geldi döner almak istermisin 100 dolar ({nataliLeaveTimer}sn)</span>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={handleNataliYes} disabled={totalCash < 100} style={{ padding: '8px 25px', background: totalCash >= 100 ? '#22c55e' : '#1e293b', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Evet</button>
            <button onClick={() => setIsNataliHere(false)} style={{ padding: '8px 25px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Hayır</button>
          </div>
        </div>
      )}

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #1e293b', paddingBottom: '20px', marginBottom: '40px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#3b82f6' }}>... NECMİ'NİN GLOBAL LOJİSTİK ÜSSÜ ...</h2>
          <div style={{ display: 'inline-block', marginTop: '6px', padding: '6px 16px', borderRadius: '8px', background: '#0f172a', border: `1px solid ${hqInfo.color}`, color: hqInfo.color, fontWeight: 'bold', fontSize: '0.9rem' }}>
            Şirket Statüsü: {hqInfo.name}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button onClick={() => { setIsInMainMenu(true); setGameStarted(false); playSfx('click'); }} style={{ padding: '10px 18px', background: '#1e293b', color: 'white', border: '1px solid #3b82f6', borderRadius: '10px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 'bold' }}>🏠 ANA MENÜ</button>
          <div style={{ background: '#0f172a', padding: '15px 25px', borderRadius: '15px', border: '1px solid #3b82f6', textAlign: 'right' }}>
            <small style={{ color: '#64748b' }}>BASKINA KALAN PARA</small>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>${Math.max(0, 1000000 - Math.floor(totalCash)).toLocaleString()}</div>
          </div>
          <div style={{ background: '#0f172a', padding: '15px 25px', borderRadius: '15px', border: `1px solid ${marketDirection === 'up' ? '#22c55e' : '#ef4444'}`, textAlign: 'right' }}>
            <small style={{ color: '#64748b' }}>BORSA DEĞERİ</small>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: marketDirection === 'up' ? '#22c55e' : '#ef4444' }}>${currentMarketValue.toFixed(2)}</div>
          </div>
        </div>
      </header>

      {activeIncident && (
        <div style={{ backgroundColor: '#7f1d1d', border: '2px solid #ef4444', padding: '25px', borderRadius: '20px', marginBottom: '40px', textAlign: 'center' }}>
          <h2 style={{ margin: 0, color: '#fecaca' }}>⚠️ KRİZ: {activeIncident.title}</h2>
          <button onClick={handleResolve} style={{ padding: '12px 40px', background: '#f8fafc', color: '#7f1d1d', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>KRİZE MÜDAHALE ET {isStrikeActive && "(-100$)"}</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '30px', marginBottom: '50px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px', background: '#0f172a', padding: '30px', borderRadius: '25px', border: '1px solid #1e293b', textAlign: 'center' }}>
          <div style={{ color: '#64748b', marginBottom: '10px' }}>NECMİ'NİN KASASI</div>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#22c55e' }}>${Math.floor(totalCash).toLocaleString()}</div>
        </div>
        
        <div style={{ flex: 1, minWidth: '250px', background: '#0f172a', padding: '30px', borderRadius: '25px', border: '1px solid #1e293b', textAlign: 'center' }}>
          <div style={{ color: '#64748b', marginBottom: '10px' }}>STOK DURUMU</div>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#eab308' }}>{currentInventory.toFixed(1)} / {lvlStorageCapacity * 40}</div>
          <div style={{ fontSize: '0.8rem', color: '#3b82f6', marginTop: '10px', fontWeight: 'bold' }}>🚚 SEVKİYAT: {shipmentCountdown}sn</div>
        </div>

        {/* 🎰 SİMGEYE VEYA BUTONA TIKLAYINCA ÖĞRETİCİ AÇILAN KISIM */}
        <div style={{ flex: 1.2, minWidth: '320px', background: '#111827', padding: '25px', borderRadius: '25px', border: '2px dashed #a855f7', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            {/* SİMGE tıklanırsa öğretici açılır */}
            <span 
              onClick={() => { setShowTutorial(true); playSfx('click'); }} 
              style={{ fontSize: '1.4rem', cursor: 'pointer' }} 
              title="Öğreticiyi Açmak İçin Tıkla!"
            >
              🎰
            </span>
            <span style={{ color: '#a855f7', fontWeight: 'bold', fontSize: '1.1rem' }}>YERALTI RISK ODASI</span>
            <button 
              onClick={() => { setShowTutorial(true); playSfx('click'); }}
              style={{ background: '#3b82f6', color: 'white', border: 'none', borderBlock: 'none', borderRadius: '6px', padding: '2px 8px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Nasıl Oynanır?
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '10px' }}>
            <input 
              type="number" 
              value={gambleAmount} 
              onChange={(e) => setGambleAmount(Math.max(1, parseInt(e.target.value) || 0))}
              style={{ width: '90px', background: '#1f2937', border: '1px solid #a855f7', color: 'white', borderRadius: '8px', padding: '8px', fontSize: '1rem', textAlign: 'center' }}
            />
            <button onClick={handleGamble} style={{ background: '#a855f7', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 15px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}>Zar At (Gerçek)</button>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center', marginBottom: '5px' }}>(Zar 1-3: Batış | Zar 4-6: 2X Kazanç)</div>
          {gambleResult && <div style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 'bold', marginTop: '8px' }}>{gambleResult}</div>}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <button 
          onClick={() => { if(!isStrikeActive && currentInventory < (lvlStorageCapacity * 40)) { const fMultiplier = frenzyTimer > 0 ? 5 : 1; setCurrentInventory(prev => Math.min(prev + (lvlManualProduction * fMultiplier), lvlStorageCapacity * 40)); playSfx('click'); } }}
          style={{ 
            padding: '35px 100px', fontSize: '1.8rem', fontWeight: 'bold', borderRadius: '25px', border: 'none',
            backgroundColor: (isStrikeActive || currentInventory >= lvlStorageCapacity * 40) ? '#334155' : '#3b82f6',
            color: 'white', cursor: 'pointer', boxShadow: '0 10px 0 #1d4ed8'
          }}
        >
          {isStrikeActive ? "GREV VAR: ÜRETİM DURDU" : currentInventory >= (lvlStorageCapacity * 40) ? "DEPO DOLU" : frenzyTimer > 0 ? "🔥 ÇILGIN MANUEL ÜRETİM (X5) 🔥" : "MANUEL ÜRETİM YAP"}
        </button>
      </div>

      <h3 style={{ marginBottom: '25px', color: '#3b82f6', borderLeft: '4px solid #3b82f6', paddingLeft: '15px' }}>YATIRIM VE GELİŞTİRME FIRSATLARI</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
        <div onClick={upgradeManualPower} style={{ background: '#0f172a', padding: '25px', borderRadius: '20px', cursor: 'pointer', border: '1px solid #1e293b' }}>
          <div>TIK BAŞINA ÜRETİM (LVL {lvlManualProduction})</div>
          <div style={{ color: '#22c55e', fontWeight: 'bold' }}>MALİYET: ${costManual}</div>
        </div>
        <div onClick={hireAutomatedWorker} style={{ background: '#0f172a', padding: '25px', borderRadius: '20px', cursor: 'pointer', border: '1px solid #1e293b' }}>
          <div>OTOMATİK İŞÇİ (LVL {lvlAutomatedWorkers})</div>
          <div style={{ color: '#22c55e', fontWeight: 'bold' }}>MALİYET: ${costAutomation}</div>
        </div>
        <div onClick={purchaseLogisticsTruck} style={{ background: '#0f172a', padding: '25px', borderRadius: '20px', cursor: 'pointer', border: '2px solid #fbbf24' }}>
          <div>🚚 YÜK KAMYONU (LVL {lvlLogisticsTrucks})</div>
          <div style={{ color: '#22c55e', fontWeight: 'bold' }}>MALİYET: ${costLogistics}</div>
        </div>
        <div onClick={expandMarketingDepth} style={{ background: '#0f172a', padding: '25px', borderRadius: '20px', cursor: 'pointer', border: '1px solid #1e293b' }}>
          <div>REKLAM KAMPANYASI (LVL {lvlMarketingCampaigns})</div>
          <div style={{ color: '#22c55e', fontWeight: 'bold' }}>MALİYET: ${costMarketing}</div>
        </div>
        <div onClick={expandWarehouseSpace} style={{ background: '#0f172a', padding: '25px', borderRadius: '20px', cursor: 'pointer', border: '1px solid #1e293b' }}>
          <div>MAKSİMUM HACİM (LVL {lvlStorageCapacity})</div>
          <div style={{ color: '#22c55e', fontWeight: 'bold' }}>MALİYET: ${costStorage}</div>
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: '25px', right: '25px', background: 'rgba(15, 23, 42, 0.95)', border: '2px solid #22c55e', padding: '15px 20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 9999 }}>
        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold' }}>📍 AKTİF: SLOT {selectedSlot}</span>
        <button onClick={saveGame} style={{ padding: '10px 25px', background: '#22c55e', color: '#020617', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>💾 OYUNU KAYDET (SAVE)</button>
      </div>

      <style>{`
        @keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-15px); } }
        @keyframes pulse { 0% { opacity: 0.9; } 50% { opacity: 1; } 100% { opacity: 0.9; } }
      `}</style>
    </div>
  );
}

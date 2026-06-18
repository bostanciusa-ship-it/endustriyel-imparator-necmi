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

// Kayıt Dosyası Tipi
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
  const [slotsData, setSlotsData] = useState<{ [key: number]: SaveData | null }>({
    1: null,
    2: null,
    3: null
  });

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

  const stateRef = useRef({ lvlMarketingCampaigns, lvlLogisticsTrucks, currentMarketValue, currentInventory, totalCash, raidStarted });
  
  // İlk açılışta lokal kayıtları kontrol etme
  useEffect(() => {
    const loadedSlots: { [key: number]: SaveData | null } = { 1: null, 2: null, 3: null };
    for (let i = 1; i <= 3; i++) {
      const saved = localStorage.getItem(`necmi_save_slot_${i}`);
      if (saved) {
        try {
          loadedSlots[i] = JSON.parse(saved);
        } catch (e) {
          console.error("Kayıt okuma hatası", e);
        }
      }
    }
    setSlotsData(loadedSlots);
  }, [isInMainMenu]);

  useEffect(() => {
    stateRef.current = { lvlMarketingCampaigns, lvlLogisticsTrucks, currentMarketValue, currentInventory, totalCash, raidStarted };
    if (totalCash >= 1000000 && !raidStarted && gameStarted && !isInMainMenu) {
      setRaidStarted(true);
      playSfx('buy');
    }
  }, [lvlMarketingCampaigns, lvlLogisticsTrucks, currentMarketValue, currentInventory, totalCash, raidStarted, gameStarted, isInMainMenu]);

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

  // OYUNU KAYDETME FONKSİYONU
  const saveGame = () => {
    if (selectedSlot === null) return;
    const dataToSave: SaveData = {
      totalCash,
      currentInventory,
      currentMarketValue,
      lvlManualProduction,
      lvlAutomatedWorkers,
      lvlMarketingCampaigns,
      lvlStorageCapacity,
      lvlLogisticsTrucks,
      savedAt: new Date().toLocaleTimeString()
    };
    localStorage.setItem(`necmi_save_slot_${selectedSlot}`, JSON.stringify(dataToSave));
    playSfx('buy');
    alert(`Oyun Başarıyla Slot ${selectedSlot}'e Kaydedildi!`);
  };

  // OYUNU BAŞLATMA VE YÜKLEME KARARI
  const handleStartGame = () => {
    if (selectedSlot === null) {
      playSfx('alert');
      alert("Lütfen oynamak veya sıfırdan başlamak için bir Slot seçin!");
      return;
    }
    
    playSfx('click');
    const slotData = slotsData[selectedSlot];

    if (slotData) {
      // Eğer bu slotta kayıtlı data varsa, İntro olmadan direkt yükle
      setTotalCash(slotData.totalCash);
      setCurrentInventory(slotData.currentInventory);
      setCurrentMarketValue(slotData.currentMarketValue);
      setLvlManualProduction(slotData.lvlManualProduction);
      setLvlAutomatedWorkers(slotData.lvlAutomatedWorkers);
      setLvlMarketingCampaigns(slotData.lvlMarketingCampaigns);
      setLvlStorageCapacity(slotData.lvlStorageCapacity);
      setLvlLogisticsTrucks(slotData.lvlLogisticsTrucks);
      
      setIsInMainMenu(false);
      setGameStarted(true);
    } else {
      // Dosya yoksa, varsayılan ayarlarla Hikaye (Intro) modunu başlat
      setTotalCash(250);
      setCurrentInventory(0);
      setLvlManualProduction(1);
      setLvlAutomatedWorkers(0);
      setLvlMarketingCampaigns(1);
      setLvlStorageCapacity(1);
      setLvlLogisticsTrucks(0);

      setIsInMainMenu(false);
      setIntroStage(0);
    }
  };

  // INTRO DAKTİLO EFEKTİ
  useEffect(() => {
    if (isInMainMenu || gameStarted) return;
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
  }, [introStage, gameStarted, isInMainMenu]);

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

  const handleNataliYes = () => {
    if (totalCash >= 100) {
      setTotalCash(prev => prev - 100);
      setDonerBuffTimer(60); 
      setIsNataliHere(false); 
      setNataliLeaveTimer(0);
      playSfx('buy');
    } else {
      playSfx('alert');
    }
  };

  const handleNataliNo = () => {
    setIsNataliHere(false);
    setNataliLeaveTimer(0);
    playSfx('click');
  };

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
    if (isInMainMenu || !gameStarted || stateRef.current.raidStarted) return;

    const marketFluxInterval = setInterval(() => {
      setCurrentMarketValue(oldPrice => {
        const volatility = (Math.random() * 8 - 4);
        const updatedPrice = Math.max(12, Math.min(48, oldPrice + volatility));
        setMarketDirection(updatedPrice > oldPrice ? 'up' : 'down');
        return updatedPrice;
      });
    }, 5000);

    const systemHeartbeat = setInterval(() => {
      setDonerBuffTimer(prev => (prev > 0 ? prev - 1 : 0));

      setNataliLeaveTimer(prev => {
        if (prev <= 1 && isNataliHere) {
          setIsNataliHere(false); 
          return 0;
        }
        return prev > 0 ? prev - 1 : 0;
      });

      setNataliArrivalCheckTimer(prevTime => {
        if (prevTime <= 1) {
          const rollDice = Math.random(); 
          if (rollDice <= 0.25 && !isNataliHere) {
            setIsNataliHere(true);
            setNataliLeaveTimer(30); 
            playSfx('buy');
          }
          return 60; 
        }
        return prevTime - 1;
      });

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
  }, [gameStarted, isInMainMenu, isStrikeActive, activeIncident, lvlStorageCapacity, lvlAutomatedWorkers, isNataliHere]);

  // --- EKRAN 0: YENİ GİRİŞ VE 3'LÜ SAVE SLOT SEÇİM MENÜSÜ ---
  if (isInMainMenu) {
    return (
      <div style={{ backgroundColor: '#020617', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#f8fafc', fontFamily: 'monospace', padding: '20px' }}>
        <div style={{ maxWidth: '650px', width: '100%', background: '#0f172a', border: '3px solid #3b82f6', padding: '40px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 0 40px rgba(59, 130, 246, 0.25)' }}>
          <h1 style={{ color: '#3b82f6', fontSize: '2.2rem', marginBottom: '10px', letterSpacing: '1px' }}>NECMİ'NİN YÜKSELİŞİ</h1>
          <p style={{ color: '#64748b', marginBottom: '30px', fontSize: '0.95rem' }}>Lütfen oynamak istediğiniz kayıt barını (save dosyasını) seçin:</p>
          
          {/* 3 ADET SAVE BARI */}
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
                      <div>
                        💰 Kasa: <strong style={{ color: '#22c55e' }}>${Math.floor(data!.totalCash).toLocaleString()}</strong> | 📦 Stok: <strong>{data!.currentInventory.toFixed(0)} birim</strong> | 🛞 Tır Gücü: <strong>Lvl {data!.lvlLogisticsTrucks}</strong>
                      </div>
                    ) : (
                      <span style={{ color: '#475569', fontStyle: 'italic' }}>Kayıtlı dosya yok. Seçilirse sıfırdan hikaye başlar.</span>
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
              backgroundColor: selectedSlot !== null ? '#22c55e' : '#334155',
              color: selectedSlot !== null ? '#020617' : '#64748b',
              cursor: selectedSlot !== null ? 'pointer' : 'not-allowed',
              boxShadow: selectedSlot !== null ? '0 5px 15px rgba(34,197,94,0.3)' : 'none'
            }}
          >
            BAŞLAT / DEVAM ET
          </button>
        </div>
      </div>
    );
  }

  // --- EKRAN 1: SİNEMATİK INTRO EKRANI (HİKAYEYİ GEÇ TUŞLU) ---
  if (!gameStarted) {
    const isAhmetSpeaking = introStage <= 2;
    const isTransitionStage = introStage === 3;
    
    return (
      <div style={{ backgroundColor: '#020617', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#f8fafc', fontFamily: 'monospace', padding: '20px', textAlign: 'center', overflow: 'hidden', position: 'relative' }}>
        
        {/* HİKAYEYİ GEÇ BUTONU */}
        <button 
          onClick={() => { setGameStarted(true); playSfx('buy'); }}
          style={{ position: 'absolute', top: '30px', right: '30px', padding: '12px 30px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', borderRadius: '10px', color: '#fecaca', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem', zIndex: 100 }}
        >
          ⏭️ HİKAYEYİ GEÇ
        </button>

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
              MENÜYE DÖN VE YENİDEN BAŞLAT
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
    <div style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc', fontFamily: 'Segoe UI, sans-serif', padding: '40px', paddingBottom: '120px' }}>
      
      {/* Natali Bildirim Ünitesi */}
      {isNataliHere && (
        <div style={{ background: '#1e1b4b', border: '2px solid #3b82f6', padding: '15px 25px', borderRadius: '12px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ffffff' }}>
            Natali geldi döner almak istermisin 100 dolar ({nataliLeaveTimer}sn)
          </span>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button 
              onClick={handleNataliYes}
              disabled={totalCash < 100}
              style={{ padding: '8px 25px', background: totalCash >= 100 ? '#22c55e' : '#1e293b', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: totalCash >= 100 ? 'pointer' : 'not-allowed' }}
            >
              Evet
            </button>
            <button 
              onClick={handleNataliNo}
              style={{ padding: '8px 25px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Hayır
            </button>
          </div>
        </div>
      )}

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #1e293b', paddingBottom: '20px', marginBottom: '40px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#3b82f6', letterSpacing: '1px' }}>NECMİ'NİN GLOBAL LOJİSTİK ÜSSÜ</h2>
          <span style={{ color: '#fbbf24', fontSize: '0.9rem', fontWeight: 'bold' }}>🎯 HEDEF: $1.000.000 BİRİKTİRİP AHMET'İN BİNASINI BASMAK!</span>
        </div>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button 
            onClick={() => { setIsInMainMenu(true); setGameStarted(false); playSfx('click'); }}
            style={{ padding: '10px 18px', background: '#1e293b', color: 'white', border: '1px solid #3b82f6', borderRadius: '10px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 'bold' }}
          >
            🏠 ANA MENÜ
          </button>
          <div style={{ fontSize: '0.8rem', color: '#475569', background: '#0b0f19', padding: '10px 15px', borderRadius: '10px', border: '1px solid #1e293b' }}>
            ⏱️ Şans Sayacı: <strong>{nataliArrivalCheckTimer}sn</strong>
          </div>

          {donerBuffTimer > 0 && (
            <div style={{ background: '#7f1d1d', padding: '12px 20px', borderRadius: '12px', border: '1px solid #ef4444' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#ffffff' }}>İndirim Aktif: {donerBuffTimer}sn</div>
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

      {/* --- SAĞ ALT KÖŞE SABİT SAVE ALANI --- */}
      <div style={{ position: 'fixed', bottom: '25px', right: '25px', background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(8px)', border: '2px solid #22c55e', padding: '15px 20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', zIndex: 9999 }}>
        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', letterSpacing: '1px' }}>
          📍 AKTİF KANAL: SLOT {selectedSlot}
        </span>
        <button
          onClick={saveGame}
          style={{ padding: '10px 25px', background: '#22c55e', color: '#020617', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem', transition: 'transform 0.1s ease' }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          💾 OYUNU KAYDET (SAVE)
        </button>
      </div>

      <footer style={{ marginTop: '60px', textAlign: 'center', color: '#334155', fontSize: '0.8rem' }}>
        NECMİ'NİN YÜKSELİŞİ v6.0.0 | Kriz Döngüsü: {incidentTimer}s
      </footer>
    </div>
  );
}

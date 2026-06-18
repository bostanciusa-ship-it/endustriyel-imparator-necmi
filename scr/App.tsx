import React, { useState, useEffect, useRef } from 'react';

/**
 * ============================================================================
 * 🔊 NECMİ HOLDİNG - GELİŞMİŞ SES SENTEZLEYİCİ ÜNİTESİ
 * ============================================================================
 */
const playSfx = (type: string) => {
  try {
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
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
    console.warn("Ses motoru başlatılamadı.");
  }
};

/**
 * ============================================================================
 * 🏭 ANA HOLDİNG YÖNETİM MERKEZİ (App Component)
 * ============================================================================
 */
export default function App() {
  
  // --- KİMLİK DOĞRULAMA DURUMLARI ---
  const [passwordInput, setPasswordInput] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [interfaceMode, setInterfaceMode] = useState<"HOCA" | "NECMI" | null>(null);
  const [isConnecting, setIsConnecting] = useState(false); // Yükleniyor efekti için
  const [loginError, setLoginError] = useState(false);

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

  // --- REFLER ---
  const stateRef = useRef({ lvlMarketingCampaigns, lvlLogisticsTrucks, currentMarketValue, currentInventory });
  
  useEffect(() => {
    stateRef.current = { lvlMarketingCampaigns, lvlLogisticsTrucks, currentMarketValue, currentInventory };
  }, [lvlMarketingCampaigns, lvlLogisticsTrucks, currentMarketValue, currentInventory]);


  // --- GİRİŞ AKSİYONU (EFEKTLİ GİRİŞ) ---
  const executeLoginAction = () => {
    const sanitizedKey = passwordInput.trim().toUpperCase();
    setLoginError(false);
    
    if (sanitizedKey === "B123B123" || sanitizedKey === "3689") {
      setIsConnecting(true); // Yüklenme animasyonunu başlat
      playSfx('click');
      
      // 1.5 saniye yapay yüklenme simülasyonu (Çok havalı duruyor)
      setTimeout(() => {
        setInterfaceMode(sanitizedKey === "B123B123" ? "NECMI" : "HOCA");
        setIsAuthenticated(true);
        setIsConnecting(false);
        playSfx('buy');
      }, 1500);
      
    } else {
      playSfx('alert');
      setLoginError(true);
    }
  };

  // --- SEVİYE YÜKSELTME FONKSİYONLARI ---
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

  // --- CORE GAME ENGINE ---
  useEffect(() => {
    if (!isAuthenticated) return;

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
  }, [isAuthenticated, isStrikeActive, activeIncident]);

  // ============================================================================
  // 🎭 GÖRSEL KATMAN (UI RENDER)
  // ============================================================================
  
  // GÜZELLEŞTİRİLMİŞ GİRİŞ EKRANI (Arayüz Geliştirmesi)
  if (!isAuthenticated) {
    return (
      <div style={{ backgroundColor: '#020617', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#f8fafc', fontFamily: 'monospace', overflow: 'hidden', position: 'relative' }}>
        
        {/* Arka Plandaki Havalı Işık Süzmeleri */}
        <div style={{ position: 'absolute', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(0,0,0,0) 70%)', top: '10%', left: '20%' }}></div>
        <div style={{ position: 'absolute', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, rgba(0,0,0,0) 70%)', bottom: '10%', right: '15%' }}></div>

        <div style={{ background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(16px)', padding: '50px 40px', borderRadius: '30px', border: loginError ? '2px solid #ef4444' : '2px solid #3b82f6', boxShadow: loginError ? '0 0 50px rgba(239, 68, 68, 0.25)' : '0 0 50px rgba(59, 130, 246, 0.25)', width: '420px', textAlign: 'center', zIndex: 10, transition: 'all 0.4s ease' }}>
          
          {/* Logo Bölümü */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{ display: 'inline-block', fontSize: '3rem', animation: 'float 3s infinite ease-in-out' }}>🏛️</div>
            <h1 style={{ fontSize: '2.2rem', margin: '10px 0 5px 0', fontWeight: 'bold', letterSpacing: '2px', background: 'linear-gradient(to right, #3b82f6, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NECMİ HOLDİNG</h1>
            <div style={{ fontSize: '0.8rem', color: '#64748b', letterSpacing: '4px' }}>SİBER ERP TERMİNALİ v4.6</div>
          </div>

          {/* Durum Mesajları */}
          <div style={{ background: '#090d16', padding: '12px', borderRadius: '12px', fontSize: '0.85rem', color: loginError ? '#f87171' : '#

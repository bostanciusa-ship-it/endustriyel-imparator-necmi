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

  // ============================================================================
  // 🔏 BUG FIX: CRITICAL STATE REFERENCES (useRef)
  // Satış anında güncel seviyeleri ve borsa fiyatını kaçırmamak için referanslar
  // ============================================================================
  const stateRef = useRef({ lvlMarketingCampaigns, lvlLogisticsTrucks, currentMarketValue, currentInventory });
  
  useEffect(() => {
    stateRef.current = { lvlMarketingCampaigns, lvlLogisticsTrucks, currentMarketValue, currentInventory };
  }, [lvlMarketingCampaigns, lvlLogisticsTrucks, currentMarketValue, currentInventory]);


  // --- GİRİŞ AKSİYONU ---
  const executeLoginAction = () => {
    const sanitizedKey = passwordInput.trim().toUpperCase();
    if (sanitizedKey === "B123B123" || sanitizedKey === "3689") {
      setInterfaceMode(sanitizedKey === "B123B123" ? "NECMI" : "HOCA");
      setIsAuthenticated(true);
      playSfx('buy');
    } else {
      alert("YETKİSİZ ERİŞİM!");
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

  // ============================================================================
  // 🔥 HOLDİNG ANA MOTORU (GAME ENGINE)
  // ============================================================================
  useEffect(() => {
    if (!isAuthenticated) return;

    // BORSA DÖNGÜSÜ (5 Saniyede Bir)
    const marketFluxInterval = setInterval(() => {
      setCurrentMarketValue(oldPrice => {
        const volatility = (Math.random() * 8 - 4);
        const updatedPrice = Math.max(12, Math.min(48, oldPrice + volatility));
        setMarketDirection(updatedPrice > oldPrice ? 'up' : 'down');
        return updatedPrice;
      });
    }, 5000);

    // SANİYELİK ENGINE TICK
    const systemHeartbeat = setInterval(() => {
      
      // 1. Otomatik Üretim Sistemi (İşçiler)
      if (!isStrikeActive) {
        setCurrentInventory(inventory => {
          const capacityLimit = lvlStorageCapacity * 40;
          const productionOutput = (lvlAutomatedWorkers * 0.25);
          return Math.min(inventory + productionOutput, capacityLimit);
        });
      }

      // 2. BUG-FREE SATIŞ VE SEVKİYAT DÖNGÜSÜ (Her 3 Saniyede Bir)
      setShipmentCountdown(currentSec => {
        if (currentSec <= 1) {
          // Güncel referans değerlerini çekiyoruz (Kilitlenme engellendi)
          const currentRefData = stateRef.current;
          
          // Formül: Sabit 1 adet + Reklam Bonusu + Kamyon Bonusu (0.5 gücünde)
          const unitsToSell = 1 + (currentRefData.lvlMarketingCampaigns * 0.25) + (currentRefData.lvlLogisticsTrucks * 0.5);
          
          setCurrentInventory(actualInventory => {
            const finalSoldAmount = Math.min(actualInventory, unitsToSell);
            
            if (finalSoldAmount > 0) {
              // Parayı kasaya güvenli bir şekilde ekle
              setTotalCash(cashPool => cashPool + (finalSoldAmount * currentRefData.currentMarketValue));
              // Stoğu düşür
              return Math.max(0, actualInventory - finalSoldAmount);
            }
            return actualInventory;
          });

          return 3; // Sevkiyat bitti, sayacı 3'e geri kur
        }
        return currentSec - 1;
      });

      // 3. Kriz Yönetim Sayacı
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

      // Kriz Zaman Aşımı Kontrolü
      if (activeIncident && Date.now() > activeIncident.end) {
        setTotalCash(prev => Math.max(0, prev * 0.88));
        setActiveIncident(null);
        setIsStrikeActive(false);
        setIncidentTimer(120);
        playSfx('alert');
      }

    }, 1000);

    return () => {
      clearInterval(marketFluxInterval);
      clearInterval(systemHeartbeat);
    };
  }, [isAuthenticated, isStrikeActive, activeIncident]);

  // --- KULLANICI ARAYÜZÜ ---
  if (!isAuthenticated) {
    return (
      <div style={{ backgroundColor: '#020617', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontFamily: 'monospace' }}>
        <div style={{ background: '#0f172a', padding: '50px', borderRadius: '25px', border: '2px solid #3b82f6', boxShadow: '0 0 40px rgba(59, 130, 246, 0.3)' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>NECMİ HOLDİNG V4.5.2</h1>
          <p style={{ color: '#64748b', marginBottom: '30px' }}>SİSTEME ERİŞİM İÇİN YETKİ KODU GEREKLİ</p>
          <input 
            type="password" 
            placeholder="ERİŞİM ŞİFRESİ" 
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && executeLoginAction()}
            style={{ width: '100%', padding: '15px', background: '#1e293b', border: 'none', color: '#3b82f6', borderRadius: '10px', fontSize: '1.2rem', textAlign: 'center' }}
          />
          <button onClick={executeLoginAction} style={{ width: '100%', padding: '15px', marginTop: '20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
            PROTOKOLÜ BAŞLAT
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc', fontFamily: 'Segoe UI, sans-serif', padding: '40px' }}>
      
      {/* HEADER PANELİ */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #1e293b', paddingBottom: '20px', marginBottom: '40px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#3b82f6', letterSpacing: '1px' }}>{interfaceMode === 'NECMI' ? "CEO YÖNETİM PANELİ" : "LOJİSTİK VE ANALİZ"}</h2>
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>HOLDİNG STATUS: <span style={{ color: '#22c55e' }}>ONLINE</span></span>
        </div>
        
        <div style={{ background: '#0f172a', padding: '15px 25px', borderRadius: '15px', border: `1px solid ${marketDirection === 'up' ? '#22c55e' : '#ef4444'}`, textAlign: 'right' }}>
          <small style={{ color: '#64748b' }}>BORSA DEĞERİ</small>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: marketDirection === 'up' ? '#22c55e' : '#ef4444' }}>
            ${currentMarketValue.toFixed(2)} {marketDirection === 'up' ? '▲' : '▼'}
          </div>
        </div>
      </header>

      {/* ACİL DURUM PANELİ */}
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

      {/* İSTATİSTİKLER */}
      <div style={{ display: 'flex', gap: '30px', marginBottom: '50px' }}>
        <div style={{ flex: 1, background: '#0f172a', padding: '30px', borderRadius: '25px', border: '1px solid #1e293b', textAlign: 'center' }}>
          <div style={{ color: '#64748b', marginBottom: '10px' }}>KASA BAKİYESİ</div>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#22c55e' }}>${Math.floor(totalCash).toLocaleString()}</div>
        </div>
        <div style={{ flex: 1, background: '#0f172a', padding: '30px', borderRadius: '25px', border: '1px solid #1e293b', textAlign: 'center' }}>
          <div style={{ color: '#64748b', marginBottom: '10px' }}>STOK DURUMU</div>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#eab308' }}>{currentInventory.toFixed(1)} / {lvlStorageCapacity * 40}</div>
          <div style={{ fontSize: '0.8rem', color: '#3b82f6', marginTop: '10px', fontWeight: 'bold' }}>🚚 SEVKİYATA KALAN SÜRE: {shipmentCountdown}sn</div>
        </div>
      </div>

      {/* ÜRETİM BUTONU */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <button 
          onClick={() => { if(!isStrikeActive && currentInventory < (lvlStorageCapacity * 40)) { setCurrentInventory(prev => Math.min(prev + lvlManualProduction, lvlStorageCapacity * 40)); playSfx('click'); } }}
          style={{ 
            padding: '35px 100px', fontSize: '1.8rem', fontWeight: 'bold', borderRadius: '25px', border: 'none',
            backgroundColor: (isStrikeActive || currentInventory >= lvlStorageCapacity * 40

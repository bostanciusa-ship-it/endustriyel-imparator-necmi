import React, { useState, useEffect, useRef } from 'react';

/**
 * ============================================================================
 * 🔊 NECMİ HOLDİNG - GELİŞMİŞ SES SENTEZLEYİCİ ÜNİTESİ
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
  const [isConnecting, setIsConnecting] = useState(false);
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


  // --- GİRİŞ AKSİYONU ---
  const executeLoginAction = () => {
    const sanitizedKey = passwordInput.trim().toUpperCase();
    setLoginError(false);
    
    if (sanitizedKey === "B123B123" || sanitizedKey === "3689") {
      setIsConnecting(true);
      playSfx('click');
      
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

  // GİRİŞ EKRANI RENDER
  if (!isAuthenticated) {
    return (
      <div style={{ backgroundColor: '#020617', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#f8fafc', fontFamily: 'monospace', overflow: 'hidden', position: 'relative' }}>
        
        <div style={{ position: 'absolute', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(0,0,0,0) 70%)', top: '10%', left: '20%' }}></div>
        <div style={{ position: 'absolute', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, rgba(0,0,0,0) 70%)', bottom: '10%', right: '15%' }}></div>

        <div style={{ background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(16px)', padding: '50px 40px', borderRadius: '30px', border: loginError ? '2px solid #ef4444' : '2px solid #3b82f6', boxShadow: loginError ? '0 0 50px rgba(239, 68, 68, 0.25)' : '0 0 50px rgba(59, 130, 246, 0.25)', width: '420px', textAlign: 'center', zIndex: 10, transition: 'all 0.4s ease' }}>
          
          <div style={{ marginBottom: '30px' }}>
            <div style={{ display: 'inline-block', fontSize: '3rem' }}>🏛️</div>
            <h1 style={{ fontSize: '2.2rem', margin: '10px 0 5px 0', fontWeight: 'bold', letterSpacing: '2px', background: 'linear-gradient(to right, #3b82f6, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NECMİ HOLDİNG</h1>
            <div style={{ fontSize: '0.8rem', color: '#64748b', letterSpacing: '4px' }}>SİBER ERP TERMİNALİ v4.6.1</div>
          </div>

          <div style={{ background: '#090d16', padding: '12px', borderRadius: '12px', fontSize: '0.85rem', color: loginError ? '#f87171' : '#38bdf8', marginBottom: '25px', border: loginError ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(56,189,248,0.2)' }}>
            {isConnecting ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                YETKİLENDİRME PROTOKOLÜ ÇALIŞIYOR...
              </span>
            ) : loginError ? "⚠️ ERİŞİM REDDEDİLDİ: GEÇERSİZ KOD!" : "🔒 GÜVENLİ BAĞLANTI İÇİN KOD GİRİNİZ"}
          </div>

          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <input 
              type="password" 
              placeholder="••••••••" 
              disabled={isConnecting}
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && executeLoginAction()}
              style={{ width: '100%', padding: '16px 20px', background: '#090d16', border: '1px solid #1e293b', color: '#38bdf8', borderRadius: '14px', fontSize: '1.4rem', textAlign: 'center', letterSpacing: '4px', outline: 'none' }}
            />
          </div>

          <button 
            onClick={executeLoginAction}
            disabled={isConnecting}
            style={{ width: '100%', padding: '16px', background: isConnecting ? '#1e293b' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 'bold', fontSize: '1.1rem', cursor: isConnecting ? 'not-allowed' : 'pointer', boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)' }}
          >
            {isConnecting ? "BAĞLANILIYOR..." : "ANA MOTORU BAŞLAT"}
          </button>

          <div style={{ marginTop: '25px', fontSize: '0.75rem', color: '#475569' }}>
            SECURE LAYER SEC-V2 // IP: 192.168.1.104
          </div>
        </div>

        {/* Global CSS Efekt Enjeksiyonu - VERCEL VITE GÜVENLİ SÜRÜM */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
            100% { transform: translateY(0px); }
          }
          input:focus { border-color: #3b82f6 !important; box-shadow: 0 0 15px rgba(59, 130, 246, 0.3) !important; }
        `}} />
      </div>
    );
  }

  // --- ANA OYUN EKRANI RENDER ---
  return (
    <div style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc', fontFamily: 'Segoe UI, sans-serif', padding: '40px' }}>
      
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
          <div style={{ color: '#64748b', marginBottom: '10px' }}>KASA BAKİYESİ</div>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#22c55e' }}>${Math.floor(totalCash).toLocaleString()}</div>
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
          {isStrikeActive ? "GREV VAR: ÜRETİM DURDU" : currentInventory >= (lvlStorageCapacity * 40) ? "DEPO FULL: SEVKİYAT BEKLENİYOR" : "MANUEL ÜRETİMİ TETİKLE"}
        </button>
      </div>

      <h3 style={{ marginBottom: '25px', color: '#3b82f6', borderLeft: '4px solid #3b82f6', paddingLeft: '15px' }}>YATIRIM VE GELİŞTİRME FIRSATLARI</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
        
        <div onClick={upgradeManualPower} style={{ background: '#0f172a', padding: '25px', borderRadius: '20px', cursor: 'pointer', border: '1px solid #1e293b' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>ÜRETİM HATTI GÜNCELLEME</div>
          <div style={{ fontSize: '1.2rem', margin: '5px 0' }}>TIK GÜCÜ (SEVİYE {lvlManualProduction})</div>
          <div style={{ color: '#22c55e', fontWeight: 'bold' }}>MALİYET: ${Math.floor(200 * Math.pow(1.25, lvlManualProduction - 1))}</div>
        </div>

        <div onClick={hireAutomatedWorker} style={{ background: '#0f172a', padding: '25px', borderRadius: '20px', cursor: 'pointer', border: '1px solid #1e293b' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>İNSAN KAYNAKLARI</div>
          <div style={{ fontSize: '1.2rem', margin: '5px 0' }}>OTOMATİK İŞÇİ (SEVİYE {lvlAutomatedWorkers})</div>
          <div style={{ color: '#22c55e', fontWeight: 'bold' }}>MALİYET: ${Math.floor(500 * Math.pow(1.28, lvlAutomatedWorkers))}</div>
        </div>

        <div onClick={purchaseLogisticsTruck} style={{ background: '#0f172a', padding: '25px', borderRadius: '20

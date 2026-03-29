import React, { useState, useEffect, useCallback } from 'react';

function App() {
  const [_c, _sc] = useState(100); 
  const [_p, _sp] = useState(0);   
  const [_tp, _stp] = useState(0); 
  const [_ns, _sns] = useState([]); 
  
  const [_levels, _setLevels] = useState({
    clickPower: 1,
    autoWorker: 0,
    marketing: 1,
    factorySize: 1 
  });

  // --- Yumuşak Ses Efektleri (Web Audio API) --- 
  const playSound = (type) => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'click') {
      osc.type = 'sine'; // Yumuşak dalga 
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime); // Kısık ses
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'upgrade') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  };

  // --- Hesaplamalar (GÜÇLÜ NERF GELDİ) --- 
  const clickGain = _levels.clickPower * 10;
  // Otomatik işçi üretimi saniyede 0.1 birime düşürüldü (10 saniyede 1 ürün) 
  const autoProdRate = _levels.autoWorker * 0.1; 
  const salePrice = 5 + (_levels.marketing * 3); 
  const storageLimit = _levels.factorySize * 30; // Depo kapasitesi daraltıldı 

  const _an = (msg) => {
    _sns(prev => [...prev.slice(-3), { id: Date.now(), text: msg }]);
  };

  const _hmp = () => {
    if (_p < storageLimit) {
      playSound('click');
      _sp(prev => prev + 1);
      _stp(prev => prev + 1);
      _sc(prev => prev + clickGain);
      _an(`Üretim: +${clickGain}$`);
    } else {
      _an("DEPO DOLU!");
    }
  };

  const buyUpgrade = (type, baseCost) => {
    const cost = Math.floor(baseCost * Math.pow(2.2, _levels[type])); // Fiyatlar artık çok daha hızlı artıyor! 
    if (_c >= cost) {
      playSound('upgrade');
      _sc(prev => prev - cost);
      _setLevels(prev => ({ ...prev, [type]: prev[type] + 1 }));
      _an("Geliştirme tamamlandı!");
    } else {
      _an("Yetersiz bakiye!");
    }
  };

  const _se = async () => {
    const message = `🚀 Endüstriyel İmparatorluk'ta $${_c.toLocaleString()} sermayeye ulaştım!`;
    if (navigator.share) {
      await navigator.share({ title: 'Skorum', text: message }).catch(() => {});
    } else {
      navigator.clipboard.writeText(message);
      _an("Kopyalandı!");
    }
  };

  useEffect(() => {
    const _t = setInterval(() => {
      // Otomatik üretim artık çok daha yavaş 
      if (autoProdRate > 0) {
        _sp(prev => (prev < storageLimit ? prev + autoProdRate : prev));
      }
      // Satış hızı da işçi sayısına bağlandı (Dengeleme) 
      _sc(prev => {
        if (_p >= 1) {
          _sp(p => p - 1);
          return prev + salePrice;
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(_t);
  }, [_p, autoProdRate, salePrice, storageLimit]);

  return (
    <div style={{ color: 'white', padding: '20px', textAlign: 'center', backgroundColor: '#0a0a0c', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#3b82f6' }}>Endüstriyel İmparatorluk v2.7</h2>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
        <div style={statBox}>Sermaye: <br/><span style={{color: '#4ade80'}}>${_c.toLocaleString()}</span></div>
        <div style={statBox}>Stok: <br/><span style={{color: '#fbbf24'}}>{_p.toFixed(1)} / {storageLimit}</span></div>
      </div>

      <button onClick={_hmp} style={mainBtn}>🏭 FABRİKAYI ÇALIŞTIR</button>
      <button onClick={_se} style={shareBtn}>🚀 PAYLAŞ</button>

      <h3 style={{marginTop: '30px', color: '#9ca3af'}}>Yatırımlar</h3>
      <div style={{ maxWidth: '700px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        
        <div style={upgradeContainer}>
          <button onClick={() => buyUpgrade('clickPower', 150)} style={upgBtn}>
            🚀 Tık Gücü (Lv {_levels.clickPower})<br/>
            <small>${Math.floor(150 * Math.pow(2.2, _levels.clickPower))}</small>
          </button>
          <p style={descText}>Tıklama kazancını katlar.</p>
        </div>

        <div style={upgradeContainer}>
          <button onClick={() => buyUpgrade('autoWorker', 500)} style={upgBtn}>
            🤖 Otomatik İşçi (Lv {_levels.autoWorker})<br/>
            <small>${Math.floor(500 * Math.pow(2.2, _levels.autoWorker))}</small>
          </button>
          <p style={descText}>Saniyede sadece 0.1 birim üretir (Çok yavaş).</p>
        </div>

        <div style={upgradeContainer}>
          <button onClick={() => buyUpgrade('marketing', 200)} style={upgBtn}>
            📈 Pazarlama (Lv {_levels.marketing})<br/>
            <small>${Math.floor(200 * Math.pow(2.2, _levels.marketing))}</small>
          </button>
          <p style={descText}>Satış fiyatını +3$ artırır.</p>
        </div>

        <div style={upgradeContainer}>
          <button onClick={() => buyUpgrade('factorySize', 400)} style={upgBtn}>
            🏗️ Depo Büyüt (Lv {_levels.factorySize})<br/>
            <small>${Math.floor(400 * Math.pow(2.2, _levels.factorySize))}</small>
          </button>
          <p style={descText}>Stok kapasitesini +30 artırır.</p>
        </div>

      </div>

      <div style={{ marginTop: '30px', color: '#6b7280', fontSize: '0.8rem' }}>
        {_ns.map(n => <div key={n.id}>⚡ {n.text}</div>)}
      </div>
    </div>
  );
}

// Stiller aynı kalıyor
const statBox = { background: '#1e1e24', padding: '15px', borderRadius: '10px', border: '1px solid #333', minWidth: '120px' };
const mainBtn = { padding: '20px 40px', fontSize: '1.2rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', margin: '10px' };
const shareBtn = { padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' };
const upgradeContainer = { display: 'flex', flexDirection: 'column' as any, alignItems: 'center' };
const upgBtn = { width: '100%', padding: '12px', background: '#1e1e24', color: 'white', border: '1px solid #444', borderRadius: '8px', cursor: 'pointer' };
const descText = { fontSize: '0.75rem', color: '#9ca3af', marginTop: '5px', fontStyle: 'italic' };

export default App;

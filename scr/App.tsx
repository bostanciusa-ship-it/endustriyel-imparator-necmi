Yatırımların ne işe yaradığını belirten kısa açıklamaları ve geliştirilmiş yeni yapıyı aşağıda bulabilirsin. Bu versiyonda her butonun altında, o yatırımın ekonomine nasıl bir katkı sağladığını görebilirsin.

Güncellenmiş App.tsx (Yatırım Açıklamalarıyla)
TypeScript
import React, { useState, useEffect } from 'react';

function App() {
  const [_c, _sc] = useState(100); // Sermaye [cite: 4]
  const [_p, _sp] = useState(0);   // Üretim (Stok) [cite: 4]
  const [_tp, _stp] = useState(0); // Toplam Üretim [cite: 4]
  const [_ns, _sns] = useState([]); // Bildirimler [cite: 6]
  
  const [_levels, _setLevels] = useState({
    clickPower: 1,
    autoWorker: 0,
    marketing: 1,
    factorySize: 1 
  });

  // --- Dinamik Hesaplamalar ---
  const clickGain = _levels.clickPower * 10;
  const autoProdRate = _levels.autoWorker * 0.5; 
  const salePrice = 5 + (_levels.marketing * 2); 
  const storageLimit = _levels.factorySize * 50; 

  const _an = (msg) => {
    _sns(prev => [...prev.slice(-4), { id: Date.now(), text: msg }]);
  };

  const _hmp = () => {
    if (_p < storageLimit) {
      _sp(prev => prev + 1);
      _stp(prev => prev + 1);
      _sc(prev => prev + clickGain);
      _an(`Üretim: +${clickGain}$`);
    } else {
      _an("DEPO DOLU!");
    }
  };

  const buyUpgrade = (type, baseCost) => {
    const cost = Math.floor(baseCost * Math.pow(1.5, _levels[type]));
    if (_c >= cost) {
      _sc(prev => prev - cost);
      _setLevels(prev => ({ ...prev, [type]: prev[type] + 1 }));
      _an("Geliştirme tamamlandı!");
    } else {
      _an("Yetersiz bakiye!");
    }
  };

  const _se = async () => {
    const message = `🚀 Endüstriyel İmparatorluk'ta $${_c.toLocaleString()} sermayeye ulaştım!`; [cite: 13]
    if (navigator.share) { [cite: 14]
      await navigator.share({ title: 'Skorum', text: message }).catch(() => {}); [cite: 14]
    } else {
      navigator.clipboard.writeText(message); [cite: 14]
      _an("Kopyalandı!"); [cite: 15]
    }
  };

  useEffect(() => {
    const _t = setInterval(() => {
      if (autoProdRate > 0) {
        _sp(prev => (prev < storageLimit ? prev + autoProdRate : prev));
      }
      _sc(prev => {
        if (_p > 0) {
          _sp(p => Math.max(0, p - 1));
          return prev + salePrice;
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(_t);
  }, [_p, autoProdRate, salePrice, storageLimit]);

  return (
    <div style={{ color: 'white', padding: '20px', textAlign: 'center', backgroundColor: '#0a0a0c', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#3b82f6' }}>Endüstriyel İmparatorluk v2.6</h2>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
        <div style={statBox}>Sermaye: <br/><span style={{color: '#4ade80'}}>${_c.toLocaleString()}</span></div>
        <div style={statBox}>Stok: <br/><span style={{color: '#fbbf24'}}>{_p.toFixed(0)} / {storageLimit}</span></div>
      </div>

      <button onClick={_hmp} style={mainBtn}>🏭 FABRİKAYI ÇALIŞTIR</button>
      <button onClick={_se} style={shareBtn}>🚀 PAYLAŞ</button>

      <h3 style={{marginTop: '30px', color: '#9ca3af'}}>Yatırımlar & Strateji</h3>
      <div style={{ maxWidth: '700px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        
        {/* Tık Gücü */}
        <div style={upgradeContainer}>
          <button onClick={() => buyUpgrade('clickPower', 100)} style={upgBtn}>
            🚀 Tık Gücü (Lv {_levels.clickPower})<br/>
            <small>${Math.floor(100 * Math.pow(1.5, _levels.clickPower))}</small>
          </button>
          <p style={descText}>Her tıklamada kazandığın parayı artırır.</p>
        </div>

        {/* Otomatik İşçi */}
        <div style={upgradeContainer}>
          <button onClick={() => buyUpgrade('autoWorker', 200)} style={upgBtn}>
            🤖 Otomatik İşçi (Lv {_levels.autoWorker})<br/>
            <small>${Math.floor(200 * Math.pow(1.5, _levels.autoWorker))}</small>
          </button>
          <p style={descText}>Sen uyurken bile fabrikada üretim yapar.</p>
        </div>

        {/* Pazarlama */}
        <div style={upgradeContainer}>
          <button onClick={() => buyUpgrade('marketing', 150)} style={upgBtn}>
            📈 Pazarlama (Lv {_levels.marketing})<br/>
            <small>${Math.floor(150 * Math.pow(1.5, _levels.marketing))}</small>
          </button>
          <p style={descText}>Ürünlerin satış fiyatını kalıcı olarak yükseltir.</p>
        </div>

        {/* Depo Büyüt */}
        <div style={upgradeContainer}>
          <button onClick={() => buyUpgrade('factorySize', 300)} style={upgBtn}>
            🏗️ Depo Büyüt (Lv {_levels.factorySize})<br/>
            <small>${Math.floor(300 * Math.pow(1.5, _levels.factorySize))}</small>
          </button>
          <p style={descText}>Daha fazla ürün stoklamana imkan sağlar.</p>
        </div>

      </div>

      <div style={{ marginTop: '30px', color: '#6b7280', fontSize: '0.8rem' }}>
        {_ns.map(n => <div key={n.id}>⚡ {n.text}</div>)}
      </div>
    </div>
  );
}

// --- Stiller ---
const statBox = { background: '#1e1e24', padding: '15px', borderRadius: '10px', border: '1px solid #333', minWidth: '120px' };
const mainBtn = { padding: '20px 40px', fontSize: '1.2rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', margin: '10px' };
const shareBtn = { padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' };
const upgradeContainer = { display: 'flex', flexDirection: 'column' as const, alignItems: 'center' };
const upgBtn = { width: '100%', padding: '12px', background: '#1e1e24', color: 'white', border: '1px solid #444', borderRadius: '8px', cursor: 'pointer' };
const descText = { fontSize: '0.75rem', color: '#9ca3af', marginTop: '5px', fontStyle: 'italic' };

export default App;

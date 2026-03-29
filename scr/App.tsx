import React, { useState, useEffect } from 'react';

function App() {
  // --- Durum Değişkenleri ---
  const [_c, _sc] = useState(100); // Sermaye [cite: 1]
  const [_p, _sp] = useState(0);   // Üretim [cite: 1]
  const [_tp, _stp] = useState(0); // Toplam Üretim [cite: 2]
  const [_ns, _sns] = useState([]); // Bildirimler [cite: 3]
  
  // Yükseltme Seviyeleri [cite: 2]
  const [_levels, _setLevels] = useState({
    clickPower: 1,
    autoWorker: 0,
    marketing: 1
  });

  // --- Hesaplamalar ---
  const clickGain = _levels.clickPower * 10;
  const autoProduction = _levels.autoWorker * 1;
  const salePrice = _levels.marketing * 5;

  // --- Fonksiyonlar ---
  
  const _an = (msg) => {
    _sns(prev => [...prev.slice(-4), { id: Date.now(), text: msg }]);
  };

  const _hmp = () => {
    _sp(prev => prev + 1);
    _stp(prev => prev + 1);
    _sc(prev => prev + clickGain);
    _an(`Üretim yapıldı: +${clickGain}$`);
  };

  const buyUpgrade = (type, cost) => {
    if (_c >= cost) {
      _sc(prev => prev - cost);
      _setLevels(prev => ({ ...prev, [type]: prev[type] + 1 }));
      _an("Yükseltme Başarılı!");
    } else {
      _an("Yetersiz Sermaye!");
    }
  };

  // --- Oyun Döngüsü ---
  useEffect(() => {
    const _t = setInterval(() => {
      // Otomatik Üretim
      if (autoProduction > 0) {
        _sp(prev => prev + autoProduction);
        _stp(prev => prev + autoProduction);
      }
      
      // Otomatik Satış [cite: 15, 16]
      _sc(prev => {
        if (_p > 0) {
          const sellAmount = Math.max(1, Math.floor(_levels.autoWorker / 2));
          _sp(p => Math.max(0, p - sellAmount));
          return prev + (sellAmount * salePrice);
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(_t);
  }, [_p, autoProduction, salePrice, _levels.autoWorker]);

  return (
    <div style={{ color: 'white', padding: '20px', textAlign: 'center', backgroundColor: '#0a0a0c', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      <h1 style={{ color: '#3b82f6', fontSize: '2.5rem', marginBottom: '10px' }}>Endüstriyel İmparatorluk v2</h1>
      
      {/* İstatistik Paneli */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#1e1e24', padding: '20px', borderRadius: '15px', border: '1px solid #3b82f6', minWidth: '150px' }}>
          <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>SERMAYE</div>
          <div style={{ color: '#4ade80', fontSize: '1.8rem', fontWeight: 'bold' }}>${_c.toLocaleString()}</div>
        </div>
        <div style={{ background: '#1e1e24', padding: '20px', borderRadius: '15px', border: '1px solid #fbbf24', minWidth: '150px' }}>
          <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>STOKTAKİ ÜRÜN</div>
          <div style={{ color: '#fbbf24', fontSize: '1.8rem', fontWeight: 'bold' }}>{_p}</div>
        </div>
      </div>

      {/* Ana Aksiyon Butonu */}
      <button onClick={_hmp} style={{ 
        padding: '25px 50px', fontSize: '1.5rem', background: 'linear-gradient(45deg, #3b82f6, #2563eb)', 
        color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold',
        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)', marginBottom: '40px'
      }}>
        🏭 FABRİKAYI ÇALIŞTIR
      </button>

      {/* Market / Yükseltmeler Bölümü */}
      <div style={{ maxWidth: '600px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <button onClick={() => buyUpgrade('clickPower', _levels.clickPower * 100)} style={upgradeButtonStyle}>
          🚀 Tık Gücü (Lv {_levels.clickPower})<br/>
          <small>Maliyet: ${_levels.clickPower * 100}</small>
        </button>
        <button onClick={() => buyUpgrade('autoWorker', (_levels.autoWorker + 1) * 200)} style={upgradeButtonStyle}>
          🤖 Otomatik İşçi (Lv {_levels.autoWorker})<br/>
          <small>Maliyet: ${(_levels.autoWorker + 1) * 200}</small>
        </button>
      </div>

      {/* Bildirimler */}
      <div style={{ marginTop: '40px', background: '#111116', padding: '15px', borderRadius: '10px', maxWidth: '400px', margin: '40px auto' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#3b82f6' }}>Lojistik Kayıtları</h4>
        {_ns.map(n => <div key={n.id} style={{ color: '#9ca3af', fontSize: '0.85rem', padding: '3px 0' }}>• {n.text}</div>)}
      </div>
    </div>
  );
}

const upgradeButtonStyle = {
  padding: '15px', background: '#1e1e24', color: 'white', border: '1px solid #374151',
  borderRadius: '10px', cursor: 'pointer', textAlign: 'center', transition: '0.2s'
};

export default App;

import React, { useState, useEffect } from 'react';

function App() {
  const [_c, _sc] = useState(100); // Sermaye [cite: 1]
  const [_p, _sp] = useState(0);   // Üretim [cite: 1, 2]
  const [_tp, _stp] = useState(0); // Toplam Üretim [cite: 2]
  const [_ns, _sns] = useState([]); // Bildirimler [cite: 3]

  // Manuel Üretim (Tıklama)
  const _hmp = () => {
    _sp(prev => prev + 1); [cite: 9]
    _stp(prev => prev + 1); [cite: 10]
    _sc(prev => prev + 10);
    _an("Üretim yapıldı: +10$");
  };

  const _an = (msg) => {
    _sns(prev => [...prev.slice(-4), { id: Date.now(), text: msg }]); [cite: 3]
  };

  // Skor Paylaşma [cite: 13]
  const _se = async () => {
    const message = `🚀 Endüstriyel İmparatorluk'ta $${_c.toLocaleString()} sermayeye ulaştım!`; [cite: 13]
    if (navigator.share) { [cite: 14]
      await navigator.share({ title: 'Skorum', text: message }); [cite: 14]
    } else {
      navigator.clipboard.writeText(message); [cite: 14]
      _an("Kopyalandı!"); [cite: 15]
    }
  };

  // Oyun Döngüsü: Otomatik Satış 
  useEffect(() => {
    const _t = setInterval(() => {
      _sc(prev => {
        if (_p > 0) {
          _sp(p => Math.max(0, p - 1)); // Saniyede 1 birim sat 
          return prev + 5; // Satıştan 5$ kazan 
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(_t);
  }, [_p]);

  return (
    <div style={{ color: 'white', padding: '40px', textAlign: 'center', backgroundColor: '#0a0a0c', minHeight: '100vh' }}>
      <h1 style={{ color: '#3b82f6' }}>Endüstriyel İmparatorluk</h1>
      <div style={{ fontSize: '32px', margin: '20px', padding: '20px', border: '2px solid #3b82f6', borderRadius: '15px', display: 'inline-block' }}>
        Sermaye: <span style={{ color: '#4ade80' }}>${_c.toLocaleString()}</span> [cite: 13]
      </div>
      <div style={{ margin: '10px' }}>Stoktaki Ürün: {_p}</div>
      <div style={{ margin: '20px' }}>
        <button onClick={_hmp} style={{ padding: '20px 40px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
          FABRİKAYI ÇALIŞTIR
        </button>
        <button onClick={_se} style={{ marginLeft: '10px', padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
          SKORU PAYLAŞ [cite: 13]
        </button>
      </div>
      <div style={{ marginTop: '40px' }}>
        <h3>Son Faaliyetler</h3>
        {_ns.map(n => <div key={n.id} style={{ color: '#9ca3af' }}>⚡ {n.text}</div>)} [cite: 3]
      </div>
    </div>
  );
}

export default App;

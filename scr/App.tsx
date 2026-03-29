import React, { useState, useEffect } from 'react';

function App() {
  const [_c, _sc] = useState(100); // Sermaye
  const [_p, _sp] = useState(0);   // Üretim
  const [_tp, _stp] = useState(0); // Toplam Üretim
  const [_ns, _sns] = useState([]); // Bildirimler

  // Manuel Üretim (Tıklama)
  const _hmp = () => {
    _sp(prev => prev + 1);
    _stp(prev => prev + 1);
    _sc(prev => prev + 10);
    _an("Üretim yapıldı: +10$");
  };

  const _an = (msg) => {
    _sns(prev => [...prev.slice(-4), { id: Date.now(), text: msg }]);
  };

  // Skor Paylaşma
  const _se = async () => {
    const message = `🚀 Endüstriyel İmparatorluk'ta $${_c.toLocaleString()} sermayeye ulaştım!`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Skorum', text: message });
      } catch (e) { console.log("Paylaşım iptal edildi."); }
    } else {
      navigator.clipboard.writeText(message);
      _an("Skor kopyalandı!");
    }
  };

  // Otomatik Satış Döngüsü
  useEffect(() => {
    const _t = setInterval(() => {
      if (_p > 0) {
        _sp(prev => Math.max(0, prev - 1));
        _sc(prev => prev + 5);
      }
    }, 1000);
    return () => clearInterval(_t);
  }, [_p]);

  return (
    <div style={{ color: 'white', padding: '40px', textAlign: 'center', backgroundColor: '#0a0a0c', minHeight: '100vh', fontFamily: 'Arial' }}>
      <h1 style={{ color: '#3b82f6' }}>Endüstriyel İmparatorluk</h1>
      <div style={{ fontSize: '32px', margin: '20px', padding: '20px', border: '2px solid #3b82f6', borderRadius: '15px', display: 'inline-block' }}>
        Sermaye: <span style={{ color: '#4ade80' }}>${_c.toLocaleString()}</span>
      </div>
      <div style={{ margin: '10px' }}>Stoktaki Ürün: {_p}</div>
      <div style={{ margin: '20px' }}>
        <button onClick={_hmp} style={{ padding: '20px 40px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
          FABRİKAYI ÇALIŞTIR
        </button>
        <button onClick={_se} style={{ marginLeft: '10px', padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
          SKORU PAYLAŞ
        </button>
      </div>
      <div style={{ marginTop: '40px', textAlign: 'left', maxWidth: '400px', margin: '40px auto' }}>
        <h3>Son Faaliyetler</h3>
        {_ns.map(n => <div key={n.id} style={{ color: '#9ca3af', padding: '5px 0' }}>⚡ {n.text}</div>)}
      </div>
    </div>
  );
}

export default App;

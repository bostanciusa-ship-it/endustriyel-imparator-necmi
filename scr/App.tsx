
TypeScript
import React, { useState, useEffect } from 'react';

function App() {
  // --- Durum Değişkenleri (State) ---
  const [_c, _sc] = useState(100); // Sermaye [cite: 1]
  const [_p, _sp] = useState(0);   // Üretim [cite: 2]
  const [_tp, _stp] = useState(0); // Toplam Üretim [cite: 2]
  const [_cts, _scts] = useState({ factory: 0, robot: 0 }); // Yükseltmeler
  const [_ns, _sns] = useState([]); // Bildirimler [cite: 3]

  // --- Oyun Fonksiyonları ---

  // Manuel Üretim (Tıklama)
  const _hmp = () => {
    _sp(prev => prev + 1); // Üretim artışı [cite: 9]
    _stp(prev => prev + 1); // Toplam üretim artışı [cite: 10]
    _sc(prev => prev + 10); // Tıklama başı kazanç
    _an("Üretim yapıldı: +10$");
  };

  // Bildirim Sistemi
  const _an = (msg) => {
    _sns(prev => [...prev.slice(-4), { id: Date.now(), text: msg }]);
  };

  // Skoru Paylaşma Sistemi
  const _se = async () => {
    const message = `🚀 Endüstriyel İmparatorluk'ta $${_c.toLocaleString()} sermayeye ulaştım!`; [cite: 13]
    if (navigator.share) { [cite: 14]
      await navigator.share({ title: 'Skorum', text: message }); [cite: 14]
    } else {
      navigator.clipboard.writeText(message); [cite: 15]
      _an("Skor kopyalandı!"); [cite: 15]
    }
  };

  // --- Oyun Döngüsü (Otomatik Sistemler) ---
  useEffect(() => {
    const _si = setInterval(() => {
      // Otomatik Satış ve Gelir Hesaplama 
      if (_p > 0) {
        const _ts = Math.min(_p, 1); // Her döngüde satış miktarı 
        _sp(prev => Math.max(0, prev - _ts)); 
        _sc(prev => prev + (_ts * 5)); // Satıştan gelen gelir 
      }
    }, 1000);
    return () => clearInterval(_si);
  }, [_p]);

  // Verileri Kaydetme (Yerel Depolama)
  useEffect(() => {
    const _save = setInterval(() => {
      const _dts = { capital: _c, counts: _cts, totalProduced: _tp };
      localStorage.setItem('industrial_empire_save', btoa(JSON.stringify(_dts)));
    }, 5000);
    return () => clearInterval(_save);
  }, [_c, _cts, _tp]);

  return (
    <div style={{ 
      color: 'white', padding: '40px', fontFamily: 'Arial, sans-serif', 
      textAlign: 'center', backgroundColor: '#0a0a0c', minHeight: '100vh' 
    }}>
      <h1 style={{ color: '#3b82f6' }}>Endüstriyel İmparatorluk</h1>
      
      <div style={{ 
        fontSize: '32px', margin: '20px 0', padding: '20px', 
        border: '2px solid #3b82f6', borderRadius: '15px', display: 'inline-block' 
      }}>
        Sermaye: <span style={{ color: '#4ade80' }}>${_c.toLocaleString()}</span>
      </div>

      <div style={{ margin: '10px' }}>
        Üretilen Mal: <span style={{ color: '#fbbf24' }}>{_p} Birim</span>
      </div>

      <div style={{ margin: '20px' }}>
        <button onClick={_hmp} style={{ 
          padding: '20px 40px', fontSize: '20px', cursor: 'pointer', 
          background: '#3b82f6', color: 'white', border: 'none', 
          borderRadius: '10px', fontWeight: 'bold', marginRight: '10px'
        }}>
          FABRİKAYI ÇALIŞTIR
        </button>

        <button onClick={_se} style={{ 
          padding: '10px 20px', fontSize: '16px', cursor: 'pointer', 
          background: '#10b981', color: 'white', border: 'none', 
          borderRadius: '10px'
        }}>
          SKORU PAYLAŞ 🚀
        </button>
      </div>

      <div style={{ marginTop: '40px', textAlign: 'left', maxWidth: '400px', margin: '40px auto' }}>
        <h3>Son Faaliyetler</h3>
        {_ns.map(n => (
          <div key={n.id} style={{ padding: '5px 0', color: '#9ca3af' }}>⚡ {n.text}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
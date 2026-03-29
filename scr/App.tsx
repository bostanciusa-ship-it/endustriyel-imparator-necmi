import React, { useState, useEffect } from 'react';

function App() {
  const [_c, _sc] = useState(100); // Sermaye 
  const [_p, _sp] = useState(0);   // Üretim [cite: 4]
  const [_tp, _stp] = useState(0); // Toplam Üretim [cite: 4]
  const [_cts, _scts] = useState({ factory: 0, robot: 0 }); // Yükseltmeler [cite: 5]
  const [_ns, _sns] = useState([]); // Bildirimler [cite: 6]

  // Verileri Kaydetme [cite: 7]
  useEffect(() => {
    const _si = setInterval(() => {
      const _dts = { capital: _c, counts: _cts, totalProduced: _tp };
      localStorage.setItem('industrial_empire_save', btoa(JSON.stringify(_dts)));
    }, 5000);
    return () => clearInterval(_si);
  }, [_c, _cts, _tp]);

  // Verileri Yükleme [cite: 8]
  useEffect(() => {
    const _sd = localStorage.getItem('industrial_empire_save');
    if (_sd) {
      try {
        const _data = JSON.parse(atob(_sd));
        _sc(_data.capital);
        _scts(_data.counts);
        _stp(_data.totalProduced);
      } catch (e) { console.error("Yükleme başarısız."); }
    }
  }, []);

  const _hmp = () => {
    _sc(prev => prev + 10); // Tıklama başı kazanç [cite: 9, 10]
    _stp(prev => prev + 1);
    _an("Üretim yapıldı: +10$");
  };

  const _an = (msg) => {
    _sns(prev => [...prev.slice(-4), { id: Date.now(), text: msg }]); // Bildirim sistemi [cite: 11]
  };

  return (
    <div style={{ 
      color: 'white', padding: '40px', fontFamily: 'Arial, sans-serif', 
      textAlign: 'center', backgroundColor: '#0a0a0c', minHeight: '100vh' 
    }}>
      <h1 style={{ color: '#3b82f6' }}>Endüstriyel İmparatorluk</h1>
      <div style={{ 
        fontSize: '32px', margin: '30px 0', padding: '20px', 
        border: '2px solid #3b82f6', borderRadius: '15px', display: 'inline-block' 
      }}>
        Sermaye: <span style={{ color: '#4ade80' }}>${_c.toLocaleString()}</span> [cite: 12, 13]
      </div>
      <div style={{ margin: '20px' }}>
        <button onClick={_hmp} style={{ 
          padding: '20px 40px', fontSize: '20px', cursor: 'pointer', 
          background: '#3b82f6', color: 'white', border: 'none', 
          borderRadius: '10px', fontWeight: 'bold' 
        }}>
          FABRİKAYI ÇALIŞTIR (TIKLA) [cite: 14, 15, 16]
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
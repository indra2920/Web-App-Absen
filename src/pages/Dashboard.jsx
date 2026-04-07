import React, { useEffect, useState } from 'react';
import { Users, UserSquare2, ScanLine } from 'lucide-react';
import { getData } from '../db';

function Dashboard() {
  const [stats, setStats] = useState({ guru: 0, murid: 0, absenHariIni: 0 });

  useEffect(() => {
    const loadStats = async () => {
      const g = await getData('guru');
      const m = await getData('murid');
      const log = await getData('logAbsen');
      
      const today = new Date().toLocaleDateString('id-ID');
      const todayLog = log.filter(l => new Date(l.timestamp).toLocaleDateString('id-ID') === today);

      setStats({
        guru: g.length,
        murid: m.length,
        absenHariIni: todayLog.length
      });
    };
    loadStats();
  }, []);

  return (
    <div className="animate-fade-in">
      <h1 className="mb-2">Dashboard</h1>
      <p className="text-muted mb-6">Ringkasan data absensi hari ini.</p>
      
      <div className="grid-3 mb-6">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
            <UserSquare2 />
          </div>
          <div className="stat-info">
            <h3>Total Guru</h3>
            <div className="value">{stats.guru}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
            <Users />
          </div>
          <div className="stat-info">
            <h3>Total Murid</h3>
            <div className="value">{stats.murid}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa' }}>
            <ScanLine />
          </div>
          <div className="stat-info">
            <h3>Absen Hari Ini</h3>
            <div className="value">{stats.absenHariIni}</div>
          </div>
        </div>
      </div>
      
      <div className="glass-panel">
        <h2>Selamat Datang di QRAbsen</h2>
        <p className="text-muted">
          Sistem absensi modern menggunakan pemindaian kode QR. Silakan navigasi melalui menu di samping 
          untuk menambahkan master data atau mulai melakukan *scan* absensi kehadiran.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;

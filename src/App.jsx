import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Users, UserSquare2, ScanLine, FileText } from 'lucide-react';
import { initDB } from './db';

// Pages placeholders
import Dashboard from './pages/Dashboard';
import MasterGuru from './pages/MasterGuru';
import MasterMurid from './pages/MasterMurid';
import Scanner from './pages/Scanner';
import Laporan from './pages/Laporan';

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo">
          <div className="sidebar-logo-icon"><ScanLine size={20} color="white" /></div>
          <span>QRAbsen</span>
        </Link>
      </div>
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} end>
          <LayoutDashboard size={20} /> Dashboard
        </NavLink>
        <NavLink to="/guru" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <UserSquare2 size={20} /> Master Guru
        </NavLink>
        <NavLink to="/murid" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <Users size={20} /> Master Murid
        </NavLink>
        <NavLink to="/scan" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <ScanLine size={20} /> Scan Absen
        </NavLink>
        <NavLink to="/laporan" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <FileText size={20} /> Laporan
        </NavLink>
      </div>
    </div>
  );
}

function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initDB().then(() => setDbReady(true));
  }, []);

  if (!dbReady) {
    return <div className="flex-center" style={{ height: '100vh' }}><h3>Memuat Database...</h3></div>;
  }

  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/guru" element={<MasterGuru />} />
            <Route path="/murid" element={<MasterMurid />} />
            <Route path="/scan" element={<Scanner />} />
            <Route path="/laporan" element={<Laporan />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { Download, Filter } from 'lucide-react';
import { subscribeData } from '../db';
import { format } from 'date-fns';

function Laporan() {
  const [logs, setLogs] = useState([]);
  const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [allLogs, setAllLogs] = useState([]);

  useEffect(() => {
    const unsub = subscribeData('logAbsen', (rawLogs) => {
      rawLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setAllLogs(rawLogs);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const filtered = allLogs.filter(l => {
      const logDate = format(new Date(l.timestamp), 'yyyy-MM-dd');
      return logDate === filterDate;
    });
    setLogs(filtered);
  }, [allLogs, filterDate]);

  const exportCSV = () => {
    if (logs.length === 0) return;
    
    // CSV Header
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Waktu,Nama,Peran,Keterangan,Tipe Absen\n";
    
    logs.forEach(log => {
      const wkt = format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss');
      const nama = log.name;
      const peran = log.role === 'guru' ? 'Guru' : 'Murid';
      const info = log.info || '-';
      const tipe = log.type;
      
      const row = `"${wkt}","${nama}","${peran}","${info}","${tipe}"`;
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Absen_${filterDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex-between mb-6">
        <div>
          <h1>Laporan Absensi</h1>
          <p className="text-muted">Riwayat absen masuk dan pulang harian.</p>
        </div>
      </div>

      <div className="glass-panel mb-6">
        <div className="flex-between">
          <div className="flex-center gap-4">
            <div className="flex-center gap-2">
              <Filter size={20} className="text-muted" />
              <span className="font-bold">Filter Tanggal:</span>
            </div>
            <input 
              type="date" 
              className="form-input" 
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              style={{ width: '200px' }}
            />
          </div>
          <button className="btn btn-success" onClick={exportCSV} disabled={logs.length === 0}>
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      <div className="glass-panel">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Nama / Info</th>
                <th>Peran</th>
                <th>Tipe Absen</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center' }}>Tidak ada data absen pada tanggal ini.</td></tr>
              ) : logs.map(log => (
                <tr key={log.id}>
                  <td>{format(new Date(log.timestamp), 'HH:mm:ss')}</td>
                  <td>
                    <div className="font-bold">{log.name}</div>
                    <div className="text-muted text-xs">{log.info}</div>
                  </td>
                  <td>
                    <span className={`badge ${log.role === 'guru' ? 'badge-success' : 'badge-warning'}`}>
                      {log.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${log.type === 'MASUK' ? 'badge-success' : 'badge-danger'}`}>
                      {log.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Laporan;

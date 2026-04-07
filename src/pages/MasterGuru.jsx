import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Plus, Trash2 } from 'lucide-react';
import { getData, addData, deleteData, generateId } from '../db';

function MasterGuru() {
  const [gurus, setGurus] = useState([]);
  const [formData, setFormData] = useState({ nama: '', nip: '', mapel: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getData('guru');
    setGurus(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama) return;
    
    const newGuru = {
      ...formData,
      id: generateId('GURU'),
      createdAt: new Date().toISOString()
    };
    
    await addData('guru', newGuru);
    setFormData({ nama: '', nip: '', mapel: '' });
    loadData();
  };

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus data ini?')) {
      await deleteData('guru', id);
      loadData();
    }
  };

  const downloadQR = (id, name) => {
    const wrapper = document.getElementById(`qr-wrapper-${id}`);
    if (!wrapper) return;
    const canvas = wrapper.querySelector('canvas');
    if (!canvas) {
      alert("QR Code tidak ditemukan");
      return;
    }
    const pngUrl = canvas.toDataURL("image/png");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `QR_${name.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex-between mb-6">
        <div>
          <h1>Master Data Guru</h1>
          <p className="text-muted">Kelola data guru dan QR Code presensi.</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="glass-panel" style={{ alignSelf: 'flex-start' }}>
          <h2 className="mb-4">Tambah Guru Baru</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Rudi Hermawan, S.Pd"
                value={formData.nama}
                onChange={e => setFormData({...formData, nama: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">NIP (Opsional)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="19800101..."
                value={formData.nip}
                onChange={e => setFormData({...formData, nip: e.target.value})}
              />
            </div>
            <div className="form-group mb-4">
              <label className="form-label">Mata Pelajaran</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Matematika"
                value={formData.mapel}
                onChange={e => setFormData({...formData, mapel: e.target.value})}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <Plus size={18} /> Simpan Data
            </button>
          </form>
        </div>

        <div className="glass-panel">
          <h2 className="mb-4">Daftar Guru</h2>
          <div className="flex-column gap-2">
            {gurus.length === 0 ? (
              <div className="text-center text-muted" style={{ padding: '24px' }}>Belum ada data</div>
            ) : gurus.map(guru => (
              <div key={guru.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                <div>
                  <div className="font-bold" style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{guru.nama}</div>
                  <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                    NIP: {guru.nip || '-'} &nbsp;•&nbsp; {guru.mapel || 'Guru'}
                  </div>
                </div>
                
                {/* Hidden QR Code for downloading */}
                <div id={`qr-wrapper-${guru.id}`} style={{ display: 'none' }}>
                  <QRCodeCanvas value={guru.id} size={500} level="M" />
                </div>

                <div className="flex-center gap-2">
                  <button className="btn btn-outline" onClick={() => downloadQR(guru.id, guru.nama)} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                    <Download size={14} /> Download QR
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(guru.id)} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MasterGuru;

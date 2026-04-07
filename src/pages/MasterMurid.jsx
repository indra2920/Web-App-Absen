import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Plus, Trash2 } from 'lucide-react';
import { getData, addData, deleteData, generateId } from '../db';

function MasterMurid() {
  const [murid, setMurid] = useState([]);
  const [formData, setFormData] = useState({ nama: '', nis: '', kelas: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getData('murid');
    setMurid(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama) return;
    
    const newMurid = {
      ...formData,
      id: generateId('MRD'),
      createdAt: new Date().toISOString()
    };
    
    await addData('murid', newMurid);
    setFormData({ nama: '', nis: '', kelas: '' });
    loadData();
  };

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus data ini?')) {
      await deleteData('murid', id);
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
    downloadLink.download = `QR_Murid_${name.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex-between mb-6">
        <div>
          <h1>Master Data Murid</h1>
          <p className="text-muted">Kelola data murid dan QR Code presensi.</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="glass-panel" style={{ alignSelf: 'flex-start' }}>
          <h2 className="mb-4">Tambah Murid Baru</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Budi Santoso"
                value={formData.nama}
                onChange={e => setFormData({...formData, nama: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">NIS (Nomor Induk Siswa)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="1001"
                value={formData.nis}
                onChange={e => setFormData({...formData, nis: e.target.value})}
              />
            </div>
            <div className="form-group mb-4">
              <label className="form-label">Kelas</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="10 IPA 1"
                value={formData.kelas}
                onChange={e => setFormData({...formData, kelas: e.target.value})}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <Plus size={18} /> Simpan Data
            </button>
          </form>
        </div>

        <div className="glass-panel">
          <h2 className="mb-4">Daftar Murid</h2>
          <div className="flex-column gap-2">
            {murid.length === 0 ? (
              <div className="text-center text-muted" style={{ padding: '24px' }}>Belum ada data</div>
            ) : murid.map(m => (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                <div>
                  <div className="font-bold" style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{m.nama}</div>
                  <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                    NIS: {m.nis || '-'} &nbsp;•&nbsp; {m.kelas || 'Murid'}
                  </div>
                </div>
                
                {/* Hidden QR Code for downloading */}
                <div id={`qr-wrapper-${m.id}`} style={{ display: 'none' }}>
                  <QRCodeCanvas value={m.id} size={500} level="M" />
                </div>

                <div className="flex-center gap-2">
                  <button className="btn btn-outline" onClick={() => downloadQR(m.id, m.nama)} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                    <Download size={14} /> Download QR
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(m.id)} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
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

export default MasterMurid;

import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { CheckCircle2, XCircle, Camera, RefreshCcw } from 'lucide-react';
import { getData, addData } from '../db';
import { format } from 'date-fns';

function Scanner() {
  const [scanResult, setScanResult] = useState(null);
  const [isError, setIsError] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const scannerRef = useRef(null);
  const isScanning = useRef(false); // To keep track of scanning state

  useEffect(() => {
    // 1. Get all cameras and auto-start the first one
    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length) {
        setCameras(devices);
        startScanner(devices[0].id);
      }
    }).catch(err => {
      console.error("Error getting cameras", err);
    });

    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = (cameraId) => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode("qr-reader");
    }

    if (isScanning.current) {
      stopScanner().then(() => {
        startScannerCore(cameraId);
      });
    } else {
      startScannerCore(cameraId);
    }
  };

  const startScannerCore = (cameraId) => {
    scannerRef.current.start(
      cameraId,
      { fps: 10, qrbox: { width: 250, height: 250 } },
      onScanSuccess,
      onScanFailure
    ).then(() => {
      isScanning.current = true;
    }).catch((err) => {
      console.log("Failed to start scanner", err);
    });
  };

  const stopScanner = () => {
    return new Promise((resolve) => {
      if (scannerRef.current && isScanning.current) {
        scannerRef.current.stop().then(() => {
          isScanning.current = false;
          resolve();
        }).catch(e => {
          resolve(); // Resolve even if error
        });
      } else {
        resolve();
      }
    });
  };

  const switchCamera = () => {
    if (cameras.length > 1) {
      const nextIndex = (currentCameraIndex + 1) % cameras.length;
      setCurrentCameraIndex(nextIndex);
      startScanner(cameras[nextIndex].id);
    }
  };

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = 800; // 800Hz beep
      
      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      console.log('Audio init failed');
    }
  };

  let isProcessing = false;
  const processAttendance = async (scannedId) => {
    if (isProcessing) return;
    isProcessing = true;
    
    playBeep();
    
    const guruData = await getData('guru');
    const muridData = await getData('murid');
    const logData = await getData('logAbsen');
    
    // Find personnel
    let person = guruData.find(g => g.id === scannedId);
    let role = 'guru';
    if (!person) {
      person = muridData.find(m => m.id === scannedId);
      role = 'murid';
    }

    if (!person) {
      setIsError(true);
      setScanResult({ message: 'QR Code tidak terdaftar dalam sistem!' });
      setTimeout(() => { setScanResult(null); isProcessing = false; }, 3000);
      return;
    }

    // Check today's attendance for this person
    const today = new Date().toLocaleDateString('id-ID');
    const personLogsToday = logData.filter(l => 
      l.personId === scannedId && new Date(l.timestamp).toLocaleDateString('id-ID') === today
    );

    let type = 'MASUK';
    if (personLogsToday.length > 0) {
      // If already has MASUK, next is PULANG
      const hasPulang = personLogsToday.find(l => l.type === 'PULANG');
      if (hasPulang) {
        setIsError(true);
        setScanResult({ message: `${person.nama} sudah absen pulang hari ini!` });
        setTimeout(() => { setScanResult(null); isProcessing = false; }, 3000);
        return;
      }
      type = 'PULANG';
    }

    const newLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type,
      personId: scannedId,
      role,
      name: person.nama,
      info: role === 'guru' ? (person.mapel || 'Guru') : (person.kelas || 'Murid')
    };

    await addData('logAbsen', newLog);
    
    setIsError(false);
    setScanResult({ 
      name: person.nama, 
      type,
      time: format(new Date(), 'HH:mm:ss'),
      role
    });

    setTimeout(() => {
      setScanResult(null);
      isProcessing = false;
    }, 4000);
  };

  let lastScan = 0;
  const onScanSuccess = (decodedText) => {
    const now = Date.now();
    if (now - lastScan < 4000 || scanResult || isProcessing) return; // Prevent double trigger within 4s
    lastScan = now;
    processAttendance(decodedText);
  };

  const onScanFailure = (error) => {
    // silently ignore ongoing scan failures (which happen every frame when no QR is found)
  };

  return (
    <div className="animate-fade-in flex-column flex-center" style={{ width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1>Scanner Absensi</h1>
        <p className="text-muted">Arahkan QR Code ke kamera. Scanner akan memindai secara otomatis.</p>
      </div>

      <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
        <div className="glass-panel" style={{ padding: '8px', overflow: 'hidden', position: 'relative' }}>
          {/* Scanner injects here */}
          <div id="qr-reader" style={{ border: 'none', borderRadius: '8px', overflow: 'hidden', width: '100%', minHeight: '300px', background: '#000' }}></div>
          
          {/* Custom Camera Controls Overlay */}
          {cameras.length > 1 && (
            <button 
              onClick={switchCamera}
              className="btn btn-primary" 
              style={{ position: 'absolute', bottom: '16px', right: '16px', zIndex: 5, borderRadius: '24px', padding: '8px 16px', fontSize: '0.8rem' }}>
              <RefreshCcw size={16} /> Ganti Kamera
            </button>
          )}
        </div>

        {/* Overlay Result Toast */}
        {scanResult && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: isError ? 'var(--accent-danger)' : 'var(--accent-success)',
            color: 'white',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            textAlign: 'center',
            width: '90%',
            zIndex: 10,
            animation: 'fadeIn 0.3s ease-out'
          }}>
            {isError ? (
              <XCircle size={64} style={{ margin: '0 auto 12px' }} />
            ) : (
              <CheckCircle2 size={64} style={{ margin: '0 auto 12px' }} />
            )}
            
            {isError ? (
              <h3 style={{ color: 'white' }}>{scanResult.message}</h3>
            ) : (
              <>
                <h2 style={{ color: 'white', marginBottom: '4px' }}>Berhasil!</h2>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{scanResult.name}</div>
                <div style={{ margin: '12px 0' }}>
                  <span className={`badge ${scanResult.type === 'MASUK' ? 'badge-success' : 'badge-warning'}`} style={{ color: 'white', border: '1px solid white', fontSize: '1rem', padding: '6px 12px' }}>
                    ABSEN {scanResult.type}
                  </span>
                </div>
                <div>Pukul {scanResult.time}</div>
              </>
            )}
          </div>
        )}
      </div>
      
    </div>
  );
}

export default Scanner;

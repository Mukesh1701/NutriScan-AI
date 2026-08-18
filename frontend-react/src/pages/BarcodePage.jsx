import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle, Camera, CheckCircle2, Copy, FlipHorizontal, Image,
  Lightbulb, PackageSearch, QrCode, RotateCcw, Search, ShieldCheck,
  StopCircle, ZoomIn, ZoomOut,
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useApp } from '../context/AppContext';
import { GRADE_INFO, NOVA_LABELS } from '../lib/config';

const FILE_SCANNER_ID = 'barcode-file-reader';
const FORMATS = [
  Html5QrcodeSupportedFormats.QR_CODE,
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.ITF,
  Html5QrcodeSupportedFormats.DATA_MATRIX,
];
const NATIVE_FORMATS = ['qr_code', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'itf', 'data_matrix'];

// Scan states
const STATE = { IDLE: 'idle', SCANNING: 'scanning', LOCKED: 'locked', LOADING: 'loading' };

export default function BarcodePage() {
  const { showToast } = useApp();

  // Scanner state
  const [scanState, setScanState] = useState(STATE.IDLE);
  const [feedback, setFeedback] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [facingMode, setFacingMode] = useState('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [zoomRange, setZoomRange] = useState({ min: 1, max: 1, step: 0.1 });
  const [mode, setMode] = useState('camera'); // 'camera' | 'upload'

  // Result state
  const [detectedCode, setDetectedCode] = useState('');
  const [codeType, setCodeType] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [product, setProduct] = useState(null);
  const [showResults, setShowResults] = useState(false);

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const rafRef = useRef(null);
  const hasScannedRef = useRef(false);
  const fileInputRef = useRef(null);
  const trackRef = useRef(null);

  // ─── Stop camera ──────────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    trackRef.current = null;
    const canvas = canvasRef.current;
    if (canvas) { const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, canvas.width, canvas.height); }
    setScanState(STATE.IDLE);
    setFeedback('');
    setTorchOn(false);
    setTorchSupported(false);
    setZoom(1);
    setZoomRange({ min: 1, max: 1, step: 0.1 });
  }, []);

  // ─── Draw overlay on canvas ───────────────────────────────────────────────
  const drawOverlay = useCallback((barcode = null) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || video.readyState < 2) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const W = canvas.width, H = canvas.height;

    if (barcode && barcode.cornerPoints && barcode.cornerPoints.length >= 4) {
      // Draw detection box around the exact barcode corners
      const pts = barcode.cornerPoints;
      ctx.save();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 4;
      ctx.shadowColor = 'rgba(34,197,94,0.6)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.closePath();
      ctx.stroke();
      // Corner dots
      ctx.fillStyle = '#22c55e';
      pts.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI * 2); ctx.fill(); });
      ctx.restore();
    } else {
      // Draw animated scan zone (centered viewfinder box)
      const bW = Math.round(W * 0.65), bH = Math.round(bW * 0.45);
      const bX = Math.round((W - bW) / 2), bY = Math.round((H - bH) / 2);
      const cLen = 28, cRad = 10, lW = 3;

      // Dimmed overlay outside the box
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.rect(0, 0, W, H);
      ctx.rect(bX + cRad, bY + cRad, bW - cRad * 2, bH - cRad * 2);
      ctx.fill('evenodd');
      ctx.restore();

      // Corner brackets
      const corners = [
        [bX, bY, 1, 1], [bX + bW, bY, -1, 1],
        [bX, bY + bH, 1, -1], [bX + bW, bY + bH, -1, -1],
      ];
      ctx.save();
      ctx.strokeStyle = '#7c3aed';
      ctx.lineWidth = lW;
      ctx.lineCap = 'round';
      corners.forEach(([cx, cy, dx, dy]) => {
        ctx.beginPath();
        ctx.moveTo(cx + dx * cLen, cy);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx, cy + dy * cLen);
        ctx.stroke();
      });
      ctx.restore();

      // Animated scan line (driven by timestamp)
      const progress = (Date.now() % 2000) / 2000;
      const scanY = bY + cRad + progress * (bH - cRad * 2);
      const grad = ctx.createLinearGradient(bX, 0, bX + bW, 0);
      grad.addColorStop(0, 'rgba(124,58,237,0)');
      grad.addColorStop(0.5, 'rgba(124,58,237,0.9)');
      grad.addColorStop(1, 'rgba(124,58,237,0)');
      ctx.save();
      ctx.fillStyle = grad;
      ctx.fillRect(bX + cRad, scanY - 1, bW - cRad * 2, 2);
      ctx.restore();
    }
  }, []);

  const startScanLoop = useCallback(() => {
    if (!detectorRef.current || !videoRef.current) return;

    const loop = async () => {
      const video = videoRef.current;
      const detector = detectorRef.current;
      if (!video || !detector || hasScannedRef.current) return;

      // Always redraw overlay so scan line animates every frame
      drawOverlay(null);

      if (video.readyState >= 2 && video.videoWidth > 0) {
        try {
          const barcodes = await detector.detect(video);
          if (barcodes.length > 0 && !hasScannedRef.current) {
            const b = barcodes[0];
            hasScannedRef.current = true;
            setScanState(STATE.LOCKED);
            setFeedback('Barcode locked!');
            // Draw the green detection box
            drawOverlay(b);
            const raw = b.rawValue;
            const fmt = b.format?.toUpperCase?.() || detectCodeType(raw);
            setDetectedCode(raw);
            setCodeType(fmt);
            setBarcodeInput(raw);
            showToast(`${fmt}: ${raw}`, 'success');
            // Short pause so user sees the locked box, then stop + lookup
            setTimeout(() => { stopCamera(); lookupBarcode(raw); }, 600);
            return; // don't schedule next frame
          }
        } catch (_) {}
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
  }, [drawOverlay, showToast, stopCamera]); // eslint-disable-line

  // ─── Start camera ─────────────────────────────────────────────────────────
  const startCamera = useCallback(async (overrideFacing) => {
    setCameraError('');
    hasScannedRef.current = false;
    setDetectedCode('');
    setCodeType('');
    setProduct(null);
    setShowResults(false);
    setScanState(STATE.SCANNING);
    setFeedback('Looking for barcodes...');

    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      setCameraError('Camera needs HTTPS. Test on localhost or the live site.');
      setScanState(STATE.IDLE);
      return;
    }

    // Build or reuse BarcodeDetector
    if (!detectorRef.current) {
      if ('BarcodeDetector' in window) {
        try {
          detectorRef.current = new window.BarcodeDetector({ formats: NATIVE_FORMATS });
        } catch (_) {}
      }
    }

    if (!detectorRef.current) {
      setCameraError('Your browser does not support the BarcodeDetector API. Please use Chrome, Edge, or a Chromium-based browser, or use the "Upload Image" mode instead.');
      setScanState(STATE.IDLE);
      return;
    }

    const facing = overrideFacing ?? facingMode;
    try {
      if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Detect torch & zoom capability
      const track = stream.getVideoTracks()[0];
      trackRef.current = track;
      if (track) {
        const caps = track.getCapabilities?.() || {};
        if (caps.torch) setTorchSupported(true);
        if (caps.zoom) {
          setZoomRange({ min: caps.zoom.min, max: caps.zoom.max, step: caps.zoom.step || 0.1 });
        }
      }

      startScanLoop();
    } catch (err) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera permission denied. Please allow camera access and try again.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera found on this device.');
      } else {
        setCameraError('Could not start camera. Close other apps using the camera and try again.');
      }
      setScanState(STATE.IDLE);
    }
  }, [facingMode, startScanLoop]);

  // ─── Flip camera ─────────────────────────────────────────────────────────
  const flipCamera = useCallback(async () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    if (scanState === STATE.SCANNING) {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      await startCamera(next);
    }
  }, [facingMode, scanState, startCamera]);

  // ─── Torch ───────────────────────────────────────────────────────────────
  const toggleTorch = useCallback(async () => {
    const track = trackRef.current;
    if (!track || !torchSupported) return;
    try {
      const next = !torchOn;
      await track.applyConstraints({ advanced: [{ torch: next }] });
      setTorchOn(next);
    } catch (_) {}
  }, [torchOn, torchSupported]);

  // ─── Zoom ─────────────────────────────────────────────────────────────────
  const applyZoom = useCallback(async (val) => {
    const track = trackRef.current;
    if (!track) return;
    try {
      await track.applyConstraints({ advanced: [{ zoom: val }] });
      setZoom(val);
    } catch (_) {}
  }, []);

  // ─── File scan ────────────────────────────────────────────────────────────
  const scanFromFile = async (file) => {
    if (!file) return;
    hasScannedRef.current = false;
    showToast('Scanning image...', 'info');
    try {
      const scanner = new Html5Qrcode(FILE_SCANNER_ID, { formatsToSupport: FORMATS, verbose: false });
      const result = await scanner.scanFile(file, false);
      await scanner.clear();
      if (result) {
        const code = typeof result === 'string' ? result : result.decodedText;
        const fmt = result?.format?.formatName || detectCodeType(code);
        setDetectedCode(code);
        setCodeType(fmt);
        setBarcodeInput(code);
        showToast(`${fmt}: ${code}`, 'success');
        lookupBarcode(code);
      }
    } catch (_) {
      showToast('No barcode found in that image. Try a clearer photo.', 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ─── Barcode lookup ───────────────────────────────────────────────────────
  const lookupBarcode = useCallback(async (code) => {
    const barcode = String(code ?? barcodeInput ?? '').trim();
    if (!barcode) { showToast('Enter or scan a code first.', 'error'); return; }
    setScanState(STATE.LOADING);
    setBarcodeInput(barcode);
    setDetectedCode(barcode);
    try {
      let found;
      for (const v of ['v2', 'v0']) {
        const res = await fetch(`https://world.openfoodfacts.org/api/${v}/product/${encodeURIComponent(barcode)}.json`);
        if (!res.ok) continue;
        const json = await res.json();
        if (json?.status === 1 && json.product) { found = json.product; break; }
      }
      if (!found) { showToast('Product not found in database.', 'error'); setScanState(STATE.IDLE); return; }
      setProduct(found);
      setShowResults(true);
      showToast('Product found!', 'success');
    } catch (e) {
      showToast('Could not connect to product database.', 'error');
    } finally {
      setScanState(prev => prev === STATE.LOADING ? STATE.IDLE : prev);
    }
  }, [barcodeInput, showToast]);

  // ─── Reset ────────────────────────────────────────────────────────────────
  const resetScanner = useCallback(async () => {
    stopCamera();
    setProduct(null);
    setShowResults(false);
    setDetectedCode('');
    setCodeType('');
    setBarcodeInput('');
    setCameraError('');
    setCopied(false);
    hasScannedRef.current = false;
    setMode('camera');
  }, [stopCamera]);

  // ─── Copy ─────────────────────────────────────────────────────────────────
  const copyToClipboard = async () => {
    if (!detectedCode) return;
    try { await navigator.clipboard.writeText(detectedCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch (_) {}
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────
  function detectCodeType(code) {
    if (!code) return 'Barcode';
    if (/^\d{13}$/.test(code)) return 'EAN-13';
    if (/^\d{8}$/.test(code)) return 'EAN-8';
    if (/^\d{12}$/.test(code)) return 'UPC-A';
    if (/^\d{6}$/.test(code)) return 'UPC-E';
    if (/^\d{14}$/.test(code)) return 'ITF-14';
    if (/^[A-Za-z0-9+/=]{20,}$/.test(code)) return 'QR Code';
    if (/^[A-Za-z0-9\-._~+/]+$/.test(code)) return 'CODE-128';
    return 'Barcode';
  }

  // Cleanup on unmount
  useEffect(() => () => stopCamera(), [stopCamera]);

  // ─── Derived values for results ───────────────────────────────────────────
  const nuts = product?.nutriments || {};
  const grade = (product?.nutriscore_grade || 'e').toLowerCase();
  const gradeUpper = grade.toUpperCase();
  const gradeInfo = GRADE_INFO[gradeUpper] || GRADE_INFO.E;
  const kcal = nuts['energy-kcal_100g'] ?? (nuts.energy_100g ? nuts.energy_100g / 4.184 : null);
  const fmt = (v) => (v == null || Number.isNaN(+v)) ? '?' : Number(v).toFixed(1);
  const badge = (v, med, hi) => {
    if (v == null || Number.isNaN(+v)) return null;
    const n = +v;
    if (n > hi) return { label: 'High', className: 'badge-high' };
    if (n > med) return { label: 'Moderate', className: 'badge-mod' };
    return { label: 'Low', className: 'badge-low' };
  };
  const warnings = [];
  if ((nuts.sugars_100g || 0) > 22.5) warnings.push(['danger', 'High Sugar', `${fmt(nuts.sugars_100g)}g per 100g`]);
  if ((nuts['saturated-fat_100g'] || 0) > 5) warnings.push(['danger', 'High Saturated Fat', `${fmt(nuts['saturated-fat_100g'])}g per 100g`]);
  if ((nuts.salt_100g || 0) > 1.5) warnings.push(['warning', 'High Salt', `${fmt(nuts.salt_100g)}g per 100g`]);
  if (product?.additives_n > 0) warnings.push(['info', `${product.additives_n} Additives`, (product.additives_tags || []).map(t => t.replace('en:', '').toUpperCase()).slice(0, 6).join(', ')]);
  if (product?.allergens) warnings.push(['danger', 'Allergens', product.allergens.replace(/en:/g, '')]);

  const isScanning = scanState === STATE.SCANNING;
  const isLocked  = scanState === STATE.LOCKED;
  const isLoading = scanState === STATE.LOADING;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div id="page-barcode">
      <section className="barcode-section clean-page">
        {/* Hero */}
        <div className="barcode-hero clean-hero">
          <span className="clean-eyebrow"><QrCode size={16} /> AI Barcode Scanner</span>
          <h1 className="barcode-title">Scan food products with your <span className="gradient-text">camera</span></h1>
          <p className="barcode-subtitle">Point your camera at any food barcode or QR code. NutriScan AI detects it instantly and shows the full nutrition profile.</p>
        </div>

        {!showResults ? (
          <div className="nscan-layout">
            {/* ── Scanner panel ── */}
            <div className="nscan-left">
              {/* Mode tabs */}
              <div className="nscan-mode-tabs">
                <button
                  className={`nscan-mode-tab ${mode === 'camera' ? 'active' : ''}`}
                  onClick={() => { setMode('camera'); if (isScanning) stopCamera(); }}
                >
                  <Camera size={16} /> Camera Scan
                </button>
                <button
                  className={`nscan-mode-tab ${mode === 'upload' ? 'active' : ''}`}
                  onClick={() => { setMode('upload'); stopCamera(); }}
                >
                  <Image size={16} /> Upload Image
                </button>
              </div>

              {mode === 'camera' ? (
                <div className="nscan-camera-card">
                  {/* Camera viewport */}
                  <div className={`nscan-viewport ${isScanning || isLocked ? 'live' : ''}`}>
                    <video
                      ref={videoRef}
                      className="nscan-video"
                      autoPlay
                      playsInline
                      muted
                      style={{ display: isScanning || isLocked ? 'block' : 'none' }}
                    />
                    <canvas
                      ref={canvasRef}
                      className="nscan-overlay-canvas"
                      style={{ display: isScanning || isLocked ? 'block' : 'none' }}
                    />

                    {/* Idle placeholder */}
                    {!isScanning && !isLocked && (
                      <div className="nscan-placeholder">
                        <QrCode size={56} opacity={0.5} />
                        <strong>Camera Preview</strong>
                        <span>Tap "Start Scanning" below</span>
                      </div>
                    )}

                    {/* In-camera action buttons */}
                    {(isScanning || isLocked) && (
                      <>
                        {/* Stop button top-left */}
                        <button className="nscan-cam-btn nscan-cam-stop" onClick={stopCamera} title="Stop camera">
                          <StopCircle size={18} />
                        </button>

                        {/* Top-right action cluster */}
                        <div className="nscan-cam-actions">
                          {torchSupported && (
                            <button
                              className={`nscan-cam-btn ${torchOn ? 'nscan-torch-on' : ''}`}
                              onClick={toggleTorch}
                              title="Torch"
                            >
                              <Lightbulb size={17} />
                            </button>
                          )}
                          <button className="nscan-cam-btn" onClick={flipCamera} title="Flip camera">
                            <FlipHorizontal size={17} />
                          </button>
                        </div>

                        {/* Zoom slider on the left */}
                        {zoomRange.max > zoomRange.min && (
                          <div className="nscan-zoom-rail">
                            <ZoomOut size={14} style={{ color: '#fff', opacity: 0.7 }} />
                            <input
                              type="range"
                              className="nscan-zoom-slider"
                              min={zoomRange.min}
                              max={zoomRange.max}
                              step={zoomRange.step}
                              value={zoom}
                              onChange={e => applyZoom(+e.target.value)}
                              style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                            />
                            <ZoomIn size={14} style={{ color: '#fff', opacity: 0.7 }} />
                          </div>
                        )}
                      </>
                    )}

                    {/* Feedback bar */}
                    {(isScanning || isLocked) && (
                      <div className={`nscan-feedback-bar ${isLocked ? 'locked' : 'scanning'}`}>
                        {isLocked ? <CheckCircle2 size={16} /> : <span className="nscan-pulse-dot" />}
                        <span>{feedback || (isLocked ? 'Barcode locked!' : 'Scanning... point at a barcode')}</span>
                      </div>
                    )}

                    {/* Loading overlay */}
                    {isLoading && (
                      <div className="nscan-loading-overlay">
                        <div className="nscan-spinner" />
                        <span>Looking up product...</span>
                      </div>
                    )}
                  </div>

                  {/* Start / detected section */}
                  {!isScanning && !isLocked && !isLoading && (
                    <button className="nscan-start-btn" onClick={() => startCamera()}>
                      <Camera size={20} /> Start Scanning
                    </button>
                  )}

                  {cameraError && (
                    <div className="nscan-camera-error">
                      <AlertTriangle size={16} /> {cameraError}
                    </div>
                  )}
                </div>
              ) : (
                /* Upload mode */
                <div
                  className="nscan-upload-zone"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                  onDragLeave={e => e.currentTarget.classList.remove('drag-over')}
                  onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); const f = e.dataTransfer.files?.[0]; if (f) scanFromFile(f); }}
                >
                  <Image size={52} opacity={0.4} />
                  <strong>Click or drag & drop an image</strong>
                  <span>JPG, PNG, WebP, GIF — any image with a clear barcode</span>
                  <button className="nscan-upload-btn">Choose Image</button>
                </div>
              )}

              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={e => scanFromFile(e.target.files?.[0])} />
              <div id={FILE_SCANNER_ID} style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 1, height: 1, overflow: 'hidden' }} />
            </div>

            {/* ── Right panel: detected code + manual lookup ── */}
            <div className="nscan-right">
              {/* Detected code card */}
              <div className="nscan-result-card">
                <div className="nscan-result-header">
                  <span>Detected Code</span>
                  {codeType && <span className="nscan-code-badge">{codeType}</span>}
                </div>
                <div className="nscan-result-value">
                  {detectedCode ? (
                    <>
                      <span className="nscan-code-text">{detectedCode}</span>
                      <button className="nscan-copy-btn" onClick={copyToClipboard} title="Copy">
                        {copied ? <CheckCircle2 size={16} style={{ color: 'var(--grade-a)' }} /> : <Copy size={16} />}
                      </button>
                    </>
                  ) : (
                    <span className="nscan-code-empty">Waiting for scan...</span>
                  )}
                </div>
              </div>

              {/* Manual lookup */}
              <div className="nscan-manual-card">
                <div className="nscan-manual-header">
                  <PackageSearch size={20} />
                  <div>
                    <h3>Manual Lookup</h3>
                    <p>Type a barcode number if camera isn't available</p>
                  </div>
                </div>
                <label className="nscan-label" htmlFor="barcode-input">Barcode / QR text</label>
                <div className="nscan-manual-row">
                  <input
                    id="barcode-input"
                    className="nscan-input"
                    value={barcodeInput}
                    onChange={e => setBarcodeInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && lookupBarcode()}
                    placeholder="e.g. 8901058852198"
                  />
                  <button className="nscan-lookup-btn" onClick={() => lookupBarcode()} disabled={isLoading}>
                    {isLoading ? <><span className="nscan-btn-spinner" /> Searching...</> : <><Search size={17} /> Lookup</>}
                  </button>
                </div>
                <div className="nscan-tips">
                  <div><CheckCircle2 size={14} /> Use good lighting and hold steady</div>
                  <div><CheckCircle2 size={14} /> Keep barcode fully in the scan zone</div>
                  <div><CheckCircle2 size={14} /> Works best on Chrome / Edge</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Results view */
          <div className="barcode-results-section clean-results">
            <div className={`grade-hero-card grade-${grade}-theme`}>
              <div className="grade-badge-circle"><span className="grade-letter">{gradeUpper}</span></div>
              <div className="grade-hero-info">
                <div className="grade-title-row">
                  <span className="grade-pill-tag">{gradeInfo.label}</span>
                  {product?.nova_group && <span className="grade-nova-badge">{NOVA_LABELS[product.nova_group] || 'NOVA 4 · Ultra-Processed'}</span>}
                </div>
                <h3 className="grade-main-title">Grade {gradeUpper} — {gradeInfo.label}</h3>
                <p className="grade-description">{gradeInfo.description}</p>
              </div>
            </div>

            <div className="product-info-card">
              <div className="product-info-row">
                <div className="product-img-wrapper">
                  <img
                    src={product?.image_url || 'https://images.openfoodfacts.org/images/icons/dist/packaging.svg'}
                    alt={product?.product_name || 'Product'}
                    onError={e => { e.target.src = 'https://images.openfoodfacts.org/images/icons/dist/packaging.svg'; }}
                  />
                </div>
                <div className="product-text-details">
                  <span className="prod-brand">{product?.brands || 'Unknown Brand'}</span>
                  <h3 className="prod-name">{product?.product_name || 'Unknown Product'}</h3>
                  <div className="prod-meta-tags">
                    <span className="prod-tag">Code: {detectedCode}</span>
                    <span className="prod-tag category-tag">{(product?.categories || '').split(',')[0].trim() || 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="barcode-card clean-card">
              <h3 className="section-label">Nutrition per 100g</h3>
              <div className="barcode-nut-grid">
                <Nut label="Calories" value={fmt(kcal)} unit="kcal" />
                <Nut label="Sugar" value={`${fmt(nuts.sugars_100g)}g`} badge={badge(nuts.sugars_100g, 5, 22.5)} />
                <Nut label="Fat" value={`${fmt(nuts.fat_100g)}g`} badge={badge(nuts.fat_100g, 3, 17.5)} />
                <Nut label="Sat Fat" value={`${fmt(nuts['saturated-fat_100g'])}g`} badge={badge(nuts['saturated-fat_100g'], 1.5, 5)} />
                <Nut label="Salt" value={`${fmt(nuts.salt_100g)}g`} badge={badge(nuts.salt_100g, 0.3, 1.5)} />
                <Nut label="Protein" value={`${fmt(nuts.proteins_100g)}g`} />
              </div>
            </div>

            <div className="barcode-card clean-card">
              <h3 className="section-label">Ingredient & Safety Alerts</h3>
              <div className="warnings-list">
                {warnings.length ? warnings.map(([type, title, desc], i) => (
                  <div key={i} className={`warning-alert-item alert-${type}`}>
                    <span className="alert-icon"><AlertTriangle size={18} /></span>
                    <div className="alert-info"><div className="alert-title">{title}</div><div className="alert-desc">{desc}</div></div>
                  </div>
                )) : (
                  <div className="warning-alert-item alert-info clean-safe-alert">
                    <span className="alert-icon"><ShieldCheck size={18} /></span>
                    <div className="alert-info"><div className="alert-title">No Major Warnings</div><div className="alert-desc">No significant ingredient alerts detected.</div></div>
                  </div>
                )}
              </div>
            </div>

            <button className="scan-primary-btn scan-again-wide" onClick={resetScanner}>
              <RotateCcw size={18} /> Scan Another Product
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function Nut({ label, value, unit, badge }) {
  return (
    <div className="b-nut-card">
      <div className="b-nut-val">{value}</div>
      <div className="b-nut-name">{label}</div>
      {unit && <div className="b-nut-unit">{unit}</div>}
      {badge && <span className={`b-nut-badge ${badge.className}`}>{badge.label}</span>}
    </div>
  );
}

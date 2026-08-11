import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Camera, CheckCircle2, Image, PackageSearch, QrCode, RotateCcw, Search, ShieldCheck, StopCircle } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useApp } from '../context/AppContext';
import { GRADE_INFO, NOVA_LABELS } from '../lib/config';

const SCANNER_ID = 'barcode-camera-reader';
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
];

export default function BarcodePage() {
  const { showToast } = useApp();
  const [barcodeInput, setBarcodeInput] = useState('');
  const [detectedCode, setDetectedCode] = useState('');
  const [scannerRunning, setScannerRunning] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const hasScannedRef = useRef(false);

  const stopScanner = async () => {
    const scanner = scannerRef.current;
    if (!scanner) {
      setScannerRunning(false);
      return;
    }

    try {
      const state = scanner.getState?.();
      if (state === 2) await scanner.stop();
      await scanner.clear();
    } catch (_) {}

    scannerRef.current = null;
    setScannerRunning(false);
  };

  const handleDetectedCode = async (code) => {
    if (!code || hasScannedRef.current) return;
    hasScannedRef.current = true;
    setDetectedCode(code);
    setBarcodeInput(code);
    showToast(`Code detected: ${code}`, 'success');
    await stopScanner();
    lookupBarcode(code);
  };

  const startScanner = async () => {
    setCameraError('');
    setShowResults(false);
    setProduct(null);
    setDetectedCode('');
    hasScannedRef.current = false;

    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      setCameraError('Camera access needs HTTPS or localhost. Use localhost while testing on your computer.');
      showToast('Camera needs HTTPS or localhost.', 'error');
      return;
    }

    await stopScanner();

    try {
      const scanner = new Html5Qrcode(SCANNER_ID, {
        formatsToSupport: FORMATS,
        verbose: false,
        experimentalFeatures: { useBarCodeDetectorIfSupported: true },
      });
      scannerRef.current = scanner;

      const width = Math.min(window.innerWidth - 48, 520);
      const qrbox = Math.max(220, Math.min(360, Math.floor(width * 0.78)));

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 24,
          qrbox: { width: qrbox, height: Math.floor(qrbox * 0.62) },
          aspectRatio: 1.777,
          disableFlip: true,
          videoConstraints: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        },
        (decodedText) => handleDetectedCode(decodedText),
        () => {}
      );

      setScannerRunning(true);
      showToast('Camera ready. Point at a QR or barcode.', 'info');
    } catch (error) {
      console.error('Scanner start failed:', error);
      setCameraError('Could not start camera. Allow camera permission, close other camera apps, and try again.');
      showToast('Could not start camera.', 'error');
      await stopScanner();
    }
  };

  const scanFromFile = async (file) => {
    if (!file) return;
    hasScannedRef.current = false;
    showToast('Scanning image...', 'info');

    try {
      const scanner = new Html5Qrcode(FILE_SCANNER_ID, { formatsToSupport: FORMATS, verbose: false });
      const code = await scanner.scanFile(file, false);
      await scanner.clear();
      if (code) handleDetectedCode(code);
    } catch (error) {
      console.error('File scan failed:', error);
      showToast('No QR/barcode found in image.', 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const lookupBarcode = async (code) => {
    const barcode = String(code || barcodeInput).trim();
    if (!barcode) {
      showToast('Enter or scan a code first.', 'error');
      return;
    }

    setLookupLoading(true);
    setBarcodeInput(barcode);
    setDetectedCode(barcode);

    try {
      let found;
      for (const version of ['v2', 'v0']) {
        const response = await fetch(`https://world.openfoodfacts.org/api/${version}/product/${encodeURIComponent(barcode)}.json`);
        if (!response.ok) continue;
        const json = await response.json();
        if (json?.status === 1 && json.product) {
          found = json.product;
          break;
        }
      }

      if (!found) {
        showToast('Code detected, but product was not found.', 'error');
        return;
      }

      setProduct(found);
      setShowResults(true);
      saveBarcodeToHistory(found, barcode);
      showToast('Product found.', 'success');
    } catch (error) {
      console.error('Product lookup failed:', error);
      showToast('Could not connect to product database.', 'error');
    } finally {
      setLookupLoading(false);
    }
  };

  const saveBarcodeToHistory = (prod, code) => {
    try {
      const history = JSON.parse(localStorage.getItem('food_history') || '[]');
      const displayName = [prod.product_name || 'Unknown Product', prod.brands].filter(Boolean).join(' · ');
      history.unshift({
        id: `scan_${Date.now()}`,
        created_at: new Date().toISOString(),
        food: `Barcode: ${displayName}`,
        confidence: 100,
        calories: prod.nutriments?.['energy-kcal_100g'] ?? null,
        image_data: prod.image_url || null,
        isBarcode: true,
        barcode: code,
        grade: prod.nutriscore_grade ? prod.nutriscore_grade.toUpperCase() : 'N/A',
      });
      localStorage.setItem('food_history', JSON.stringify(history.slice(0, 30)));
    } catch (_) {}
  };

  const resetScanner = async () => {
    await stopScanner();
    setProduct(null);
    setShowResults(false);
    setDetectedCode('');
    setBarcodeInput('');
    setCameraError('');
    hasScannedRef.current = false;
  };

  useEffect(() => () => { stopScanner(); }, []);

  const nuts = product?.nutriments || {};
  const grade = (product?.nutriscore_grade || 'e').toLowerCase();
  const gradeUpper = grade.toUpperCase();
  const gradeInfo = GRADE_INFO[gradeUpper] || GRADE_INFO.E;
  const kcal = nuts['energy-kcal_100g'] ?? (nuts.energy_100g ? nuts.energy_100g / 4.184 : null);
  const fmt = (value) => value === undefined || value === null || Number.isNaN(Number(value)) ? '?' : Number(value).toFixed(1);
  const badge = (value, medium, high) => {
    if (value === undefined || value === null || Number.isNaN(Number(value))) return null;
    const n = Number(value);
    if (n > high) return { label: 'High', className: 'badge-high' };
    if (n > medium) return { label: 'Moderate', className: 'badge-mod' };
    return { label: 'Low', className: 'badge-low' };
  };

  const warnings = [];
  if ((nuts.sugars_100g || 0) > 22.5) warnings.push(['danger', 'High Sugar Content', `Contains ${fmt(nuts.sugars_100g)}g sugar per 100g.`]);
  if ((nuts['saturated-fat_100g'] || 0) > 5) warnings.push(['danger', 'High Saturated Fat', `Contains ${fmt(nuts['saturated-fat_100g'])}g saturated fat per 100g.`]);
  if ((nuts.salt_100g || 0) > 1.5) warnings.push(['warning', 'High Salt', `Contains ${fmt(nuts.salt_100g)}g salt per 100g.`]);
  if (product?.additives_n > 0) warnings.push(['info', `Food Additives Detected (${product.additives_n})`, (product.additives_tags || []).map((t) => t.replace('en:', '').toUpperCase()).slice(0, 8).join(', ') || 'Contains additives.']);
  if (product?.allergens) warnings.push(['danger', 'Allergens Present', product.allergens.replace(/en:/g, '')]);

  return (
    <div id="page-barcode">
      <section className="barcode-section clean-page">
        <div className="barcode-hero clean-hero">
          <span className="clean-eyebrow"><QrCode size={16} /> Fast QR & Barcode Scanner</span>
          <h2 className="barcode-title">Scan products with your <span className="gradient-text">camera</span></h2>
          <p className="barcode-subtitle">Open the camera, point at a QR code or food barcode, and the detected code appears instantly before product lookup.</p>
        </div>

        {!showResults ? (
          <div className="scan-layout">
            <div className="scanner-panel clean-card">
              <div className="scanner-toolbar">
                <button type="button" className="scan-primary-btn" onClick={scannerRunning ? stopScanner : startScanner}>
                  {scannerRunning ? <StopCircle size={19} /> : <Camera size={19} />}
                  {scannerRunning ? 'Stop Camera' : 'Start Camera Scan'}
                </button>
                <button type="button" className="scan-secondary-btn" onClick={() => fileInputRef.current?.click()}>
                  <Image size={18} /> Upload Image
                </button>
              </div>

              <div className={`camera-frame ${scannerRunning ? 'camera-live' : ''}`}>
                <div id={SCANNER_ID} className="camera-reader" />
                {!scannerRunning && (
                  <div className="camera-placeholder">
                    <QrCode size={54} />
                    <strong>Camera preview</strong>
                    <span>Tap Start Camera Scan</span>
                  </div>
                )}
                <div className="scan-box-overlay">
                  <span className="scan-corner scan-corner-tl" />
                  <span className="scan-corner scan-corner-tr" />
                  <span className="scan-corner scan-corner-bl" />
                  <span className="scan-corner scan-corner-br" />
                  {scannerRunning && <span className="scan-line" />}
                </div>
              </div>

              {cameraError && (
                <div className="camera-error"><AlertTriangle size={16} /> {cameraError}</div>
              )}

              <div className="detected-code-card">
                <span>Detected Code</span>
                <strong>{detectedCode || 'Waiting for scan...'}</strong>
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => scanFromFile(e.target.files?.[0])} />
              <div id={FILE_SCANNER_ID} style={{ display: 'none' }} />
            </div>

            <div className="manual-panel clean-card">
              <div className="manual-panel-title">
                <PackageSearch size={22} />
                <div>
                  <h3>Manual Lookup</h3>
                  <p>Type barcode digits if camera scan is not available.</p>
                </div>
              </div>
              <label className="form-label" htmlFor="barcode-input">Barcode / QR text</label>
              <div className="clean-input-row">
                <input id="barcode-input" className="form-input" value={barcodeInput} onChange={(e) => setBarcodeInput(e.target.value)} placeholder="Example: 5000159484695" />
                <button type="button" className="scan-primary-btn" onClick={() => lookupBarcode()} disabled={lookupLoading}>
                  <Search size={18} /> {lookupLoading ? 'Searching...' : 'Lookup'}
                </button>
              </div>
              <div className="scanner-tips">
                <div><CheckCircle2 size={15} /> Use good lighting</div>
                <div><CheckCircle2 size={15} /> Keep barcode inside the box</div>
                <div><CheckCircle2 size={15} /> Works best on HTTPS or localhost</div>
              </div>
            </div>
          </div>
        ) : (
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
                  <img src={product?.image_url || 'https://images.openfoodfacts.org/images/icons/dist/packaging.svg'} alt={product?.product_name || 'Product'} onError={(e) => { e.target.src = 'https://images.openfoodfacts.org/images/icons/dist/packaging.svg'; }} />
                </div>
                <div className="product-text-details">
                  <span className="prod-brand">{product?.brands || 'Unknown Brand'}</span>
                  <h3 className="prod-name">{product?.product_name || 'Unknown Product'}</h3>
                  <div className="prod-meta-tags">
                    <span className="prod-tag">Detected: {detectedCode}</span>
                    <span className="prod-tag category-tag">Category: {(product?.categories || '').split(',')[0].trim() || 'Unknown'}</span>
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
                {warnings.length ? warnings.map(([type, title, desc], index) => (
                  <div key={index} className={`warning-alert-item alert-${type}`}>
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

            <button type="button" className="scan-primary-btn scan-again-wide" onClick={resetScanner}>
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

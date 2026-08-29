import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Camera, CheckCircle2, Copy, ExternalLink, History, Image, PackageSearch, PlusCircle, QrCode, RotateCcw, Search, ShieldCheck, Sparkles, StopCircle } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useApp } from '../context/AppContext';
import { GRADE_INFO, NOVA_LABELS } from '../lib/config';

const SCANNER_ID = 'barcode-camera-reader';
const FILE_SCANNER_ID = 'barcode-file-reader';
// Food-relevant formats only — fewer formats = faster per-frame detection
const FORMATS = [
  Html5QrcodeSupportedFormats.QR_CODE,
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.CODE_128,
];

// Native BarcodeDetector formats (Chrome/Edge/Android) — mirrors the list above
const NATIVE_FORMATS = ['qr_code', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'];

// Food-barcode formats we actually care about. BarcodeDetector exists on
// desktop Chrome/Edge but ONLY supports qr_code there, so we must verify real
// format support via getSupportedFormats() before using the native full-frame
// scanner — otherwise EAN/UPC food barcodes are never detected on desktop.
const FOOD_NATIVE_FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39'];

// Open Food Facts lookup tuning:
//  - mirrors tried in order (world → country mirrors spread load and provide
//    some resilience against rate limiting/outages)
//  - only the fields we actually render (keeps payloads small and fast)
//  - lc=en asks for English product names where available
const OFF_MIRRORS = ['world', 'in', 'us', 'fr'];
const OFF_FIELDS = [
  'code', 'product_name', 'brands', 'image_url', 'categories',
  'nutriscore_grade', 'nova_group', 'additives_n', 'additives_tags',
  'allergens', 'ingredients_analysis_tags', 'nutriments', 'labels',
].join(',');
const OFF_TIMEOUT_MS = 10000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const SCAN_HISTORY_KEY = 'nutriscan_scan_history';
const MAX_HISTORY = 50;

// Persist a scanned product to local scan history (best-effort, never throws)
function saveBarcodeToHistory(product, barcode) {
  try {
    const entry = {
      id: Date.now(),
      barcode,
      name: product?.product_name || 'Unknown Product',
      brand: product?.brands || '',
      grade: (product?.nutriscore_grade || '').toUpperCase(),
      image: product?.image_url || '',
      timestamp: new Date().toISOString(),
    };
    const history = JSON.parse(localStorage.getItem(SCAN_HISTORY_KEY) || '[]');
    const deduped = Array.isArray(history) ? history.filter((h) => h.barcode !== barcode) : [];
    localStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify([entry, ...deduped].slice(0, MAX_HISTORY)));
  } catch (e) {
    console.warn('Failed to save scan history:', e);
  }
}


export default function BarcodePage() {
  const { showToast } = useApp();
  const [barcodeInput, setBarcodeInput] = useState('');
  const [detectedCode, setDetectedCode] = useState('');
  const [codeType, setCodeType] = useState('');
  const [scannerRunning, setScannerRunning] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [notFound, setNotFound] = useState('');
  // '' | 'rate-limited' | 'network' — distinguishes "not in DB" from API issues
  const [lookupIssue, setLookupIssue] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [copied, setCopied] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const hasScannedRef = useRef(false);
  const scanCountRef = useRef(0);
  const barcodeInputRef = useRef('');
  // Holds the rAF id for the native BarcodeDetector fast path
  const rafRef = useRef(null);
  // Holds the MediaStream for the native full-frame scanner
  const streamRef = useRef(null);

  const stopScanner = useCallback(async () => {
    // Cancel the native BarcodeDetector rAF loop first
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    // Tear down the native full-frame scanner (direct getUserMedia)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    const container = document.getElementById(SCANNER_ID);
    const nativeVideo = container?.querySelector('video.native-video');
    if (nativeVideo) nativeVideo.remove();

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
  }, []);

  const detectCodeType = useCallback((code) => {
    if (!code) return 'Unknown';
    if (/^[A-Za-z0-9+/=]+$/.test(code) && code.length > 20) return 'QR Code';
    if (/^\d{13}$/.test(code)) return 'EAN-13';
    if (/^\d{8}$/.test(code)) return 'EAN-8';
    if (/^\d{12}$/.test(code)) return 'UPC-A';
    if (/^\d{6}$/.test(code)) return 'UPC-E';
    if (/^[A-Za-z0-9\-._~+/]+$/.test(code)) return 'CODE-128';
    if (/^[A-Z0-9\-. $/+%]+$/.test(code)) return 'CODE-39';
    if (/^\d{14}$/.test(code)) return 'ITF';
    return 'Barcode';
  }, []);

  const handleDetectedCode = useCallback((code, format) => {
    if (!code) return;
    
    scanCountRef.current += 1;
    if (scanCountRef.current === 1) {
      hasScannedRef.current = true;
      const detectedType = format || detectCodeType(code);
      setDetectedCode(code);
      setCodeType(detectedType);
      setBarcodeInput(code);
      showToast(`${detectedType} detected: ${code}`, 'success');
      stopScanner();
      lookupBarcode(code);
    }
  }, [showToast, stopScanner, detectCodeType]);

  /**
   * Native full-frame scanner (like professional scanner sites):
   * opens the camera directly via getUserMedia and scans the ENTIRE video
   * frame with BarcodeDetector every animation frame — no small scan box,
   * no html5-qrcode canvas overhead. Very fast on Chrome/Edge/Android.
   */
  const startNativeScanner = useCallback(async () => {
    const container = document.getElementById(SCANNER_ID);
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: false,
    });
    streamRef.current = stream;

    const video = document.createElement('video');
    video.className = 'native-video';
    video.setAttribute('playsinline', 'true'); // iOS: play inline instead of fullscreen
    video.muted = true;
    video.autoplay = true;
    video.srcObject = stream;
    container.innerHTML = '';
    container.appendChild(video);
    await video.play();

    let detector;
    try {
      detector = new window.BarcodeDetector({ formats: NATIVE_FORMATS });
    } catch (_) {
      detector = new window.BarcodeDetector(); // fall back to all supported formats
    }

    const loop = async () => {
      if (!streamRef.current || hasScannedRef.current) return;

      if (video.readyState >= 2 && video.videoWidth > 0) {
        try {
          const barcodes = await detector.detect(video);
          if (barcodes.length > 0 && !hasScannedRef.current) {
            // Pick the biggest (closest) barcode in the frame
            const area = (b) => (b.boundingBox?.width || 0) * (b.boundingBox?.height || 0);
            const best = barcodes.reduce((a, b) => (area(b) > area(a) ? b : a));
            handleDetectedCode(best.rawValue, best.format?.toUpperCase?.() || null);
            return; // don't schedule next frame — scanner will be stopped
          }
        } catch (_) {
          // detect() can throw on hidden/zero-size frames — safe to ignore
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    setScannerRunning(true);
    showToast('Camera ready — hold the barcode anywhere in view.', 'info');
  }, [showToast, handleDetectedCode]);

  const startScanner = useCallback(async () => {
    setCameraError('');
    setShowResults(false);
    setProduct(null);
    setDetectedCode('');
    setCodeType('');
    setNotFound('');
    setLookupIssue('');
    hasScannedRef.current = false;
    scanCountRef.current = 0;

    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      setCameraError('Camera access needs HTTPS or localhost. Use localhost while testing on your computer.');
      showToast('Camera needs HTTPS or localhost.', 'error');
      return;
    }

    await stopScanner();

    // Preferred path: native full-frame BarcodeDetector — but ONLY when the
    // browser actually supports the food barcode formats. Desktop Chrome/Edge
    // ships BarcodeDetector yet only supports qr_code, so we gate on
    // getSupportedFormats() and otherwise fall through to html5-qrcode, whose
    // ZXing decoder reads EAN/UPC barcodes on every platform (desktop too).
    if ('BarcodeDetector' in window) {
      let canScanFoodBarcodes = false;
      if (typeof window.BarcodeDetector.getSupportedFormats === 'function') {
        try {
          const supportedFormats = await window.BarcodeDetector.getSupportedFormats();
          canScanFoodBarcodes = Array.isArray(supportedFormats) &&
            supportedFormats.some((f) => FOOD_NATIVE_FORMATS.includes(f));
          if (!canScanFoodBarcodes && supportedFormats?.length) {
            console.info(
              `BarcodeDetector only supports: ${supportedFormats.join(', ')} — using html5-qrcode for EAN/UPC.`
            );
          }
        } catch (error) {
          console.warn('Could not query BarcodeDetector format support:', error);
        }
      } else {
        // Very old build of the API — trust that EAN/UPC formats listed below
        // are supported and let the native path throw if they aren't.
        canScanFoodBarcodes = true;
      }

      if (canScanFoodBarcodes) {
        try {
          await startNativeScanner();
          return;
        } catch (error) {
          console.error('Native scanner failed:', error);
          await stopScanner();
          // fall through to html5-qrcode fallback
        }
      }
    }

    // Fallback: html5-qrcode (browsers without BarcodeDetector, e.g. iOS Safari)
    try {
      const scanner = new Html5Qrcode(SCANNER_ID, {
        formatsToSupport: FORMATS,
        verbose: false,
        experimentalFeatures: { useBarCodeDetectorIfSupported: true },
      });
      scannerRef.current = scanner;

      const width = Math.min(window.innerWidth - 48, 520);
      const qrbox = Math.max(240, Math.min(420, Math.floor(width * 0.85)));

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 30,
          qrbox: { width: qrbox, height: Math.floor(qrbox * 0.6) },
          // false = also detect flipped/rotated barcodes (common on packaging)
          disableFlip: false,
          videoConstraints: {
            facingMode: { ideal: 'environment' },
            // Higher resolution = better barcode detection at distance
            width: { ideal: 1920, min: 1280 },
            height: { ideal: 1080, min: 720 },
          },
        },
        (decodedText, decodedResult) => {
          const format = decodedResult?.result?.format?.formatName || null;
          handleDetectedCode(decodedText, format);
        },
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
  }, [showToast, stopScanner, handleDetectedCode, startNativeScanner]);

  const scanFromFile = async (file) => {
    if (!file) return;
    hasScannedRef.current = false;
    scanCountRef.current = 0;
    showToast('Scanning image...', 'info');

    try {
      const scanner = new Html5Qrcode(FILE_SCANNER_ID, { 
        formatsToSupport: FORMATS, 
        verbose: false,
        experimentalFeatures: { useBarCodeDetectorIfSupported: true }
      });
      // Pass false to avoid rendering image in DOM, which fails if container is hidden
      const result = await scanner.scanFile(file, false);
      await scanner.clear();
      if (result) {
        const code = typeof result === 'string' ? result : result.decodedText;
        const format = result?.format?.formatName || detectCodeType(code);
        handleDetectedCode(code, format);
      }
    } catch (error) {
      console.error('File scan failed:', error);
      showToast('No QR/barcode found in image.', 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Keep ref in sync with state so lookupBarcode always reads fresh value
  useEffect(() => { barcodeInputRef.current = barcodeInput; }, [barcodeInput]);

  // Load saved scan history for the Recent Scans strip
  const loadScanHistory = useCallback(() => {
    try {
      const history = JSON.parse(localStorage.getItem(SCAN_HISTORY_KEY) || '[]');
      setScanHistory(Array.isArray(history) ? history : []);
    } catch (_) {
      setScanHistory([]);
    }
  }, []);

  useEffect(() => { loadScanHistory(); }, [loadScanHistory]);

  const clearScanHistory = () => {
    try { localStorage.removeItem(SCAN_HISTORY_KEY); } catch (_) {}
    setScanHistory([]);
    showToast('Scan history cleared.', 'info');
  };

  // Single Open Food Facts product lookup against one mirror/version.
  // Returns:
  //   { product }  → product found
  //   { rateLimited: true } → HTTP 429 (do NOT show "not found"; user should retry)
  //   { networkError: true } / { timedOut: true } → could not reach the API
  //   null → product simply isn't in the database (404 / status 0)
  const fetchOffProduct = useCallback(async (barcode, version, mirror) => {
    const url =
      `https://${mirror}.openfoodfacts.org/api/${version}/product/${encodeURIComponent(barcode)}.json` +
      `?fields=${OFF_FIELDS}&lc=en`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), OFF_TIMEOUT_MS);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (response.status === 429) return { rateLimited: true };
      if (!response.ok) return null;
      const json = await response.json();
      if (json?.status === 1 && json.product) return { product: json.product };
      return null;
    } catch (error) {
      if (error?.name === 'AbortError') return { timedOut: true };
      return { networkError: true };
    } finally {
      clearTimeout(timer);
    }
  }, []);

  const lookupBarcode = useCallback(async (code) => {
    // Prefer the explicitly passed code, then the ref (always fresh), then state
    const barcode = String(code ?? barcodeInputRef.current ?? barcodeInput).trim();
    if (!barcode) {
      showToast('Enter or scan a code first.', 'error');
      return;
    }

    setBarcodeInput(barcode);
    setDetectedCode(barcode);
    setNotFound('');
    setLookupIssue('');

    // QR codes often contain links, not products — help the user instead of a dead-end error
    if (/^https?:\/\//i.test(barcode)) {
      setNotFound(barcode);
      showToast('This QR contains a link, not a product code.', 'info');
      return;
    }

    setLookupLoading(true);

    try {
      let found = null;
      let rateLimited = false;
      let networkIssue = false;
      let attempts = 0;

      // Try mirrors/versions with a tiny pause between attempts so we never
      // hammer the database — important because OFF rate-limits per IP.
      for (const mirror of OFF_MIRRORS) {
        for (const version of ['v2', 'v0']) {
          const result = await fetchOffProduct(barcode, version, mirror);
          attempts += 1;
          if (result?.product) { found = result.product; break; }
          if (result?.rateLimited) rateLimited = true;
          if (result?.networkError || result?.timedOut) networkIssue = true;
          if (attempts < OFF_MIRRORS.length * 2) await sleep(200);
        }
        if (found) break;
      }

      if (!found) {
        setNotFound(barcode);
        if (rateLimited) {
          setLookupIssue('rate-limited');
          showToast('Open Food Facts is busy right now — please try again in a few seconds.', 'error');
        } else if (networkIssue) {
          setLookupIssue('network');
          showToast('Could not connect to the product database. Check your connection.', 'error');
        } else {
          setLookupIssue('not-found');
          showToast('Product not found in the database.', 'info');
        }
        return;
      }

      setProduct(found);
      setShowResults(true);
      saveBarcodeToHistory(found, barcode);
      loadScanHistory();
      showToast('Product found.', 'success');
    } catch (error) {
      console.error('Product lookup failed:', error);
      setNotFound(barcode);
      setLookupIssue('network');
      showToast('Could not connect to product database.', 'error');
    } finally {
      setLookupLoading(false);
    }
  }, [showToast, loadScanHistory, fetchOffProduct, barcodeInput]);

  const resetScanner = async () => {
    await stopScanner();
    setProduct(null);
    setShowResults(false);
    setDetectedCode('');
    setCodeType('');
    setBarcodeInput('');
    setCameraError('');
    setNotFound('');
    setLookupIssue('');
    setCopied(false);
    hasScannedRef.current = false;
    scanCountRef.current = 0;
  };

  const copyToClipboard = async () => {
    if (!detectedCode) return;
    try {
      await navigator.clipboard.writeText(detectedCode);
      setCopied(true);
      showToast('Code copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {
      showToast('Failed to copy', 'error');
    }
  };

  useEffect(() => () => { stopScanner(); }, [stopScanner]);

  const nuts = product?.nutriments || {};
  const rawGrade = (product?.nutriscore_grade || '').toLowerCase();
  const isValidGrade = ['a', 'b', 'c', 'd', 'e', 'f'].includes(rawGrade);
  const grade = isValidGrade ? rawGrade : 'e';
  const gradeUpper = isValidGrade ? rawGrade.toUpperCase() : '?';
  const gradeInfo = isValidGrade
    ? (GRADE_INFO[gradeUpper] || GRADE_INFO.E)
    : { label: 'Grade Not Available', description: 'This product does not have enough nutrition data in the database to compute a health grade yet.' };
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
        <div className="barcode-hero clean-hero hero-premium">
          <div className="hero-emojis" aria-hidden="true">
            <span className="fe fe-1">🍎</span>
            <span className="fe fe-2">🥑</span>
            <span className="fe fe-3">🍓</span>
            <span className="fe fe-4">🥕</span>
            <span className="fe fe-5">🍇</span>
          </div>
          <span className="clean-eyebrow"><QrCode size={16} /> Fast QR & Barcode Scanner</span>
          <h2 className="barcode-title hero-display">Know what's really <span className="gradient-shimmer">in your food</span></h2>
          <p className="barcode-subtitle">Point your camera at any product barcode and instantly get its health grade, nutrition breakdown, and ingredient alerts.</p>
          <div className="hero-trust-chips">
            <span className="trust-chip"><CheckCircle2 size={14} /> 100% Free</span>
            <span className="trust-chip"><ShieldCheck size={14} /> No sign-up</span>
            <span className="trust-chip"><PackageSearch size={14} /> 3M+ products</span>
          </div>
        </div>

        {!showResults && (
          <div className="how-it-works">
            <div className="hiw-step">
              <span className="hiw-num">1</span>
              <div className="hiw-icon"><Camera size={22} /></div>
              <h4>Scan</h4>
              <p>Point your camera at any food barcode or QR code.</p>
            </div>
            <div className="hiw-arrow" aria-hidden="true">→</div>
            <div className="hiw-step">
              <span className="hiw-num">2</span>
              <div className="hiw-icon"><Search size={22} /></div>
              <h4>Analyze</h4>
              <p>AI grades the product and breaks down its nutrition.</p>
            </div>
            <div className="hiw-arrow" aria-hidden="true">→</div>
            <div className="hiw-step">
              <span className="hiw-num">3</span>
              <div className="hiw-icon"><CheckCircle2 size={22} /></div>
              <h4>Decide</h4>
              <p>Get alerts and choose smarter, healthier options.</p>
            </div>
          </div>
        )}

        {notFound && !showResults && (
          <div className="notfound-card clean-card">
            <div className="nf-icon"><PackageSearch size={32} /></div>
            <h3 className="nf-title">
              {/^https?:\/\//i.test(notFound) ? 'This QR contains a link' : lookupIssue === 'rate-limited' ? 'Open Food Facts is busy right now' : lookupIssue === 'network' ? 'Could not reach the product database' : 'Product not found in the database'}
            </h3>
            <p className="nf-desc">
              {/^https?:\/\//i.test(notFound) ? (
                <>The scanned code is a website link, not a product barcode. You can open it below, or scan a product's EAN/UPC barcode instead.</>
              ) : lookupIssue === 'rate-limited' ? (
                <>Too many lookups in a short time tripped a safety limit. Wait a few seconds and try again — most lookups succeed on the first retry.</>
              ) : lookupIssue === 'network' ? (
                <>We couldn't reach the Open Food Facts database. Check your internet connection and try again.</>
              ) : (
                <>Code <strong>{notFound}</strong> isn't in Open Food Facts yet — this is common for regional brands and newly launched products. You can help everyone by adding it, or try our AI photo classifier instead.</>
              )}
            </p>
            <div className="nf-actions">
              {!/^https?:\/\//i.test(notFound) && !lookupIssue && (
                <Link className="nf-btn nf-primary" to="/classify">
                  <Sparkles size={16} /> Try AI Photo Classifier
                </Link>
              )}
              {/^https?:\/\//i.test(notFound) && (
                <a className="nf-btn nf-primary" href={notFound} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={16} /> Open Link
                </a>
              )}
              {!/^https?:\/\//i.test(notFound) && !lookupIssue && (
                <a
                  className="nf-btn"
                  href={`https://world.openfoodfacts.org/cgi/product.pl?barcode=${encodeURIComponent(notFound)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <PlusCircle size={16} /> Add it to Open Food Facts
                </a>
              )}
              <button type="button" className="nf-btn" onClick={resetScanner}>
                <RotateCcw size={16} /> {lookupIssue ? 'Try Again' : 'Scan Another Code'}
              </button>
            </div>
          </div>
        )}

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
                <div className="detected-code-header">
                  <span>Detected Code</span>
                  {codeType && <span className="code-type-badge">{codeType}</span>}
                </div>
                <div className="detected-code-value">
                  <strong>{detectedCode || 'Waiting for scan...'}</strong>
                  {detectedCode && (
                    <button type="button" className="copy-btn" onClick={copyToClipboard} title="Copy to clipboard">
                      {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                    </button>
                  )}
                </div>
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => scanFromFile(e.target.files?.[0])} />
              <div id={FILE_SCANNER_ID} style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: '300px', height: '300px', zIndex: -100 }} />
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
                <div><CheckCircle2 size={15} /> Hold the barcode anywhere in view</div>
                <div><CheckCircle2 size={15} /> Use good lighting, keep it steady</div>
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

        {!showResults && scanHistory.length > 0 && (
          <div className="recent-scans clean-card">
            <div className="recent-scans-header">
              <h3 className="section-label"><History size={16} /> Recent Scans</h3>
              <button type="button" className="rs-clear" onClick={clearScanHistory}>Clear</button>
            </div>
            <div className="rs-track">
              {scanHistory.slice(0, 10).map((h) => (
                <button
                  key={h.barcode}
                  type="button"
                  className="rs-card"
                  onClick={() => lookupBarcode(h.barcode)}
                  title={`Look up ${h.name || h.barcode}`}
                >
                  {h.image ? (
                    <img className="rs-img" src={h.image} alt="" loading="lazy" onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <span className="rs-fallback"><PackageSearch size={20} /></span>
                  )}
                  <span className="rs-name">{h.name || 'Unknown Product'}</span>
                  {h.brand && <span className="rs-brand">{h.brand}</span>}
                  {['A', 'B', 'C', 'D', 'E', 'F'].includes(h.grade) && (
                    <span className={`rs-grade rs-grade-${h.grade.toLowerCase()}`}>{h.grade}</span>
                  )}
                </button>
              ))}
            </div>
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

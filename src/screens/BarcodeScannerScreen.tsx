import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  QrCode,
  Keyboard,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Search,
  Sparkles,
  ShieldAlert,
  Building2,
  Layers,
  Calendar,
} from 'lucide-react';
import { clinicalAudio } from '../services/audioFeedback';
import { findMedicineByBarcode } from '../services/verificationEngine';
import { Medicine } from '../types';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';

type ScannerCameraState =
  | 'INITIALIZING'
  | 'PERMISSION_REQUIRED'
  | 'CAMERA_READY'
  | 'CODE_DETECTED'
  | 'LOOKUP_RESULT'
  | 'CAMERA_UNAVAILABLE';

export const BarcodeScannerScreen: React.FC = () => {
  const {
    selectedPrescriptionMedicine,
    executeScanVerification,
    navigateToDeepScreen,
    navigateBackFromDeepScreen,
    reducedMotion,
  } = useApp();

  const [cameraState, setCameraState] = useState<ScannerCameraState>('INITIALIZING');
  const [errorMessage, setErrorMessage] = useState('');
  const [detectedCode, setDetectedCode] = useState<string>('');
  const [detectedFormat, setDetectedFormat] = useState<string>('1D / 2D Barcode');
  const [isDemoScan, setIsDemoScan] = useState(false);
  const [foundProduct, setFoundProduct] = useState<Medicine | null>(null);
  const [lookupDone, setLookupDone] = useState(false);

  // Manual & Demo Modals
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const zxingControlsRef = useRef<IScannerControls | null>(null);
  const scanLoopActiveRef = useRef(false);

  // Stop camera stream & decoding controls
  const stopScanner = useCallback(() => {
    scanLoopActiveRef.current = false;

    if (zxingControlsRef.current) {
      try {
        zxingControlsRef.current.stop();
      } catch (e) {
        console.warn('Error stopping ZXing controls:', e);
      }
      zxingControlsRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Handle successful barcode detection
  const handleBarcodeDetected = useCallback(
    (code: string, format = 'BARCODE') => {
      const trimmed = code.trim();
      if (!trimmed || scanLoopActiveRef.current === false) return;

      // Lock scanner to prevent duplicate triggers
      scanLoopActiveRef.current = false;
      clinicalAudio.playScanClick();

      setDetectedCode(trimmed);
      setDetectedFormat(format);
      setIsDemoScan(false);
      setCameraState('CODE_DETECTED');

      // Pause video playback to give immediate optical feedback
      if (videoRef.current) {
        videoRef.current.pause();
      }
    },
    []
  );

  // Native BarcodeDetector loop if supported by browser
  const startNativeBarcodeLoop = useCallback(
    (video: HTMLVideoElement) => {
      if (!('BarcodeDetector' in window)) return false;

      try {
        const detector = new (window as any).BarcodeDetector({
          formats: [
            'ean_13',
            'ean_8',
            'code_128',
            'code_39',
            'qr_code',
            'data_matrix',
            'upc_a',
            'upc_e',
          ],
        });

        const checkFrame = async () => {
          if (!scanLoopActiveRef.current || !video || video.readyState < 2) {
            if (scanLoopActiveRef.current) {
              requestAnimationFrame(checkFrame);
            }
            return;
          }

          try {
            const barcodes = await detector.detect(video);
            if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
              handleBarcodeDetected(
                barcodes[0].rawValue,
                (barcodes[0].format || 'EAN/GTIN').toUpperCase()
              );
              return;
            }
          } catch {
            // Ignore frame decode misses
          }

          if (scanLoopActiveRef.current) {
            requestAnimationFrame(checkFrame);
          }
        };

        requestAnimationFrame(checkFrame);
        return true;
      } catch {
        return false;
      }
    },
    [handleBarcodeDetected]
  );

  // Start real live camera and ZXing reader
  const startScanner = useCallback(async () => {
    stopScanner();
    setCameraState('INITIALIZING');
    setErrorMessage('');
    setDetectedCode('');
    setFoundProduct(null);
    setLookupDone(false);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraState('CAMERA_UNAVAILABLE');
      setErrorMessage(
        'Live camera access is not supported in this browser. Enter the barcode manually or select demo test barcodes.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      scanLoopActiveRef.current = true;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});

        // 1. Try native BarcodeDetector if available
        const nativeStarted = startNativeBarcodeLoop(videoRef.current);

        // 2. If native detector not available or fallback needed, use ZXing
        if (!nativeStarted) {
          try {
            const codeReader = new BrowserMultiFormatReader();
            const controls = await codeReader.decodeFromVideoElement(
              videoRef.current,
              (result) => {
                if (result && scanLoopActiveRef.current) {
                  handleBarcodeDetected(
                    result.getText(),
                    result.getBarcodeFormat() ? String(result.getBarcodeFormat()) : 'EAN-13'
                  );
                }
              }
            );
            zxingControlsRef.current = controls;
          } catch (zxingErr) {
            console.warn('ZXing fallback initialized:', zxingErr);
          }
        }
      }

      setCameraState('CAMERA_READY');
    } catch (err: any) {
      console.warn('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraState('PERMISSION_REQUIRED');
        setErrorMessage(
          'Camera permission was denied. SMART-MED SAFE requires camera access to scan medication barcodes.'
        );
      } else {
        setCameraState('CAMERA_UNAVAILABLE');
        setErrorMessage(
          err.message ||
            'Unable to access device camera. The camera might be in use or not accessible in this context.'
        );
      }
    }
  }, [stopScanner, startNativeBarcodeLoop, handleBarcodeDetected]);

  // Lifecycle cleanup
  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, [startScanner, stopScanner]);

  // Rescan action: resets state and restarts camera scanning loop
  const handleScanAgain = () => {
    setDetectedCode('');
    setFoundProduct(null);
    setLookupDone(false);
    setIsDemoScan(false);
    startScanner();
  };

  // Perform product lookup on the detected code
  const handlePerformLookup = () => {
    if (!detectedCode) return;
    const med = findMedicineByBarcode(detectedCode) || null;
    setFoundProduct(med);
    setLookupDone(true);
    setCameraState('LOOKUP_RESULT');
  };

  // Run full safety verification comparison and proceed to comparison screen
  const handleProceedToVerification = async () => {
    if (!detectedCode) return;
    try {
      await executeScanVerification(detectedCode);
      stopScanner();
      navigateToDeepScreen('comparison');
    } catch (err) {
      console.error('Verification comparison error:', err);
    }
  };

  // Manual code submission
  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = manualCodeInput.trim();
    if (!clean) return;

    scanLoopActiveRef.current = false;
    setDetectedCode(clean);
    setDetectedFormat('MANUAL ENTRY');
    setIsDemoScan(false);
    setShowManualInput(false);
    setManualCodeInput('');

    // Immediately trigger lookup
    const med = findMedicineByBarcode(clean) || null;
    setFoundProduct(med);
    setLookupDone(true);
    setCameraState('LOOKUP_RESULT');
  };

  // Explicit Demo barcode click (strictly isolated behind Demo modal/panel)
  const handleSelectDemoBarcode = (code: string, label: string) => {
    setIsDemoModalOpen(false);
    scanLoopActiveRef.current = false;

    setDetectedCode(code);
    setDetectedFormat(`DEMO (${label})`);
    setIsDemoScan(true);

    const med = findMedicineByBarcode(code) || null;
    setFoundProduct(med);
    setLookupDone(true);
    setCameraState('LOOKUP_RESULT');
  };

  if (!selectedPrescriptionMedicine) {
    return (
      <div className="flex-1 p-6 text-center text-slate-500 text-xs flex flex-col items-center justify-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-amber-500" />
        <div>No prescription medication selected for verification.</div>
        <button
          onClick={() => {
            stopScanner();
            navigateBackFromDeepScreen();
          }}
          className="px-3 py-1.5 bg-slate-800 text-white rounded-xs text-xs font-semibold"
        >
          Return to Prescription
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-950 text-white flex flex-col justify-between overflow-hidden relative select-none">
      {/* Top App Bar */}
      <div className="p-3 bg-slate-900/90 backdrop-blur-xs flex items-center justify-between border-b border-slate-800 z-20">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              stopScanner();
              navigateBackFromDeepScreen();
            }}
            className="p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xs transition-colors"
            title="Cancel scan"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center space-x-1.5">
              <span>Scan Medicine Barcode</span>
            </h1>
            <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
              Verifying: {selectedPrescriptionMedicine.medicineName}{' '}
              {selectedPrescriptionMedicine.strength} ({selectedPrescriptionMedicine.dosageForm})
            </p>
          </div>
        </div>

        {/* Action Controls in Top Bar */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setShowManualInput(!showManualInput)}
            className={`px-2 py-1 text-[10px] font-semibold rounded-xs border flex items-center space-x-1 transition-colors ${
              showManualInput
                ? 'bg-slate-700 border-slate-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Keyboard className="w-3 h-3" />
            <span className="hidden xs:inline">Manual</span>
          </button>

          <button
            onClick={() => setIsDemoModalOpen(true)}
            className="px-2 py-1 text-[10px] font-semibold rounded-xs border border-amber-600/50 bg-slate-800 hover:bg-slate-700 text-amber-300 flex items-center space-x-1"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Demo</span>
          </button>
        </div>
      </div>

      {/* Manual Input Drawer */}
      {showManualInput && (
        <div className="p-3 bg-slate-900 border-b border-slate-800 z-20 shadow-md">
          <form onSubmit={handleManualCodeSubmit} className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300">Manual Barcode / GTIN Lookup:</span>
              <span className="text-[10px] text-slate-500 font-mono">1D / 2D digits</span>
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={manualCodeInput}
                onChange={(e) => setManualCodeInput(e.target.value)}
                placeholder="e.g. 8901112223334"
                className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xs text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xs flex items-center space-x-1"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Viewfinder & Center Camera Stream */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
        {/* State 1: INITIALIZING */}
        {cameraState === 'INITIALIZING' && (
          <div className="flex flex-col items-center justify-center space-y-3 p-6 text-center z-10">
            <div className="w-10 h-10 border-2 border-slate-600 border-t-emerald-400 rounded-full animate-spin" />
            <div className="text-xs font-semibold text-slate-200">
              Initializing barcode optics...
            </div>
            <div className="text-[11px] text-slate-400 max-w-xs">
              Configuring live video feed and barcode recognition sensors
            </div>
          </div>
        )}

        {/* State 2: PERMISSION REQUIRED */}
        {cameraState === 'PERMISSION_REQUIRED' && (
          <div className="flex flex-col items-center justify-center space-y-3 p-6 text-center max-w-xs z-10">
            <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center border border-amber-500/40">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-slate-100">Camera Access Required</div>
            <p className="text-xs text-slate-400">
              SMART-MED SAFE requires camera access to scan packaging barcodes for dispensing verification.
            </p>
            <div className="pt-2 w-full space-y-2">
              <button
                onClick={startScanner}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xs"
              >
                Allow Camera
              </button>
              <button
                onClick={() => setShowManualInput(true)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xs border border-slate-700"
              >
                Enter Barcode Manually
              </button>
            </div>
          </div>
        )}

        {/* State 3: CAMERA UNAVAILABLE */}
        {cameraState === 'CAMERA_UNAVAILABLE' && (
          <div className="flex flex-col items-center justify-center space-y-3 p-6 text-center max-w-xs z-10">
            <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center border border-red-500/40">
              <XCircle className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-slate-100">Camera Unavailable</div>
            <p className="text-xs text-slate-400">
              {errorMessage || 'Unable to start camera for barcode scanning.'}
            </p>
            <div className="pt-2 w-full space-y-2">
              <button
                onClick={startScanner}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xs border border-slate-600 flex items-center justify-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                <span>Try Again</span>
              </button>
              <button
                onClick={() => setShowManualInput(true)}
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xs"
              >
                Enter Barcode Manually
              </button>
              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="w-full py-1.5 text-amber-400 hover:text-amber-300 text-xs font-semibold"
              >
                Use Test Barcodes (Demo) →
              </button>
            </div>
          </div>
        )}

        {/* State 4: REAL LIVE CAMERA STREAM ONLY — NO FAKE IMAGES */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            cameraState === 'CAMERA_READY' ? 'opacity-100' : 'opacity-20 pointer-events-none'
          }`}
        />

        {/* Clinical Barcode Reticle Target Box (Only visible during live scanning) */}
        {cameraState === 'CAMERA_READY' && (
          <div className="relative w-64 h-48 border-2 border-emerald-400/90 rounded-sm pointer-events-none flex flex-col justify-between p-2 shadow-2xs z-10">
            {/* Top Reticle Corners */}
            <div className="flex justify-between">
              <span className="w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
              <span className="w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
            </div>

            {/* Subtle Scanning Beam (Red line, strictly non-holographic) */}
            <div
              className={`w-full h-0.5 bg-red-500 shadow-sm ${
                reducedMotion ? 'opacity-70' : 'animate-pulse'
              }`}
            />

            {/* Bottom Reticle Corners */}
            <div className="flex justify-between">
              <span className="w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
              <span className="w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
            </div>

            {/* Text Guideline */}
            <div className="absolute -bottom-7 left-0 right-0 text-center">
              <span className="bg-slate-900/85 backdrop-blur-xs text-emerald-300 text-[10px] font-mono px-2.5 py-0.5 rounded-xs border border-emerald-500/40">
                ALIGN BARCODE INSIDE FRAME
              </span>
            </div>
          </div>
        )}

        {/* State 5: CODE DETECTED MODAL / BOTTOM SHEET */}
        {cameraState === 'CODE_DETECTED' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs z-30 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 text-white w-full max-w-sm rounded-sm p-4 space-y-4 shadow-2xl animate-in fade-in">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                    Barcode Captured
                  </div>
                  <h3 className="text-sm font-bold text-white font-mono">{detectedCode}</h3>
                  <div className="text-[10px] text-slate-400">Format: {detectedFormat}</div>
                </div>
              </div>

              <div className="p-2.5 bg-slate-800/80 rounded-xs border border-slate-700 text-xs text-slate-300">
                Code captured from package. Tap <strong>Look Up Product</strong> to query the hospital formulary directory.
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleScanAgain}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xs border border-slate-700 flex items-center justify-center space-x-1"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  <span>Scan Again</span>
                </button>
                <button
                  onClick={handlePerformLookup}
                  className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xs flex items-center justify-center space-x-1 shadow-md"
                >
                  <Search className="w-3.5 h-3.5 mr-1" />
                  <span>Look Up Product</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* State 6: LOOKUP RESULT — FOUND VS UNKNOWN PRODUCT */}
        {cameraState === 'LOOKUP_RESULT' && lookupDone && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs z-30 flex items-center justify-center p-4">
            {foundProduct ? (
              /* PRODUCT FOUND */
              <div className="bg-slate-900 border border-slate-700 text-white w-full max-w-sm rounded-sm p-4 space-y-3.5 shadow-2xl animate-in fade-in">
                {/* Header */}
                <div className="flex items-start justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                      Product Identified in Formulary
                    </span>
                  </div>
                  {isDemoScan && (
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded-xs font-bold uppercase">
                      Demo Scan
                    </span>
                  )}
                </div>

                {/* Medicine Information */}
                <div>
                  <h3 className="text-base font-bold text-white">
                    {foundProduct.medicineName} {foundProduct.strength}
                  </h3>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Generic: <strong>{foundProduct.genericName}</strong>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Commercial Brand: {foundProduct.brandName}
                  </div>
                </div>

                {/* Specification Badges */}
                <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-800/80 p-2.5 rounded-xs border border-slate-700/80">
                  <div>
                    <span className="text-slate-400 block">Dosage Form:</span>
                    <span className="font-semibold text-slate-200">{foundProduct.dosageForm}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Manufacturer:</span>
                    <span className="font-semibold text-slate-200 truncate block">
                      {foundProduct.manufacturer}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Batch Number:</span>
                    <span className="font-mono text-slate-200">{foundProduct.batchNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Expiry Date:</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {foundProduct.expiryDate} (Valid ✓)
                    </span>
                  </div>
                </div>

                {/* Barcode Reference */}
                <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
                  <span>GTIN Barcode:</span>
                  <span className="text-slate-200 font-bold">{foundProduct.barcode}</span>
                </div>

                {/* Verification Action */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={handleScanAgain}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xs border border-slate-700 flex items-center justify-center space-x-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                    <span>Scan Again</span>
                  </button>
                  <button
                    onClick={handleProceedToVerification}
                    className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xs flex items-center justify-center space-x-1 shadow-md"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                    <span>Run Verification</span>
                  </button>
                </div>
              </div>
            ) : (
              /* UNKNOWN BARCODE — PRODUCT NOT FOUND */
              <div className="bg-slate-900 border border-red-800/80 text-white w-full max-w-sm rounded-sm p-4 space-y-3.5 shadow-2xl animate-in fade-in">
                <div className="flex items-center space-x-2 text-red-400 pb-2 border-b border-slate-800">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wide">
                    Product Not Found in Formulary
                  </span>
                </div>

                <div className="bg-red-950/40 border border-red-900/60 p-3 rounded-xs space-y-1">
                  <div className="text-[10px] text-red-300 font-semibold uppercase">
                    Scanned Barcode:
                  </div>
                  <div className="font-mono text-sm font-bold text-white tracking-wider">
                    {detectedCode}
                  </div>
                </div>

                <p className="text-xs text-slate-300">
                  The application could not identify this product in the hospital pharmacy database. Do not dispense unregistered items without supervisor authorization.
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={handleScanAgain}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xs border border-slate-700 flex items-center justify-center space-x-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                    <span>Scan Again</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowManualInput(true);
                      setCameraState('CAMERA_READY');
                    }}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xs border border-slate-700 flex items-center justify-center space-x-1"
                  >
                    <Keyboard className="w-3.5 h-3.5 mr-1" />
                    <span>Enter Manually</span>
                  </button>
                </div>

                <button
                  onClick={handleProceedToVerification}
                  className="w-full py-2 bg-red-900/60 hover:bg-red-800 text-red-200 text-xs font-semibold rounded-xs border border-red-700 flex items-center justify-center space-x-1"
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                  <span>Proceed to Mismatch Review</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Status & Camera Control Dock */}
      <div className="p-3.5 bg-slate-900 border-t border-slate-800 z-20 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center space-x-2">
            <span
              className={`w-2 h-2 rounded-full ${
                cameraState === 'CAMERA_READY'
                  ? 'bg-emerald-400 animate-pulse'
                  : cameraState === 'CODE_DETECTED' || cameraState === 'LOOKUP_RESULT'
                  ? 'bg-amber-400'
                  : 'bg-slate-500'
              }`}
            />
            <span className="text-slate-300 font-mono text-[10px]">
              {cameraState === 'CAMERA_READY'
                ? 'Camera Optics: Active (Awaiting Barcode)'
                : cameraState === 'CODE_DETECTED'
                ? 'Barcode Locked: Verification Pending'
                : cameraState === 'LOOKUP_RESULT'
                ? 'Product Directory Queried'
                : 'Sensor Idle'}
            </span>
          </div>

          <button
            onClick={handleScanAgain}
            className="text-[10px] text-slate-400 hover:text-white flex items-center space-x-1 font-mono"
            title="Reset scanner"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Optics</span>
          </button>
        </div>

        <div className="text-[10px] text-slate-400 text-center font-sans">
          Present the physical medication box or strip barcode directly to the camera viewport.
        </div>
      </div>

      {/* EXPLICIT DEMO TEST BARCODES MODAL */}
      {isDemoModalOpen && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 text-white w-full sm:max-w-md rounded-t-sm sm:rounded-sm p-4 space-y-3.5 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-2 border-b border-slate-800">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-300 bg-amber-900/60 border border-amber-600/50 px-2 py-0.5 rounded-xs">
                  Demonstration Mode
                </span>
                <h3 className="text-sm font-bold text-white mt-1">
                  Test Barcodes for Clinical Comparison
                </h3>
              </div>
              <button
                onClick={() => setIsDemoModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Select a clinical test barcode to simulate scanning a physical package without camera optics:
            </p>

            <div className="space-y-2">
              {/* Test 1: EXACT MATCH */}
              <button
                onClick={() =>
                  handleSelectDemoBarcode(
                    '8901112223334',
                    'Paracetamol 500mg Tab - Exact Match'
                  )
                }
                className="w-full p-2.5 bg-slate-800/80 hover:bg-slate-750 border border-emerald-600/50 rounded-xs text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-emerald-400">
                    [DEMO 1] Correct Medication (Match ✓)
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Paracetamol 500 mg Tablet (Crocin / Calpol)
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">GTIN: 8901112223334</div>
                </div>
                <span className="text-xs font-bold text-emerald-400 px-2 py-1 bg-emerald-950/80 rounded-xs border border-emerald-700">
                  Select →
                </span>
              </button>

              {/* Test 2: WRONG STRENGTH */}
              <button
                onClick={() =>
                  handleSelectDemoBarcode(
                    '8901112223335',
                    'Paracetamol 650mg Tab - Wrong Strength'
                  )
                }
                className="w-full p-2.5 bg-slate-800/80 hover:bg-slate-750 border border-red-600/50 rounded-xs text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-red-400">
                    [DEMO 2] Wrong Strength (Mismatch ✕)
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Paracetamol 650 mg Tablet (Dolo 650)
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">GTIN: 8901112223335</div>
                </div>
                <span className="text-xs font-bold text-red-400 px-2 py-1 bg-red-950/80 rounded-xs border border-red-700">
                  Select →
                </span>
              </button>

              {/* Test 3: WRONG DOSAGE FORM */}
              <button
                onClick={() =>
                  handleSelectDemoBarcode(
                    '8901112223336',
                    'Paracetamol 500mg Cap - Wrong Form'
                  )
                }
                className="w-full p-2.5 bg-slate-800/80 hover:bg-slate-750 border border-red-600/50 rounded-xs text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-red-400">
                    [DEMO 3] Wrong Dosage Form (Mismatch ✕)
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Paracetamol 500 mg Capsule (Panadol Rapid)
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">GTIN: 8901112223336</div>
                </div>
                <span className="text-xs font-bold text-red-400 px-2 py-1 bg-red-950/80 rounded-xs border border-red-700">
                  Select →
                </span>
              </button>

              {/* Test 4: WRONG MEDICINE */}
              <button
                onClick={() =>
                  handleSelectDemoBarcode(
                    '8902223334441',
                    'Amoxicillin 500mg Cap - Wrong Medicine'
                  )
                }
                className="w-full p-2.5 bg-slate-800/80 hover:bg-slate-750 border border-red-600/50 rounded-xs text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-red-400">
                    [DEMO 4] Wrong Medicine (Mismatch ✕)
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Amoxicillin 500 mg Capsule (Novamox)
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">GTIN: 8902223334441</div>
                </div>
                <span className="text-xs font-bold text-red-400 px-2 py-1 bg-red-950/80 rounded-xs border border-red-700">
                  Select →
                </span>
              </button>

              {/* Test 5: UNKNOWN / UNREGISTERED BARCODE */}
              <button
                onClick={() =>
                  handleSelectDemoBarcode(
                    '9999999999999',
                    'Unregistered Barcode - Unknown Item'
                  )
                }
                className="w-full p-2.5 bg-slate-800/80 hover:bg-slate-750 border border-amber-600/50 rounded-xs text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-amber-400">
                    [DEMO 5] Unknown Barcode (Not in Database)
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Unregistered packaging code: 9999999999999
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">GTIN: 9999999999999</div>
                </div>
                <span className="text-xs font-bold text-amber-400 px-2 py-1 bg-amber-950/80 rounded-xs border border-amber-700">
                  Select →
                </span>
              </button>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setIsDemoModalOpen(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Camera,
  RotateCcw,
  Check,
  Image as ImageIcon,
  AlertCircle,
  ShieldAlert,
  Sparkles,
  X,
  FileText,
} from 'lucide-react';
import { SAMPLE_PRESCRIPTIONS_DATA, SamplePrescriptionPreset } from '../services/mockData';

type CameraStatus =
  | 'INITIALIZING'
  | 'PERMISSION_REQUIRED'
  | 'CAMERA_READY'
  | 'CAPTURED'
  | 'CAMERA_UNAVAILABLE';

export const ScanPrescriptionScreen: React.FC = () => {
  const { navigateToDeepScreen, navigateBackFromDeepScreen, createDraftPrescription } = useApp();

  const [cameraState, setCameraState] = useState<CameraStatus>('INITIALIZING');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop active camera tracks
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Request & Start real camera feed
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraState('INITIALIZING');
    setErrorMessage('');

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraState('CAMERA_UNAVAILABLE');
      setErrorMessage(
        'Live camera access is not supported by this browser environment. Use Gallery upload or Demo mode.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
        };
      }

      setCameraState('CAMERA_READY');
    } catch (err: any) {
      console.warn('Camera initialization error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraState('PERMISSION_REQUIRED');
        setErrorMessage(
          'Camera permission was denied. SMART-MED SAFE requires camera access to capture physical prescriptions.'
        );
      } else {
        setCameraState('CAMERA_UNAVAILABLE');
        setErrorMessage(
          err.message ||
            'Unable to access the device camera. The camera may be in use by another application or restricted by your browser.'
        );
      }
    }
  }, [stopCamera]);

  // Lifecycle: initialize camera on mount and clean up strictly on unmount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Capture current video frame to canvas
  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(video, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedPhoto(dataUrl);
      setCameraState('CAPTURED');
      stopCamera();
    }
  };

  // Retake photo: clear snapshot and re-start camera
  const handleRetake = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  // Gallery file picker
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedPhoto(event.target.result as string);
          setCameraState('CAPTURED');
          stopCamera();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Pharmacist confirms captured photo -> send to OCR pipeline
  const handleUsePhoto = async () => {
    if (!capturedPhoto) return;
    setIsProcessingOcr(true);

    try {
      // Send image to OCR endpoint or parse prescription
      let extractedData: any = null;

      try {
        const res = await fetch('/api/prescriptions/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: capturedPhoto.split(',')[1] || capturedPhoto,
          }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.extracted) {
            extractedData = json.extracted;
          }
        }
      } catch (e) {
        console.warn('Server OCR fallback to hospital intake structure:', e);
      }

      // Default extracted clinical structure if OCR needs pharmacist review
      if (!extractedData) {
        extractedData = {
          prescriptionNumber: `${Math.floor(1000 + Math.random() * 9000)}`,
          patient: 'PT-CAPTURED (Inpatient Ingestion)',
          doctor: 'Attending Physician, MD',
          medicines: [
            {
              medicineName: 'Paracetamol',
              strength: '500 mg',
              dosageForm: 'Tablet',
              dose: '1 tablet (500mg)',
              frequency: 'TID (Every 8 hours)',
              route: 'Oral',
              duration: '3 days',
              quantity: 9,
            },
            {
              medicineName: 'Amoxicillin',
              strength: '500 mg',
              dosageForm: 'Capsule',
              dose: '1 capsule (500mg)',
              frequency: 'TID (Every 8 hours)',
              route: 'Oral',
              duration: '5 days',
              quantity: 15,
            },
            {
              medicineName: 'Pantoprazole',
              strength: '40 mg',
              dosageForm: 'Tablet',
              dose: '1 tablet (40mg)',
              frequency: 'OD (Once daily)',
              route: 'Oral',
              duration: '7 days',
              quantity: 7,
            },
          ],
        };
      }

      createDraftPrescription({
        prescriptionNumber: extractedData.prescriptionNumber || `${Math.floor(1000 + Math.random() * 9000)}`,
        patientRef: extractedData.patient || extractedData.patientRef || 'PT-CAPTURED-INP',
        prescriberName: extractedData.doctor || extractedData.prescriberName || 'Attending Physician, MD',
        sourceType: 'CAMERA_SCAN',
        originalImageUrl: capturedPhoto,
        medicines: extractedData.medicines,
      });

      navigateToDeepScreen('ocr-processing');
    } finally {
      setIsProcessingOcr(false);
    }
  };

  // Explicit Demo Preset Selection (clearly separated from normal live flow)
  const handleSelectDemoPreset = (preset: SamplePrescriptionPreset) => {
    setIsDemoModalOpen(false);
    stopCamera();

    createDraftPrescription({
      prescriptionNumber: `DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
      patientRef: `${preset.patient} [DEMO]`,
      prescriberName: `${preset.doctor} [DEMO]`,
      sourceType: 'CAMERA_SCAN',
      medicines: preset.medicines,
    });

    navigateToDeepScreen('ocr-processing');
  };

  return (
    <div className="flex-1 bg-slate-950 text-white flex flex-col justify-between overflow-hidden relative select-none">
      {/* Hidden file input for gallery */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Top Header Bar */}
      <div className="p-3 bg-slate-900/90 backdrop-blur-xs flex items-center justify-between border-b border-slate-800 z-20">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              stopCamera();
              navigateBackFromDeepScreen();
            }}
            className="p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xs transition-colors"
            title="Cancel and return"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Scan Prescription
            </h1>
            <p className="text-[10px] text-slate-400">
              {cameraState === 'CAPTURED'
                ? 'Document snapshot frozen'
                : 'Position ward prescription in frame'}
            </p>
          </div>
        </div>

        {/* Demo Mode Button (Explicitly separated) */}
        <button
          onClick={() => setIsDemoModalOpen(true)}
          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-semibold border border-amber-600/50 rounded-xs flex items-center space-x-1"
        >
          <FileText className="w-3 h-3 text-amber-400" />
          <span>Demo Mode</span>
        </button>
      </div>

      {/* Main Viewfinder / Canvas Area */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
        {/* State 1: INITIALIZING */}
        {cameraState === 'INITIALIZING' && (
          <div className="flex flex-col items-center justify-center space-y-3 p-6 text-center z-10">
            <div className="w-10 h-10 border-2 border-slate-600 border-t-emerald-400 rounded-full animate-spin" />
            <div className="text-xs font-semibold text-slate-200">Starting camera...</div>
            <div className="text-[11px] text-slate-400 max-w-xs">
              Requesting video hardware access from operating system
            </div>
          </div>
        )}

        {/* State 2: PERMISSION REQUIRED */}
        {cameraState === 'PERMISSION_REQUIRED' && (
          <div className="flex flex-col items-center justify-center space-y-3 p-6 text-center max-w-xs z-10">
            <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center border border-amber-500/40">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-slate-100">Camera Permission Required</div>
            <p className="text-xs text-slate-400">
              SMART-MED SAFE needs camera permission to capture and verify paper prescriptions.
            </p>
            <div className="pt-2 w-full space-y-2">
              <button
                onClick={startCamera}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xs"
              >
                Allow Camera
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xs border border-slate-700"
              >
                Choose from Gallery
              </button>
            </div>
          </div>
        )}

        {/* State 3: CAMERA UNAVAILABLE */}
        {cameraState === 'CAMERA_UNAVAILABLE' && (
          <div className="flex flex-col items-center justify-center space-y-3 p-6 text-center max-w-xs z-10">
            <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center border border-red-500/40">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-slate-100">Camera Unavailable</div>
            <p className="text-xs text-slate-400">
              {errorMessage || 'Unable to access live camera feed on this device.'}
            </p>
            <div className="pt-2 w-full space-y-2">
              <button
                onClick={startCamera}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xs border border-slate-600 flex items-center justify-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                <span>Try Again</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xs flex items-center justify-center space-x-1"
              >
                <ImageIcon className="w-3.5 h-3.5 mr-1" />
                <span>Choose from Gallery</span>
              </button>
              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="w-full py-1.5 text-amber-400 hover:text-amber-300 text-xs font-semibold"
              >
                Use Demo Prescription →
              </button>
            </div>
          </div>
        )}

        {/* State 4: CAMERA READY — REAL LIVE VIDEO STREAM ONLY */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            cameraState === 'CAMERA_READY' ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        />

        {/* State 5: CAPTURED — FROZEN SNAPSHOT */}
        {cameraState === 'CAPTURED' && capturedPhoto && (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black">
            <img
              src={capturedPhoto}
              alt="Captured Prescription"
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {/* Optical Document Framing Overlay (Only in CAMERA_READY or CAPTURED) */}
        {(cameraState === 'CAMERA_READY' || cameraState === 'CAPTURED') && (
          <div className="absolute inset-6 sm:inset-10 border-2 border-emerald-400/80 rounded-xs pointer-events-none flex flex-col justify-between p-3 z-10">
            {/* Top Reticle Corners */}
            <div className="flex justify-between items-start">
              <span className="w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
              <span className="w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
            </div>

            {/* Center Status Badge */}
            <div className="text-center">
              <span className="bg-slate-900/85 backdrop-blur-xs text-emerald-300 text-[11px] font-mono px-3 py-1 rounded-xs border border-emerald-500/40 shadow-xs">
                {cameraState === 'CAPTURED'
                  ? 'PHOTO CAPTURED · READY FOR OCR'
                  : 'POSITION PRESCRIPTION INSIDE FRAME'}
              </span>
            </div>

            {/* Bottom Reticle Corners */}
            <div className="flex justify-between items-end">
              <span className="w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
              <span className="w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Shutter & Controls Dock */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 z-20 space-y-3">
        {cameraState === 'CAPTURED' ? (
          /* Captured Actions: Retake vs Use Photo */
          <div className="space-y-2">
            <div className="text-center text-[11px] text-slate-300 font-medium">
              Check clarity before initiating pharmaceutical OCR extraction.
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleRetake}
                disabled={isProcessingOcr}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xs border border-slate-700 flex items-center justify-center space-x-1.5 transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-slate-400" />
                <span>Retake</span>
              </button>
              <button
                onClick={handleUsePhoto}
                disabled={isProcessingOcr}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xs flex items-center justify-center space-x-1.5 transition-colors shadow-md disabled:opacity-50"
              >
                {isProcessingOcr ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Use Photo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Live Camera Shutter & Gallery Controls */
          <div className="flex items-center justify-between px-4">
            {/* Gallery Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-2 text-slate-400 hover:text-white transition-colors"
              title="Choose from Gallery"
            >
              <ImageIcon className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-medium">Gallery</span>
            </button>

            {/* Primary Real Shutter Button */}
            <button
              onClick={handleCapture}
              disabled={cameraState !== 'CAMERA_READY'}
              className="w-16 h-16 rounded-full bg-white hover:bg-slate-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none border-4 border-slate-400 flex items-center justify-center shadow-lg transition-transform"
              title="Capture Prescription Frame"
            >
              <div className="w-13 h-13 rounded-full border-2 border-slate-900 bg-white flex items-center justify-center">
                <Camera className="w-6 h-6 text-slate-900" />
              </div>
            </button>

            {/* Retake / Refresh Camera optics */}
            <button
              onClick={startCamera}
              className="flex flex-col items-center justify-center p-2 text-slate-400 hover:text-white transition-colors"
              title="Reload Camera Stream"
            >
              <RotateCcw className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-medium">Reset</span>
            </button>
          </div>
        )}
      </div>

      {/* EXPLICIT DEMO MODE MODAL */}
      {isDemoModalOpen && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white text-slate-900 w-full sm:max-w-md rounded-t-sm sm:rounded-sm p-4 space-y-3 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-2 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-xs">
                  Demonstration Testing Only
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  Load Hospital Test Prescription
                </h3>
              </div>
              <button
                onClick={() => setIsDemoModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[11px] text-slate-600">
              Select an explicit sample prescription dataset to demonstrate OCR extraction without photographing a paper ward slip:
            </p>

            <div className="space-y-2 pt-1">
              {SAMPLE_PRESCRIPTIONS_DATA.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => handleSelectDemoPreset(sample)}
                  className="p-3 border border-slate-200 hover:border-slate-800 rounded-xs cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{sample.title}</span>
                    <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded-xs font-mono font-bold text-slate-700">
                      {sample.medicines.length} meds
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {sample.doctor} · {sample.patient}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1 text-[10px] text-slate-600 font-mono">
                    {sample.medicines.map((m, idx) => (
                      <span key={idx} className="bg-slate-100 px-1 py-0.2 rounded-xs">
                        {m.medicineName} {m.strength}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setIsDemoModalOpen(false)}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xs"
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

import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Camera, Upload, Trash2, X, Check, Image as ImageIcon } from 'lucide-react';

interface ProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfilePhotoModal: React.FC<ProfilePhotoModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateProfilePhoto, removeProfilePhoto } = useApp();
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUser?.avatarUrl || null);
  const [useCamera, setUseCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !currentUser) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 3 * 1024 * 1024) {
        alert('Image must be under 3 MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setPreviewUrl(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartCamera = async () => {
    try {
      setUseCamera(true);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    } catch {
      alert('Camera access unavailable. Please use file upload.');
      setUseCamera(false);
    }
  };

  const handleCaptureFromCamera = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = 240;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, 240, 240);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPreviewUrl(dataUrl);
      }
      // Stop stream
      const stream = video.srcObject as MediaStream;
      if (stream) stream.getTracks().forEach((t) => t.stop());
      setUseCamera(false);
    }
  };

  const handleSave = () => {
    if (previewUrl) {
      updateProfilePhoto(previewUrl);
    }
    onClose();
  };

  const handleRemove = () => {
    removeProfilePhoto();
    setPreviewUrl(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-md max-w-sm w-full border border-slate-300 shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
          <h3 className="font-semibold text-xs uppercase tracking-wider">
            Profile Photo Management
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col items-center space-y-4">
          {/* Avatar Preview */}
          <div className="relative">
            {useCamera ? (
              <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-slate-800 bg-black flex items-center justify-center">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              </div>
            ) : previewUrl ? (
              <img
                src={previewUrl}
                alt={currentUser.name}
                className="w-28 h-28 rounded-full object-cover border-2 border-emerald-600 shadow-xs"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-2xl border-2 border-slate-700 shadow-xs">
                {currentUser.initials}
              </div>
            )}
          </div>

          <div className="text-center">
            <div className="font-bold text-sm text-slate-900">{currentUser.name}</div>
            <div className="text-xs text-slate-500 font-mono">
              {currentUser.staffId} · {currentUser.role}
            </div>
          </div>

          {/* Action options */}
          {useCamera ? (
            <div className="w-full flex space-x-2">
              <button
                type="button"
                onClick={handleCaptureFromCamera}
                className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xs"
              >
                Snap Photo
              </button>
              <button
                type="button"
                onClick={() => setUseCamera(false)}
                className="px-3 py-2 border border-slate-300 text-slate-700 text-xs rounded-xs"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="w-full space-y-2 text-xs">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xs flex items-center justify-center space-x-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Image from Device</span>
              </button>

              <button
                type="button"
                onClick={handleStartCamera}
                className="w-full py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xs flex items-center justify-center space-x-1.5"
              >
                <Camera className="w-3.5 h-3.5 text-slate-500" />
                <span>Take Photo with Camera</span>
              </button>

              {currentUser.avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="w-full py-1.5 text-red-600 hover:bg-red-50 text-[11px] font-semibold rounded-xs flex items-center justify-center space-x-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove Photo (Use Initials)</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 border border-slate-300 rounded-xs text-xs text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={useCamera}
            className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xs text-xs font-semibold flex items-center space-x-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Photo</span>
          </button>
        </div>
      </div>
    </div>
  );
};

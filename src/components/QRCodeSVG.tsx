import React, { useState } from 'react';

interface QRCodeSVGProps {
  value: string;
  size?: number;
}

/**
 * Standard Scannable QR Code Component
 * Renders 100% valid ISO spec QR codes readable by iOS/Android camera apps.
 */
export const QRCodeSVG: React.FC<QRCodeSVGProps> = ({ value, size = 200 }) => {
  const [imgError, setImgError] = useState(false);

  const primaryQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
    value
  )}&margin=10`;

  const fallbackQrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(
    value
  )}&size=${size}&margin=1`;

  return (
    <div
      className="p-3 bg-white rounded-2xl shadow-xl border border-slate-200 flex items-center justify-center shrink-0"
      style={{ width: size + 24, height: size + 24 }}
    >
      <img
        src={imgError ? fallbackQrUrl : primaryQrUrl}
        alt={`QR Code for ${value}`}
        width={size}
        height={size}
        className="rounded-lg object-contain"
        onError={() => {
          if (!imgError) setImgError(true);
        }}
      />
    </div>
  );
};

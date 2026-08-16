'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    cloudinary?: {
      openUploadWidget: (
        options: Record<string, unknown>,
        cb: (
          error: unknown,
          result: { event: string; info?: { secure_url: string } },
        ) => void,
      ) => void;
    };
  }
}

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? '';
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? '';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [ready, setReady] = useState(false);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      setError('Konfigurasi Cloudinary belum diatur di .env.local.');
      return;
    }
    if (window.cloudinary) {
      setReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://upload-widget.cloudinary.com/global/all.js';
    script.onload = () => setReady(true);
    document.body.appendChild(script);
  }, []);

  const openWidget = () => {
    if (!window.cloudinary) return;
    setOpening(true);
    window.cloudinary.openUploadWidget(
      {
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
        folder: 'apartments',
        multiple: true,
        clientAllowedFormats: ['image'],
        maxFileSize: 8000000,
      },
      (_error, result) => {
        setOpening(false);
        if (!_error && result?.event === 'success' && result.info?.secure_url) {
          onChange([...images, result.info.secure_url]);
        }
      },
    );
  };

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...images];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  const remove = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    return <div className="error" style={{ marginBottom: 8 }}>{error}</div>;
  }

  return (
    <div>
      {images.length > 0 && (
        <div className="img-grid">
          {images.map((url, i) => (
            <div key={url + i} className="img-cell">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Foto ${i + 1}`} />
              {i === 0 && <span className="img-cover">COVER</span>}
              <div className="img-actions">
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Geser kiri">←</button>
                <button type="button" disabled={i === images.length - 1} onClick={() => move(i, 1)} aria-label="Geser kanan">→</button>
                <button type="button" onClick={() => remove(i)} aria-label="Hapus">×</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <button type="button" className="btn" style={{ marginTop: 8 }} onClick={openWidget} disabled={!ready || opening}>
        {opening ? 'Pilih foto...' : ready ? 'Upload Foto' : 'Memuat widget...'}
      </button>
      <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>
        Foto pertama adalah sampul. Upload langsung ke Cloudinary — tidak membebani server.
      </p>
    </div>
  );
}

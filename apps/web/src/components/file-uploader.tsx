'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    cloudinary?: {
      openUploadWidget: (
        options: Record<string, unknown>,
        cb: (
          error: unknown,
          result: { event: string; info?: { secure_url: string; original_filename?: string } },
        ) => void,
      ) => void;
    };
  }
}

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? '';
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? '';

interface FileUploaderProps {
  url: string;
  onChange: (url: string) => void;
  label: string;
  folder: string;
  accept?: string[];
  hint?: string;
}

export function FileUploader({ url, onChange, label, folder, accept = ['image', 'pdf'], hint }: FileUploaderProps) {
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
        folder,
        multiple: false,
        clientAllowedFormats: accept,
        maxFileSize: 8000000,
      },
      (_error, result) => {
        setOpening(false);
        if (!_error && result?.event === 'success' && result.info?.secure_url) {
          onChange(result.info.secure_url);
        }
      },
    );
  };

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    return <div className="error" style={{ marginBottom: 8 }}>{error}</div>;
  }

  return (
    <div>
      {url ? (
        <div className="row" style={{ gap: 8, alignItems: 'center' }}>
          {accept.includes('image') ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={label} className="file-upload-preview" />
          ) : (
            <span className="file-upload-preview" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
              PDF
            </span>
          )}
          <a href={url} target="_blank" rel="noreferrer" className="btn" style={{ padding: '6px 12px', fontSize: 12 }}>
            Lihat
          </a>
          <button type="button" className="btn btn-danger" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => onChange('')}>
            Hapus
          </button>
        </div>
      ) : (
        <button type="button" className="btn" onClick={openWidget} disabled={!ready || opening}>
          {opening ? 'Memilih file...' : ready ? `Upload ${label}` : 'Memuat widget...'}
        </button>
      )}
      {hint && <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>{hint}</p>}
    </div>
  );
}

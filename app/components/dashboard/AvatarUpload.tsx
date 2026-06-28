'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface AvatarUploadProps {
  currentAvatar?: string;
  onUpload?: (url: string) => void;
}

export default function AvatarUpload({ currentAvatar, onUpload }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError('');
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Only .jpg and .png files are allowed.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!inputRef.current?.files?.[0]) return;
    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('avatar', inputRef.current.files[0]);

    const response = await fetch('/api/users/me/avatar', { method: 'POST', body: formData });
    setUploading(false);

    if (response.ok) {
      const { url } = await response.json();
      onUpload?.(url);
      setPreview(null);
    } else {
      setError('Upload failed. Please try again.');
    }
  };

  const avatarSrc = preview || currentAvatar;

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 hover:opacity-80 transition-opacity"
      >
        {avatarSrc ? (
          <Image src={avatarSrc} alt="Avatar" fill className="object-cover" />
        ) : (
          <span className="flex h-full items-center justify-center text-gray-400 text-3xl">+</span>
        )}
      </button>
      <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={handleFileChange} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {preview && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Confirm Upload'}
        </button>
      )}
    </div>
  );
}

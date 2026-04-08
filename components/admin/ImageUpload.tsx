'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Film, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
}

export function ImageUpload({ value, onChange, label = 'Зураг оруулах', accept = 'image/*' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError('Файл 10MB-аас бага байх ёстой');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload алдаа');
      onChange(data.url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-forest-700 mb-1.5">{label}</label>
      {value ? (
        <div className="relative w-full h-48 rounded-xl overflow-hidden group border border-forest-100">
          <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-forest-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button type="button" onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-forest-700">
              Солих
            </button>
            <button type="button" onClick={() => onChange('')}
              className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white">
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()}
          className={cn(
            'w-full h-36 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-colors',
            uploading ? 'border-forest-300 bg-forest-50' : 'border-forest-200 hover:border-forest-400 hover:bg-forest-50'
          )}>
          {uploading ? (
            <>
              <Loader2 size={24} className="text-forest-400 animate-spin" />
              <span className="text-sm text-forest-500">Uploading...</span>
            </>
          ) : (
            <>
              <Upload size={24} className="text-forest-400" />
              <span className="text-sm text-forest-500">{label}</span>
              <span className="text-xs text-forest-300">JPG, PNG, WEBP — Max 10MB</span>
            </>
          )}
        </button>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      <input ref={inputRef} type="file" accept={accept} className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
    </div>
  );
}

interface MultiImageUploadProps {
  values: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  max?: number;
}

export function MultiImageUpload({ values, onChange, label = 'Зургийн цомог', max = 20 }: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList) {
    setUploading(true);
    setError('');
    const uploaded: string[] = [];
    try {
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) continue;
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (res.ok) uploaded.push(data.url);
      }
      onChange([...values, ...uploaded]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  function remove(idx: number) {
    onChange(values.filter((_, i) => i !== idx));
  }

  return (
    <div>
      <label className="block text-sm font-medium text-forest-700 mb-2">{label}</label>
      <div className="grid grid-cols-4 gap-2">
        {values.map((img, i) => (
          <div key={i} className="relative aspect-square rounded-xl overflow-hidden group border border-forest-100">
            <img src={img} alt="" className="w-full h-full object-cover" />
            <button type="button" onClick={() => remove(i)}
              className="absolute inset-0 bg-red-500/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <X size={16} />
            </button>
          </div>
        ))}
        {values.length < max && (
          <button type="button" onClick={() => inputRef.current?.click()}
            className="aspect-square border-2 border-dashed border-forest-200 rounded-xl flex flex-col items-center justify-center gap-1 text-forest-400 hover:border-forest-400 hover:bg-forest-50 transition-colors">
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            <span className="text-xs">{uploading ? '...' : 'Нэмэх'}</span>
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
        onChange={e => { if (e.target.files?.length) handleFiles(e.target.files); e.target.value = ''; }} />
    </div>
  );
}

interface VideoUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function VideoUpload({ value, onChange }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (file.size > 100 * 1024 * 1024) { setError('Видео 100MB-аас бага байх ёстой'); return; }
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload алдаа');
      onChange(data.url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-forest-700 mb-1.5">Видео оруулах</label>
      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-forest-100 group">
          <video src={value} controls className="w-full max-h-48 object-cover" />
          <button type="button" onClick={() => onChange('')}
            className="absolute top-2 right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <X size={14} />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()}
          className={cn('w-full h-28 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-colors',
            uploading ? 'border-forest-300 bg-forest-50' : 'border-forest-200 hover:border-forest-400 hover:bg-forest-50')}>
          {uploading ? (
            <><Loader2 size={22} className="text-forest-400 animate-spin" /><span className="text-sm text-forest-500">Uploading...</span></>
          ) : (
            <><Film size={22} className="text-forest-400" /><span className="text-sm text-forest-500">Видео оруулах</span><span className="text-xs text-forest-300">MP4, MOV — Max 100MB</span></>
          )}
        </button>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      <input ref={inputRef} type="file" accept="video/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
    </div>
  );
}

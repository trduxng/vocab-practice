'use client';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import BulkImportTab from './BulkImportTab';
import { creatorService, MediaItem } from '@/src/services/creator.service';
import {
  Upload, Trash2, Loader2, Music, Search, File,
  Copy, Check, Clipboard, FileText, Video as VideoIcon,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { toast } from 'sonner';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '');

const mediaTypeBadge: Record<string, string> = {
  Image: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  Audio: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  AudioUK: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  AudioUS: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  ExampleAudio: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  QuestionAudio: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  QuestionImage: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  Video: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  Document: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
};

const mediaTypeLabels: Record<string, string> = {
  Image: 'Hình ảnh',
  Audio: 'Âm thanh',
  AudioUK: 'Audio UK',
  AudioUS: 'Audio US',
  ExampleAudio: 'Audio ví dụ',
  QuestionAudio: 'Audio câu hỏi',
  QuestionImage: 'Hình câu hỏi',
  Video: 'Video',
  Document: 'Tài liệu',
};

function formatBytes(bytes: number): string {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function isImage(mimeType: string): boolean {
  return mimeType?.startsWith('image/');
}

function isAudio(mimeType: string): boolean {
  return mimeType?.startsWith('audio/');
}

function isVideo(mimeType: string): boolean {
  return mimeType?.startsWith('video/');
}

function isPdf(mimeType: string): boolean {
  return mimeType === 'application/pdf';
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

export default function CreatorMediaPage() {
  const [activeMainTab, setActiveMainTab] = useState<'media' | 'import'>('media');
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadQueue, setUploadQueue] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const result = await creatorService.getMedia({
        mediaType: filterType || undefined,
        search: search.trim() || undefined,
        page,
        pageSize: 24,
      });
      setItems(result.data || []);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 1);
    } catch {
      toast.error('Không thể tải media');
    } finally {
      setLoading(false);
    }
  }, [page, filterType, search]);

  useEffect(() => { load(); }, [load]);

  // Global paste handler (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const files = e.clipboardData?.files;
      if (files && files.length > 0) {
        e.preventDefault();
        const valid = Array.from(files).filter(f =>
          f.type.startsWith('image/') || f.type.startsWith('audio/') || f.type.startsWith('text/') || f.type.startsWith('application/') || f.name.endsWith('.csv') || f.name.endsWith('.txt')
        );
        if (valid.length > 0) {
          startUpload(valid);
        } else {
          toast.error('Clipboard không chứa file hợp lệ (Hình ảnh, Âm thanh, CSV, TXT, JSON)');
        }
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startUpload = async (files: File[]) => {
    if (files.length === 0) return;
    const queue: UploadingFile[] = files.map(file => ({ file, progress: 0, status: 'pending' as const }));
    setUploadQueue(queue);
    setIsUploading(true);

    try {
      // Send all files at once in single request (Anki/Quizlet style)
      const formData = new FormData();
      for (const file of files) {
        formData.append('file', file);
      }
      setUploadQueue(prev => prev.map(q => ({ ...q, status: 'uploading' })));
      await creatorService.uploadMedia(formData);
      setUploadQueue(prev => prev.map(q => ({ ...q, progress: 100, status: 'done' })));
      toast.success(`Upload thành công ${files.length} file`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      const msg = e.response?.data?.message || 'Lỗi upload';
      setUploadQueue(prev => prev.map(q => ({ ...q, status: 'error', error: msg })));
      toast.error(msg);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadQueue([]), 3000);
      setPage(1);
      await load();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) startUpload(Array.from(e.target.files));
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f =>
      f.type.startsWith('image/') || f.type.startsWith('audio/')
    );
    if (files.length > 0) startUpload(files);
    else toast.error('Chỉ chấp nhận file hình ảnh hoặc âm thanh');
  };

  const handleDelete = async (id: number, fileName: string) => {
    if (!confirm(`Xóa "${fileName}"?`)) return;
    try {
      await creatorService.deleteMedia(id);
      toast.success('Đã xóa');
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
      await load();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Lỗi khi xóa');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Xóa ${selectedIds.size} file đã chọn?`)) return;
    let deleted = 0;
    for (const id of selectedIds) {
      try {
        await creatorService.deleteMedia(id);
        deleted++;
      } catch { /* skip */ }
    }
    toast.success(`Đã xóa ${deleted} file`);
    setSelectedIds(new Set());
    await load();
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(items.map(i => i.id)));
  };

  const copyUrl = async (item: MediaItem) => {
    const url = `${API_BASE}${item.fileUrl}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(item.id);
      toast.success('Đã copy URL');
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      toast.error('Không thể copy');
    }
  };

  const copyAnkiRef = async (item: MediaItem) => {
    // Anki format: [sound:filename] or <img src="filename">
    const ref = isAudio(item.mimeType)
      ? `[sound:${item.fileName}]`
      : `<img src="${item.fileName}">`;
    try {
      await navigator.clipboard.writeText(ref);
      setCopiedId(item.id);
      toast.success(`Đã copy: ${ref}`);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      toast.error('Không thể copy');
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6">
      {/* Header Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200 dark:border-white/10">
        <button
          onClick={() => setActiveMainTab('media')}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeMainTab === 'media' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Kho Media
        </button>
        <button
          onClick={() => setActiveMainTab('import')}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeMainTab === 'import' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Import Từ Vựng
        </button>
      </div>

      {activeMainTab === 'import' ? (
        <BulkImportTab />
      ) : (
        <div 
          className="space-y-6"
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
          onDrop={handleDrop}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Media</h1>
          <p className="text-slate-600 text-sm mt-1">
            {total} file media {selectedIds.size > 0 && `· Đã chọn ${selectedIds.size}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Xóa ({selectedIds.size})
            </Button>
          )}
          <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="gap-2 rounded-xl">
            {isUploading ? <Loader2 className="animate-spin h-4 w-4" /> : <Upload className="h-4 w-4" />}
            Upload
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,audio/*,.csv,.txt,.json,.xlsx"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      </div>

      {/* Upload Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
          dragOver
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 scale-[1.01]'
            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
            <p className="text-sm text-slate-500">Đang upload {uploadQueue.length} file...</p>
            <div className="w-full max-w-xs bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse w-full" />
            </div>
            <p className="text-xs text-slate-400">{uploadQueue.length} file đang được xử lý</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-10 w-10 text-slate-400" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Kéo thả file vào đây, click để chọn, hoặc Ctrl+V để paste
            </p>
            <p className="text-xs text-slate-400">
              JPG, PNG, GIF, WebP, MP3, WAV, OGG, CSV, TXT, JSON, Excel · Tối đa 10MB · Upload nhiều file cùng lúc
            </p>
          </div>
        )}
      </div>

      {/* Upload Queue (show errors) */}
      {uploadQueue.some(f => f.status === 'error') && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/10 p-3">
          <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">File lỗi:</p>
          {uploadQueue.filter(f => f.status === 'error').map((f, i) => (
            <p key={i} className="text-xs text-red-600 dark:text-red-300">
              {f.file.name}: {f.error}
            </p>
          ))}
        </div>
      )}

      {/* Filters & Sort */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            placeholder="Tìm file..."
            className="pl-9"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
          className="rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
        >
          <option value="">Tất cả</option>
          <option value="Image">Hình ảnh</option>
          <option value="Audio">Âm thanh</option>
          <option value="Video">Video</option>
          <option value="Document">Tài liệu</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
        >
          <option value="date">Mới nhất</option>
          <option value="name">Tên A-Z</option>
          <option value="size">Kích thước</option>
        </select>
        {items.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSelectAll}
            className="ml-auto"
          >
            {selectedIds.size === items.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
          </Button>
        )}
      </div>

      {/* Media Grid */}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-12 text-center">
          <File className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Chưa có media nào</p>
          <p className="text-xs text-slate-400 mt-1">Kéo thả, click nút Upload, hoặc Ctrl+V để bắt đầu</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items
            .slice()
            .sort((a, b) => {
              if (sortBy === 'name') return a.fileName.localeCompare(b.fileName);
              if (sortBy === 'size') return b.fileSizeBytes - a.fileSizeBytes;
              return 0; // date = default API order
            })
            .map((item) => (
              <div
                key={item.id}
                className={`group relative rounded-xl border bg-white dark:bg-white/5 overflow-hidden hover:shadow-md transition-all ${
                  selectedIds.has(item.id)
                    ? 'border-blue-400 dark:border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                    : 'border-slate-200 dark:border-white/10'
                }`}
              >
                {/* Select checkbox */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleSelect(item.id); }}
                  className={`absolute top-2 left-2 z-10 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    selectedIds.has(item.id)
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-white/80 dark:bg-black/50 border-slate-300 dark:border-slate-600 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {selectedIds.has(item.id) && <Check className="h-3 w-3" />}
                </button>

                {/* Preview */}
                <div className="aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                  {isImage(item.mimeType) ? (
                    <img
                      src={`${API_BASE}${item.fileUrl}`}
                      alt={item.altText || item.fileName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : isAudio(item.mimeType) ? (
                    <div className="flex flex-col items-center gap-2 p-4 w-full">
                      <Music className="h-10 w-10 text-purple-400" />
                      <audio controls className="w-full max-w-[140px] h-8" preload="none">
                        <source src={`${API_BASE}${item.fileUrl}`} type={item.mimeType} />
                      </audio>
                    </div>
                  ) : isVideo(item.mimeType) ? (
                    <div className="flex flex-col items-center gap-2 p-2 w-full h-full justify-center">
                      <VideoIcon className="h-8 w-8 text-orange-400 mb-1" />
                      <video controls className="w-full max-h-[80px]" preload="none">
                        <source src={`${API_BASE}${item.fileUrl}`} type={item.mimeType} />
                      </video>
                    </div>
                  ) : isPdf(item.mimeType) ? (
                    <div className="flex flex-col items-center gap-2 p-4 w-full text-center">
                      <FileText className="h-10 w-10 text-emerald-500" />
                      <a
                        href={`${API_BASE}${item.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:text-blue-600 underline truncate w-full"
                      >
                        Mở PDF
                      </a>
                    </div>
                  ) : (
                    <File className="h-10 w-10 text-slate-400" />
                  )}
                </div>

                {/* Info */}
                <div className="p-2">
                  <p className="text-xs font-medium truncate" title={item.fileName}>{item.fileName}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${mediaTypeBadge[item.mediaType] || 'bg-slate-100 text-slate-600'}`}>
                      {mediaTypeLabels[item.mediaType] || item.mediaType}
                    </span>
                    <span className="text-[10px] text-slate-400">{formatBytes(item.fileSizeBytes)}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); copyUrl(item); }}
                    className="p-1.5 rounded-lg bg-black/50 text-white hover:bg-blue-600 transition-colors"
                    title="Copy URL"
                  >
                    {copiedId === item.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); copyAnkiRef(item); }}
                    className="p-1.5 rounded-lg bg-black/50 text-white hover:bg-purple-600 transition-colors"
                    title="Copy Anki/Quizlet ref"
                  >
                    <Clipboard className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id, item.fileName); }}
                    className="p-1.5 rounded-lg bg-black/50 text-white hover:bg-red-600 transition-colors"
                    title="Xóa"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>
            Trước
          </Button>
          <span className="text-sm text-slate-500">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
            Sau
          </Button>
        </div>
      )}
        </div>
      )}
    </div>
  );
}

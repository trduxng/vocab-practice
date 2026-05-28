'use client';
import React from 'react';
import { Image, Upload } from 'lucide-react';

export default function CreatorMediaPage() {
  return (
    <div className="flex-1 p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Media</h1>
        <p className="text-slate-500 text-sm mt-1">Upload và quản lý hình ảnh, âm thanh cho nội dung</p>
      </div>
      <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/20 bg-white dark:bg-white/5 p-12 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
          <Upload className="h-8 w-8 text-blue-500" />
        </div>
        <div>
          <p className="font-semibold text-lg">Kéo thả file vào đây</p>
          <p className="text-slate-500 text-sm mt-1">Hỗ trợ: JPG, PNG, MP3, WAV (tối đa 10MB)</p>
        </div>
        <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-sm transition-colors">
          Chọn file
        </button>
      </div>
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 flex flex-col items-center justify-center text-center">
        <Image className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
        <p className="text-slate-500 text-sm">Chưa có media nào được upload</p>
        <p className="text-slate-400 text-xs mt-1">Tính năng đang được phát triển hoàn thiện</p>
      </div>
    </div>
  );
}

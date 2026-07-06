"use client";

import { useState, useRef } from "react";
import { Upload, Play, Square, FileAudio, X } from "lucide-react";
import { Textarea } from "@/src/components/ui/textarea";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";

type DictationFieldsProps = {
  questionText: string;
  correctAnswer: string;
  onQuestionTextChange: (text: string) => void;
  onCorrectAnswerChange: (answer: string) => void;
};

export function DictationFields({
  questionText,
  correctAnswer,
  onQuestionTextChange,
  onCorrectAnswerChange,
}: DictationFieldsProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(
    questionText.startsWith("http") ? questionText : null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [caseInsensitive, setCaseInsensitive] = useState(true);
  const [allowVariants, setAllowVariants] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    onQuestionTextChange(url);
  }

  function togglePlay() {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }

  function clearAudio() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    onQuestionTextChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
          Audio
        </label>
        <div className="mt-2">
          {audioUrl ? (
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
              <FileAudio className="h-5 w-5 text-blue-500" />
              <span className="flex-1 truncate text-sm text-slate-600 dark:text-slate-300">
                {audioUrl.startsWith("blob:") ? "Audio đã tải lên" : audioUrl.split("/").pop()}
              </span>
              <button
                type="button"
                onClick={togglePlay}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500 text-white hover:bg-blue-600"
              >
                {isPlaying ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={clearAudio}
                className="rounded-md p-1.5 text-slate-400 hover:text-rose-500"
              >
                <X className="h-4 w-4" />
              </button>
              <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
            </div>
          ) : (
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500 hover:border-blue-400 hover:text-blue-500 dark:border-white/20 dark:bg-white/[0.03] dark:hover:border-blue-400">
              <Upload className="h-5 w-5" />
              <span>Tải lên file audio (MP3, WAV, M4A - tối đa 10MB)</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/mp3,audio/wav,audio/m4a,audio/mpeg,audio/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          )}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
          Transcript / Đáp án đúng
        </label>
        <Textarea
          value={correctAnswer}
          onChange={(e) => onCorrectAnswerChange(e.target.value)}
          placeholder="Nhập nội dung chính xác của audio..."
          className="mt-2 min-h-20 rounded-md"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={caseInsensitive}
            onChange={(e) => setCaseInsensitive(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          Case-insensitive
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={allowVariants}
            onChange={(e) => setAllowVariants(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          Chấp nhận nhiều đáp án
        </label>
      </div>

      {allowVariants && (
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
            Các đáp án thay thế (phân cách bằng dấu |)
          </label>
          <Input
            value={correctAnswer}
            onChange={(e) => onCorrectAnswerChange(e.target.value)}
            placeholder="Đáp án chính|xác|variant khác"
            className="mt-2 h-10 rounded-md"
          />
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, FileText, Trash2, Save } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { creatorService, WordPayload } from '@/src/services/creator.service';
import { toast } from 'sonner';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface ParsedWord {
  term: string;
  meaning: string;
  phonetic?: string;
  _error?: string;
}

export default function BulkImportTab() {
  const [activeTab, setActiveTab] = useState<'paste' | 'file'>('paste');
  const [rawText, setRawText] = useState('');
  const [delimiter, setDelimiter] = useState<string>('tab');
  const [parsedWords, setParsedWords] = useState<ParsedWord[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const processData = (data: any[][]) => {
    const words: ParsedWord[] = [];
    for (const row of data) {
      if (!row || row.length === 0 || (!row[0] && !row[1])) continue;
      
      const term = String(row[0] || '').trim();
      const meaning = String(row[1] || '').trim();
      const phonetic = String(row[2] || '').trim();

      if (!term || !meaning) {
        words.push({ term, meaning, phonetic, _error: 'Thiếu từ hoặc nghĩa' });
      } else {
        words.push({ term, meaning, phonetic });
      }
    }
    setParsedWords(words);
  };

  const handleParse = () => {
    setIsParsing(true);
    try {
      if (activeTab === 'paste') {
        const actualDelimiter = delimiter === 'tab' ? '\t' : delimiter === 'comma' ? ',' : ';';
        Papa.parse(rawText, {
          delimiter: actualDelimiter,
          skipEmptyLines: true,
          complete: (results) => {
            processData(results.data as any[][]);
            setIsParsing(false);
          },
          error: (error: any) => {
            toast.error('Lỗi phân tích: ' + error.message);
            setIsParsing(false);
          }
        });
      }
    } catch (err) {
      toast.error('Lỗi khi phân tích dữ liệu');
      setIsParsing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          processData(json as any[][]);
          toast.success('Đã đọc xong file Excel');
        } catch (err) {
          toast.error('Lỗi khi đọc file Excel');
        } finally {
          setIsParsing(false);
        }
      };
      reader.onerror = () => {
        toast.error('Không thể đọc file');
        setIsParsing(false);
      };
      reader.readAsArrayBuffer(file);
    } else {
      Papa.parse(file, {
        skipEmptyLines: true,
        complete: (results) => {
          processData(results.data as any[][]);
          toast.success('Đã đọc xong file');
          setIsParsing(false);
        },
        error: (error: any) => {
          toast.error('Lỗi phân tích: ' + error.message);
          setIsParsing(false);
        }
      });
    }
  };

  const removeRow = (index: number) => {
    setParsedWords(prev => prev.filter((_, i) => i !== index));
  };

  const handleImport = async () => {
    const validWords = parsedWords.filter(w => !w._error && w.term && w.meaning);
    if (validWords.length === 0) {
      toast.error('Không có từ vựng hợp lệ để import');
      return;
    }

    try {
      setIsImporting(true);
      const payload: WordPayload[] = validWords.map(w => ({
        term: w.term,
        meaning: w.meaning,
        phonetic: w.phonetic,
        partOfSpeechId: 1, // Default Noun
      }));

      const res = await creatorService.bulkCreateWords({ words: payload });
      toast.success(res.message || `Đã import ${payload.length} từ vựng`);
      setParsedWords([]);
      setRawText('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi import');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-white/10 p-6">
        <div className="flex items-center gap-4 mb-4 border-b border-slate-100 dark:border-white/5 pb-4">
          <button
            onClick={() => setActiveTab('paste')}
            className={`font-medium text-sm transition-colors ${activeTab === 'paste' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Dán văn bản
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={`font-medium text-sm transition-colors ${activeTab === 'file' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Tải lên file (CSV/TXT)
          </button>
        </div>

        {activeTab === 'paste' ? (
          <div className="space-y-4">
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Word 1 [tab] Meaning 1 [tab] Phonetic 1&#10;Word 2 [tab] Meaning 2 [tab] Phonetic 2"
              className="w-full h-40 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 p-4 text-sm font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">Ký tự phân cách:</span>
                <select
                  value={delimiter}
                  onChange={(e) => setDelimiter(e.target.value)}
                  className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm"
                >
                  <option value="tab">Tab (\t)</option>
                  <option value="comma">Dấu phẩy (,)</option>
                  <option value="semicolon">Chấm phẩy (;)</option>
                </select>
              </div>
              <Button onClick={handleParse} disabled={!rawText.trim() || isParsing}>
                Phân tích dữ liệu
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-slate-900/50 p-10">
            <input type="file" id="bulk-file" accept=".csv,.txt,.xlsx,.xls" className="hidden" onChange={handleFileUpload} />
            <label htmlFor="bulk-file" className="cursor-pointer flex flex-col items-center text-center">
              <UploadCloud className="h-10 w-10 text-slate-400 mb-3" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Nhấn để tải lên file CSV, TXT hoặc Excel</p>
              <p className="text-xs text-slate-500 mt-1">Hỗ trợ file xuất từ Anki, Quizlet, Excel</p>
            </label>
          </div>
        )}
      </div>

      {/* Preview Section */}
      {parsedWords.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col h-[500px]">
          <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" /> Bản xem trước
              </h3>
              <span className="text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded-full">
                {parsedWords.length} từ
              </span>
              {parsedWords.some(w => w._error) && (
                <span className="text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {parsedWords.filter(w => w._error).length} lỗi
                </span>
              )}
            </div>
            <Button onClick={handleImport} disabled={isImporting || parsedWords.every(w => w._error)}>
              {isImporting ? 'Đang Import...' : <><Save className="w-4 h-4 mr-2" /> Lưu vào kho (Bản nháp)</>}
            </Button>
          </div>
          
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-white/10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-500">Từ vựng</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Nghĩa</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Phiên âm</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {parsedWords.map((word, idx) => (
                  <tr key={idx} className={word._error ? 'bg-red-50/50 dark:bg-red-900/10' : ''}>
                    <td className="px-4 py-3 font-medium">
                      {word.term}
                      {word._error && <span className="block text-xs text-red-500 mt-1">{word._error}</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{word.meaning}</td>
                    <td className="px-4 py-3 text-slate-500">{word.phonetic || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => removeRow(idx)} className="text-slate-400 hover:text-red-500 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

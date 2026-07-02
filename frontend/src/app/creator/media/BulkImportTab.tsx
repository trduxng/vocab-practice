'use client';

import React, { useState, useEffect } from 'react';
import { UploadCloud, AlertCircle, FileText, Trash2, Save, Settings } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { creatorService, WordPayload } from '@/src/services/creator.service';
import { toast } from 'sonner';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface ParsedWord {
  term: string;
  meaning: string;
  phonetic?: string;
  partOfSpeech?: string;
  example?: string;
  exampleMeaning?: string;
  _error?: string;
}

export default function BulkImportTab() {
  const [activeTab, setActiveTab] = useState<'paste' | 'file'>('paste');
  const [rawText, setRawText] = useState('');
  const [delimiter, setDelimiter] = useState<string>('tab');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rawRows, setRawRows] = useState<any[][]>([]);
  const [parsedWords, setParsedWords] = useState<ParsedWord[]>([]);
  const [hasHeader, setHasHeader] = useState<boolean>(true);
  
  const [columnMappings, setColumnMappings] = useState({
    term: 0,
    meaning: 1,
    phonetic: -1,
    partOfSpeech: -1,
    example: -1,
    exampleMeaning: -1,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [conflictStrategy, setConflictStrategy] = useState<string>('merge');

  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Load Topics on mount
  useEffect(() => {
    const loadTopics = async () => {
      try {
        const list = await creatorService.getTopics();
        setTopics(list);
      } catch (err) {
        console.error('Không thể load danh sách topic:', err);
      }
    };
    loadTopics();
  }, []);

  // Process data from raw file/text rows
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const processData = (data: any[][]) => {
    const cleaned = data.filter(row => row && row.length > 0 && row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== ''));
    if (cleaned.length === 0) {
      toast.error('Không tìm thấy dữ liệu nào hợp lệ');
      return;
    }
    setRawRows(cleaned);
    
    // Auto-detect columns
    const firstRowLength = cleaned[0].length;
    setColumnMappings({
      term: 0,
      meaning: firstRowLength > 1 ? 1 : 0,
      phonetic: firstRowLength > 2 ? 2 : -1,
      partOfSpeech: -1,
      example: -1,
      exampleMeaning: -1,
    });
  };

  // Re-compute parsedWords when rawRows, hasHeader, or columnMappings change
  useEffect(() => {
    if (rawRows.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setParsedWords([]);
      return;
    }
    const startIndex = hasHeader ? 1 : 0;
    const words: ParsedWord[] = [];
    
    for (let i = startIndex; i < rawRows.length; i++) {
      const row = rawRows[i];
      if (!row || row.length === 0) continue;
      
      const termCol = columnMappings.term;
      const meaningCol = columnMappings.meaning;
      const phoneticCol = columnMappings.phonetic;
      const partOfSpeechCol = columnMappings.partOfSpeech;
      const exampleCol = columnMappings.example;
      const exampleMeaningCol = columnMappings.exampleMeaning;
      
      const term = termCol >= 0 && row[termCol] !== undefined ? String(row[termCol]).trim() : '';
      const meaning = meaningCol >= 0 && row[meaningCol] !== undefined ? String(row[meaningCol]).trim() : '';
      const phonetic = phoneticCol >= 0 && row[phoneticCol] !== undefined ? String(row[phoneticCol]).trim() : '';
      const partOfSpeech = partOfSpeechCol >= 0 && row[partOfSpeechCol] !== undefined ? String(row[partOfSpeechCol]).trim() : '';
      const example = exampleCol >= 0 && row[exampleCol] !== undefined ? String(row[exampleCol]).trim() : '';
      const exampleMeaning = exampleMeaningCol >= 0 && row[exampleMeaningCol] !== undefined ? String(row[exampleMeaningCol]).trim() : '';
      
      if (!term && !meaning) continue;
      
      let errorMsg;
      if (!term) {
        errorMsg = 'Thiếu từ vựng';
      } else if (!meaning) {
        errorMsg = 'Thiếu nghĩa';
      }
      
      words.push({
        term,
        meaning,
        phonetic,
        partOfSpeech,
        example,
        exampleMeaning,
        _error: errorMsg
      });
    }
    setParsedWords(words);
  }, [rawRows, hasHeader, columnMappings]);

  const handleParse = () => {
    setIsParsing(true);
    try {
      if (activeTab === 'paste') {
        const actualDelimiter = delimiter === 'tab' ? '\t' : delimiter === 'comma' ? ',' : ';';
        Papa.parse(rawText, {
          delimiter: actualDelimiter,
          skipEmptyLines: true,
          complete: (results) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            processData(results.data as any[][]);
            setIsParsing(false);
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          error: (error: any) => {
            toast.error('Lỗi phân tích: ' + error.message);
            setIsParsing(false);
          }
        });
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          processData(json as any[][]);
          toast.success('Đã đọc xong file Excel');
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          processData(results.data as any[][]);
          toast.success('Đã đọc xong file CSV');
          setIsParsing(false);
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    if (!selectedTopicId) {
      toast.error('Vui lòng chọn chủ đề (Topic) để gán các từ vựng này!');
      return;
    }
    const validWords = parsedWords.filter(w => !w._error && w.term && w.meaning);
    if (validWords.length === 0) {
      toast.error('Không có từ vựng hợp lệ để import');
      return;
    }

    try {
      setIsImporting(true);
      const payload: WordPayload[] = validWords.map(w => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const item: any = {
          term: w.term,
          meaning: w.meaning,
          phonetic: w.phonetic || '',
          partOfSpeechId: 1, // Default Noun
        };
        
        if (w.partOfSpeech) {
          item.partOfSpeechId = w.partOfSpeech; // mapped by backend service
        }
        
        if (selectedTopicId) {
          item.topicIds = [Number(selectedTopicId)];
        }
        
        if (w.example) {
          item.examples = [{
            sentence: w.example,
            meaning: w.exampleMeaning || '',
          }];
        }
        
        return item;
      });

      const res = await creatorService.bulkCreateWords({ 
        words: payload,
        conflictStrategy 
      });
      
      toast.success(res.message || `Đã import thành công ${payload.length} từ vựng`);
      setParsedWords([]);
      setRawRows([]);
      setRawText('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi import');
    } finally {
      setIsImporting(false);
    }
  };

  // Compute column options list
  const maxCols = rawRows.length > 0 ? Math.max(...rawRows.map(r => r.length)) : 0;
  const colIndices = Array.from({ length: maxCols }, (_, i) => i);
  const headerLabels = rawRows.length > 0 && hasHeader
    ? rawRows[0].map((val, idx) => String(val || '').trim() || `Cột ${idx + 1}`)
    : colIndices.map(idx => `Cột ${idx + 1}`);

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
                  <option value="tab">Tab (\\t)</option>
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

      {/* Mapping Configuration Section */}
      {rawRows.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-white/10 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-500" /> Cấu hình mapping & Import options
            </h3>
            <div className="flex items-center gap-2">
              <label className="text-sm flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasHeader}
                  onChange={(e) => setHasHeader(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Dòng đầu tiên là tiêu đề (Header)
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Term Mapping */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Từ vựng (Term) <span className="text-red-500">*</span></label>
              <select
                value={columnMappings.term}
                onChange={(e) => setColumnMappings(p => ({ ...p, term: Number(e.target.value) }))}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {colIndices.map(idx => (
                  <option key={idx} value={idx}>{headerLabels[idx] || `Cột ${idx + 1}`}</option>
                ))}
              </select>
            </div>

            {/* Meaning Mapping */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nghĩa (Meaning) <span className="text-red-500">*</span></label>
              <select
                value={columnMappings.meaning}
                onChange={(e) => setColumnMappings(p => ({ ...p, meaning: Number(e.target.value) }))}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {colIndices.map(idx => (
                  <option key={idx} value={idx}>{headerLabels[idx] || `Cột ${idx + 1}`}</option>
                ))}
              </select>
            </div>

            {/* Phonetic Mapping */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phiên âm (Phonetic)</label>
              <select
                value={columnMappings.phonetic}
                onChange={(e) => setColumnMappings(p => ({ ...p, phonetic: Number(e.target.value) }))}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="-1">-- Không map (Bỏ qua) --</option>
                {colIndices.map(idx => (
                  <option key={idx} value={idx}>{headerLabels[idx] || `Cột ${idx + 1}`}</option>
                ))}
              </select>
            </div>

            {/* Part Of Speech Mapping */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Từ loại (Part Of Speech)</label>
              <select
                value={columnMappings.partOfSpeech}
                onChange={(e) => setColumnMappings(p => ({ ...p, partOfSpeech: Number(e.target.value) }))}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="-1">-- Không map (Bỏ qua) --</option>
                {colIndices.map(idx => (
                  <option key={idx} value={idx}>{headerLabels[idx] || `Cột ${idx + 1}`}</option>
                ))}
              </select>
            </div>

            {/* Example sentence Mapping */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ví dụ (Example sentence)</label>
              <select
                value={columnMappings.example}
                onChange={(e) => setColumnMappings(p => ({ ...p, example: Number(e.target.value) }))}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="-1">-- Không map (Bỏ qua) --</option>
                {colIndices.map(idx => (
                  <option key={idx} value={idx}>{headerLabels[idx] || `Cột ${idx + 1}`}</option>
                ))}
              </select>
            </div>

            {/* Example meaning Mapping */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nghĩa ví dụ (Example meaning)</label>
              <select
                value={columnMappings.exampleMeaning}
                onChange={(e) => setColumnMappings(p => ({ ...p, exampleMeaning: Number(e.target.value) }))}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="-1">-- Không map (Bỏ qua) --</option>
                {colIndices.map(idx => (
                  <option key={idx} value={idx}>{headerLabels[idx] || `Cột ${idx + 1}`}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-white/5 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Topic Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Gán vào chủ đề (Topic)</label>
              <select
                value={selectedTopicId || ''}
                onChange={(e) => setSelectedTopicId(e.target.value ? Number(e.target.value) : null)}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">-- Chọn chủ đề bắt buộc --</option>
                {topics.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                ))}
              </select>
              <p className="text-xs text-slate-400">Các từ vựng import sẽ tự động được liên kết với chủ đề này.</p>
            </div>

            {/* Conflict Strategy */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Xử lý khi trùng lặp từ vựng</label>
              <select
                value={conflictStrategy}
                onChange={(e) => setConflictStrategy(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="merge">Trộn & liên kết (Merge) - Giữ thông tin cũ, thêm ví dụ & liên kết topic</option>
                <option value="overwrite">Ghi đè (Overwrite) - Cập nhật lại nghĩa và phiên âm theo file mới</option>
                <option value="skip">Bỏ qua (Skip) - Không chèn và không sửa đổi từ đã tồn tại</option>
              </select>
              <p className="text-xs text-slate-400">Tránh lỗi UNIQUE constraint khi import từ vựng đã có trong hệ thống.</p>
            </div>
          </div>
        </div>
      )}

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
              <thead className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-white/10 shadow-sm z-10">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-500">Từ vựng</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Nghĩa</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Phiên âm</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Từ loại</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Ví dụ</th>
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
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-[200px] truncate" title={word.meaning}>{word.meaning}</td>
                    <td className="px-4 py-3 text-slate-500">{word.phonetic || '-'}</td>
                    <td className="px-4 py-3 text-slate-500">{word.partOfSpeech || '-'}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-[250px] truncate" title={word.example}>{word.example || '-'}</td>
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

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { adminService } from '@/src/services/admin.service';
import { categoriesService } from '@/src/services/categories.service';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/card';
import { Plus, Search, Edit2, Trash2, BookOpen, X, Check, Upload } from 'lucide-react';
import { Skeleton } from '@/src/components/ui/skeleton';
import Topbar from '@/src/components/shared/Topbar';
import { toast } from 'sonner';
import axios from 'axios';

type CategoryOption = {
  id: number;
  name: string;
  code?: string;
  description?: string;
};

type WordExample = {
  id?: number;
  sentence: string;
  meaning?: string;
};

type WordItem = {
  id: number;
  term: string;
  meaning: string;
  phonetic?: string;
  partOfSpeechId: number;
  partOfSpeechName?: string;
  topics?: CategoryOption[];
  examples?: WordExample[];
};

export default function AdminWordsPage() {
  const [words, setWords] = useState<WordItem[]>([]);
  const [partsOfSpeech, setPartOfSpeeches] = useState<CategoryOption[]>([]);
  const [topics, setTopics] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowAddForm] = useState(false);
  const [editingWord, setEditingWord] = useState<WordItem | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Word Form State
  const [formData, setFormData] = useState({
    term: '',
    meaning: '',
    phonetic: '',
    partOfSpeechId: '',
    topicIds: [] as number[],
    examples: [{ sentence: '', meaning: '' }]
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [wordsData, posData, topicsData] = await Promise.all([
        adminService.getWords(1, 100),
        categoriesService.getPartOfSpeeches(),
        categoriesService.getTopics()
      ]);
      setWords(wordsData);
      setPartOfSpeeches(posData);
      setTopics(topicsData);
    } catch (error) {
      console.error("Failed to fetch admin data", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const handleEdit = (word: WordItem) => {
    const wordExamples = word.examples ?? [];

    setEditingWord(word);
    setFormData({
      term: word.term,
      meaning: word.meaning,
      phonetic: word.phonetic || '',
      partOfSpeechId: word.partOfSpeechId.toString(),
      topicIds: word.topics?.map((t) => t.id) || [],
      examples: wordExamples.length > 0 
        ? wordExamples.map((ex) => ({ sentence: ex.sentence, meaning: ex.meaning || '' }))
        : [{ sentence: '', meaning: '' }]
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa từ vựng này? Các câu hỏi liên quan cũng sẽ bị xóa.")) return;
    try {
      await adminService.deleteWord(id);
      toast.success("Xóa từ vựng thành công");
      fetchData();
    } catch (error) {
      toast.error("Xóa thất bại");
    }
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    setImporting(true);
    try {
      const extension = file.name.split('.').pop()?.toLowerCase();
      let payload: unknown[] | string;

      if (extension === 'csv' || file.type === 'text/csv') {
        payload = await file.text();
      } else if (extension === 'xlsx' || extension === 'xls') {
        const XLSX = await import('xlsx');
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        payload = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });
      } else {
        toast.error('Vui long chon file CSV, XLS hoac XLSX');
        return;
      }

      if (Array.isArray(payload) && payload.length === 0) {
        toast.error('File khong co du lieu de import');
        return;
      }

      const result = await adminService.bulkImportWords(payload);
      const message = `Import thanh cong ${result.success || 0} dong, loi ${result.failed || 0} dong`;

      if (result.failed > 0) {
        console.warn('Word import errors', result.errors);
        toast.warning(message);
      } else {
        toast.success(message);
      }

      fetchData();
    } catch (error) {
      console.error('Import words failed', error);
      toast.error('Import tu vung that bai');
    } finally {
      setImporting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const partOfSpeechId = Number(formData.partOfSpeechId);
      if (!partOfSpeechId) {
        toast.error('Vui long chon loai tu');
        return;
      }

      const data = {
        ...formData,
        partOfSpeechId,
        examples: formData.examples
          .map((example) => ({
            sentence: example.sentence.trim(),
            meaning: example.meaning.trim()
          }))
          .filter((example) => example.sentence)
      };

      if (editingWord) {
        await adminService.updateWord(editingWord.id, data);
        toast.success("Cập nhật thành công");
      } else {
        await adminService.createWord(data);
        toast.success("Thêm mới thành công");
      }

      setShowAddForm(false);
      setEditingWord(null);
      setFormData({
        term: '',
        meaning: '',
        phonetic: '',
        partOfSpeechId: '',
        topicIds: [],
        examples: [{ sentence: '', meaning: '' }]
      });
      fetchData();
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Loi khi luu du lieu'
        : 'Loi khi luu du lieu';

      console.error("Operation failed", message, axios.isAxiosError(error) ? error.response?.data : error);
      toast.error("Lỗi khi lưu dữ liệu");
    }
  };

  const addExample = () => {
    setFormData({ ...formData, examples: [...formData.examples, { sentence: '', meaning: '' }] });
  };

  const removeExample = (index: number) => {
    setFormData({ ...formData, examples: formData.examples.filter((_, i) => i !== index) });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#080d1a]">
      <Topbar title="Quản lý từ vựng" role="admin" />
      
      <main className="p-6 space-y-6 overflow-auto">
        <div className="flex justify-between items-center">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <Input className="pl-10 bg-white/5 border-white/10 text-white rounded-xl" placeholder="Tìm kiếm từ vựng..." />
          </div>
          {!showForm && (
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                onChange={handleImportFile}
              />
              <Button
                type="button"
                disabled={importing}
                onClick={() => fileInputRef.current?.click()}
                className="bg-white/5 hover:bg-white/10 border-white/10 text-white gap-2"
              >
                <Upload size={16} /> {importing ? 'Dang import...' : 'Import CSV/Excel'}
              </Button>
              <Button onClick={() => { setEditingWord(null); setShowAddForm(true); }} className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Plus size={16} /> Thêm từ mới
              </Button>
            </div>
          )}
        </div>

        {showForm && (
          <Card className="bg-white/5 border-white/10 text-white rounded-[32px] overflow-hidden">
            <CardHeader className="bg-white/5 border-b border-white/5">
              <CardTitle className="text-sm uppercase tracking-widest font-black">
                {editingWord ? `Chỉnh sửa: ${editingWord.term}` : 'Thêm từ vựng mới'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Từ vựng (Term)</label>
                    <Input 
                      value={formData.term} 
                      onChange={e => setFormData({...formData, term: e.target.value})}
                      className="bg-white/5 border-white/10 h-11 px-4 rounded-xl" required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Phiên âm (Phonetic)</label>
                    <Input 
                      value={formData.phonetic} 
                      onChange={e => setFormData({...formData, phonetic: e.target.value})}
                      className="bg-white/5 border-white/10 h-11 px-4 rounded-xl" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Loại từ</label>
                    <select 
                      className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white outline-none"
                      value={formData.partOfSpeechId}
                      onChange={e => setFormData({...formData, partOfSpeechId: e.target.value})}
                      required
                    >
                      <option value="">Chọn loại từ</option>
                      {partsOfSpeech.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Định nghĩa (Meaning)</label>
                  <Input 
                    value={formData.meaning} 
                    onChange={e => setFormData({...formData, meaning: e.target.value})}
                    className="bg-white/5 border-white/10 h-11 px-4 rounded-xl" required 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Chủ đề (Topics)</label>
                  <div className="flex flex-wrap gap-2 p-4 bg-white/3 border border-white/8 rounded-2xl">
                    {topics.map(t => (
                      <label key={t.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${formData.topicIds.includes(t.id) ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                        <input 
                          type="checkbox" 
                          className="hidden"
                          checked={formData.topicIds.includes(t.id)}
                          onChange={e => {
                            const ids = e.target.checked 
                              ? [...formData.topicIds, t.id]
                              : formData.topicIds.filter(id => id !== t.id);
                            setFormData({...formData, topicIds: ids});
                          }}
                        />
                        <span className="text-xs font-bold">{t.name}</span>
                        {formData.topicIds.includes(t.id) && <Check size={12} />}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Câu ví dụ</label>
                    <Button type="button" variant="ghost" size="xs" onClick={addExample} className="text-blue-400 hover:text-blue-300 font-bold">
                      + Thêm ví dụ
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {formData.examples.map((ex, idx) => (
                      <div key={idx} className="flex gap-3 group relative">
                        <Input 
                          placeholder="Câu tiếng Anh" 
                          value={ex.sentence}
                          onChange={e => {
                            const examples = [...formData.examples];
                            examples[idx].sentence = e.target.value;
                            setFormData({...formData, examples});
                          }}
                          className="bg-white/5 border-white/10 text-sm h-11 flex-1 px-4 rounded-xl" 
                        />
                        <Input 
                          placeholder="Nghĩa tiếng Việt" 
                          value={ex.meaning}
                          onChange={e => {
                            const examples = [...formData.examples];
                            examples[idx].meaning = e.target.value;
                            setFormData({...formData, examples});
                          }}
                          className="bg-white/5 border-white/10 text-sm h-11 flex-1 px-4 rounded-xl" 
                        />
                        <button 
                          type="button" 
                          onClick={() => removeExample(idx)}
                          className="w-11 h-11 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                  <Button type="button" variant="ghost" onClick={() => { setShowAddForm(false); setEditingWord(null); }} className="px-8 h-11 rounded-xl">Hủy</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-10 h-11 rounded-xl font-bold shadow-xl shadow-blue-900/20">
                    {editingWord ? 'Cập nhật' : 'Lưu từ vựng'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="bg-white/3 border border-white/8 rounded-[32px] overflow-hidden shadow-2xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-500 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-8 py-5">Từ vựng</th>
                <th className="px-6 py-5">Loại</th>
                <th className="px-6 py-5">Định nghĩa</th>
                <th className="px-6 py-5">Chủ đề</th>
                <th className="px-8 py-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && words.length === 0 ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-8 py-6"><Skeleton className="h-10 w-32 rounded-lg" /></td>
                    <td className="px-6 py-6"><Skeleton className="h-6 w-16 rounded-md" /></td>
                    <td className="px-6 py-6"><Skeleton className="h-4 w-48" /></td>
                    <td className="px-6 py-6"><div className="flex gap-1"><Skeleton className="h-4 w-10" /><Skeleton className="h-4 w-10" /></div></td>
                    <td className="px-8 py-6 text-right"><Skeleton className="h-8 w-8 ml-auto rounded-lg" /></td>
                  </tr>
                ))
              ) : words.map((w) => (
                <tr key={w.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-base">{w.term}</span>
                      <span className="text-slate-500 font-mono text-xs mt-0.5">{w.phonetic}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20 uppercase tracking-tighter">
                      {w.partOfSpeechName}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-slate-300 font-medium italic">
                    {w.meaning}
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-wrap gap-1.5">
                      {w.topics?.map((t) => (
                        <span key={t.id} className="text-[9px] px-2 py-0.5 bg-white/5 text-slate-400 rounded-md border border-white/5 font-bold">
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => handleEdit(w)}
                        className="p-2.5 bg-white/5 hover:bg-blue-600 rounded-xl text-slate-400 hover:text-white transition-all shadow-lg"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(w.id)}
                        className="p-2.5 bg-white/5 hover:bg-red-600 rounded-xl text-slate-400 hover:text-white transition-all shadow-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {words.length === 0 && !loading && (
            <div className="py-32 text-center text-slate-700 flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center"><BookOpen size={40} className="opacity-20" /></div>
              <p className="font-bold uppercase tracking-widest text-xs">Hệ thống từ vựng đang trống</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

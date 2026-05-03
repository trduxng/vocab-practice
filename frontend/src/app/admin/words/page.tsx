'use client';

import React, { useState, useEffect } from 'react';
import { adminService } from '@/src/services/admin.service';
import { categoriesService } from '@/src/services/categories.service';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/card';
import { Plus, Search, Edit2, Trash2, BookOpen, X, Check } from 'lucide-react';
import { Skeleton } from '@/src/components/ui/skeleton';
import Topbar from '@/src/components/shared/Topbar';
import { toast } from 'sonner';

export default function AdminWordsPage() {
  const [words, setWords] = useState<any[]>([]);
  const [partsOfSpeech, setPartOfSpeeches] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowAddForm] = useState(false);
  const [editingWord, setEditingWord] = useState<any>(null);

  // Word Form State
  const [formData, setFormData] = useState({
    term: '',
    meaning: '',
    phonetic: '',
    partOfSpeechId: '',
    topicIds: [] as number[],
    examples: [{ sentence: '', meaning: '' }]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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
  };

  const handleEdit = (word: any) => {
    setEditingWord(word);
    setFormData({
      term: word.term,
      meaning: word.meaning,
      phonetic: word.phonetic || '',
      partOfSpeechId: word.partOfSpeechId.toString(),
      topicIds: word.topics?.map((t: any) => t.id) || [],
      examples: word.examples?.length > 0 
        ? word.examples.map((ex: any) => ({ sentence: ex.sentence, meaning: ex.meaning }))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        partOfSpeechId: parseInt(formData.partOfSpeechId)
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
      console.error("Operation failed", error);
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
            <Button onClick={() => { setEditingWord(null); setShowAddForm(true); }} className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Plus size={16} /> Thêm từ mới
            </Button>
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
                      {w.topics?.map((t: any) => (
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

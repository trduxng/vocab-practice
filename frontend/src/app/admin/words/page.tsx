'use client';

import React, { useState, useEffect } from 'react';
import { adminService } from '@/src/services/admin.service';
import { categoriesService } from '@/src/services/categories.service';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/card';
import { Plus, Search, Edit2, Trash2, BookOpen, Layers } from 'lucide-react';
import Topbar from '@/src/components/shared/Topbar';

export default function AdminWordsPage() {
  const [words, setWords] = useState<any[]>([]);
  const [partsOfSpeech, setPartOfSpeeches] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Word Form State
  const [newWord, setNewWord] = useState({
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
        adminService.getWords(1, 50),
        categoriesService.getPartOfSpeeches(),
        categoriesService.getTopics()
      ]);
      setWords(wordsData);
      setPartOfSpeeches(posData);
      setTopics(topicsData);
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createWord({
        ...newWord,
        partOfSpeechId: parseInt(newWord.partOfSpeechId)
      });
      setShowAddForm(false);
      setNewWord({
        term: '',
        meaning: '',
        phonetic: '',
        partOfSpeechId: '',
        topicIds: [],
        examples: [{ sentence: '', meaning: '' }]
      });
      fetchData();
    } catch (error) {
      console.error("Failed to create word", error);
      alert("Tạo từ vựng thất bại");
    }
  };

  const addExample = () => {
    setNewWord({ ...newWord, examples: [...newWord.examples, { sentence: '', meaning: '' }] });
  };

  if (loading && words.length === 0) {
    return <div className="p-10 text-white">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="flex-1 flex flex-col bg-[#080d1a]">
      <Topbar title="Quản lý từ vựng" role="admin" />
      
      <main className="p-6 space-y-6 overflow-auto">
        <div className="flex justify-between items-center">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <Input className="pl-10 bg-white/5 border-white/10 text-white" placeholder="Tìm kiếm từ vựng..." />
          </div>
          <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Plus size={16} /> Thêm từ mới
          </Button>
        </div>

        {showAddForm && (
          <Card className="bg-white/5 border-white/10 text-white animate-in fade-in zoom-in duration-200">
            <CardHeader>
              <CardTitle>Thêm từ vựng mới</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddWord} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400">Từ vựng (Term)</label>
                    <Input 
                      value={newWord.term} 
                      onChange={e => setNewWord({...newWord, term: e.target.value})}
                      className="bg-white/5 border-white/10" required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400">Phiên âm (Phonetic)</label>
                    <Input 
                      value={newWord.phonetic} 
                      onChange={e => setNewWord({...newWord, phonetic: e.target.value})}
                      className="bg-white/5 border-white/10" 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400">Loại từ</label>
                    <select 
                      className="w-full h-8 bg-white/5 border border-white/10 rounded-none px-2 text-xs text-white outline-none"
                      value={newWord.partOfSpeechId}
                      onChange={e => setNewWord({...newWord, partOfSpeechId: e.target.value})}
                      required
                    >
                      <option value="">Chọn loại từ</option>
                      {partsOfSpeech.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400">Định nghĩa (Meaning)</label>
                    <Input 
                      value={newWord.meaning} 
                      onChange={e => setNewWord({...newWord, meaning: e.target.value})}
                      className="bg-white/5 border-white/10" required 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-400">Chủ đề (Topics)</label>
                  <div className="flex flex-wrap gap-2 p-3 bg-white/5 border border-white/10">
                    {topics.map(t => (
                      <label key={t.id} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={newWord.topicIds.includes(t.id)}
                          onChange={e => {
                            const ids = e.target.checked 
                              ? [...newWord.topicIds, t.id]
                              : newWord.topicIds.filter(id => id !== t.id);
                            setNewWord({...newWord, topicIds: ids});
                          }}
                        />
                        <span className="text-xs">{t.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-slate-400">Câu ví dụ</label>
                    <Button type="button" variant="ghost" size="xs" onClick={addExample} className="text-blue-400 hover:text-blue-300">
                      + Thêm ví dụ
                    </Button>
                  </div>
                  {newWord.examples.map((ex, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-2 pb-2 border-b border-white/5">
                      <Input 
                        placeholder="Câu tiếng Anh" 
                        value={ex.sentence}
                        onChange={e => {
                          const examples = [...newWord.examples];
                          examples[idx].sentence = e.target.value;
                          setNewWord({...newWord, examples});
                        }}
                        className="bg-white/5 border-white/10 text-xs" 
                      />
                      <Input 
                        placeholder="Nghĩa tiếng Việt" 
                        value={ex.meaning}
                        onChange={e => {
                          const examples = [...newWord.examples];
                          examples[idx].meaning = e.target.value;
                          setNewWord({...newWord, examples});
                        }}
                        className="bg-white/5 border-white/10 text-xs" 
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)}>Hủy</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Lưu từ vựng</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Từ vựng</th>
                <th className="px-6 py-4">Loại</th>
                <th className="px-6 py-4">Định nghĩa</th>
                <th className="px-6 py-4">Chủ đề</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {words.map((w) => (
                <tr key={w.id} className="hover:bg-white/2 transition-colors group text-white">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold">{w.term}</span>
                      <span className="text-slate-500 text-xs">{w.phonetic}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs border border-blue-500/20">
                      {w.partOfSpeechName}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300 max-w-xs truncate">
                    {w.meaning}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {w.topics?.map((t: any) => (
                        <span key={t.id} className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded">
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {words.length === 0 && (
            <div className="py-20 text-center text-slate-500 flex flex-col items-center gap-3">
              <BookOpen size={40} className="opacity-20" />
              <p>Chưa có từ vựng nào. Hãy thêm từ mới!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

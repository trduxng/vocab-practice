'use client';

import React, { useState, useEffect } from 'react';
import { adminService } from '@/src/services/admin.service';
import { categoriesService } from '@/src/services/categories.service';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/card';
import { Textarea } from '@/src/components/ui/textarea';
import { FileText, Plus, Search, Trash2, ListChecks, Check } from 'lucide-react';
import Topbar from '@/src/components/shared/Topbar';
import { toast } from 'sonner';

export default function AdminMiniTestsPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [words, setWords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Mini Test State
  const [newTest, setNewTest] = useState({
    title: '',
    description: '',
    topicId: '',
    selectedQuestionIds: [] as number[]
  });

  // Flat list of questions for selection
  const [allQuestions, setAllQuestions] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [testsData, topicsData, wordsData] = await Promise.all([
        adminService.getMiniTests(),
        categoriesService.getTopics(),
        adminService.getWords(1, 100)
      ]);
      setTests(testsData);
      setTopics(topicsData);
      setWords(wordsData);
      
      // Extract all questions from words
      const questions: any[] = [];
      for (const word of wordsData) {
        const qData = await adminService.getQuestionsByWord(word.id);
        questions.push(...qData.map((q: any) => ({ ...q, term: word.term })));
      }
      setAllQuestions(questions);
    } catch (error) {
      console.error("Failed to fetch admin data", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTest.selectedQuestionIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 câu hỏi");
      return;
    }

    try {
      await adminService.createMiniTest({
        title: newTest.title,
        description: newTest.description,
        topicId: parseInt(newTest.topicId),
        questionIds: newTest.selectedQuestionIds
      });
      toast.success("Tạo Mini Test thành công!");
      setShowAddForm(false);
      setNewTest({ title: '', description: '', topicId: '', selectedQuestionIds: [] });
      fetchData();
    } catch (error) {
      toast.error("Lỗi khi tạo bài thi");
    }
  };

  const toggleQuestionSelection = (id: number) => {
    const ids = newTest.selectedQuestionIds.includes(id)
      ? newTest.selectedQuestionIds.filter(qId => qId !== id)
      : [...newTest.selectedQuestionIds, id];
    setNewTest({ ...newTest, selectedQuestionIds: ids });
  };

  if (loading && tests.length === 0) {
    return <div className="p-10 text-white bg-[#080d1a] min-h-screen font-mono">LOADING TEST ENGINE...</div>;
  }

  return (
    <div className="flex-1 flex flex-col bg-[#080d1a]">
      <Topbar title="Quản lý Mini Test" role="admin" />
      
      <main className="p-6 space-y-6 overflow-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-white font-bold flex items-center gap-2">
            <FileText size={20} className="text-blue-500" /> Danh sách bài thi
          </h2>
          <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Plus size={16} /> Tạo bài thi mới
          </Button>
        </div>

        {showAddForm && (
          <Card className="bg-white/5 border-white/10 text-white rounded-[32px] overflow-hidden animate-in slide-in-from-top-4 duration-300">
             <CardHeader className="bg-blue-600/10 border-b border-white/5">
                <CardTitle className="text-sm uppercase tracking-widest font-black text-blue-400">Thiết kế Mini Test</CardTitle>
             </CardHeader>
             <CardContent className="p-8">
                <form onSubmit={handleCreateTest} className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tiêu đề bài thi</label>
                        <Input 
                          value={newTest.title} 
                          onChange={e => setNewTest({...newTest, title: e.target.value})}
                          className="bg-white/5 border-white/10 h-11 rounded-xl" required 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Chủ đề bài thi</label>
                        <select 
                          className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white outline-none"
                          value={newTest.topicId}
                          onChange={e => setNewTest({...newTest, topicId: e.target.value})}
                          required
                        >
                          <option value="">Chọn chủ đề</option>
                          {topics.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Mô tả bài thi</label>
                      <Textarea 
                        value={newTest.description}
                        onChange={e => setNewTest({...newTest, description: e.target.value})}
                        className="bg-white/5 border-white/10 rounded-xl"
                      />
                   </div>

                   <div className="space-y-4">
                      <div className="flex justify-between items-center">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <ListChecks size={14} className="text-blue-400" /> Chọn câu hỏi ({newTest.selectedQuestionIds.length})
                         </label>
                         <div className="relative w-48">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={12} />
                            <Input className="pl-8 bg-white/5 border-white/10 h-8 text-[10px] text-white" placeholder="Lọc câu hỏi..." />
                         </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2 no-scrollbar bg-black/20 p-4 rounded-2xl border border-white/5">
                         {allQuestions.map((q) => (
                           <div 
                            key={q.id} 
                            onClick={() => toggleQuestionSelection(q.id)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${newTest.selectedQuestionIds.includes(q.id) ? 'bg-blue-600/20 border-blue-500/50 text-white' : 'bg-white/3 border-white/5 text-slate-500 hover:bg-white/5'}`}
                           >
                              <div className={`w-5 h-5 rounded flex items-center justify-center border ${newTest.selectedQuestionIds.includes(q.id) ? 'bg-blue-500 border-blue-400 text-white' : 'border-white/10'}`}>
                                 {newTest.selectedQuestionIds.includes(q.id) && <Check size={12} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="text-xs font-bold truncate">{q.questionText}</p>
                                 <p className="text-[9px] opacity-60">Từ: {q.term} · {q.questionType}</p>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                      <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)} className="px-8 h-11 rounded-xl text-slate-400">Hủy</Button>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-10 h-11 rounded-xl font-bold shadow-xl shadow-blue-900/20">Xuất bản bài thi</Button>
                   </div>
                </form>
             </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
           {tests.map((test) => (
             <Card key={test.id} className="bg-white/3 border border-white/8 rounded-3xl overflow-hidden hover:border-blue-500/30 transition-all group">
                <CardContent className="p-6">
                   <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                         <FileText size={24} />
                      </div>
                      <div className="flex gap-1">
                         <Button variant="ghost" size="icon-sm" className="text-slate-600 hover:text-white"><Trash2 size={14} /></Button>
                      </div>
                   </div>
                   <h3 className="text-white font-bold text-lg mb-2">{test.title}</h3>
                   <p className="text-slate-500 text-xs line-clamp-2 h-8 mb-4">{test.description || "Không có mô tả."}</p>
                   
                   <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                      <span className="text-[10px] px-2 py-1 rounded bg-white/5 text-slate-400 font-bold border border-white/5">{test.topicName || "Tổng hợp"}</span>
                      <span className="text-[10px] px-2 py-1 rounded bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20 uppercase">{test.totalQuestions} câu hỏi</span>
                   </div>
                </CardContent>
             </Card>
           ))}
           {tests.length === 0 && !loading && (
             <div className="col-span-full py-32 text-center text-slate-700 flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center"><FileText size={40} className="opacity-20" /></div>
                <p className="font-bold uppercase tracking-widest text-xs text-balance">Hiện chưa có bài thi Mini Test nào</p>
             </div>
           )}
        </div>
      </main>
    </div>
  );
}

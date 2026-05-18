'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { adminService, type PaginationMeta } from '@/src/services/admin.service';
import { categoriesService } from '@/src/services/categories.service';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/card';
import { Textarea } from '@/src/components/ui/textarea';
import { FileText, Plus, Search, Trash2, ListChecks, Check, Archive } from 'lucide-react';
import Topbar from '@/src/components/shared/Topbar';
import { toast } from 'sonner';

type MiniTestItem = {
  id: number;
  title: string;
  description?: string;
  topicName?: string;
  totalQuestions: number;
  status?: string;
};

type TopicOption = { id: number; name: string };
type WordItem = { id: number; term: string };
type ApiQuestion = { id: number; questionText: string; questionType: string };
type QuestionItem = ApiQuestion & { term: string };

export default function AdminMiniTestsPage() {
  const [tests, setTests] = useState<MiniTestItem[]>([]);
  const [topics, setTopics] = useState<TopicOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [questionFilter, setQuestionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [newTest, setNewTest] = useState({
    title: '',
    description: '',
    topicId: '',
    selectedQuestionIds: [] as number[]
  });
  const [allQuestions, setAllQuestions] = useState<QuestionItem[]>([]);
  const pageSize = 12;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [testsData, topicsData, wordsData] = await Promise.all([
        adminService.getMiniTestsPage<MiniTestItem>(page, pageSize),
        categoriesService.getTopics(),
        adminService.getWords<WordItem>(1, 100)
      ]);
      setTests(testsData.items);
      setPagination(testsData.pagination);
      setTopics(topicsData);

      const questions: QuestionItem[] = [];
      for (const word of wordsData) {
        const qData: ApiQuestion[] = await adminService.getQuestionsByWord<ApiQuestion>(word.id, 1, 100);
        questions.push(...qData.map((q) => ({ ...q, term: word.term })));
      }
      setAllQuestions(questions);
    } catch (error) {
      console.error('Failed to fetch admin data', error);
      toast.error('Khong the tai du lieu');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void Promise.resolve().then(fetchData);
  }, [fetchData]);

  const filteredQuestions = useMemo(() => {
    const query = questionFilter.trim().toLowerCase();
    if (!query) return allQuestions;
    return allQuestions.filter((question) =>
      `${question.questionText} ${question.questionType} ${question.term}`.toLowerCase().includes(query)
    );
  }, [allQuestions, questionFilter]);

  const handleCreateTest = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newTest.selectedQuestionIds.length === 0) {
      toast.error('Vui long chon it nhat 1 cau hoi');
      return;
    }

    try {
      await adminService.createMiniTest({
        title: newTest.title,
        description: newTest.description,
        topicId: parseInt(newTest.topicId, 10),
        questionIds: newTest.selectedQuestionIds
      });
      toast.success('Tao mini test thanh cong');
      setShowAddForm(false);
      setNewTest({ title: '', description: '', topicId: '', selectedQuestionIds: [] });
      fetchData();
    } catch (error) {
      console.error('Failed to create mini test', error);
      toast.error('Tao mini test that bai');
    }
  };

  const toggleQuestionSelection = (id: number) => {
    const ids = newTest.selectedQuestionIds.includes(id)
      ? newTest.selectedQuestionIds.filter((questionId) => questionId !== id)
      : [...newTest.selectedQuestionIds, id];
    setNewTest({ ...newTest, selectedQuestionIds: ids });
  };

  const handleDeleteTest = async (id: number) => {
    if (!confirm('Xoa mini test nay? Lich su lam bai lien quan cung se bi xoa.')) return;

    try {
      await adminService.deleteMiniTest(id);
      toast.success('Xoa mini test thanh cong');
      fetchData();
    } catch (error) {
      console.error('Failed to delete mini test', error);
      toast.error('Xoa mini test that bai');
    }
  };

  const handlePublishTest = async (id: number) => {
    try {
      await adminService.publishMiniTest(id);
      toast.success('Xuat ban mini test thanh cong');
      fetchData();
    } catch (error) {
      console.error('Failed to publish mini test', error);
      toast.error('Xuat ban mini test that bai');
    }
  };

  const handleArchiveTest = async (id: number) => {
    try {
      await adminService.archiveMiniTest(id);
      toast.success('Luu tru mini test thanh cong');
      fetchData();
    } catch (error) {
      console.error('Failed to archive mini test', error);
      toast.error('Luu tru mini test that bai');
    }
  };

  if (loading && tests.length === 0) {
    return <div className="p-10 text-white bg-[#080d1a] min-h-screen font-mono">LOADING TEST ENGINE...</div>;
  }

  return (
    <div className="flex-1 flex flex-col bg-[#080d1a]">
      <Topbar title="Quan ly Mini Test" role="admin" />

      <main className="p-6 space-y-6 overflow-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-white font-bold flex items-center gap-2">
            <FileText size={20} className="text-blue-500" /> Danh sach bai thi
          </h2>
          <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Plus size={16} /> Tao bai thi moi
          </Button>
        </div>

        {showAddForm && (
          <Card className="bg-white/5 border-white/10 text-white rounded-[32px] overflow-hidden animate-in slide-in-from-top-4 duration-300">
            <CardHeader className="bg-blue-600/10 border-b border-white/5">
              <CardTitle className="text-sm uppercase tracking-widest font-black text-blue-400">Thiet ke Mini Test</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleCreateTest} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tieu de bai thi</label>
                    <Input
                      value={newTest.title}
                      onChange={(event) => setNewTest({ ...newTest, title: event.target.value })}
                      className="bg-white/5 border-white/10 h-11 rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Chu de bai thi</label>
                    <select
                      className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white outline-none"
                      value={newTest.topicId}
                      onChange={(event) => setNewTest({ ...newTest, topicId: event.target.value })}
                      required
                    >
                      <option value="">Chon chu de</option>
                      {topics.map((topic) => (
                        <option key={topic.id} value={topic.id}>{topic.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Mo ta bai thi</label>
                  <Textarea
                    value={newTest.description}
                    onChange={(event) => setNewTest({ ...newTest, description: event.target.value })}
                    className="bg-white/5 border-white/10 rounded-xl"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <ListChecks size={14} className="text-blue-400" /> Chon cau hoi ({newTest.selectedQuestionIds.length})
                    </label>
                    <div className="relative w-48">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={12} />
                      <Input
                        value={questionFilter}
                        onChange={(event) => setQuestionFilter(event.target.value)}
                        className="pl-8 bg-white/5 border-white/10 h-8 text-[10px] text-white"
                        placeholder="Loc cau hoi..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2 no-scrollbar bg-black/20 p-4 rounded-2xl border border-white/5">
                    {filteredQuestions.map((question) => (
                      <div
                        key={question.id}
                        onClick={() => toggleQuestionSelection(question.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${newTest.selectedQuestionIds.includes(question.id) ? 'bg-blue-600/20 border-blue-500/50 text-white' : 'bg-white/3 border-white/5 text-slate-500 hover:bg-white/5'}`}
                      >
                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${newTest.selectedQuestionIds.includes(question.id) ? 'bg-blue-500 border-blue-400 text-white' : 'border-white/10'}`}>
                          {newTest.selectedQuestionIds.includes(question.id) && <Check size={12} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate">{question.questionText}</p>
                          <p className="text-[9px] opacity-60">Tu: {question.term} - {question.questionType}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                  <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)} className="px-8 h-11 rounded-xl text-slate-400">Huy</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-10 h-11 rounded-xl font-bold shadow-xl shadow-blue-900/20">Xuat ban bai thi</Button>
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
                    {test.status === 'Published' ? (
                      <Button variant="ghost" size="icon-sm" className="text-slate-600 hover:text-amber-300" onClick={() => handleArchiveTest(test.id)}><Archive size={14} /></Button>
                    ) : (
                      <Button variant="ghost" size="icon-sm" className="text-slate-600 hover:text-emerald-300" onClick={() => handlePublishTest(test.id)}><Check size={14} /></Button>
                    )}
                    <Button variant="ghost" size="icon-sm" className="text-slate-600 hover:text-red-400" onClick={() => handleDeleteTest(test.id)}><Trash2 size={14} /></Button>
                  </div>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{test.title}</h3>
                <p className="text-slate-500 text-xs line-clamp-2 h-8 mb-4">{test.description || 'Khong co mo ta.'}</p>

                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <span className="text-[10px] px-2 py-1 rounded bg-white/5 text-slate-400 font-bold border border-white/5">{test.topicName || 'Tong hop'}</span>
                  <span className="text-[10px] px-2 py-1 rounded bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20 uppercase">{test.totalQuestions} cau hoi</span>
                  <span className="text-[10px] px-2 py-1 rounded bg-white/5 text-slate-400 font-bold border border-white/5">{test.status || 'Published'}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {tests.length === 0 && !loading && (
            <div className="col-span-full py-32 text-center text-slate-700 flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center"><FileText size={40} className="opacity-20" /></div>
              <p className="font-bold uppercase tracking-widest text-xs text-balance">Hien chua co Mini Test nao</p>
            </div>
          )}
        </div>
        {pagination && (
          <div className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-white/3 px-5 py-4 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <span>Hien thi {tests.length} / {pagination.total} mini test</span>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))}>
                Truoc
              </Button>
              <span>Trang {pagination.page}/{pagination.totalPages}</span>
              <Button type="button" variant="ghost" disabled={page >= pagination.totalPages || loading} onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}>
                Sau
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

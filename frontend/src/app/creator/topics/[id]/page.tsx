'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { creatorService, Word, WordPayload, Question, QuestionPayload, Topic } from '@/src/services/creator.service';
import { ArrowLeft, Plus, Pencil, Trash2, Send, Loader2, X, BookOpen, FileQuestion } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { toast } from 'sonner';

const statusBadge: Record<string, string> = {
  Draft: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  PendingReview: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  Published: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  Rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};
const statusLabels: Record<string, string> = {
  Draft: 'Bản nháp', PendingReview: 'Chờ duyệt', Published: 'Đã xuất bản', Rejected: 'Bị từ chối',
};
const qTypes = ['MultipleChoice', 'FillInBlank', 'TrueFalse', 'Matching', 'Listening'];

export default function TopicDetailPage() {
  const { id } = useParams<{ id: string }>();
  const topicId = Number(id);
  const router = useRouter();

  const [topic, setTopic] = useState<Topic | null>(null);
  const [tab, setTab] = useState<'words' | 'questions'>('words');
  const [words, setWords] = useState<Word[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // Word form
  const [showWordForm, setShowWordForm] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [wordForm, setWordForm] = useState<WordPayload>({ term: '', meaning: '', phonetic: '', partOfSpeechId: 1, topicIds: [topicId] });
  const [savingWord, setSavingWord] = useState(false);

  // Question form
  const [showQForm, setShowQForm] = useState(false);
  const [editingQ, setEditingQ] = useState<Question | null>(null);
  const [qForm, setQForm] = useState<QuestionPayload>({ wordId: 0, questionType: 'MultipleChoice', questionText: '', optionsJson: '[]', correctAnswer: '', explanation: '' });
  const [savingQ, setSavingQ] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [allTopics, ws, qs] = await Promise.all([
        creatorService.getTopics(),
        creatorService.getWords({ topicId }),
        creatorService.getQuestions({ topicId }),
      ]);
      const found = allTopics.find((t) => t.id === topicId) || null;
      setTopic(found);
      setWords(ws);
      setQuestions(qs);
    } catch {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadData(); }, [loadData]);

  // ── Word handlers ──
  const openCreateWord = () => {
    setEditingWord(null);
    setWordForm({ term: '', meaning: '', phonetic: '', partOfSpeechId: 1, topicIds: [topicId] });
    setShowWordForm(true);
  };
  const openEditWord = (w: Word) => {
    setEditingWord(w);
    setWordForm({ term: w.term, meaning: w.meaning, phonetic: w.phonetic || '', partOfSpeechId: w.partOfSpeechId, topicIds: [topicId] });
    setShowWordForm(true);
  };
  const handleSaveWord = async () => {
    if (!wordForm.term.trim() || !wordForm.meaning.trim()) { toast.error('Từ và nghĩa là bắt buộc'); return; }
    setSavingWord(true);
    try {
      if (editingWord) {
        await creatorService.updateWord(editingWord.id, wordForm);
        toast.success('Cập nhật thành công');
      } else {
        await creatorService.createWord({ ...wordForm, topicIds: [topicId] });
        toast.success('Tạo từ vựng thành công');
      }
      setShowWordForm(false);
      await loadData();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) { toast.error(e.response?.data?.message || 'Lỗi khi lưu'); }
    finally { setSavingWord(false); }
  };
  const handleDeleteWord = async (wId: number) => {
    if (!confirm('Xóa từ vựng này?')) return;
    try { await creatorService.deleteWord(wId); toast.success('Đã xóa'); await loadData(); }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (e: any) { toast.error(e.response?.data?.message || 'Không thể xóa'); }
  };
  const handleSubmitWord = async (wId: number) => {
    try { await creatorService.submitWordForReview(wId); toast.success('Đã gửi duyệt'); await loadData(); }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (e: any) { toast.error(e.response?.data?.message || 'Lỗi'); }
  };

  // ── Question handlers ──
  const openCreateQ = () => {
    setEditingQ(null);
    setQForm({ wordId: 0, questionType: 'MultipleChoice', questionText: '', optionsJson: '[]', correctAnswer: '', explanation: '' });
    setShowQForm(true);
  };
  const openEditQ = (q: Question) => {
    setEditingQ(q);
    setQForm({ wordId: q.wordId, questionType: q.questionType, questionText: q.questionText, optionsJson: q.optionsJson || '[]', correctAnswer: q.correctAnswer, explanation: q.explanation || '' });
    setShowQForm(true);
  };
  const handleSaveQ = async () => {
    if (!qForm.questionText.trim() || !qForm.correctAnswer.trim()) { toast.error('Nội dung và đáp án bắt buộc'); return; }
    if (!qForm.wordId) { toast.error('Chọn từ vựng cho câu hỏi'); return; }
    setSavingQ(true);
    try {
      if (editingQ) {
        await creatorService.updateQuestion(editingQ.id, qForm);
        toast.success('Cập nhật thành công');
      } else {
        await creatorService.createQuestion(qForm);
        toast.success('Tạo câu hỏi thành công');
      }
      setShowQForm(false);
      await loadData();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) { toast.error(e.response?.data?.message || 'Lỗi khi lưu'); }
    finally { setSavingQ(false); }
  };
  const handleDeleteQ = async (qId: number) => {
    if (!confirm('Xóa câu hỏi này?')) return;
    try { await creatorService.deleteQuestion(qId); toast.success('Đã xóa'); await loadData(); }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (e: any) { toast.error(e.response?.data?.message || 'Lỗi'); }
  };
  const handleSubmitQ = async (qId: number) => {
    try { await creatorService.submitQuestionForReview(qId); toast.success('Đã gửi duyệt'); await loadData(); }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (e: any) { toast.error(e.response?.data?.message || 'Lỗi'); }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-blue-500" /></div>;

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{topic?.name || 'Chủ đề'}</h1>
          <p className="text-slate-500 text-sm mt-0.5">{topic?.code} · {statusLabels[topic?.contentStatus || ''] || topic?.contentStatus}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-white/5 rounded-xl w-fit">
        <button
          onClick={() => setTab('words')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'words' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <BookOpen className="h-4 w-4" /> Từ vựng ({words.length})
        </button>
        <button
          onClick={() => setTab('questions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'questions' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <FileQuestion className="h-4 w-4" /> Câu hỏi ({questions.length})
        </button>
      </div>

      {/* ── Words Tab ── */}
      {tab === 'words' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openCreateWord} className="gap-2 rounded-xl"><Plus className="h-4 w-4" /> Thêm từ vựng</Button>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Từ</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Nghĩa</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Phiên âm</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Trạng thái</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {words.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-slate-500">Chưa có từ vựng nào trong chủ đề này</td></tr>
                ) : words.map((w) => (
                  <tr key={w.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium">{w.term}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{w.meaning}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{w.phonetic || '—'}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[w.contentStatus] || ''}`}>{statusLabels[w.contentStatus] || w.contentStatus}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {(w.contentStatus === 'Draft' || w.contentStatus === 'Rejected') && (
                          <button onClick={() => handleSubmitWord(w.id)} title="Gửi duyệt" className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500"><Send className="h-4 w-4" /></button>
                        )}
                        <button onClick={() => openEditWord(w)} title="Sửa" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500"><Pencil className="h-4 w-4" /></button>
                        {w.contentStatus === 'Draft' && (
                          <button onClick={() => handleDeleteWord(w.id)} title="Xóa" className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 className="h-4 w-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Questions Tab ── */}
      {tab === 'questions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Câu hỏi liên kết với các từ vựng trong chủ đề này</p>
            <Button onClick={openCreateQ} className="gap-2 rounded-xl"><Plus className="h-4 w-4" /> Thêm câu hỏi</Button>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Câu hỏi</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Từ vựng</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Loại</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Trạng thái</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {questions.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-slate-500">Chưa có câu hỏi nào. Hãy tạo từ vựng trước rồi thêm câu hỏi!</td></tr>
                ) : questions.map((q) => (
                  <tr key={q.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium max-w-xs truncate">{q.questionText}</td>
                    <td className="px-4 py-3 text-slate-500">{q.wordTerm || '—'}</td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-500">{q.questionType}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[q.contentStatus] || ''}`}>{statusLabels[q.contentStatus] || q.contentStatus}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {(q.contentStatus === 'Draft' || q.contentStatus === 'Rejected') && (
                          <button onClick={() => handleSubmitQ(q.id)} title="Gửi duyệt" className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500"><Send className="h-4 w-4" /></button>
                        )}
                        <button onClick={() => openEditQ(q)} title="Sửa" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500"><Pencil className="h-4 w-4" /></button>
                        {q.contentStatus === 'Draft' && (
                          <button onClick={() => handleDeleteQ(q.id)} title="Xóa" className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 className="h-4 w-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Word Form Modal ── */}
      {showWordForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowWordForm(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl border border-slate-200 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{editingWord ? 'Sửa từ vựng' : 'Thêm từ vựng'}</h2>
              <button onClick={() => setShowWordForm(false)}><X className="h-5 w-5 text-slate-500" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-semibold text-slate-500 uppercase">Từ (Term) *</label><Input value={wordForm.term} onChange={(e) => setWordForm({ ...wordForm, term: e.target.value })} placeholder="example" className="mt-1" /></div>
              <div><label className="text-xs font-semibold text-slate-500 uppercase">Nghĩa *</label><Input value={wordForm.meaning} onChange={(e) => setWordForm({ ...wordForm, meaning: e.target.value })} placeholder="ví dụ" className="mt-1" /></div>
              <div><label className="text-xs font-semibold text-slate-500 uppercase">Phiên âm</label><Input value={wordForm.phonetic} onChange={(e) => setWordForm({ ...wordForm, phonetic: e.target.value })} placeholder="/ɪɡˈzæm.pəl/" className="mt-1" /></div>
              <div><label className="text-xs font-semibold text-slate-500 uppercase">Loại từ</label>
                <select value={wordForm.partOfSpeechId} onChange={(e) => setWordForm({ ...wordForm, partOfSpeechId: Number(e.target.value) })} className="mt-1 w-full rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-sm">
                  <option value={1}>Noun (Danh từ)</option>
                  <option value={2}>Verb (Động từ)</option>
                  <option value={3}>Adjective (Tính từ)</option>
                  <option value={4}>Adverb (Trạng từ)</option>
                  <option value={5}>Preposition (Giới từ)</option>
                  <option value={6}>Conjunction (Liên từ)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowWordForm(false)} className="rounded-xl">Hủy</Button>
              <Button onClick={handleSaveWord} disabled={savingWord} className="rounded-xl gap-2">
                {savingWord && <Loader2 className="animate-spin h-4 w-4" />} {editingWord ? 'Cập nhật' : 'Tạo'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Question Form Modal ── */}
      {showQForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowQForm(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl border border-slate-200 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{editingQ ? 'Sửa câu hỏi' : 'Thêm câu hỏi'}</h2>
              <button onClick={() => setShowQForm(false)}><X className="h-5 w-5 text-slate-500" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-semibold text-slate-500 uppercase">Từ vựng *</label>
                <select value={qForm.wordId} onChange={(e) => setQForm({ ...qForm, wordId: Number(e.target.value) })} className="mt-1 w-full rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-sm">
                  <option value={0}>-- Chọn từ vựng trong chủ đề --</option>
                  {words.map((w) => <option key={w.id} value={w.id}>{w.term} — {w.meaning}</option>)}
                </select>
              </div>
              <div><label className="text-xs font-semibold text-slate-500 uppercase">Loại câu hỏi</label>
                <select value={qForm.questionType} onChange={(e) => setQForm({ ...qForm, questionType: e.target.value })} className="mt-1 w-full rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-sm">
                  {qTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div><label className="text-xs font-semibold text-slate-500 uppercase">Nội dung câu hỏi *</label><textarea value={qForm.questionText} onChange={(e) => setQForm({ ...qForm, questionText: e.target.value })} rows={3} className="mt-1 w-full rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-sm resize-none" /></div>
              <div><label className="text-xs font-semibold text-slate-500 uppercase">Options JSON</label><textarea value={qForm.optionsJson} onChange={(e) => setQForm({ ...qForm, optionsJson: e.target.value })} rows={2} className="mt-1 w-full rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-mono resize-none" placeholder='["A","B","C","D"]' /></div>
              <div><label className="text-xs font-semibold text-slate-500 uppercase">Đáp án đúng *</label><Input value={qForm.correctAnswer} onChange={(e) => setQForm({ ...qForm, correctAnswer: e.target.value })} className="mt-1" /></div>
              <div><label className="text-xs font-semibold text-slate-500 uppercase">Giải thích</label><textarea value={qForm.explanation} onChange={(e) => setQForm({ ...qForm, explanation: e.target.value })} rows={2} className="mt-1 w-full rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-sm resize-none" /></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowQForm(false)} className="rounded-xl">Hủy</Button>
              <Button onClick={handleSaveQ} disabled={savingQ} className="rounded-xl gap-2">
                {savingQ && <Loader2 className="animate-spin h-4 w-4" />} {editingQ ? 'Cập nhật' : 'Tạo'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { aiService } from '@/src/services/ai.service';
import { creatorService, Word, WordPayload, Question, QuestionPayload, Topic, MediaItem } from '@/src/services/creator.service';
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
  const [wordForm, setWordForm] = useState<WordPayload>({ term: '', meaning: '', phonetic: '', partOfSpeechId: 1, topicIds: [topicId], mediaIds: [] });
  const [savingWord, setSavingWord] = useState(false);
  const [autoFillingWord, setAutoFillingWord] = useState(false);

  // Media Modal
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);

  const handleOpenMedia = async () => {
    setShowMediaModal(true);
    if (mediaList.length === 0) {
      setLoadingMedia(true);
      try {
        const res = await creatorService.getMedia();
        setMediaList(res.data);
      } catch {
        toast.error('Không thể tải media');
      } finally {
        setLoadingMedia(false);
      }
    }
  };

  const toggleMediaSelection = (mId: number) => {
    const current = wordForm.mediaIds || [];
    if (current.includes(mId)) {
      setWordForm({ ...wordForm, mediaIds: current.filter(id => id !== mId) });
    } else {
      setWordForm({ ...wordForm, mediaIds: [...current, mId] });
    }
  };

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
    setWordForm({ term: '', meaning: '', phonetic: '', partOfSpeechId: 1, topicIds: [topicId], mediaIds: [] });
    setShowWordForm(true);
  };
  const openEditWord = (w: Word) => {
    setEditingWord(w);
    setWordForm({ term: w.term, meaning: w.meaning, phonetic: w.phonetic || '', partOfSpeechId: w.partOfSpeechId, topicIds: [topicId], mediaIds: [] });
    setShowWordForm(true);
  };

  const handleAutoFillWord = async () => {
    const term = wordForm.term.trim();
    if (!term) return;
    const shouldRefreshContext = Boolean(
      editingWord && editingWord.term.trim().toLowerCase() !== term.toLowerCase()
    );

    setAutoFillingWord(true);
    try {
      const suggestion = await aiService.suggestWordContent({
        term,
        meaning: wordForm.meaning.trim() || undefined,
        exampleCount: 3,
      });

      setWordForm((current) => ({
        ...current,
        term: current.term.trim() || suggestion.term,
        meaning: shouldRefreshContext
          ? suggestion.meaning || current.meaning
          : current.meaning.trim() || suggestion.meaning || current.meaning,
        phonetic: shouldRefreshContext
          ? suggestion.phonetic || current.phonetic
          : (current.phonetic || '').trim() || suggestion.phonetic || current.phonetic,
      }));
    } catch (error) {
      console.error('Không thể tự điền từ vựng', error);
      toast.error('Không thể tự động điền nghĩa/phiên âm');
    } finally {
      setAutoFillingWord(false);
    }
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
                        {(w.contentStatus === 'Draft' || w.contentStatus === 'PendingReview') && (
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
                        {(q.contentStatus === 'Draft' || q.contentStatus === 'PendingReview') && (
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
              <div><label className="text-xs font-semibold text-slate-500 uppercase">Từ (Term) *</label><Input value={wordForm.term} onChange={(e) => setWordForm({ ...wordForm, term: e.target.value })} onBlur={() => { void handleAutoFillWord(); }} placeholder="example" className="mt-1" /></div>
              <div><label className="text-xs font-semibold text-slate-500 uppercase">Nghĩa *</label><Input value={wordForm.meaning} onChange={(e) => setWordForm({ ...wordForm, meaning: e.target.value })} placeholder="ví dụ" className="mt-1" /></div>
              <div><label className="text-xs font-semibold text-slate-500 uppercase">Phiên âm</label><Input value={wordForm.phonetic} onChange={(e) => setWordForm({ ...wordForm, phonetic: e.target.value })} placeholder="/ɪɡˈzæm.pəl/" className="mt-1" /></div>
              <div className="flex justify-end">
                <Button type="button" variant="outline" onClick={() => { void handleAutoFillWord(); }} disabled={autoFillingWord || !wordForm.term.trim()} className="rounded-md">
                  {autoFillingWord ? 'Đang tự điền...' : 'Tự động điền'}
                </Button>
              </div>
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
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Media đính kèm</label>
                <div className="flex items-center gap-2 mt-1">
                  <Button variant="outline" size="sm" onClick={handleOpenMedia}>Chọn từ Thư viện Media</Button>
                  <span className="text-xs text-slate-500">
                    Đã chọn: {(wordForm.mediaIds || []).length} media
                  </span>
                </div>
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

      {/* ── Media Selection Modal ── */}
      {showMediaModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowMediaModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Chọn Media</h2>
              <button onClick={() => setShowMediaModal(false)}><X className="h-5 w-5 text-slate-500" /></button>
            </div>
            <div className="flex-1 overflow-y-auto min-h-[300px]">
              {loadingMedia ? (
                <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-6 w-6 text-blue-500" /></div>
              ) : mediaList.length === 0 ? (
                <div className="text-center text-slate-500 py-10">Không có media nào trong thư viện.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {mediaList.map((m) => {
                    const isSelected = (wordForm.mediaIds || []).includes(m.id);
                    return (
                      <div 
                        key={m.id} 
                        onClick={() => toggleMediaSelection(m.id)}
                        className={`cursor-pointer border-2 rounded-xl overflow-hidden transition-all relative ${isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                      >
                        {m.mediaType === 'image' ? (
                          <img src={m.fileUrl} alt={m.altText || ''} className="w-full h-24 object-cover" />
                        ) : m.mediaType === 'audio' ? (
                          <div className="w-full h-24 bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-2 text-center text-xs">
                            🎵 {m.fileName}
                          </div>
                        ) : (
                          <div className="w-full h-24 bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-2 text-center text-xs text-slate-500">
                            {m.fileName}
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-0.5 shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex justify-end pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <Button onClick={() => setShowMediaModal(false)} className="rounded-xl">Xong</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

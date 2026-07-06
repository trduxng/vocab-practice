'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FileQuestion, Loader2, Pencil, Plus, Send, Sparkles, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

import { aiService } from '@/src/services/ai.service';
import { creatorService, type Question, type Word } from '@/src/services/creator.service';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';

type QuestionType = 'MCQ' | 'FillBlank' | 'DragDrop' | 'Dictation' | 'FlashcardCheck' | 'AudioRecognition';
type QuestionStatus = 'Draft' | 'PendingReview' | 'Published' | 'Rejected' | 'Archived';

type QuestionForm = {
  questionType: QuestionType;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  status: QuestionStatus;
};

const questionTypes: QuestionType[] = ['MCQ', 'FillBlank', 'Dictation', 'DragDrop', 'FlashcardCheck', 'AudioRecognition'];

const statusBadge: Record<string, string> = {
  Draft: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  PendingReview: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  Published: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  Rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  Archived: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const statusLabels: Record<string, string> = {
  Draft: 'Bản nháp',
  PendingReview: 'Chờ duyệt',
  Published: 'Đã xuất bản',
  Rejected: 'Bị từ chối',
  Archived: 'Đã lưu trữ',
};

const emptyForm: QuestionForm = {
  questionType: 'MCQ',
  questionText: '',
  options: ['', '', '', ''],
  correctAnswer: '',
  explanation: '',
  status: 'Draft',
};

function parseOptions(optionsJson?: string) {
  if (!optionsJson) return ['', '', '', ''];
  try {
    const parsed = JSON.parse(optionsJson);
    if (Array.isArray(parsed)) return parsed.map((item) => String(item ?? '')).slice(0, 5);
  } catch {
    return ['', '', '', ''];
  }
  return ['', '', '', ''];
}

export default function CreatorQuestionsPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedWordId, setSelectedWordId] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [saving, setSaving] = useState(false);
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [form, setForm] = useState<QuestionForm>(emptyForm);

  const selectedWord = useMemo(
    () => words.find((word) => word.id === selectedWordId) || words[0] || null,
    [selectedWordId, words],
  );

  const filteredQuestions = useMemo(() => {
    if (!selectedWord) return questions;
    return questions.filter((question) => question.wordId === selectedWord.id);
  }, [questions, selectedWord]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [wordList, questionList] = await Promise.all([
        creatorService.getWords({ pageSize: 200 }),
        creatorService.getQuestions({ pageSize: 200 }),
      ]);
      setWords(wordList);
      setQuestions(questionList);
      setSelectedWordId((current) => current || wordList[0]?.id || '');
    } catch (error) {
      console.error('Không thể tải dữ liệu câu hỏi', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadData(); }, [loadData]);

  const openCreate = () => {
    if (!selectedWord) {
      toast.error('Hãy chọn từ vựng trước');
      return;
    }
    setEditingQuestion(null);
    setForm({
      ...emptyForm,
      questionText: `What is the correct meaning of "${selectedWord.term}"?`,
      correctAnswer: selectedWord.meaning,
      options: [selectedWord.meaning, '', '', ''],
    });
    setShowForm(true);
  };

  const openEdit = (question: Question) => {
    setEditingQuestion(question);
    setForm({
      questionType: question.questionType as QuestionType,
      questionText: question.questionText,
      options: parseOptions(question.optionsJson),
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || '',
      status: (question.contentStatus as QuestionStatus) || 'Draft',
    });
    setShowForm(true);
  };

  const updateOption = (index: number, value: string) => {
    setForm((current) => {
      const next = [...current.options];
      next[index] = value;
      return { ...current, options: next };
    });
  };

  const addOption = () => setForm((current) => ({ ...current, options: [...current.options, ''] }));

  const removeOption = (index: number) => setForm((current) => ({ ...current, options: current.options.filter((_, i) => i !== index) }));

  const applyAiSuggestion = (suggestion: Awaited<ReturnType<typeof aiService.suggestQuestionContent>>) => {
    const options = parseOptions(suggestion.optionsJson).filter((item) => item.trim().length > 0);
    setForm((current) => ({
      ...current,
      questionText: suggestion.questionText || current.questionText,
      options: options.length > 0 ? options : current.options,
      correctAnswer: suggestion.correctAnswer || current.correctAnswer,
      explanation: suggestion.explanation || current.explanation,
    }));
  };

  const handleSuggestQuestionContent = async () => {
    if (!selectedWord) {
      toast.error('Hãy chọn từ vựng trước khi dùng AI');
      return;
    }

    setGeneratingDraft(true);
    try {
      const suggestion = await aiService.suggestQuestionContent({
        wordId: selectedWord.id,
        term: selectedWord.term,
        meaning: selectedWord.meaning,
        questionType: form.questionType,
        optionCount: Math.max(2, form.options.length || 4),
      });
      applyAiSuggestion(suggestion);
      toast.success('AI đã gợi ý câu hỏi');
    } catch (error) {
      console.error('Không thể tạo gợi ý câu hỏi', error);
      toast.error('Không thể tạo gợi ý AI');
    } finally {
      setGeneratingDraft(false);
    }
  };

  const buildPayload = () => {
    if (!selectedWord) throw new Error('Vui lòng chọn từ vựng trước');
    const questionText = form.questionText.trim();
    const correctAnswer = form.correctAnswer.trim();
    const options = form.options.map((option) => option.trim()).filter(Boolean);

    if (questionText.length < 5) throw new Error('Nội dung câu hỏi phải có ít nhất 5 ký tự');
    if (!correctAnswer) throw new Error('Vui lòng nhập đáp án đúng');
    if (form.questionType === 'MCQ' && options.length < 2) throw new Error('Câu trắc nghiệm cần ít nhất 2 lựa chọn');

    return {
      wordId: selectedWord.id,
      questionType: form.questionType,
      questionText,
      optionsJson: JSON.stringify(form.questionType === 'MCQ' ? options : []),
      correctAnswer,
      explanation: form.explanation.trim() || undefined,
      status: form.status,
    };
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = buildPayload();
      if (editingQuestion) {
        await creatorService.updateQuestion(editingQuestion.id, payload);
        toast.success('Cập nhật câu hỏi thành công');
      } else {
        await creatorService.createQuestion(payload);
        toast.success('Tạo câu hỏi thành công');
      }
      setShowForm(false);
      setEditingQuestion(null);
      setForm(emptyForm);
      await loadData();
    } catch (error) {
      console.error('Không thể lưu câu hỏi', error);
      toast.error(error instanceof Error ? error.message : 'Lỗi khi lưu câu hỏi');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (question: Question) => {
    if (!confirm('Xóa câu hỏi này?')) return;
    try {
      await creatorService.deleteQuestion(question.id);
      toast.success('Đã xóa câu hỏi');
      await loadData();
    } catch (error) {
      console.error('Không thể xóa câu hỏi', error);
      toast.error('Xóa câu hỏi thất bại');
    }
  };

  const handleSubmitReview = async (id: number) => {
    try {
      await creatorService.submitQuestionForReview(id);
      toast.success('Đã gửi duyệt');
      await loadData();
    } catch (error) {
      console.error('Không thể gửi duyệt câu hỏi', error);
      toast.error('Không thể gửi duyệt');
    }
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Câu hỏi</h1>
          <p className="text-slate-600 text-sm mt-1">Tạo và quản lý câu hỏi theo luồng creator</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={selectedWordId} onChange={(e) => setSelectedWordId(e.target.value ? Number(e.target.value) : '')} className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm">
            {words.map((word) => <option key={word.id} value={word.id}>{word.term}</option>)}
          </select>
          <Button onClick={openCreate} className="gap-2 rounded-xl"><Plus className="h-4 w-4" /> Tạo mới</Button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Câu hỏi</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Từ</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Loại</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Trạng thái</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-400">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuestions.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-slate-500">Chưa có câu hỏi nào</td></tr>
              ) : filteredQuestions.map((question) => (
                <tr key={question.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-medium max-w-[420px] truncate">{question.questionText}</td>
                  <td className="px-4 py-3 text-slate-500">{question.wordTerm || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{question.questionType}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[question.contentStatus] || ''}`}>{statusLabels[question.contentStatus] || question.contentStatus}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {(question.contentStatus === 'Draft' || question.contentStatus === 'Rejected') && (
                        <button onClick={() => handleSubmitReview(question.id)} title="Gửi duyệt" className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500"><Send className="h-4 w-4" /></button>
                      )}
                      <button onClick={() => openEdit(question)} title="Sửa" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500"><Pencil className="h-4 w-4" /></button>
                      {(question.contentStatus === 'Draft' || question.contentStatus === 'PendingReview') && (
                        <button onClick={() => handleDelete(question)} title="Xóa" className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 className="h-4 w-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-2xl space-y-4 shadow-2xl border border-slate-200 dark:border-white/10 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{editingQuestion ? 'Sửa câu hỏi' : 'Tạo câu hỏi mới'}</h2>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={handleSuggestQuestionContent} disabled={generatingDraft} className="rounded-xl gap-2">
                  {generatingDraft ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Gợi ý AI
                </Button>
                <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-slate-500" /></button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 block">
                <span className="text-xs font-semibold uppercase text-slate-500">Loại câu hỏi</span>
                <select value={form.questionType} onChange={(e) => setForm({ ...form, questionType: e.target.value as QuestionType })} className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm">
                  {questionTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <label className="space-y-1 block">
                <span className="text-xs font-semibold uppercase text-slate-500">Trạng thái</span>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as QuestionStatus })} className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm">
                  {Object.keys(statusLabels).map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
                </select>
              </label>
            </div>

            <label className="space-y-1 block">
              <span className="text-xs font-semibold uppercase text-slate-500">Nội dung câu hỏi *</span>
              <textarea value={form.questionText} onChange={(e) => setForm({ ...form, questionText: e.target.value })} rows={3} className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm" />
            </label>

            {form.questionType === 'MCQ' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase text-slate-500">Options</p>
                  <Button type="button" variant="outline" onClick={addOption} className="rounded-xl text-xs">Thêm option</Button>
                </div>
                <div className="space-y-2">
                  {form.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input value={option} onChange={(e) => updateOption(index, e.target.value)} placeholder={`Lựa chọn ${index + 1}`} />
                      {form.options.length > 2 && <Button type="button" variant="outline" onClick={() => removeOption(index)} className="rounded-xl px-3"><X className="h-4 w-4" /></Button>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 block">
                <span className="text-xs font-semibold uppercase text-slate-500">Đáp án đúng *</span>
                <Input value={form.correctAnswer} onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })} />
              </label>
              <label className="space-y-1 block">
                <span className="text-xs font-semibold uppercase text-slate-500">Giải thích</span>
                <Input value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">Hủy</Button>
              <Button onClick={handleSave} disabled={saving} className="rounded-xl gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} {editingQuestion ? 'Cập nhật' : 'Tạo'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

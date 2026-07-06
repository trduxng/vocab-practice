'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, Loader2, Pencil, Plus, Send, Sparkles, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

import { aiService } from '@/src/services/ai.service';
import { categoriesService } from '@/src/services/categories.service';
import { creatorService, type Topic, type Word } from '@/src/services/creator.service';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';

type PartOfSpeech = { id: number; name: string };

type WordForm = {
  term: string;
  meaning: string;
  phonetic: string;
  partOfSpeechId: string;
  topicIds: number[];
  status: 'Draft' | 'PendingReview' | 'Published' | 'Rejected' | 'Archived';
  examples: Array<{ sentence: string; meaning: string }>;
};

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

function createEmptyForm(): WordForm {
  return {
    term: '',
    meaning: '',
    phonetic: '',
    partOfSpeechId: '',
    topicIds: [],
    status: 'Draft',
    examples: [{ sentence: '', meaning: '' }],
  };
}

export default function CreatorWordsPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [partsOfSpeech, setPartsOfSpeech] = useState<PartOfSpeech[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [saving, setSaving] = useState(false);
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [form, setForm] = useState<WordForm>(createEmptyForm());

  const selectedPartOfSpeechName = useMemo(
    () => partsOfSpeech.find((part) => String(part.id) === form.partOfSpeechId)?.name,
    [form.partOfSpeechId, partsOfSpeech],
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [wordList, topicList, posList] = await Promise.all([
        creatorService.getWords(),
        creatorService.getTopics(),
        categoriesService.getPartOfSpeeches(),
      ]);
      setWords(wordList);
      setTopics(topicList);
      setPartsOfSpeech(posList);
    } catch (error) {
      console.error('Không thể tải dữ liệu từ vựng', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadData(); }, [loadData]);

  const openCreate = () => {
    setEditingWord(null);
    setForm(createEmptyForm());
    setShowForm(true);
  };

  const openEdit = (word: Word) => {
    setEditingWord(word);
    setForm({
      term: word.term,
      meaning: word.meaning,
      phonetic: word.phonetic || '',
      partOfSpeechId: String(word.partOfSpeechId || ''),
      topicIds: [],
      status: (word.contentStatus as WordForm['status']) || 'Draft',
      examples: [{ sentence: '', meaning: '' }],
    });
    setShowForm(true);
  };

  const applyAiSuggestion = (suggestion: Awaited<ReturnType<typeof aiService.suggestWordContent>>) => {
    const matchedPart = suggestion.partOfSpeech
      ? partsOfSpeech.find((part) => {
          const normalized = suggestion.partOfSpeech?.toLowerCase();
          const partName = part.name.toLowerCase();
          return partName === normalized || partName.includes(normalized || '') || (normalized || '').includes(partName);
        })
      : null;

    setForm((current) => ({
      ...current,
      term: current.term.trim() || suggestion.term,
      meaning: suggestion.meaning || current.meaning,
      phonetic: suggestion.phonetic || current.phonetic,
      partOfSpeechId: current.partOfSpeechId || (matchedPart ? String(matchedPart.id) : current.partOfSpeechId),
      examples: suggestion.examples.length > 0
        ? suggestion.examples.map((example) => ({ sentence: example.sentence, meaning: example.meaning || '' }))
        : current.examples,
    }));
  };

  const handleSuggestWordContent = async () => {
    const term = form.term.trim();
    if (!term) {
      toast.error('Nhập từ vựng trước khi dùng AI');
      return;
    }

    setGeneratingDraft(true);
    try {
      const suggestion = await aiService.suggestWordContent({
        term,
        meaning: form.meaning.trim() || undefined,
        partOfSpeech: selectedPartOfSpeechName,
        exampleCount: 3,
      });
      applyAiSuggestion(suggestion);
      toast.success('AI đã gợi ý nội dung cho từ vựng');
    } catch (error) {
      console.error('Không thể tạo gợi ý AI', error);
      toast.error('Không thể tạo gợi ý AI');
    } finally {
      setGeneratingDraft(false);
    }
  };

  const updateExample = (index: number, field: 'sentence' | 'meaning', value: string) => {
    setForm((current) => {
      const next = [...current.examples];
      next[index] = { ...next[index], [field]: value };
      return { ...current, examples: next };
    });
  };

  const addExample = () => setForm((current) => ({ ...current, examples: [...current.examples, { sentence: '', meaning: '' }] }));

  const removeExample = (index: number) => setForm((current) => ({ ...current, examples: current.examples.filter((_, i) => i !== index) }));

  const toggleTopic = (topicId: number) => {
    setForm((current) => {
      const exists = current.topicIds.includes(topicId);
      return {
        ...current,
        topicIds: exists ? current.topicIds.filter((id) => id !== topicId) : [...current.topicIds, topicId],
      };
    });
  };

  const handleSave = async () => {
    const term = form.term.trim();
    const meaning = form.meaning.trim();
    const partOfSpeechId = Number(form.partOfSpeechId);
    if (!term || !meaning) return toast.error('Từ vựng và nghĩa là bắt buộc');
    if (!partOfSpeechId) return toast.error('Vui lòng chọn loại từ');

    setSaving(true);
    try {
      const payload = {
        term,
        meaning,
        phonetic: form.phonetic.trim() || undefined,
        partOfSpeechId,
        status: form.status,
      };

      if (editingWord) {
        await creatorService.updateWord(editingWord.id, payload);
        toast.success('Cập nhật từ vựng thành công');
      } else {
        await creatorService.createWord({
          ...payload,
          topicIds: form.topicIds.length > 0 ? form.topicIds : undefined,
          examples: form.examples.map((example) => ({ sentence: example.sentence.trim(), meaning: example.meaning.trim() })).filter((example) => example.sentence),
        });
        toast.success('Tạo từ vựng thành công');
      }

      setShowForm(false);
      setForm(createEmptyForm());
      setEditingWord(null);
      await loadData();
    } catch (error) {
      console.error('Không thể lưu từ vựng', error);
      toast.error('Lỗi khi lưu từ vựng');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (word: Word) => {
    if (!confirm('Xóa/lưu trữ từ vựng này?')) return;
    try {
      await creatorService.deleteWord(word.id);
      toast.success('Đã lưu trữ từ vựng');
      await loadData();
    } catch (error) {
      console.error('Không thể lưu trữ từ vựng', error);
      toast.error('Lưu trữ từ vựng thất bại');
    }
  };

  const handleSubmitReview = async (id: number) => {
    try {
      await creatorService.submitWordForReview(id);
      toast.success('Đã gửi duyệt');
      await loadData();
    } catch (error) {
      console.error('Không thể gửi duyệt', error);
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
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Từ vựng</h1>
          <p className="text-slate-600 text-sm mt-1">Tạo và quản lý từ vựng theo luồng creator</p>
        </div>
        <Button onClick={openCreate} className="gap-2 rounded-xl"><Plus className="h-4 w-4" /> Tạo mới</Button>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Từ</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Nghĩa</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Loại từ</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Trạng thái</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-400">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {words.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-slate-500">Chưa có từ vựng nào</td></tr>
              ) : words.map((word) => (
                <tr key={word.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-medium">{word.term}</td>
                  <td className="px-4 py-3 text-slate-500">{word.meaning}</td>
                  <td className="px-4 py-3 text-slate-500">{word.partOfSpeechName || '—'}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[word.contentStatus] || ''}`}>{statusLabels[word.contentStatus] || word.contentStatus}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {(word.contentStatus === 'Draft' || word.contentStatus === 'Rejected') && (
                        <button onClick={() => handleSubmitReview(word.id)} title="Gửi duyệt" className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500"><Send className="h-4 w-4" /></button>
                      )}
                      <button onClick={() => openEdit(word)} title="Sửa" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500"><Pencil className="h-4 w-4" /></button>
                      {(word.contentStatus === 'Draft' || word.contentStatus === 'PendingReview') && (
                        <button onClick={() => handleDelete(word)} title="Xóa" className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 className="h-4 w-4" /></button>
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
              <h2 className="text-lg font-bold">{editingWord ? 'Sửa từ vựng' : 'Tạo từ vựng mới'}</h2>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={handleSuggestWordContent} disabled={generatingDraft} className="rounded-xl gap-2">
                  {generatingDraft ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Gợi ý AI
                </Button>
                <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-slate-500" /></button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase text-slate-500">Từ *</span>
                <Input value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })} onBlur={() => { void handleSuggestWordContent(); }} />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase text-slate-500">Loại từ *</span>
                <select value={form.partOfSpeechId} onChange={(e) => setForm({ ...form, partOfSpeechId: e.target.value })} className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm">
                  <option value="">-- Chọn loại từ --</option>
                  {partsOfSpeech.map((part) => <option key={part.id} value={part.id}>{part.name}</option>)}
                </select>
              </label>
            </div>

            <label className="space-y-1 block">
              <span className="text-xs font-semibold uppercase text-slate-500">Nghĩa *</span>
              <textarea value={form.meaning} onChange={(e) => setForm({ ...form, meaning: e.target.value })} rows={3} className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm" />
            </label>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 block">
                <span className="text-xs font-semibold uppercase text-slate-500">Phiên âm</span>
                <Input value={form.phonetic} onChange={(e) => setForm({ ...form, phonetic: e.target.value })} />
              </label>
              <label className="space-y-1 block">
                <span className="text-xs font-semibold uppercase text-slate-500">Trạng thái</span>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as WordForm['status'] })} className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm">
                  {Object.keys(statusLabels).map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
                </select>
              </label>
            </div>

            {!editingWord && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-slate-500">Gắn chủ đề</p>
                <div className="grid gap-2 md:grid-cols-2">
                  {topics.map((topic) => (
                    <label key={topic.id} className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 px-3 py-2 text-sm">
                      <input type="checkbox" checked={form.topicIds.includes(topic.id)} onChange={() => toggleTopic(topic.id)} />
                      <span>{topic.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {!editingWord && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase text-slate-500">Examples</p>
                  <Button type="button" variant="outline" onClick={addExample} className="rounded-xl text-xs">Thêm ví dụ</Button>
                </div>
                {form.examples.map((example, index) => (
                  <div key={index} className="grid gap-2 rounded-xl border border-slate-200 dark:border-white/10 p-3">
                    <textarea value={example.sentence} onChange={(e) => updateExample(index, 'sentence', e.target.value)} rows={2} placeholder="Example sentence" className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-sm" />
                    <textarea value={example.meaning} onChange={(e) => updateExample(index, 'meaning', e.target.value)} rows={2} placeholder="Nghĩa tiếng Việt" className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-sm" />
                    {form.examples.length > 1 && (
                      <button type="button" onClick={() => removeExample(index)} className="justify-self-end text-xs text-rose-500">Xóa ví dụ</button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">Hủy</Button>
              <Button onClick={handleSave} disabled={saving} className="rounded-xl gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} {editingWord ? 'Cập nhật' : 'Tạo'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

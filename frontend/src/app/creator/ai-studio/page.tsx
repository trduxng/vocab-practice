'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Loader2, Sparkles, FileQuestion, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';

import { aiService } from '@/src/services/ai.service';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';

type TabKey = 'topic' | 'question' | 'miniTest';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
      {children}
    </label>
  );
}

export default function CreatorAiStudioPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>('topic');
  const [loading, setLoading] = useState(false);

  const [topicForm, setTopicForm] = useState({ learningGoal: '', targetWordCount: 15 });
  const [questionForm, setQuestionForm] = useState({ learningGoal: '', targetWordCount: 10, questionType: 'MCQ' });
  const [miniTestForm, setMiniTestForm] = useState({ learningGoal: '', targetWordCount: 10, titleHint: '' });

  const createVocabularyDraft = async (learningGoal: string, targetWordCount: number) => {
    const result = await aiService.suggestTopicContent({
      topicName: learningGoal,
      description: learningGoal,
      targetWordCount,
    });
    const suggestedWords = result.suggestedWords || [];
    if (suggestedWords.length !== targetWordCount) {
      throw new Error(`AI sinh ${suggestedWords.length}/${targetWordCount} từ. Vui lòng thử lại.`);
    }

    window.localStorage.setItem('creator.topicDraft', JSON.stringify({
      topicName: result.topicName || learningGoal,
      topicCode: result.topicCode || '',
      description: result.description || learningGoal,
      suggestedWords,
    }));
    router.push('/creator/topics?draft=1');
  };

  const runTopic = async () => {
    const learningGoal = topicForm.learningGoal.trim();
    if (!learningGoal) return toast.error('Nhập nội dung muốn học');
    setLoading(true);
    try {
      await createVocabularyDraft(learningGoal, topicForm.targetWordCount);
      toast.success(`Đã sinh ${topicForm.targetWordCount} từ vựng`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Không thể sinh nháp');
    } finally {
      setLoading(false);
    }
  };

  const runQuestion = async () => {
    const learningGoal = questionForm.learningGoal.trim();
    if (!learningGoal) return toast.error('Nhập nội dung muốn học');
    setLoading(true);
    try {
      await createVocabularyDraft(`${learningGoal} - ${questionForm.questionType}`, questionForm.targetWordCount);
      toast.success(`Đã sinh ${questionForm.targetWordCount} từ vựng để tạo câu hỏi`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Không thể sinh nháp');
    } finally {
      setLoading(false);
    }
  };

  const runMiniTest = async () => {
    const learningGoal = miniTestForm.learningGoal.trim();
    if (!learningGoal) return toast.error('Nhập nội dung muốn học');
    setLoading(true);
    try {
      await createVocabularyDraft(miniTestForm.titleHint || learningGoal, miniTestForm.targetWordCount);
      toast.success(`Đã sinh ${miniTestForm.targetWordCount} từ vựng cho mini test`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Không thể sinh nháp');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 dark:border-white/10 dark:text-slate-300">
              <Brain className="h-3.5 w-3.5" /> AI Studio
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">Sinh nháp nội dung bằng AI</h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Tạo draft cho topics, questions, mini tests rồi chỉnh sửa trước khi gửi duyệt.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setTab('topic')} className={`rounded-xl px-4 py-2 text-sm font-medium ${tab === 'topic' ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-300'}`}>
              <Sparkles className="mr-2 inline-block h-4 w-4" /> Topics
            </button>
            {/* <button onClick={() => setTab('question')} className={`rounded-xl px-4 py-2 text-sm font-medium ${tab === 'question' ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-300'}`}>
              <FileQuestion className="mr-2 inline-block h-4 w-4" /> Questions
            </button>
            <button onClick={() => setTab('miniTest')} className={`rounded-xl px-4 py-2 text-sm font-medium ${tab === 'miniTest' ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-300'}`}>
              <ClipboardList className="mr-2 inline-block h-4 w-4" /> Mini Test
            </button> */}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-950">
          {tab === 'topic' && (
            <div className="space-y-4">
              <Field label="Nội dung muốn học">
                <textarea value={topicForm.learningGoal} onChange={(e) => setTopicForm((prev) => ({ ...prev, learningGoal: e.target.value }))} rows={4} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-400 dark:border-white/10 dark:bg-slate-950 dark:text-white" placeholder="Ví dụ: từ vựng về ô tô, bộ phận xe, lái xe và giao thông" />
              </Field>
              <Field label="Số lượng từ cần sinh">
                <Input type="number" min={5} max={50} value={topicForm.targetWordCount} onChange={(e) => setTopicForm((prev) => ({ ...prev, targetWordCount: Number(e.target.value) || 15 }))} />
              </Field>
              <Button onClick={runTopic} disabled={loading} className="rounded-xl gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Sinh từ vựng Topic
              </Button>
            </div>
          )}

          {tab === 'question' && (
            <div className="space-y-4">
              <Field label="Nội dung muốn học để tạo câu hỏi">
                <textarea value={questionForm.learningGoal} onChange={(e) => setQuestionForm((prev) => ({ ...prev, learningGoal: e.target.value }))} rows={4} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-400 dark:border-white/10 dark:bg-slate-950 dark:text-white" placeholder="Ví dụ: câu hỏi TOEIC về meeting, schedule, report" />
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Loại câu hỏi">
                  <Input value={questionForm.questionType} onChange={(e) => setQuestionForm((prev) => ({ ...prev, questionType: e.target.value }))} placeholder="MCQ" />
                </Field>
                <Field label="Số lượng từ cần sinh">
                  <Input type="number" min={5} max={50} value={questionForm.targetWordCount} onChange={(e) => setQuestionForm((prev) => ({ ...prev, targetWordCount: Number(e.target.value) || 10 }))} />
                </Field>
              </div>
              <Button onClick={runQuestion} disabled={loading} className="rounded-xl gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileQuestion className="h-4 w-4" />} Sinh từ vựng Question
              </Button>
            </div>
          )}

          {tab === 'miniTest' && (
            <div className="space-y-4">
              <Field label="Nội dung muốn học trong mini test">
                <textarea value={miniTestForm.learningGoal} onChange={(e) => setMiniTestForm((prev) => ({ ...prev, learningGoal: e.target.value }))} rows={4} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-400 dark:border-white/10 dark:bg-slate-950 dark:text-white" placeholder="Ví dụ: mini test về airport, hotel, travel conversation" />
              </Field>
              <Field label="Title hint (optional)">
                <Input value={miniTestForm.titleHint} onChange={(e) => setMiniTestForm((prev) => ({ ...prev, titleHint: e.target.value }))} placeholder="Mini Test - Business English" />
              </Field>
              <Field label="Số lượng từ cần sinh">
                <Input type="number" min={5} max={50} value={miniTestForm.targetWordCount} onChange={(e) => setMiniTestForm((prev) => ({ ...prev, targetWordCount: Number(e.target.value) || 10 }))} />
              </Field>
              <Button onClick={runMiniTest} disabled={loading} className="rounded-xl gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardList className="h-4 w-4" />} Sinh từ vựng Mini Test
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

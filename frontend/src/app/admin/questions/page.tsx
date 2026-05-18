'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { adminService, type PaginationMeta } from '@/src/services/admin.service';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/card';
import { Textarea } from '@/src/components/ui/textarea';
import { HelpCircle, Plus, Search, BookOpen, Trash2, ListChecks, Upload } from 'lucide-react';
import Topbar from '@/src/components/shared/Topbar';
import { toast } from 'sonner';

type WordItem = {
  id: number;
  term: string;
  meaning: string;
  partOfSpeechName?: string;
};

type QuestionItem = {
  id: number;
  questionType: string;
  questionText: string;
  optionsJson?: string;
  correctAnswer: string;
  explanation?: string;
};

type BulkImportResult = {
  success: number;
  failed: number;
};

export default function AdminQuestionsPage() {
  const [words, setWords] = useState<WordItem[]>([]);
  const [existingQuestions, setExistingQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWord, setSelectedWord] = useState<WordItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkResult, setBulkResult] = useState<BulkImportResult | null>(null);
  const [wordQuery, setWordQuery] = useState('');
  const [wordPage, setWordPage] = useState(1);
  const [wordPagination, setWordPagination] = useState<PaginationMeta | null>(null);
  const [questionsPage, setQuestionsPage] = useState(1);
  const [questionsPagination, setQuestionsPagination] = useState<PaginationMeta | null>(null);

  // New Question Form State
  const [newQuestion, setNewQuestion] = useState({
    questionType: 'MCQ',
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: ''
  });

  const fetchWords = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getWordsPage<WordItem>(wordPage, 20, { search: wordQuery.trim() });
      setWords(data.items);
      setWordPagination(data.pagination);
    } catch (error) {
      console.error("Failed to fetch words", error);
    } finally {
      setLoading(false);
    }
  }, [wordPage, wordQuery]);

  const fetchExistingQuestions = useCallback(async () => {
    if (!selectedWord) return;

    try {
      const data = await adminService.getQuestionsByWordPage<QuestionItem>(selectedWord.id, questionsPage, 10);
      setExistingQuestions(data.items);
      setQuestionsPagination(data.pagination);
    } catch (error) {
      console.error("Failed to fetch existing questions", error);
    }
  }, [questionsPage, selectedWord]);

  useEffect(() => {
    void Promise.resolve().then(fetchWords);
  }, [fetchWords]);

  useEffect(() => {
    if (selectedWord) {
      void Promise.resolve().then(fetchExistingQuestions);
    }
  }, [fetchExistingQuestions, selectedWord]);

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWord) return;

    try {
      await adminService.createQuestion({
        wordId: selectedWord.id,
        questionType: newQuestion.questionType,
        questionText: newQuestion.questionText,
        optionsJson: JSON.stringify(newQuestion.options),
        correctAnswer: newQuestion.correctAnswer,
        explanation: newQuestion.explanation
      });
      setShowAddForm(false);
      setNewQuestion({
        questionType: 'MCQ',
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: ''
      });
      fetchExistingQuestions();
      alert("Tạo câu hỏi thành công!");
    } catch (error) {
      console.error("Failed to create question", error);
      alert("Lỗi khi tạo câu hỏi");
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm("Xoa cau hoi nay? Cau hoi se bi go khoi cac mini test lien quan.")) return;

    try {
      await adminService.deleteQuestion(questionId);
      toast.success("Xoa cau hoi thanh cong");
      fetchExistingQuestions();
    } catch (error) {
      console.error("Failed to delete question", error);
      toast.error("Xoa cau hoi that bai");
    }
  };

  const handleBulkImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setBulkImporting(true);
    setBulkResult(null);
    try {
      const csv = await file.text();
      const result = await adminService.bulkImportQuestions(csv);
      setBulkResult(result);
      if (selectedWord) fetchExistingQuestions();
    } catch (error) {
      console.error("Failed to bulk import questions", error);
      alert("Bulk import failed");
    } finally {
      setBulkImporting(false);
      event.target.value = "";
    }
  };

  if (loading && words.length === 0) {
    return <div className="p-10 text-white bg-[#080d1a] min-h-screen">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="flex-1 flex flex-col bg-[#080d1a]">
      <Topbar title="Quản lý câu hỏi" role="admin" />
      
      <main className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-auto">
        {/* Left: Word List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={18} className="text-blue-400" />
            <h2 className="text-white font-bold text-sm uppercase tracking-widest">Chọn từ vựng</h2>
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <Input
              value={wordQuery}
              onChange={(event) => {
                setWordQuery(event.target.value);
                setWordPage(1);
              }}
              className="pl-9 bg-white/5 border-white/10 text-xs text-white rounded-xl"
              placeholder="Tìm từ..."
            />
          </div>
          <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 no-scrollbar">
            {words.map((w) => (
              <div 
                key={w.id} 
                onClick={() => { setSelectedWord(w); setQuestionsPage(1); setShowAddForm(false); }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedWord?.id === w.id ? 'bg-blue-600/20 border-blue-500/50 text-white' : 'bg-white/3 border-white/5 text-slate-400 hover:bg-white/5'}`}
              >
                <div className="font-bold text-sm">{w.term}</div>
                <div className="text-[10px] opacity-60 mt-1">{w.meaning}</div>
              </div>
            ))}
          </div>
          {wordPagination && (
            <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
              <Button type="button" variant="ghost" disabled={wordPage <= 1 || loading} onClick={() => setWordPage((current) => Math.max(1, current - 1))}>
                Truoc
              </Button>
              <span>Trang {wordPagination.page}/{wordPagination.totalPages}</span>
              <Button type="button" variant="ghost" disabled={wordPage >= wordPagination.totalPages || loading} onClick={() => setWordPage((current) => Math.min(wordPagination.totalPages, current + 1))}>
                Sau
              </Button>
            </div>
          )}
        </div>

        {/* Right: Question Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white/3 border-white/8 text-white rounded-3xl">
            <CardContent className="p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest">Bulk import CSV</h3>
                <p className="mt-1 text-xs text-slate-500">Columns: wordId, questionType, questionText, correctAnswer, optionsJson, explanation.</p>
                {bulkResult && (
                  <p className="mt-2 text-xs text-blue-300">
                    Inserted {bulkResult.success}, failed {bulkResult.failed}
                  </p>
                )}
              </div>
              <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-blue-700">
                <Upload size={14} />
                {bulkImporting ? "Importing..." : "Upload CSV"}
                <input type="file" accept=".csv,text/csv,text/plain" className="hidden" disabled={bulkImporting} onChange={handleBulkImport} />
              </label>
            </CardContent>
          </Card>

          {selectedWord ? (
            <>
              <div className="flex justify-between items-center bg-white/3 p-6 rounded-3xl border border-white/8 shadow-xl shadow-black/20">
                <div>
                  <h3 className="text-white font-black text-2xl tracking-tighter">{selectedWord.term}</h3>
                  <p className="text-slate-500 text-sm font-medium">{selectedWord.partOfSpeechName} · {selectedWord.meaning}</p>
                </div>
                {!showAddForm && (
                  <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700 font-bold uppercase text-[10px] tracking-widest px-6 rounded-xl gap-2">
                    <Plus size={14} /> Thêm câu hỏi
                  </Button>
                )}
              </div>

              {showAddForm && (
                <Card className="bg-white/5 border-white/10 text-white rounded-[32px] overflow-hidden border-blue-500/30">
                  <CardHeader className="bg-blue-600/10 border-b border-white/5">
                    <CardTitle className="text-sm uppercase tracking-widest font-black text-blue-400">Thiết kế câu hỏi mới</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <form onSubmit={handleAddQuestion} className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Loại câu hỏi</label>
                          <select 
                            className="w-full h-11 bg-white/5 border border-white/10 px-4 text-sm text-white outline-none rounded-xl focus:border-blue-500/50 transition-all"
                            value={newQuestion.questionType}
                            onChange={e => setNewQuestion({...newQuestion, questionType: e.target.value})}
                          >
                            <option value="MCQ">Trắc nghiệm (MCQ)</option>
                            <option value="FillBlank">Điền vào chỗ trống</option>
                            <option value="Dictation">Chính tả</option>
                            <option value="DragDrop">Drag-drop</option>
                            <option value="AudioRecognition">Audio recognition</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Đáp án chính xác</label>
                          <Input 
                            value={newQuestion.correctAnswer}
                            onChange={e => setNewQuestion({...newQuestion, correctAnswer: e.target.value})}
                            className="bg-white/5 border-white/10 h-11 px-4 rounded-xl" 
                            placeholder="VD: Ambiguous"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Nội dung câu hỏi</label>
                        <Textarea 
                          value={newQuestion.questionText}
                          onChange={e => setNewQuestion({...newQuestion, questionText: e.target.value})}
                          placeholder="VD: What is the correct translation of this word?"
                          className="bg-white/5 border-white/10 min-h-[100px] p-4 rounded-xl text-lg font-medium"
                          required
                        />
                      </div>

                      {newQuestion.questionType === 'MCQ' && (
                        <div className="space-y-4 pt-4">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <ListChecks size={14} className="text-blue-400" /> Các phương án lựa chọn
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {newQuestion.options.map((opt, idx) => (
                              <div key={idx} className="flex items-center gap-3">
                                <span className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg font-black text-[10px] text-slate-500">{String.fromCharCode(65 + idx)}</span>
                                <Input 
                                  value={opt}
                                  onChange={e => {
                                    const opts = [...newQuestion.options];
                                    opts[idx] = e.target.value;
                                    setNewQuestion({...newQuestion, options: opts});
                                  }}
                                  className="bg-white/5 border-white/10 text-sm h-11 px-4 rounded-xl flex-1" 
                                  placeholder={`Lựa chọn ${idx + 1}`}
                                  required
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Giải thích bổ sung</label>
                        <Input 
                          value={newQuestion.explanation}
                          onChange={e => setNewQuestion({...newQuestion, explanation: e.target.value})}
                          className="bg-white/5 border-white/10 h-11 px-4 rounded-xl" 
                          placeholder="VD: Word refers to something unclear..."
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-6">
                        <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)} className="px-8 h-11 rounded-xl text-slate-400">Hủy bỏ</Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-10 h-11 rounded-xl font-bold">Lưu câu hỏi</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* List existing questions */}
              <div className="space-y-4">
                 <h4 className="text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                    <ListChecks size={16} className="text-blue-400" /> Câu hỏi hiện có ({questionsPagination?.total ?? existingQuestions.length})
                 </h4>
                 <div className="grid grid-cols-1 gap-3">
                    {existingQuestions.map((q) => (
                      <div key={q.id} className="p-5 bg-white/3 border border-white/5 rounded-2xl group hover:border-white/10 transition-all">
                        <div className="flex justify-between items-start mb-3">
                           <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">{q.questionType}</span>
                           <button onClick={() => handleDeleteQuestion(q.id)} className="text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                        </div>
                        <p className="text-white text-sm font-semibold mb-2">{q.questionText}</p>
                        <p className="text-[10px] text-green-400 font-bold uppercase tracking-tighter">Đáp án: {q.correctAnswer}</p>
                      </div>
                    ))}
                    {existingQuestions.length === 0 && !showAddForm && (
                      <div className="py-20 text-center text-slate-700 border border-dashed border-white/5 rounded-[32px]">
                         <HelpCircle size={40} className="mx-auto mb-3 opacity-10" />
                         <p className="text-sm">Chưa có câu hỏi nào cho từ này.</p>
                      </div>
                    )}
                    {questionsPagination && questionsPagination.total > 0 && (
                      <div className="flex items-center justify-between gap-2 pt-2 text-xs text-slate-500">
                        <Button type="button" variant="ghost" disabled={questionsPage <= 1} onClick={() => setQuestionsPage((current) => Math.max(1, current - 1))}>
                          Truoc
                        </Button>
                        <span>Trang {questionsPagination.page}/{questionsPagination.totalPages}</span>
                        <Button type="button" variant="ghost" disabled={questionsPage >= questionsPagination.totalPages} onClick={() => setQuestionsPage((current) => Math.min(questionsPagination.totalPages, current + 1))}>
                          Sau
                        </Button>
                      </div>
                    )}
                 </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-4 border border-dashed border-white/8 rounded-[40px] bg-white/[0.01]">
              <HelpCircle size={64} className="opacity-10" />
              <div className="text-center">
                 <p className="font-black uppercase tracking-tighter text-lg mb-1">Hệ thống câu hỏi</p>
                 <p className="text-xs text-slate-500 max-w-[200px]">Vui lòng chọn một từ vựng bên trái để bắt đầu quản lý nội dung.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { adminService } from '@/src/services/admin.service';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/card';
import { Textarea } from '@/src/components/ui/textarea';
import { HelpCircle, Plus, Search, BookOpen } from 'lucide-react';
import Topbar from '@/src/components/shared/Topbar';

export default function AdminQuestionsPage() {
  const [words, setWords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Question Form State
  const [newQuestion, setNewQuestion] = useState({
    questionType: 'MCQ',
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: ''
  });

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    setLoading(true);
    try {
      const data = await adminService.getWords(1, 100);
      setWords(data);
    } catch (error) {
      console.error("Failed to fetch words", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
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
      alert("Tạo câu hỏi thành công!");
    } catch (error) {
      console.error("Failed to create question", error);
      alert("Lỗi khi tạo câu hỏi");
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
            <h2 className="text-white font-bold">Chọn từ vựng</h2>
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <Input className="pl-9 bg-white/5 border-white/10 text-xs text-white" placeholder="Tìm từ..." />
          </div>
          <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 no-scrollbar">
            {words.map((w) => (
              <div 
                key={w.id} 
                onClick={() => { setSelectedWord(w); setShowAddForm(false); }}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedWord?.id === w.id ? 'bg-blue-600/20 border-blue-500/50 text-white' : 'bg-white/3 border-white/5 text-slate-400 hover:bg-white/5'}`}
              >
                <div className="font-bold text-sm">{w.term}</div>
                <div className="text-[10px] opacity-60">{w.meaning}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Question Area */}
        <div className="lg:col-span-2 space-y-6">
          {selectedWord ? (
            <>
              <div className="flex justify-between items-center bg-white/3 p-4 rounded-2xl border border-white/8">
                <div>
                  <h3 className="text-white font-bold text-xl">{selectedWord.term}</h3>
                  <p className="text-slate-500 text-sm">{selectedWord.partOfSpeechName} · {selectedWord.meaning}</p>
                </div>
                {!showAddForm && (
                  <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700 gap-2">
                    <Plus size={16} /> Thêm câu hỏi
                  </Button>
                )}
              </div>

              {showAddForm && (
                <Card className="bg-white/5 border-white/10 text-white">
                  <CardHeader>
                    <CardTitle className="text-lg">Câu hỏi mới cho "{selectedWord.term}"</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddQuestion} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-xs text-slate-400">Loại câu hỏi</label>
                        <select 
                          className="w-full h-9 bg-white/5 border border-white/10 px-3 text-sm text-white outline-none rounded-lg"
                          value={newQuestion.questionType}
                          onChange={e => setNewQuestion({...newQuestion, questionType: e.target.value})}
                        >
                          <option value="MCQ">Trắc nghiệm (MCQ)</option>
                          <option value="FillBlank">Điền vào chỗ trống</option>
                          <option value="Dictation">Chính tả</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-slate-400">Nội dung câu hỏi</label>
                        <Textarea 
                          value={newQuestion.questionText}
                          onChange={e => setNewQuestion({...newQuestion, questionText: e.target.value})}
                          placeholder="VD: What is the meaning of this word?"
                          className="bg-white/5 border-white/10 min-h-[80px]"
                          required
                        />
                      </div>

                      {newQuestion.questionType === 'MCQ' && (
                        <div className="space-y-3">
                          <label className="text-xs text-slate-400">Các lựa chọn</label>
                          <div className="grid grid-cols-2 gap-3">
                            {newQuestion.options.map((opt, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="text-slate-500 font-bold text-xs">{String.fromCharCode(65 + idx)}.</span>
                                <Input 
                                  value={opt}
                                  onChange={e => {
                                    const opts = [...newQuestion.options];
                                    opts[idx] = e.target.value;
                                    setNewQuestion({...newQuestion, options: opts});
                                  }}
                                  className="bg-white/5 border-white/10 text-xs" 
                                  placeholder={`Lựa chọn ${idx + 1}`}
                                  required
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400">Đáp án đúng</label>
                          <Input 
                            value={newQuestion.correctAnswer}
                            onChange={e => setNewQuestion({...newQuestion, correctAnswer: e.target.value})}
                            className="bg-white/5 border-white/10" 
                            placeholder="Nhập chính xác đáp án"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400">Giải thích (nếu có)</label>
                          <Input 
                            value={newQuestion.explanation}
                            onChange={e => setNewQuestion({...newQuestion, explanation: e.target.value})}
                            className="bg-white/5 border-white/10" 
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)}>Hủy</Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Lưu câu hỏi</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Placeholder for existing questions list */}
              <div className="py-10 text-center text-slate-600 border border-dashed border-white/10 rounded-2xl">
                <HelpCircle size={32} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">Danh sách câu hỏi đã tạo sẽ hiện ở đây.</p>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-3 border border-dashed border-white/10 rounded-3xl">
              <HelpCircle size={48} className="opacity-10" />
              <p>Chọn một từ vựng bên trái để quản lý câu hỏi</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

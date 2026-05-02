"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { userService } from "@/src/services/user.service";
import { useAuth } from "@/src/app/context/AuthContext";
import { Button } from "@/src/components/ui/button";
import { ArrowLeft, Clock, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

const QUESTION_TIME = 15;

const UserPractice = () => {
  const { user, loading: authLoading } = useAuth();
  const [questions, setQuestions] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [loading, setLoading] = useState(true);
  const [wrongList, setWrongList] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await userService.getDueFlashcards();
        // Xáo trộn danh sách câu hỏi
        setQuestions(data.sort(() => Math.random() - 0.5));
      } catch (error) {
        console.error("Failed to fetch questions", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchQuestions();
    }
  }, [user]);

  const current = questions[index];

  // Parse options from JSON string in DB
  const options = useMemo(() => {
    if (!current?.optionsJson) return [];
    try {
      const parsed = JSON.parse(current.optionsJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }, [current]);

  const isCorrect = selected === current?.meaning;

  // Timer logic
  useEffect(() => {
    if (checked || !current) return;

    if (timeLeft <= 0) {
      handleCheck(true); // Auto-fail on timeout
      return;
    }

    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, checked, current]);

  const handleCheck = async (isTimeout = false) => {
    if (!current || checked) return;

    const correct = !isTimeout && selected === current.meaning;
    
    try {
      // Submit to backend
      await userService.submitAnswer({
        questionId: current.questionId,
        wordId: current.wordId,
        submittedAnswer: isTimeout ? "TIMEOUT" : (selected || "NONE"),
        isCorrect: correct,
        scoreAwarded: correct ? 1.0 : 0.0
      });

      if (correct) {
        setScore(s => s + 1);
      } else {
        setWrongList(prev => [...prev, current]);
      }
      
      setChecked(true);
    } catch (error) {
      console.error("Failed to submit answer", error);
    }
  };

  const next = () => {
    if (index < questions.length - 1) {
      setIndex(prev => prev + 1);
      setSelected(null);
      setChecked(false);
      setTimeLeft(QUESTION_TIME);
    } else {
      setIndex(questions.length); // Trigger end screen
    }
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] text-white">Đang tải câu hỏi...</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0f1e] text-white p-6 text-center">
        <CheckCircle2 size={64} className="text-green-500 mb-6 opacity-20" />
        <h2 className="text-2xl font-bold mb-2">Không có câu hỏi</h2>
        <p className="text-slate-400 mb-8">Hôm nay bạn đã hoàn thành hết mục tiêu luyện tập!</p>
        <Button onClick={() => router.push('/user/dashboard')} className="bg-blue-600">Quay về Dashboard</Button>
      </div>
    );
  }

  // END SCREEN
  if (index >= questions.length) {
    const accuracy = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] text-white px-4">
        <Card className="w-full max-w-md bg-white/5 border-white/10 p-8 text-center">
          <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
            <RefreshCw size={40} className="text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Kết quả</h1>
          <div className="flex justify-center gap-8 my-6">
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Điểm số</p>
              <p className="text-2xl font-black">{score}/{questions.length}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Chính xác</p>
              <p className="text-2xl font-black text-green-400">{accuracy}%</p>
            </div>
          </div>

          {wrongList.length > 0 && (
            <div className="text-left mb-8 max-h-40 overflow-y-auto pr-2 no-scrollbar bg-black/20 rounded-xl p-4 border border-white/5">
              <p className="text-xs font-bold text-red-400 uppercase mb-2">Từ cần lưu ý:</p>
              {wrongList.map((w, i) => (
                <div key={i} className="text-sm py-1 border-b border-white/5 last:border-0 flex justify-between">
                  <span className="font-semibold">{w.term}</span>
                  <span className="text-slate-500">{w.meaning}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => window.location.reload()} className="flex-1 border-white/10 text-white">Làm lại</Button>
            <Button onClick={() => router.push('/user/dashboard')} className="flex-1 bg-blue-600">Hoàn thành</Button>
          </div>
        </Card>
      </div>
    );
  }

  const progress = ((index + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] px-4 py-10 relative">
      <button 
        onClick={() => router.push('/user/dashboard')}
        className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors flex items-center gap-2"
      >
        <ArrowLeft size={18} /> Thoát
      </button>

      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1 mr-4">
            <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-tighter mb-2">
              <span>Tiến độ</span>
              <span>{index + 1} / {questions.length}</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${timeLeft < 5 ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-white/5 border-white/10 text-slate-400'}`}>
            <Clock size={14} />
            <span className="font-mono font-bold text-sm">{timeLeft}s</span>
          </div>
        </div>

        <Card className="bg-white/5 border-white/10 p-10 mb-8 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
           <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Câu hỏi</p>
           <h1 className="text-4xl text-white font-bold mb-2">
            {current.term}
           </h1>
           <p className="text-slate-400 italic">Chọn nghĩa đúng của từ trên</p>
        </Card>

        <div className="grid gap-3">
          {options.map((opt: string, i: number) => {
            const isSelected = selected === opt;
            const isAnswer = opt === current.meaning;

            return (
              <button
                key={i}
                disabled={checked}
                onClick={() => setSelected(opt)}
                className={`group relative p-5 rounded-2xl border text-left transition-all
                  ${
                    checked
                      ? isAnswer
                        ? "bg-green-500/20 border-green-500/50 text-white"
                        : isSelected
                          ? "bg-red-500/20 border-red-500/50 text-white"
                          : "bg-white/2 border-white/5 text-slate-600"
                      : isSelected
                        ? "bg-blue-600/20 border-blue-500 text-white scale-[1.02] shadow-xl shadow-blue-900/20"
                        : "bg-white/3 border-white/5 text-slate-400 hover:bg-white/5 hover:border-white/10"
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{opt}</span>
                  {checked && isAnswer && <CheckCircle2 size={18} className="text-green-400" />}
                  {checked && isSelected && !isAnswer && <XCircle size={18} className="text-red-400" />}
                </div>
              </button>
            );
          })}
        </div>

        {!checked ? (
          <Button
            disabled={!selected}
            onClick={() => handleCheck()}
            className="mt-10 w-full py-7 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-lg font-bold shadow-lg shadow-blue-600/20 transition-all disabled:opacity-30 disabled:grayscale"
          >
            Kiểm tra đáp án
          </Button>
        ) : (
          <Button
            onClick={next}
            className="mt-10 w-full py-7 bg-white text-slate-900 hover:bg-slate-200 rounded-2xl text-lg font-bold transition-all animate-in slide-in-from-bottom-2"
          >
            {index < questions.length - 1 ? "Câu tiếp theo" : "Xem kết quả"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default UserPractice;

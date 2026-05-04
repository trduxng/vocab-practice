"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { userService } from "@/src/services/user.service";
import { useAuth } from "@/src/app/context/AuthContext";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card } from "@/src/components/ui/card";
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

  const options = useMemo(() => {
    if (!current?.optionsJson || current.questionType !== 'MCQ') return [];
    try {
      const parsed = JSON.parse(current.optionsJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }, [current]);

  const isCorrect = current?.questionType === 'MCQ' 
    ? selected === current?.meaning 
    : selected?.toLowerCase().trim() === current?.term?.toLowerCase().trim();

  const handleCheck = async (isTimeout = false) => {
    if (!current || checked) return;
    const correct = !isTimeout && isCorrect;
    
    try {
      await userService.submitAnswer({
        questionId: current.questionId,
        wordId: current.wordId,
        submittedAnswer: isTimeout ? "TIMEOUT" : (selected || "NONE"),
        isCorrect: correct,
        scoreAwarded: correct ? 1.0 : 0.0
      });

      if (correct) setScore(s => s + 1);
      else setWrongList(prev => [...prev, current]);
      
      setChecked(true);
    } catch (error) {
      console.error("Failed to submit answer", error);
    }
  };

  useEffect(() => {
    if (checked || !current) return;
    if (timeLeft <= 0) {
      handleCheck(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, checked, current]);

  const next = () => {
    if (index < questions.length - 1) {
      setIndex(prev => prev + 1);
      setSelected(null);
      setChecked(false);
      setTimeLeft(QUESTION_TIME);
    } else {
      setIndex(questions.length);
    }
  };

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] text-white">Đang tải câu hỏi...</div>;
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

  if (index >= questions.length) {
    const accuracy = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] text-white px-4">
        <Card className="w-full max-w-md bg-white/5 border-white/10 p-8 text-center rounded-[40px]">
          <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
            <RefreshCw size={40} className="text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-white">Hoàn thành!</h1>
          <div className="flex justify-center gap-8 my-8">
            <div>
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Điểm số</p>
              <p className="text-2xl font-black text-white">{score}/{questions.length}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Chính xác</p>
              <p className="text-2xl font-black text-green-400">{accuracy}%</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => window.location.reload()} className="flex-1 border-white/10 text-white h-12 rounded-xl">Làm lại</Button>
            <Button onClick={() => router.push('/user/dashboard')} className="flex-1 bg-blue-600 h-12 rounded-xl font-bold uppercase text-[10px] tracking-widest">Xong</Button>
          </div>
        </Card>
      </div>
    );
  }

  const progress = ((index + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] px-4 py-10 relative">
      <button onClick={() => router.push('/user/dashboard')} className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
        <ArrowLeft size={16} /> Thoát
      </button>

      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex-1 mr-6">
            <div className="flex justify-between text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">
              <span>Tiến trình</span>
              <span>{index + 1} / {questions.length}</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-linear-to-r from-blue-600 to-cyan-400 transition-all duration-500 shadow-glow" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${timeLeft < 5 ? 'bg-red-500/10 border-red-500/30 text-red-500 animate-pulse' : 'bg-white/5 border-white/5 text-slate-400'}`}>
            <Clock size={16} />
            <span className="font-mono font-black text-lg">{timeLeft}s</span>
          </div>
        </div>

        <Card className="bg-white/5 border-white/10 p-12 mb-8 relative overflow-hidden rounded-[40px] shadow-2xl">
           <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 shadow-glow" />
           <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
             {current.questionType === 'MCQ' ? 'Multiple Choice' : 'Fill In The Blank'}
           </p>
           <h1 className="text-5xl text-white font-black mb-4 tracking-tighter">
            {current.questionType === 'MCQ' ? current.term : current.meaning}
           </h1>
           <p className="text-slate-500 text-sm font-medium italic">
             {current.questionType === 'MCQ' ? 'Tìm định nghĩa chính xác cho từ vựng này' : 'Gõ từ tiếng Anh tương ứng với nghĩa trên'}
           </p>
        </Card>

        {current.questionType === 'MCQ' ? (
          <div className="grid gap-3">
            {options.map((opt: string, i: number) => {
              const isSelected = selected === opt;
              const isAnswer = opt === current.meaning;
              return (
                <button key={i} disabled={checked} onClick={() => setSelected(opt)} className={`group relative p-6 rounded-3xl border-2 text-left transition-all ${checked ? (isAnswer ? "bg-green-500/10 border-green-500/40 text-white" : (isSelected ? "bg-red-500/10 border-red-500/40 text-white" : "bg-white/2 border-white/5 text-slate-700")) : (isSelected ? "bg-blue-600 border-blue-500 text-white scale-[1.02] shadow-2xl shadow-blue-900/40" : "bg-white/3 border-white/5 text-slate-400 hover:bg-white/5 hover:border-white/10")}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg">{opt}</span>
                    {checked && isAnswer && <CheckCircle2 size={24} className="text-green-400" />}
                    {checked && isSelected && !isAnswer && <XCircle size={24} className="text-red-400" />}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-6">
             <Input 
                value={selected || ''}
                disabled={checked}
                autoFocus
                onChange={e => setSelected(e.target.value)}
                placeholder="Type your answer..."
                className={`h-24 text-4xl font-black text-center rounded-[32px] bg-white/3 border-4 transition-all ${checked ? (isCorrect ? 'border-green-500 text-green-400 shadow-glow-green' : 'border-red-500 text-red-400 shadow-glow-red') : 'border-white/5 focus:border-blue-600 focus:bg-white/5 text-white'}`}
             />
             {checked && !isCorrect && (
               <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-center">
                  <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">Đáp án đúng</p>
                  <p className="text-red-400 text-2xl font-black">{current.term}</p>
               </div>
             )}
          </div>
        )}

        <div className="mt-12">
          {!checked ? (
            <Button disabled={!selected} onClick={() => handleCheck()} className="w-full py-8 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl text-xl font-black uppercase tracking-widest shadow-2xl shadow-blue-900/40 transition-all disabled:opacity-20">
              Kiểm tra
            </Button>
          ) : (
            <Button onClick={next} className="w-full py-8 bg-white text-slate-900 hover:bg-slate-200 rounded-3xl text-xl font-black uppercase tracking-widest shadow-2xl transition-all animate-in zoom-in-95">
              {index < questions.length - 1 ? "Tiếp tục" : "Kết quả"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPractice;

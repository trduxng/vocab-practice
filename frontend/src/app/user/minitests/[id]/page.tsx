"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { userService } from "@/src/services/user.service";
import { useAuth } from "@/src/app/context/AuthContext";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { ArrowLeft, Timer, CheckCircle2, AlertCircle, ChevronRight, Send } from "lucide-react";

const MiniTestExecutionPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await userService.getMiniTestDetails(params.id as string);
        setQuestions(data);
      } catch (error) {
        console.error("Failed to fetch test details", error);
      } finally {
        setLoading(false);
      }
    };
    if (user && params.id) fetchDetails();
  }, [user, params.id]);

  const handleSubmit = async () => {
    if (submitted) return;
    setSubmitted(true);
    try {
      for (const q of questions) {
        const userAnswer = answers[q.questionId] || "";
        const isCorrect = userAnswer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
        await userService.submitAnswer({
          questionId: q.questionId,
          wordId: q.wordId || 0,
          submittedAnswer: userAnswer,
          isCorrect: isCorrect,
          scoreAwarded: isCorrect ? 1.0 : 0.0
        });
      }
    } catch (error) {
      console.error("Error submitting test results", error);
    }
  };

  // Timer logic - Declared AFTER handleSubmit to avoid hoisting error
  useEffect(() => {
    if (submitted || loading || questions.length === 0) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted, loading, questions]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center bg-[#080d1a] text-white font-mono uppercase tracking-widest">Initializing Test System...</div>;

  if (submitted) {
    const score = questions.filter(q => (answers[q.questionId] || "").toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()).length;
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080d1a] text-white p-4">
        <Card className="w-full max-w-2xl bg-white/5 border-white/10 p-12 text-center rounded-[40px] shadow-2xl">
           <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/30">
              <CheckCircle2 size={48} className="text-green-400" />
           </div>
           <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">Hoàn thành!</h1>
           <p className="text-slate-500 mb-12 font-medium">Kết quả của bạn đã được ghi nhận và lưu vào lịch sử.</p>
           
           <div className="grid grid-cols-2 gap-6 mb-12">
              <div className="bg-white/3 p-8 rounded-3xl border border-white/5">
                 <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-2">Đúng</p>
                 <p className="text-4xl font-black text-green-400">{score} / {questions.length}</p>
              </div>
              <div className="bg-white/3 p-8 rounded-3xl border border-white/5">
                 <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-2">Độ chính xác</p>
                 <p className="text-4xl font-black text-blue-400">{Math.round((score/questions.length) * 100)}%</p>
              </div>
           </div>

           <Button onClick={() => router.push('/user/minitests')} className="w-full py-8 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-3xl shadow-2xl shadow-blue-900/40 transition-all">Quay lại danh sách</Button>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const options = currentQ?.optionsJson ? JSON.parse(currentQ.optionsJson) : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#080d1a]">
      <header className="h-20 bg-black/40 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-50">
         <div className="flex items-center gap-6">
            <button onClick={() => router.back()} className="p-3 hover:bg-white/5 rounded-2xl text-slate-500 transition-colors"><ArrowLeft size={20} /></button>
            <div>
               <h1 className="text-white font-black text-xs uppercase tracking-[0.2em]">Exam Session</h1>
               <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Question {currentIndex + 1} of {questions.length}</p>
            </div>
         </div>
         <div className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl border-2 transition-all ${timeLeft < 60 ? 'bg-red-500/10 border-red-500/30 text-red-500 animate-pulse' : 'bg-white/5 border-white/10 text-blue-400'}`}>
            <Timer size={18} />
            <span className="font-mono font-black text-xl">{formatTime(timeLeft)}</span>
         </div>
         <Button onClick={handleSubmit} className="bg-white text-black hover:bg-blue-600 hover:text-white font-black text-[10px] uppercase tracking-widest px-8 h-12 rounded-xl transition-all">Nộp bài</Button>
      </header>

      <main className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-10 py-16">
         <div className="flex flex-wrap gap-2.5 justify-center mb-6">
            {questions.map((_, i) => (
               <div 
                key={i} 
                className={`w-3 h-3 rounded-full border-2 transition-all ${i === currentIndex ? 'bg-blue-500 border-blue-400 scale-125 shadow-glow' : answers[questions[i].questionId] ? 'bg-slate-600 border-slate-700' : 'bg-white/5 border-white/10'}`} 
               />
            ))}
         </div>

         <Card className="bg-white/3 border border-white/10 p-12 rounded-[48px] relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 shadow-glow" />
            <h2 className="text-white text-4xl font-black leading-tight mb-6 tracking-tighter">{currentQ?.questionText}</h2>
            {currentQ?.term && <p className="text-slate-500 italic text-sm font-medium">Context: Related to "{currentQ.term}"</p>}
         </Card>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {options.map((opt: string, i: number) => (
               <button
                  key={i}
                  onClick={() => setAnswers({ ...answers, [currentQ.questionId]: opt })}
                  className={`group p-8 rounded-[32px] border-2 text-left transition-all relative
                    ${answers[currentQ.questionId] === opt 
                      ? 'bg-blue-600/10 border-blue-500 text-white shadow-2xl scale-[1.02]' 
                      : 'bg-white/2 border-white/5 text-slate-500 hover:bg-white/5 hover:border-white/10'}`}
               >
                  <div className="flex items-center gap-5">
                     <span className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs border-2 ${answers[currentQ.questionId] === opt ? 'bg-blue-500 border-blue-400 text-white' : 'bg-white/5 border-white/10 text-slate-600'}`}>
                        {String.fromCharCode(65 + i)}
                     </span>
                     <span className="font-bold text-xl">{opt}</span>
                  </div>
               </button>
            ))}
         </div>

         <div className="flex justify-between items-center pt-16">
            <Button 
               variant="ghost" 
               disabled={currentIndex === 0}
               onClick={() => setCurrentIndex(prev => prev - 1)}
               className="text-slate-500 hover:text-white font-bold uppercase text-[10px] tracking-widest h-14 px-8 rounded-2xl"
            >
               Quay lại
            </Button>
            <Button 
               onClick={() => {
                  if (currentIndex < questions.length - 1) setCurrentIndex(prev => prev + 1);
                  else handleSubmit();
               }}
               className="bg-white text-black hover:bg-blue-600 hover:text-white px-12 h-16 rounded-[24px] font-black uppercase text-xs tracking-[0.2em] shadow-2xl transition-all"
            >
               {currentIndex < questions.length - 1 ? "Tiếp theo" : "Hoàn thành bài thi"}
            </Button>
         </div>
      </main>
    </div>
  );
};

export default MiniTestExecutionPage;

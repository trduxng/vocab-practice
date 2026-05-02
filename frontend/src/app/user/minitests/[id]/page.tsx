"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { userService } from "@/src/services/user.service";
import { useAuth } from "@/src/app/context/AuthContext";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
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

  // Timer logic
  useEffect(() => {
    if (submitted || loading || questions.length === 0) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted, loading, questions]);

  const handleSubmit = async () => {
    if (submitted) return;
    setSubmitted(true);
    
    // In real app, we would send all answers to a specific MiniTestAttempt table
    // For this MVP, we use the existing submitAnswer API for each question
    try {
      for (const q of questions) {
        const userAnswer = answers[q.questionId] || "";
        const isCorrect = userAnswer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
        await userService.submitAnswer({
          questionId: q.questionId,
          wordId: q.wordId || 0, // Should have wordId from join
          submittedAnswer: userAnswer,
          isCorrect: isCorrect,
          scoreAwarded: isCorrect ? 1.0 : 0.0
        });
      }
    } catch (error) {
      console.error("Error submitting test results", error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center bg-[#080d1a] text-white font-mono">INITIALIZING TEST SYSTEM...</div>;

  if (submitted) {
    const score = questions.filter(q => (answers[q.questionId] || "").toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()).length;
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080d1a] text-white p-4">
        <Card className="w-full max-w-2xl bg-white/5 border-white/10 p-10 text-center rounded-3xl">
           <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30 shadow-2xl">
              <CheckCircle2 size={48} className="text-green-400" />
           </div>
           <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Hoàn thành bài thi!</h1>
           <p className="text-slate-500 mb-10">Kết quả của bạn đã được ghi nhận vào hệ thống.</p>
           
           <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                 <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Đúng</p>
                 <p className="text-3xl font-black text-green-400">{score} / {questions.length}</p>
              </div>
              <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                 <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Độ chính xác</p>
                 <p className="text-3xl font-black text-blue-400">{Math.round((score/questions.length) * 100)}%</p>
              </div>
           </div>

           <Button onClick={() => router.push('/user/minitests')} className="w-full py-7 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20">Quay lại danh sách</Button>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const options = currentQ?.optionsJson ? JSON.parse(currentQ.optionsJson) : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#080d1a]">
      {/* Test Header */}
      <header className="h-20 bg-black/40 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-50">
         <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-xl text-slate-500 transition-colors"><ArrowLeft size={20} /></button>
            <div>
               <h1 className="text-white font-bold text-sm uppercase tracking-widest">Mini Test Session</h1>
               <p className="text-slate-500 text-xs font-medium">Câu {currentIndex + 1} / {questions.length}</p>
            </div>
         </div>
         <div className={`flex items-center gap-3 px-5 py-2 rounded-2xl border ${timeLeft < 60 ? 'bg-red-500/20 border-red-500/30 text-red-400 animate-pulse' : 'bg-white/5 border-white/10 text-blue-400'}`}>
            <Timer size={18} />
            <span className="font-mono font-black text-lg">{formatTime(timeLeft)}</span>
         </div>
         <Button onClick={handleSubmit} className="bg-white text-black hover:bg-blue-600 hover:text-white font-black text-xs uppercase tracking-widest px-6 py-5 rounded-xl transition-all">Nộp bài <Send size={14} className="ml-2" /></Button>
      </header>

      <main className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-8 py-12">
         {/* Question Progress dots */}
         <div className="flex flex-wrap gap-2 justify-center mb-4">
            {questions.map((_, i) => (
               <div 
                key={i} 
                className={`w-2.5 h-2.5 rounded-full border transition-all ${i === currentIndex ? 'bg-blue-500 border-blue-400 scale-125' : answers[questions[i].questionId] ? 'bg-slate-500 border-slate-600' : 'bg-white/5 border-white/10'}`} 
               />
            ))}
         </div>

         {/* Question Card */}
         <Card className="bg-white/5 border-white/10 p-10 rounded-[32px] relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />
            <div className="flex items-center gap-2 mb-6">
               <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-2 py-1 rounded">Question {currentIndex + 1}</span>
            </div>
            <h2 className="text-white text-3xl font-bold leading-tight mb-4">{currentQ?.questionText}</h2>
            {currentQ?.term && <p className="text-slate-500 italic text-sm">Gợi ý: Liên quan đến từ "{currentQ.term}"</p>}
         </Card>

         {/* Options */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {options.map((opt: string, i: number) => (
               <button
                  key={i}
                  onClick={() => setAnswers({ ...answers, [currentQ.questionId]: opt })}
                  className={`group p-6 rounded-3xl border text-left transition-all relative overflow-hidden
                    ${answers[currentQ.questionId] === opt 
                      ? 'bg-blue-600 border-blue-400 text-white shadow-xl shadow-blue-900/40 scale-[1.02]' 
                      : 'bg-white/3 border-white/5 text-slate-400 hover:bg-white/5 hover:border-white/10'}`}
               >
                  <div className="flex items-center gap-4">
                     <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border ${answers[currentQ.questionId] === opt ? 'bg-white/20 border-white/30' : 'bg-white/5 border-white/10'}`}>
                        {String.fromCharCode(65 + i)}
                     </span>
                     <span className="font-semibold text-lg">{opt}</span>
                  </div>
               </button>
            ))}
         </div>

         {/* Navigation */}
         <div className="flex justify-between items-center pt-10">
            <Button 
               variant="ghost" 
               disabled={currentIndex === 0}
               onClick={() => setCurrentIndex(prev => prev - 1)}
               className="text-slate-500 hover:text-white"
            >
               Quay lại
            </Button>
            <Button 
               onClick={() => {
                  if (currentIndex < questions.length - 1) setCurrentIndex(prev => prev + 1);
                  else handleSubmit();
               }}
               className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-6 rounded-2xl font-bold"
            >
               {currentIndex < questions.length - 1 ? "Câu tiếp theo" : "Hoàn thành bài thi"} <ChevronRight size={18} className="ml-1" />
            </Button>
         </div>
      </main>
    </div>
  );
};

export default MiniTestExecutionPage;

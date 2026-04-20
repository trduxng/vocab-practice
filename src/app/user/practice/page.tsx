"use client";

import React, { useMemo, useState, useEffect } from "react";

type Flashcard = {
  word: string;
  meaning: string;
};

const data: Flashcard[] = [
  { word: "Ambiguous", meaning: "Mơ hồ, không rõ ràng" },
  { word: "Eloquent", meaning: "Hùng hồn, diễn đạt tốt" },
  { word: "Diligent", meaning: "Chăm chỉ, cần cù" },
  { word: "Innovate", meaning: "Đổi mới, sáng tạo" },
  { word: "Versatile", meaning: "Đa năng, linh hoạt" },
  { word: "Proficient", meaning: "Thành thạo" },
];

// Fisher-Yates shuffle
const shuffle = <T,>(arr: T[]): T[] => {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const QUESTION_TIME = 10;

const UserPractice = () => {
  const [questions, setQuestions] = useState<Flashcard[]>(() => shuffle(data));

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [wrongList, setWrongList] = useState<Flashcard[]>([]);

  const current = questions[index];

  // options
  const options = useMemo(() => {
    if (!current) return [];

    const wrong = shuffle(data)
      .filter((i) => i.word !== current.word)
      .slice(0, 3);

    return shuffle([current, ...wrong]);
  }, [index, current]);

  const isCorrect = selected === current?.meaning;
  const progress = ((index + 1) / questions.length) * 100;
  const accuracy = Math.round((score / questions.length) * 100);

  // ✅ xử lý khi hết giờ
  const handleTimeout = () => {
    if (!current) return;

    setChecked(true);
    setWrongList((prev) => [...prev, current]);
  };

  // TIMER (không vi phạm rule)
  useEffect(() => {
    if (checked) return;

    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, checked]);

  // check đáp án
  const handleCheck = () => {
    if (!current) return;

    if (isCorrect) {
      setScore((s) => s + 1);
    } else {
      setWrongList((prev) => [...prev, current]);
    }

    setChecked(true);
  };

  const next = () => {
    if (index < questions.length - 1) {
      setIndex((prev) => prev + 1);
      setSelected(null);
      setChecked(false);
      setTimeLeft(QUESTION_TIME);
    } else {
      setIndex(questions.length); // trigger end screen
    }
  };

  const restart = () => {
    setQuestions(shuffle(data));
    setIndex(0);
    setScore(0);
    setSelected(null);
    setChecked(false);
    setTimeLeft(QUESTION_TIME);
    setWrongList([]);
  };

  // END SCREEN
  if (index >= questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] text-white">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold mb-4">Hoàn thành</h1>

          <p className="text-lg mb-2">
            Điểm: {score} / {questions.length}
          </p>

          <p className="text-slate-400 mb-6">Accuracy: {accuracy}%</p>

          {wrongList.length > 0 && (
            <div className="text-left mb-6">
              <p className="mb-2 text-red-400">Câu sai:</p>
              <ul className="text-sm text-slate-300 space-y-1">
                {wrongList.map((w, i) => (
                  <li key={i}>
                    {w.word} → {w.meaning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={restart}
            className="px-6 py-3 bg-brand-600 rounded-xl"
          >
            Làm lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] px-4">
      <div className="w-full max-w-2xl">
        {/* PROGRESS */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>Tiến độ</span>
            <span>
              {index + 1}/{questions.length}
            </span>
          </div>

          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-brand-500 to-cyan-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* TIMER */}
        <div className="text-right text-sm text-slate-400 mb-2">
          ⏱ {timeLeft}s
        </div>

        {/* WORD */}
        <h1 className="text-4xl text-white font-bold text-center mb-8">
          {current.word}
        </h1>

        {/* OPTIONS */}
        <div className="grid gap-4">
          {options.map((opt, i) => {
            const isSelected = selected === opt.meaning;
            const isAnswer = opt.meaning === current.meaning;

            return (
              <button
                key={i}
                onClick={() => !checked && setSelected(opt.meaning)}
                className={`p-4 rounded-xl border text-left transition
                  ${
                    checked
                      ? isAnswer
                        ? "bg-green-500/30 border-green-400 text-white"
                        : isSelected
                          ? "bg-red-500/30 border-red-400 text-white"
                          : "bg-white/5 border-white/10 text-slate-400"
                      : isSelected
                        ? "bg-brand-500/30 border-brand-400 text-white"
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                  }
                `}
              >
                {opt.meaning}
              </button>
            );
          })}
        </div>

        {/* ACTION */}
        {!checked ? (
          <button
            disabled={!selected}
            onClick={handleCheck}
            className="mt-6 w-full py-3 bg-brand-600 text-white rounded-xl disabled:opacity-50"
          >
            Check
          </button>
        ) : (
          <div className="mt-6 text-center">
            <p
              className={`text-lg font-semibold ${
                isCorrect ? "text-green-400" : "text-red-400"
              }`}
            >
              {isCorrect ? "Đúng" : "Sai"}
            </p>

            {!isCorrect && (
              <p className="text-slate-300 mt-2">
                Đáp án đúng: {current.meaning}
              </p>
            )}

            <button
              onClick={next}
              className="mt-4 px-6 py-3 bg-white/10 rounded-xl text-white"
            >
              Câu tiếp
            </button>
          </div>
        )}

        {/* SCORE */}
        <div className="mt-6 text-center text-slate-400 text-sm">
          Điểm: {score}
        </div>
      </div>
    </div>
  );
};

export default UserPractice;

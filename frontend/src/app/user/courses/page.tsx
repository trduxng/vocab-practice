"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, CheckCircle2, Clock3, ListChecks, Play, RefreshCw, Search, Target, X } from "lucide-react";
import { toast } from "sonner";
import { categoriesService } from "@/src/services/categories.service";
import { userService } from "@/src/services/user.service";
import { useAuth } from "@/src/app/context/AuthContext";
import Topbar from "@/src/components/shared/Topbar";
import { Button } from "@/src/components/ui/button";

type Topic = {
  id: number;
  name: string;
  code?: string;
  description?: string;
  status?: string;
  wordCount?: number;
  learnedCount?: number;
  masteredCount?: number;
  dueCount?: number;
  averageMastery?: number | string | null;
  progressPercent?: number | string | null;
};

type TopicWord = {
  wordId: number;
  term: string;
  meaning: string;
  phonetic?: string;
  partOfSpeechName?: string;
  masteryLevel: number;
  memoryStatus: string;
  exampleSentence?: string;
  exampleMeaning?: string;
};

const numberValue = (value: unknown) => Number(value ?? 0) || 0;

const getStage = (topic: Topic, index: number) => {
  const code = String(topic.code || "").toLowerCase();
  if (code.includes("starter")) return "Nền tảng";
  if (code.includes("office")) return "Công sở";
  if (code.includes("part")) return "Kỹ năng TOEIC";
  return `Chặng ${index + 1}`;
};

const getTopicTone = (index: number) => {
  const tones = [
    "border-cyan-400/25 bg-cyan-400/[0.08] text-cyan-200",
    "border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-200",
    "border-amber-400/25 bg-amber-400/[0.08] text-amber-200",
    "border-rose-400/25 bg-rose-400/[0.08] text-rose-200",
  ];

  return tones[index % tones.length];
};

const UserCoursesPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [courseWords, setCourseWords] = useState<TopicWord[]>([]);
  const [wordsLoading, setWordsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await categoriesService.getTopics();
        setTopics(data);
      } catch (error) {
        console.error("Failed to fetch topics", error);
        toast.error("Không tải được lộ trình học.");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchTopics();
  }, [user]);

  useEffect(() => {
    if (!selectedTopic) {
      return;
    }

    const fetchCourseWords = async () => {
      setWordsLoading(true);
      try {
        const data = await userService.getTopicWords(selectedTopic.id);
        setCourseWords(data);
      } catch (error) {
        console.error("Failed to fetch course words", error);
        setCourseWords([]);
        toast.error("Không tải được danh sách từ vựng.");
      } finally {
        setWordsLoading(false);
      }
    };

    fetchCourseWords();
  }, [selectedTopic]);

  const filteredTopics = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return topics;

    return topics.filter((topic) => {
      const haystack = `${topic.name} ${topic.code || ""} ${topic.description || ""}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [topics, query]);

  const totals = useMemo(() => {
    return topics.reduce(
      (summary, topic) => {
        summary.words += numberValue(topic.wordCount);
        summary.learned += numberValue(topic.learnedCount);
        summary.mastered += numberValue(topic.masteredCount);
        summary.due += numberValue(topic.dueCount);
        return summary;
      },
      { words: 0, learned: 0, mastered: 0, due: 0 },
    );
  }, [topics]);

  const selectedProgress = selectedTopic ? Math.min(100, numberValue(selectedTopic.progressPercent)) : 0;

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080d1a] text-sm font-semibold text-slate-200">
        Đang tải lộ trình học...
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-[#080d1a]">
      <Topbar title="Lộ trình TOEIC" role="student" userName={user?.fullName} />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 overflow-auto px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-lg border border-white/10 bg-[#111827] p-5">
          <div className="mb-5 flex justify-end">
            <Button
              onClick={() => router.push("/user/learn")}
              className="h-10 rounded-lg bg-cyan-400 px-4 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
            >
              <Play className="h-4 w-4" />
              Ôn tập hôm nay
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric icon={BookOpen} label="Tổng từ" value={totals.words} />
            <Metric icon={CheckCircle2} label="Đã học" value={totals.learned} />
            <Metric icon={Target} label="Đã nắm chắc" value={totals.mastered} />
            <Metric icon={Clock3} label="Cần ôn" value={totals.due} />
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#111827] px-4 py-3">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm topic, mã khóa học..."
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredTopics.map((topic, index) => {
              const isSelected = selectedTopic?.id === topic.id;
              const progress = Math.min(100, numberValue(topic.progressPercent));
              const tone = getTopicTone(index);

              return (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  className={`rounded-lg border p-4 text-left transition ${
                    isSelected
                      ? "border-cyan-400/50 bg-cyan-400/10"
                      : "border-white/10 bg-[#111827] hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className={`mb-2 inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${tone}`}>
                        {getStage(topic, index)}
                      </span>
                      <h2 className="truncate text-base font-bold text-white">{topic.name}</h2>
                      <p className="mt-1 text-xs text-slate-500">{topic.code || "TOEIC"}</p>
                    </div>
                    <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold text-slate-300">
                      {numberValue(topic.wordCount)} từ
                    </span>
                  </div>

                  <p className="mb-4 line-clamp-2 text-sm leading-6 text-slate-400">
                    {topic.description || "Bộ từ vựng TOEIC cho quá trình học và ôn tập ngắn mỗi ngày."}
                  </p>

                  <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                    <span>{numberValue(topic.masteredCount)} đã nắm chắc</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
                    <div className="h-full rounded-full bg-cyan-400" style={{ width: `${progress}%` }} />
                  </div>
                </button>
              );
            })}
          </div>

          {filteredTopics.length === 0 && (
            <div className="rounded-lg border border-white/10 bg-[#111827] p-6 text-center text-sm text-slate-400">
              Không tìm thấy topic phù hợp.
            </div>
          )}
        </section>

        {selectedTopic && (
          <section className="rounded-lg border border-white/10 bg-[#111827]">
            <div className="border-b border-white/10 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-cyan-200">
                    <ListChecks className="h-4 w-4" />
                    {selectedTopic.code || "Topic TOEIC"}
                  </div>
                  <h2 className="text-2xl font-bold text-white">{selectedTopic.name}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                    {selectedTopic.description || "Học bằng flashcard, xem ví dụ, rồi ôn lại các từ đến hạn."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => router.push(`/user/learn?topicId=${selectedTopic.id}`)}
                    className="h-10 rounded-lg bg-cyan-400 px-4 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
                  >
                    <Play className="h-4 w-4" />
                    Học ngay
                  </Button>
                  <Button
                    onClick={() => router.push(`/user/learn?topicId=${selectedTopic.id}&mode=learned`)}
                    className="h-10 rounded-lg bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/15"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Ôn đã học
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedTopic(null);
                      setCourseWords([]);
                    }}
                    className="h-10 rounded-lg bg-white/5 px-3 text-sm font-semibold text-white hover:bg-white/10"
                    aria-label="Đóng chi tiết topic"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-4">
                <Metric compact icon={BookOpen} label="Từ" value={numberValue(selectedTopic.wordCount)} />
                <Metric compact icon={CheckCircle2} label="Đã học" value={numberValue(selectedTopic.learnedCount)} />
                <Metric compact icon={Target} label="Chắc" value={numberValue(selectedTopic.masteredCount)} />
                <Metric compact icon={Clock3} label="Cần ôn" value={numberValue(selectedTopic.dueCount)} />
              </div>

              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs text-slate-400">
                  <span>Hoàn thành topic</span>
                  <span>{Math.round(selectedProgress)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
                  <div className="h-full rounded-full bg-emerald-400" style={{ width: `${selectedProgress}%` }} />
                </div>
              </div>
            </div>

            <div className="max-h-[560px] overflow-auto">
              {wordsLoading ? (
                <div className="p-8 text-center text-sm font-semibold text-slate-400">Đang tải từ vựng...</div>
              ) : courseWords.length === 0 ? (
                <div className="p-8 text-center text-sm font-semibold text-slate-400">Topic này chưa có từ vựng.</div>
              ) : (
                <div className="divide-y divide-white/[0.08]">
                  {courseWords.map((word) => (
                    <WordRow key={word.wordId} word={word} />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

type MetricProps = {
  icon: React.ElementType;
  label: string;
  value: number;
  compact?: boolean;
};

const Metric = ({ icon: Icon, label, value, compact = false }: MetricProps) => (
  <div className={`rounded-lg border border-white/10 bg-white/[0.04] ${compact ? "p-3" : "p-4"}`}>
    <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-400">
      <Icon className="h-4 w-4 text-cyan-300" />
      {label}
    </div>
    <div className={`${compact ? "text-xl" : "text-2xl"} font-bold text-white`}>{value}</div>
  </div>
);

const WordRow = ({ word }: { word: TopicWord }) => {
  const mastery = Math.min(10, numberValue(word.masteryLevel));

  return (
    <div className="grid gap-4 p-4 md:grid-cols-[1fr_1.4fr_130px] md:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-base font-bold text-white">{word.term}</h3>
          {word.partOfSpeechName && (
            <span className="rounded-md border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 text-xs font-semibold text-cyan-200">
              {word.partOfSpeechName}
            </span>
          )}
        </div>
        {word.phonetic && <p className="mt-1 text-xs text-slate-500">{word.phonetic}</p>}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-medium leading-6 text-slate-200">{word.meaning}</p>
        {word.exampleSentence && (
          <p className="mt-1 truncate text-xs text-slate-500">{word.exampleSentence}</p>
        )}
      </div>

      <div>
        <div className="mb-2 flex justify-between text-xs text-slate-500">
          <span>{word.memoryStatus || "Mới"}</span>
          <span>{mastery}/10</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
          <div className="h-full rounded-full bg-emerald-400" style={{ width: `${mastery * 10}%` }} />
        </div>
      </div>
    </div>
  );
};

export default UserCoursesPage;

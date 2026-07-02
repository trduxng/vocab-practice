'use client';

import React, { useEffect, useState } from 'react';
import { creatorService, AcademicAnalyticsData } from '@/src/services/creator.service';
import { BarChart3, Users, Award, BookOpen, Clock, AlertCircle, TrendingUp, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface SummaryItem { EntityType: string; ContentStatus: string; Total: number; }

export default function CreatorAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'content' | 'academic'>('academic');
  const [summary, setSummary] = useState<SummaryItem[]>([]);
  const [academicData, setAcademicData] = useState<AcademicAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [summaryRes, academicRes] = await Promise.all([
        creatorService.getContentSummary(),
        creatorService.getAcademicAnalytics()
      ]);
      setSummary(summaryRes);
      setAcademicData(academicRes);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải dữ liệu báo cáo thống kê');
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    })();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success('Đã cập nhật dữ liệu mới nhất');
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12">
        <Loader2 className="animate-spin h-10 w-10 text-violet-600 mb-3" />
        <p className="text-slate-500 text-sm animate-pulse">Đang tải báo cáo học thuật...</p>
      </div>
    );
  }

  // Group content summary
  const grouped: Record<string, SummaryItem[]> = {};
  summary.forEach((s) => {
    if (!grouped[s.EntityType]) grouped[s.EntityType] = [];
    grouped[s.EntityType].push(s);
  });

  const statusColors: Record<string, string> = {
    Draft: 'bg-slate-400',
    PendingReview: 'bg-amber-400',
    Published: 'bg-emerald-500',
    Rejected: 'bg-rose-500',
    Archived: 'bg-gray-400',
  };

  const statusLabels: Record<string, string> = {
    Draft: 'Bản nháp',
    PendingReview: 'Chờ duyệt',
    Published: 'Đã xuất bản',
    Rejected: 'Bị từ chối',
    Archived: 'Đã lưu trữ',
  };

  const typeLabels: Record<string, string> = {
    Topic: 'Chủ đề',
    Word: 'Từ vựng',
    Question: 'Câu hỏi',
    MiniTest: 'Bài test',
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20';
    if (score >= 50) return 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20';
    return 'text-rose-600 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20';
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <BarChart3 className="h-7 w-7 text-violet-600" /> Báo cáo thống kê
          </h1>
          <p className="text-slate-500 text-sm mt-1">Phân tích chất lượng học liệu và kết quả học tập của học viên</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
          Làm mới dữ liệu
        </button>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 dark:border-white/10">
        <button
          onClick={() => setActiveTab('academic')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px flex items-center gap-2 ${
            activeTab === 'academic'
              ? 'border-violet-600 text-violet-600 dark:text-violet-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Users className="h-4 w-4" /> Thống kê học viên
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px flex items-center gap-2 ${
            activeTab === 'content'
              ? 'border-violet-600 text-violet-600 dark:text-violet-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <BookOpen className="h-4 w-4" /> Tổng quan nội dung
        </button>
      </div>

      {activeTab === 'content' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-200">
          {Object.entries(grouped).map(([type, items]) => {
            const total = items.reduce((s, i) => s + i.Total, 0);
            return (
              <div key={type} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-700 dark:text-slate-200">{typeLabels[type] || type}</h3>
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">{total}</span>
                </div>
                <div className="space-y-2">
                  {items.map((item) => {
                    const pct = total > 0 ? Math.round((item.Total / total) * 100) : 0;
                    return (
                      <div key={item.ContentStatus} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">{statusLabels[item.ContentStatus] || item.ContentStatus}</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">{item.Total} ({pct}%)</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${statusColors[item.ContentStatus] || 'bg-violet-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {Object.keys(grouped).length === 0 && (
            <div className="col-span-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-12 text-center text-slate-500">
              Chưa có dữ liệu. Hãy bắt đầu soạn thảo học liệu nhé!
            </div>
          )}
        </div>
      )}

      {activeTab === 'academic' && academicData && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Summary Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-violet-50 dark:bg-violet-500/10 rounded-xl text-violet-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-medium">Học viên đang học</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {academicData.summary.totalStudents}
                </h3>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-medium">Điểm thi trung bình</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {academicData.summary.averageScore} <span className="text-xs text-slate-400 font-normal">/100</span>
                </h3>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-sky-50 dark:bg-sky-500/10 rounded-xl text-sky-600">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-medium">Tổng lượt làm bài</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {academicData.summary.totalAttempts}
                </h3>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-600">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-medium">Chủ đề đã xuất bản</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {academicData.summary.publishedTopics}
                </h3>
              </div>
            </div>
          </div>

          {/* Academic Analytics details */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Hard Words List */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 space-y-4 shadow-sm">
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-rose-500" /> Từ hay sai nhất
                </h3>
                <p className="text-slate-500 text-xs mt-1">Từ có tỷ lệ sai cao nhất, giúp phát hiện lỗi đề hoặc cần giải thích rõ hơn</p>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-[400px] overflow-y-auto pr-1">
                {academicData.hardWords.map((word) => (
                  <div key={word.wordId} className="py-3 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">{word.term}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[280px]">{word.meaning}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 dark:bg-rose-500/10 text-rose-600">
                        Sai {word.failureRate}%
                      </span>
                      <p className="text-[10px] text-slate-400">({word.wrongAttempts}/{word.totalAttempts} lượt câu hỏi)</p>
                    </div>
                  </div>
                ))}
                {academicData.hardWords.length === 0 && (
                  <div className="py-12 text-center text-slate-400 text-sm">Chưa phát hiện từ khó hoặc chưa có dữ liệu làm bài.</div>
                )}
              </div>
            </div>

            {/* Test Performance */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 space-y-4 shadow-sm">
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Award className="h-5 w-5 text-emerald-500" /> Phân tích hiệu suất bài kiểm tra
                </h3>
                <p className="text-slate-500 text-xs mt-1">Điểm trung bình học viên đạt được qua các bài kiểm tra</p>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-[400px] overflow-y-auto pr-1">
                {academicData.testPerformance.map((test) => (
                  <div key={test.testId} className="py-3 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white truncate max-w-[280px]">
                        {test.testTitle}
                      </p>
                      <p className="text-xs text-slate-400">{test.attemptCount} lượt làm bài</p>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                        {test.averageScore} <span className="text-[10px] text-slate-400">/100</span>
                      </span>
                      <div className="w-24 h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            test.averageScore >= 80 ? 'bg-emerald-500' : test.averageScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${test.averageScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {academicData.testPerformance.length === 0 && (
                  <div className="py-12 text-center text-slate-400 text-sm">Chưa có bài kiểm tra hoặc chưa có học viên làm.</div>
                )}
              </div>
            </div>
          </div>

          {/* Student grade list (Vế 1 của yêu cầu) */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 space-y-4 shadow-sm">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Clock className="h-5 w-5 text-sky-500" /> Bảng điểm học viên
              </h3>
              <p className="text-slate-500 text-xs mt-1">Điểm thi thực tế của từng học viên</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 font-medium">
                    <th className="py-3 px-4">Tên học viên</th>
                    <th className="py-3 px-4">Bài kiểm tra</th>
                    <th className="py-3 px-4 text-center">Số câu đúng</th>
                    <th className="py-3 px-4 text-center">Điểm số</th>
                    <th className="py-3 px-4">Ngày hoàn thành</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {academicData.studentAttempts.map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{attempt.studentName}</div>
                        <div className="text-xs text-slate-400">{attempt.studentEmail}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                        {attempt.testTitle}
                      </td>
                      <td className="py-3.5 px-4 text-center font-medium text-slate-700 dark:text-slate-300">
                        {attempt.correctCount} / {attempt.totalQuestions}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold border ${getScoreColor(Number(attempt.score))}`}>
                          {attempt.score}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs">
                        {new Date(attempt.submittedAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                  {academicData.studentAttempts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        Chưa có học viên nào hoàn thành bài thi thử của bạn.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

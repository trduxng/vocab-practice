// vocab-practice/frontend/src/app/admin/courses/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import Topbar from "@/src/components/shared/Topbar";
import apiClient from "@/src/lib/api-client";
import { BookOpen, Plus, Edit, Trash2, Search } from "lucide-react";

interface Topic {
  id: number;
  name: string;
  code: string;
  description: string;
}

export default function AdminCourses() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchTopics() {
      try {
        const response = await apiClient.get("/categories/topics");
        setTopics(response.data || []);
      } catch (err) {
        console.error("Failed to fetch topics:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTopics();
  }, []);

  const filteredTopics = topics.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.code.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <Topbar title="Quản lý khóa học" role="admin" userName="Admin" />

      <main className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-white text-xl font-bold">Danh sách khóa học</h2>
            <p className="text-slate-400 text-sm mt-1">
              {filteredTopics.length} khóa học
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
              <Search size={14} className="text-slate-500" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-sm text-slate-300 placeholder:text-slate-600 outline-none w-40"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-all">
              <Plus size={16} />
              Thêm khóa học
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          </div>
        ) : filteredTopics.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={48} className="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Chưa có khóa học nào</p>
          </div>
        ) : (
          <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8">
                    <th className="text-left px-6 py-4 text-slate-400 text-xs font-medium uppercase">
                      Tên khóa học
                    </th>
                    <th className="text-left px-6 py-4 text-slate-400 text-xs font-medium uppercase">
                      Mã
                    </th>
                    <th className="text-left px-6 py-4 text-slate-400 text-xs font-medium uppercase">
                      Mô tả
                    </th>
                    <th className="text-right px-6 py-4 text-slate-400 text-xs font-medium uppercase">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTopics.map((topic) => (
                    <tr
                      key={topic.id}
                      className="border-b border-white/5 hover:bg-white/3 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                            <BookOpen size={16} className="text-brand-400" />
                          </div>
                          <span className="text-white font-medium text-sm">
                            {topic.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-400 text-sm">
                          {topic.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-500 text-sm line-clamp-1">
                          {topic.description || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500/40 transition-all">
                            <Edit size={14} />
                          </button>
                          <button className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-red-400 hover:border-red-500/40 transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

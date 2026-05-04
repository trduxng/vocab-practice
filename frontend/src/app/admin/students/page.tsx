// vocab-practice/frontend/src/app/admin/students/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import Topbar from "@/src/components/shared/Topbar";
import apiClient from "@/src/lib/api-client";
import { Users, Search, MoreVertical, Mail } from "lucide-react";

interface Student {
  id: number;
  name: string;
  email: string;
  course: string;
  status: string;
  joined: string;
  avatar: string;
  avatarColor: string;
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchStudents() {
      try {
        const response = await apiClient.get("/admin/recent-users");
        setStudents(response.data || []);
      } catch (err) {
        console.error("Failed to fetch students:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <Topbar title="Quản lý học viên" role="admin" userName="Admin" />

      <main className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-white text-xl font-bold">Danh sách học viên</h2>
            <p className="text-slate-400 text-sm mt-1">
              {filteredStudents.length} học viên
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
            <Search size={14} className="text-slate-500" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-slate-300 placeholder:text-slate-600 outline-none w-48"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-20">
            <Users size={48} className="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Chưa có học viên nào</p>
          </div>
        ) : (
          <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8">
                    <th className="text-left px-6 py-4 text-slate-400 text-xs font-medium uppercase">
                      Học viên
                    </th>
                    <th className="text-left px-6 py-4 text-slate-400 text-xs font-medium uppercase">
                      Khóa học
                    </th>
                    <th className="text-left px-6 py-4 text-slate-400 text-xs font-medium uppercase">
                      Trạng thái
                    </th>
                    <th className="text-left px-6 py-4 text-slate-400 text-xs font-medium uppercase">
                      Ngày tham gia
                    </th>
                    <th className="text-right px-6 py-4 text-slate-400 text-xs font-medium uppercase">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b border-white/5 hover:bg-white/3 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl ${student.avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                          >
                            {student.avatar}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">
                              {student.name}
                            </p>
                            <p className="text-slate-500 text-xs flex items-center gap-1">
                              <Mail size={10} />
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-300 text-sm">
                          {student.course}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            student.status === "active"
                              ? "bg-green-500/15 text-green-400 border border-green-500/20"
                              : "bg-slate-500/15 text-slate-400 border border-slate-500/20"
                          }`}
                        >
                          {student.status === "active"
                            ? "Hoạt động"
                            : "Không hoạt động"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-400 text-sm">
                          {student.joined}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end">
                          <button className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                            <MoreVertical size={14} />
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

'use client';

import React, { useState, useEffect } from 'react';
import { adminService } from '@/src/services/admin.service';
import Topbar from '@/src/components/shared/Topbar';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Users, Search, ShieldCheck, ShieldAlert, Mail, Calendar, BookOpenCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await adminService.getStudents();
      setStudents(data);
    } catch (error) {
      toast.error("Không thể tải danh sách học viên");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await adminService.toggleStudentStatus(id);
      toast.success("Cập nhật trạng thái thành công");
      fetchStudents();
    } catch (error) {
      toast.error("Lỗi khi cập nhật");
    }
  };

  const filteredStudents = students.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && students.length === 0) {
    return <div className="p-10 text-white bg-[#080d1a] min-h-screen font-mono">LOADING STUDENT REGISTRY...</div>;
  }

  return (
    <div className="flex-1 flex flex-col bg-[#080d1a]">
      <Topbar title="Quản lý Học viên" role="admin" />
      
      <main className="p-6 space-y-6 overflow-auto">
        <div className="flex justify-between items-center mb-4">
           <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-blue-500/50 outline-none transition-all" 
                placeholder="Tìm tên hoặc email..." 
              />
           </div>
           <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl">
              <p className="text-blue-400 text-xs font-bold uppercase tracking-widest">Tổng số: {students.length}</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
           {filteredStudents.map((s) => (
             <Card key={s.id} className={`bg-white/3 border transition-all overflow-hidden rounded-[32px] ${s.isActive ? 'border-white/8 hover:border-blue-500/30' : 'border-red-500/20 grayscale opacity-70'}`}>
                <CardContent className="p-0">
                   <div className="p-6">
                      <div className="flex justify-between items-start mb-6">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-2xl ${s.isActive ? 'bg-linear-to-br from-blue-500 to-indigo-600' : 'bg-slate-700'}`}>
                            {s.fullName.slice(0, 1).toUpperCase()}
                         </div>
                         <button 
                          onClick={() => handleToggleStatus(s.id)}
                          title={s.isActive ? "Khóa tài khoản" : "Mở khóa"}
                          className={`p-2 rounded-xl transition-all ${s.isActive ? 'bg-white/5 text-slate-500 hover:bg-red-500/10 hover:text-red-400' : 'bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white'}`}
                         >
                            {s.isActive ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
                         </button>
                      </div>

                      <h3 className="text-white font-bold text-lg mb-1">{s.fullName}</h3>
                      <div className="flex items-center gap-2 text-slate-500 text-xs mb-6">
                         <Mail size={12} /> {s.email}
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-6">
                         <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                            <p className="text-[9px] text-slate-600 uppercase font-black tracking-tighter mb-1">Đã thuộc</p>
                            <p className="text-white font-bold flex items-center gap-1.5"><BookOpenCheck size={12} className="text-green-400" /> {s.masteredWords}</p>
                         </div>
                         <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                            <p className="text-[9px] text-slate-600 uppercase font-black tracking-tighter mb-1">Ngày tham gia</p>
                            <p className="text-white font-bold text-[10px] flex items-center gap-1.5"><Calendar size={12} className="text-blue-400" /> {new Date(s.joinedAt).toLocaleDateString('vi-VN')}</p>
                         </div>
                      </div>

                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                         <div 
                          className="h-full bg-blue-500 shadow-glow" 
                          style={{ width: `${(s.masteredWords / (s.totalWords || 1)) * 100}%` }} 
                         />
                      </div>
                      <p className="text-[9px] text-slate-600 text-right font-bold">TIẾN ĐỘ: {Math.round((s.masteredWords / (s.totalWords || 1)) * 100)}%</p>
                   </div>
                </CardContent>
             </Card>
           ))}

           {filteredStudents.length === 0 && !loading && (
             <div className="col-span-full py-32 text-center text-slate-700">
                <Users size={48} className="mx-auto mb-4 opacity-10" />
                <p className="font-bold uppercase tracking-widest text-xs">Không tìm thấy học viên phù hợp</p>
             </div>
           )}
        </div>
      </main>
    </div>
  );
}

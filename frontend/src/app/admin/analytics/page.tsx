'use client';

import React, { useState, useEffect } from 'react';
import { adminService } from '@/src/services/admin.service';
import Topbar from '@/src/components/shared/Topbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, Activity, Calendar } from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const result = await adminService.getAnalytics();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch analytics", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return <div className="p-10 text-white bg-[#080d1a] min-h-screen font-mono text-center">GENERATING INSIGHTS...</div>;
  }

  return (
    <div className="flex-1 flex flex-col bg-[#080d1a]">
      <Topbar title="Phân tích & Thống kê" role="admin" />
      
      <main className="p-6 space-y-6 overflow-auto max-w-6xl mx-auto w-full">
        {/* TREND CHART */}
        <Card className="bg-white/3 border-white/8 rounded-[32px] overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-white/5 bg-blue-600/5">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                   <Activity size={20} />
                </div>
                <div>
                   <CardTitle className="text-white text-lg font-black uppercase tracking-tighter">Hoạt động học tập</CardTitle>
                   <p className="text-slate-500 text-xs font-medium">Số lượt trả lời câu hỏi trong 7 ngày qua</p>
                </div>
             </div>
          </CardHeader>
          <CardContent className="p-8 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.dailyTrends || []}>
                <defs>
                  <linearGradient id="colorAttempts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="attempts" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorAttempts)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* PIE CHART */}
           <Card className="bg-white/3 border-white/8 rounded-[32px] overflow-hidden">
              <CardHeader className="p-8 border-b border-white/5">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                       <PieIcon size={20} />
                    </div>
                    <div>
                       <CardTitle className="text-white text-sm font-black uppercase tracking-widest">Phân bổ từ vựng</CardTitle>
                       <p className="text-slate-500 text-[10px]">Tỉ lệ theo loại từ (Part of Speech)</p>
                    </div>
                 </div>
              </CardHeader>
              <CardContent className="p-8 h-64 flex items-center">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                          data={data?.wordDistribution || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          animationDuration={1000}
                       >
                          {data?.wordDistribution?.map((entry: any, index: number) => (
                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                          ))}
                       </Pie>
                       <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }}
                       />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="space-y-2 ml-4">
                    {data?.wordDistribution?.map((d: any, i: number) => (
                       <div key={i} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{d.name}: {d.value}</span>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>

           {/* MILESTONE CARD */}
           <Card className="bg-white/3 border-white/8 rounded-[32px] p-10 flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/20">
                 <TrendingUp size={32} className="text-blue-400" />
              </div>
              <h3 className="text-white font-black text-2xl uppercase tracking-tighter mb-2">Tăng trưởng ổn định</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-[280px]">Hệ thống đang hoạt động với hiệu suất tối ưu. Tỉ lệ người dùng quay lại đạt mức 85% trong tuần này.</p>
              <div className="mt-8 pt-8 border-t border-white/5 w-full flex justify-around">
                 <div>
                    <p className="text-blue-400 font-black text-xl">+42%</p>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Học viên mới</p>
                 </div>
                 <div>
                    <p className="text-green-400 font-black text-xl">99.9%</p>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Uptime Server</p>
                 </div>
              </div>
           </Card>
        </div>
      </main>
    </div>
  );
}

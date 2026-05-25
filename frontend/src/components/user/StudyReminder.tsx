"use client";

import React, { useEffect, useState } from "react";
import { Bell, BellOff, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";

type ReminderSchedule = "none" | "morning" | "afternoon" | "evening";

const SCHEDULE_LABELS: Record<ReminderSchedule, string> = {
  none: "Tắt",
  morning: "Sáng (8:00)",
  afternoon: "Chiều (14:00)",
  evening: "Tối (20:00)",
};

const SCHEDULE_HOURS: Record<ReminderSchedule, number> = {
  none: -1,
  morning: 8,
  afternoon: 14,
  evening: 20,
};

export default function StudyReminder() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [schedule, setSchedule] = useState<ReminderSchedule>("none");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
    const saved = localStorage.getItem("studyReminderSchedule") as ReminderSchedule | null;
    if (saved && ["none", "morning", "afternoon", "evening"].includes(saved)) {
      setSchedule(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("studyReminderSchedule", schedule);

    if (schedule === "none" || permission !== "granted") return;

    const hour = SCHEDULE_HOURS[schedule];

    const timer = setInterval(() => {
      const currentHour = new Date().getHours();
      const currentMinute = new Date().getMinutes();

      if (currentHour === hour && currentMinute === 0) {
        sendStudyReminder(schedule);
      }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(timer);
  }, [schedule, permission]);

  const sendStudyReminder = (scheduled: ReminderSchedule) => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const label = SCHEDULE_LABELS[scheduled];
    new Notification("VocaBoost - Nhắc nhở học tập", {
      body: `Đã đến lúc học từ vựng! Hãy dành vài phút để ôn tập.`,
      icon: "/favicon.ico",
      tag: "vocab-study-reminder",
    });
  };

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("Trình duyệt của bạn không hỗ trợ thông báo.");
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        toast.success("Đã bật thông báo! Bạn sẽ nhận được nhắc nhở học tập.");
        // Send a test notification
        new Notification("VocaBoost", {
          body: "Thông báo đã được bật thành công!",
          icon: "/favicon.ico",
        });
      } else {
        toast.error("Bạn đã từ chối thông báo. Hãy bật lại trong cài đặt trình duyệt.");
      }
    } catch (error) {
      console.error("Failed to request notification permission", error);
    }
  };

  const handleScheduleChange = (newSchedule: ReminderSchedule) => {
    setSchedule(newSchedule);
    if (newSchedule !== "none") {
      const label = SCHEDULE_LABELS[newSchedule];
      toast.success(`Sẽ nhắc nhở bạn vào ${label.toLowerCase()}`);
    } else {
      toast.success("Đã tắt nhắc nhở học tập");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${
            permission === "granted"
              ? "bg-green-500/10 text-green-600 dark:text-green-400"
              : permission === "denied"
                ? "bg-red-500/10 text-red-600 dark:text-red-400"
                : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400"
          }`}>
            {permission === "granted" ? <Bell size={18} /> : <BellOff size={18} />}
          </div>
          <div>
            <p className="text-slate-900 dark:text-white font-bold text-sm">
              Nhắc nhở học tập
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              {permission === "granted"
                ? "Thông báo đã được bật"
                : permission === "denied"
                  ? "Thông báo đã bị từ chối"
                  : "Chưa được cấp quyền"}
            </p>
          </div>
        </div>

        {permission !== "granted" && permission !== "denied" && (
          <Button
            onClick={requestPermission}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 rounded-xl h-9 px-4 text-[10px] font-black uppercase tracking-widest"
          >
            Bật thông báo
          </Button>
        )}

        {permission === "denied" && (
          <p className="text-[10px] text-red-500 font-medium">
            Bật trong cài đặt trình duyệt
          </p>
        )}
      </div>

      {permission === "granted" && (
        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
            Lịch nhắc nhở
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(["none", "morning", "afternoon", "evening"] as ReminderSchedule[]).map((s) => (
              <button
                key={s}
                onClick={() => handleScheduleChange(s)}
                className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl border-2 text-xs font-bold transition-all ${
                  schedule === s
                    ? "bg-blue-600 border-blue-500 text-white shadow-lg"
                    : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-blue-500/30 hover:bg-blue-500/5"
                }`}
              >
                {s !== "none" && <Clock size={12} />}
                {SCHEDULE_LABELS[s]}
              </button>
            ))}
          </div>

          {schedule !== "none" && (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3">
              <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-2">
                <Bell size={12} />
                Bạn sẽ nhận được thông báo vào {SCHEDULE_LABELS[schedule].toLowerCase()} mỗi ngày.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

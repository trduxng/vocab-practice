"use client";

import { useMemo, useState } from "react";
import Topbar from "@/src/components/shared/Topbar";
import { AdminPage, AdminPanel, IconButton, KpiCard, StatusBadge, TableShell, ToolbarButton } from "@/src/components/admin/AdminPrimitives";
import { Archive, BookOpenCheck, CheckCircle2, Edit3, FileQuestion, Flag, FolderKanban, Layers3, Plus, Search, Tags, Trash2 } from "lucide-react";

type ContentStatus = "Published" | "Draft" | "Flagged";

interface LearningContent {
  id: string;
  title: string;
  type: "Quiz" | "Flashcards";
  category: string;
  tags: string[];
  cards: number;
  attempts: number;
  accuracy: number;
  status: ContentStatus;
  updated: string;
}

const initialContent: LearningContent[] = [
  { id: "QZ-2101", title: "IELTS Academic Word List", type: "Flashcards", category: "IELTS", tags: ["vocabulary", "band-7", "academic"], cards: 240, attempts: 18420, accuracy: 78, status: "Published", updated: "Today" },
  { id: "QZ-2108", title: "TOEIC Part 5 Grammar Drill", type: "Quiz", category: "TOEIC", tags: ["grammar", "timed", "business"], cards: 80, attempts: 14110, accuracy: 69, status: "Published", updated: "Yesterday" },
  { id: "QZ-2188", title: "Middle School Science Terms", type: "Flashcards", category: "K-12", tags: ["science", "biology"], cards: 130, attempts: 3210, accuracy: 74, status: "Draft", updated: "Apr 24" },
  { id: "QZ-2215", title: "Duplicated Business Idioms", type: "Quiz", category: "Business", tags: ["idioms", "reported"], cards: 55, attempts: 1890, accuracy: 44, status: "Flagged", updated: "Apr 22" },
  { id: "QZ-2230", title: "Vietnamese English Starter Set", type: "Flashcards", category: "Beginner", tags: ["starter", "pronunciation"], cards: 96, attempts: 7210, accuracy: 83, status: "Published", updated: "Apr 20" },
];

const reports = [
  { title: "Copied quiz questions", item: "Duplicated Business Idioms", reason: "Potential copyright violation", count: 11 },
  { title: "Incorrect answer key", item: "TOEIC Part 5 Grammar Drill", reason: "Question 18 disputed", count: 7 },
  { title: "Sensitive language", item: "Vietnamese English Starter Set", reason: "Community policy review", count: 3 },
];

const statusTone: Record<ContentStatus, "emerald" | "amber" | "rose"> = {
  Published: "emerald",
  Draft: "amber",
  Flagged: "rose",
};

export default function AdminCourses() {
  const [content, setContent] = useState(initialContent);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const categories = ["All", ...Array.from(new Set(content.map((item) => item.category)))];

  const filteredContent = useMemo(() => {
    return content.filter((item) => {
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      const matchesQuery = `${item.title} ${item.type} ${item.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [content, query, selectedCategory]);

  function addDraft() {
    setContent((current) => [
      { id: `QZ-${2300 + current.length}`, title: "Untitled learning set", type: "Quiz", category: "Drafts", tags: ["new"], cards: 0, attempts: 0, accuracy: 0, status: "Draft", updated: "Now" },
      ...current,
    ]);
  }

  function markPublished(id: string) {
    setContent((current) => current.map((item) => (item.id === id ? { ...item, status: "Published", updated: "Now" } : item)));
  }

  return (
    <>
      <Topbar title="Content management" subtitle="Manage quizzes, flashcards, categories, tagging, and reported content." role="admin" userName="Admin" />
      <AdminPage>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Published sets" value="14,382" change="+286 this month" icon={BookOpenCheck} tone="blue" />
          <KpiCard label="Flashcards" value="2.8M" change="+8.2%" icon={Layers3} tone="emerald" />
          <KpiCard label="Categories" value="48" change="+3 active" icon={FolderKanban} tone="violet" />
          <KpiCard label="Reports open" value="124" change="+19 today" trend="down" icon={Flag} tone="rose" />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <AdminPanel>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex h-10 flex-1 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 dark:border-white/10 dark:bg-white/5">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search quizzes, flashcards, tags" className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => <ToolbarButton key={category} active={selectedCategory === category} onClick={() => setSelectedCategory(category)}>{category}</ToolbarButton>)}
                  <ToolbarButton active onClick={addDraft}><Plus className="h-4 w-4" />Create</ToolbarButton>
                </div>
              </div>
            </AdminPanel>

            <TableShell>
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                  <tr><th className="px-4 py-3 font-medium">Content</th><th className="px-4 py-3 font-medium">Category</th><th className="px-4 py-3 font-medium">Tags</th><th className="px-4 py-3 font-medium">Activity</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                  {filteredContent.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5"><FileQuestion className="h-4 w-4 text-slate-500 dark:text-slate-300" /></div>
                          <div><p className="font-medium text-slate-950 dark:text-white">{item.title}</p><p className="text-xs text-slate-500 dark:text-slate-400">{item.type} · {item.cards} items · {item.updated}</p></div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{item.category}</td>
                      <td className="px-4 py-4"><div className="flex max-w-xs flex-wrap gap-1.5">{item.tags.map((tag) => <StatusBadge key={tag} tone="slate">#{tag}</StatusBadge>)}</div></td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300"><p>{item.attempts.toLocaleString()} attempts</p><p className="text-xs text-slate-500 dark:text-slate-400">{item.accuracy}% accuracy</p></td>
                      <td className="px-4 py-4"><StatusBadge tone={statusTone[item.status]}>{item.status}</StatusBadge></td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <IconButton label="Edit content"><Edit3 className="h-4 w-4" /></IconButton>
                          <IconButton label="Publish content" tone="emerald" onClick={() => markPublished(item.id)}><CheckCircle2 className="h-4 w-4" /></IconButton>
                          <IconButton label="Delete content" tone="rose" onClick={() => setContent((current) => current.filter((row) => row.id !== item.id))}><Trash2 className="h-4 w-4" /></IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>
          </div>

          <div className="space-y-5">
            <AdminPanel title="Tagging system" description="Top tags used across quiz and flashcard content." action={<Tags className="h-4 w-4 text-slate-400" />}>
              <div className="flex flex-wrap gap-2">{["ielts", "toeic", "grammar", "academic", "speaking", "business", "starter", "pronunciation"].map((tag) => <StatusBadge key={tag} tone="blue">#{tag}</StatusBadge>)}</div>
            </AdminPanel>
            <AdminPanel title="Moderation queue" description="Reported content waiting for review.">
              <div className="space-y-3">
                {reports.map((report) => (
                  <div key={report.title} className="rounded-md border border-slate-200 p-3 dark:border-white/10">
                    <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-slate-950 dark:text-white">{report.title}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{report.item}</p></div><StatusBadge tone="rose">{report.count}</StatusBadge></div>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{report.reason}</p>
                    <div className="mt-3 flex gap-2"><ToolbarButton><CheckCircle2 className="h-4 w-4" />Resolve</ToolbarButton><ToolbarButton><Archive className="h-4 w-4" />Hide</ToolbarButton></div>
                  </div>
                ))}
              </div>
            </AdminPanel>
          </div>
        </div>
      </AdminPage>
    </>
  );
}

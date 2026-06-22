'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Archive,
  Check,
  Download,
  Edit2,
  Eye,
  FileSpreadsheet,
  FolderTree,
  Layers3,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Tags,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import Topbar from '@/src/components/shared/Topbar';
import { AdminPage, AdminPanel, ConfirmDialog, IconButton, StatusBadge, TableShell, ToolbarButton } from '@/src/components/admin/AdminPrimitives';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
import { adminService, type PaginationMeta } from '@/src/services/admin.service';
import { aiService, type AiWordSuggestion } from '@/src/services/ai.service';
import { categoriesService } from '@/src/services/categories.service';
import { adminLabel } from '@/src/lib/admin-i18n';
import { usePermissions } from '@/src/modules/auth/hooks/usePermissions';
import { PERMISSIONS } from '@/src/modules/auth/types/permissions';

type ContentStatus = 'Draft' | 'PendingReview' | 'Published' | 'Rejected' | 'Archived';
type AdminTab = 'words' | 'topics' | 'categories' | 'import';
type SortBy = 'createdAt' | 'updatedAt' | 'term' | 'questionCount' | 'exampleCount';
type SortDirection = 'asc' | 'desc';
type PendingAction =
  | { kind: 'archiveWord'; item: WordItem | WordDetail }
  | { kind: 'hardDeleteWord'; item: WordItem | WordDetail }
  | { kind: 'deleteTopic'; item: TopicItem }
  | { kind: 'disableCategory'; item: TopicCategory };

type CategoryOption = {
  id: number;
  name: string;
  code?: string;
  description?: string;
};

type TopicCategory = CategoryOption & {
  iconUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
  topicCount?: number;
  wordCount?: number;
  updatedAt?: string;
};

type TopicItem = CategoryOption & {
  topicCategoryId?: number | null;
  categoryName?: string | null;
  status: ContentStatus;
  wordCount: number;
  miniTestCount?: number;
  updatedAt?: string;
};

type WordExample = {
  id?: number;
  sentence: string;
  meaning?: string;
};

type WordQuestion = {
  id: number;
  questionType: string;
  questionText: string;
  correctAnswer?: string;
  status: ContentStatus;
  updatedAt?: string;
};

type WordAuditLog = {
  id: number;
  action: string;
  details?: string;
  adminName?: string;
  createdAt?: string;
};

type WordItem = {
  id: number;
  term: string;
  meaning: string;
  phonetic?: string;
  partOfSpeechId: number;
  partOfSpeechName?: string;
  status: ContentStatus;
  topics?: CategoryOption[];
  examples?: WordExample[];
  questionCount?: number;
  exampleCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

type WordDetail = WordItem & {
  questions: WordQuestion[];
  auditLogs: WordAuditLog[];
  createdByName?: string;
};

type ImportPreviewRow = {
  row: number;
  valid: boolean;
  errors: string[];
  term: string;
  meaning: string;
  phonetic?: string;
  partOfSpeech?: CategoryOption | null;
  topics: CategoryOption[];
  examples: WordExample[];
};

type ImportPreview = {
  total: number;
  valid: number;
  invalid: number;
  rows: ImportPreviewRow[];
};

const tabs: Array<{ id: AdminTab; label: string; icon: React.ElementType }> = [
  { id: 'words', label: 'Từ vựng', icon: Layers3 },
  { id: 'topics', label: 'Chủ đề', icon: Tags },
  { id: 'categories', label: 'Danh mục', icon: FolderTree },
  { id: 'import', label: 'Nhập dữ liệu', icon: FileSpreadsheet },
];

const statusOptions: ContentStatus[] = ['Draft', 'PendingReview', 'Published', 'Rejected', 'Archived'];

const statusTone: Record<ContentStatus, 'slate' | 'blue' | 'emerald' | 'amber' | 'rose'> = {
  Draft: 'amber',
  PendingReview: 'blue',
  Published: 'emerald',
  Rejected: 'rose',
  Archived: 'slate',
};

function createEmptyWordForm() {
  return {
    term: '',
    meaning: '',
    phonetic: '',
    partOfSpeechId: '',
    status: 'Published' as ContentStatus,
    topicIds: [] as number[],
    examples: [{ sentence: '', meaning: '' }],
  };
}

const emptyTopicForm = {
  name: '',
  code: '',
  description: '',
  topicCategoryId: '',
  status: 'Published' as ContentStatus,
};

const emptyCategoryForm = {
  name: '',
  code: '',
  description: '',
  displayOrder: '',
  isActive: true,
};

function getErrorMessage(error: unknown, fallback: string) {
  return axios.isAxiosError(error) ? error.response?.data?.message || fallback : fallback;
}

function formatDate(value?: string) {
  if (!value) return 'Chưa có dữ liệu';
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function downloadBlob(content: BlobPart, fileName: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function getCanHardDelete() {
  if (typeof window === 'undefined') return false;
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return Array.isArray(user.permissions) && user.permissions.includes('MANAGE_SYSTEM_SETTINGS');
  } catch {
    return false;
  }
}

export default function AdminWordsPage() {
  const { hasAnyPermission } = usePermissions();
  const canManageTopicCategories = hasAnyPermission([PERMISSIONS.manageTopicCategories, PERMISSIONS.manageTopics]);
  const [activeTab, setActiveTab] = useState<AdminTab>('words');
  const [words, setWords] = useState<WordItem[]>([]);
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [topicCategories, setTopicCategories] = useState<TopicCategory[]>([]);
  const [partsOfSpeech, setPartOfSpeeches] = useState<CategoryOption[]>([]);
  const [loadingWords, setLoadingWords] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [wordsError, setWordsError] = useState('');
  const [topicsError, setTopicsError] = useState('');
  const [saving, setSaving] = useState(false);
  const [generatingSuggestion, setGeneratingSuggestion] = useState(false);
  const [importing, setImporting] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [showWordForm, setShowWordForm] = useState(false);
  const [editingWord, setEditingWord] = useState<WordItem | null>(null);
  const [selectedWord, setSelectedWord] = useState<WordDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [editingTopic, setEditingTopic] = useState<TopicItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<TopicCategory | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [selectedPartOfSpeechId, setSelectedPartOfSpeechId] = useState('');
  const [wordStatus, setWordStatus] = useState('');
  const [missingExamples, setMissingExamples] = useState(false);
  const [missingQuestions, setMissingQuestions] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [wordSearch, setWordSearch] = useState('');
  const [topicSearch, setTopicSearch] = useState('');
  const [topicStatus, setTopicStatus] = useState('');
  const [topicCategoryFilter, setTopicCategoryFilter] = useState('');
  const [wordPage, setWordPage] = useState(1);
  const [wordPagination, setWordPagination] = useState<PaginationMeta | null>(null);
  const [topicPage, setTopicPage] = useState(1);
  const [topicPagination, setTopicPagination] = useState<PaginationMeta | null>(null);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [importPayload, setImportPayload] = useState<unknown[] | string | null>(null);
  const [canHardDelete, setCanHardDelete] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [confirming, setConfirming] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pageSize = 20;

  const [wordForm, setWordForm] = useState(createEmptyWordForm);
  const [topicForm, setTopicForm] = useState(emptyTopicForm);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);

  const activeTopics = useMemo(() => topics.filter((topic) => topic.status !== 'Archived'), [topics]);

  const fetchReferenceData = useCallback(async () => {
    try {
      const [posData, categoryData] = await Promise.all([
        categoriesService.getPartOfSpeeches(),
        adminService.getTopicCategories<TopicCategory>(),
      ]);
      setPartOfSpeeches(posData);
      setTopicCategories(categoryData);
    } catch (error) {
      console.error('Không thể tải dữ liệu tham chiếu', error);
      toast.error('Không thể tải dữ liệu danh mục');
    }
  }, []);

  const fetchTopics = useCallback(async () => {
    setLoadingTopics(true);
    setTopicsError('');
    try {
      const response = await adminService.getTopicsPage<TopicItem>(topicPage, 50, {
        search: topicSearch.trim(),
        status: topicStatus,
        categoryId: topicCategoryFilter,
      });
      setTopics(response.items);
      setTopicPagination(response.pagination);
    } catch (error) {
      console.error('Không thể tải chủ đề', error);
      const message = getErrorMessage(error, 'Không thể tải chủ đề');
      setTopicsError(message);
      toast.error(message);
    } finally {
      setLoadingTopics(false);
    }
  }, [topicCategoryFilter, topicPage, topicSearch, topicStatus]);

  const fetchWords = useCallback(async () => {
    setLoadingWords(true);
    setWordsError('');
    try {
      const response = await adminService.getWordsPage<WordItem>(wordPage, pageSize, {
        topicId: selectedTopicId,
        partOfSpeechId: selectedPartOfSpeechId,
        status: wordStatus,
        missingExamples,
        missingQuestions,
        sortBy,
        sortDirection,
        search: wordSearch.trim(),
      });
      setWords(response.items);
      setWordPagination(response.pagination);
    } catch (error) {
      console.error('Không thể tải từ vựng', error);
      const message = getErrorMessage(error, 'Không thể tải từ vựng');
      setWordsError(message);
      toast.error(message);
    } finally {
      setLoadingWords(false);
    }
  }, [missingExamples, missingQuestions, selectedPartOfSpeechId, selectedTopicId, sortBy, sortDirection, wordPage, wordSearch, wordStatus]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanHardDelete(getCanHardDelete());
    fetchReferenceData();
  }, [fetchReferenceData]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTopics();
  }, [fetchTopics]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchWords();
  }, [fetchWords]);

  function resetWordForm() {
    setEditingWord(null);
    setWordForm(createEmptyWordForm());
    setShowWordForm(false);
  }

  function resetWordFilters() {
    setSelectedTopicId('');
    setSelectedPartOfSpeechId('');
    setWordStatus('');
    setMissingExamples(false);
    setMissingQuestions(false);
    setSortBy('createdAt');
    setSortDirection('desc');
    setWordSearch('');
    setWordPage(1);
  }

  function handleEditWord(word: WordItem) {
    const examples = word.examples ?? [];
    setEditingWord(word);
    setWordForm({
      term: word.term,
      meaning: word.meaning,
      phonetic: word.phonetic || '',
      partOfSpeechId: String(word.partOfSpeechId),
      status: word.status || 'Published',
      topicIds: word.topics?.map((topic) => topic.id) || [],
      examples: examples.length > 0
        ? examples.map((example) => ({ sentence: example.sentence, meaning: example.meaning || '' }))
        : [{ sentence: '', meaning: '' }],
    });
    setShowWordForm(true);
    setActiveTab('words');
  }

  async function openWordDetail(wordId: number) {
    setLoadingDetail(true);
    try {
      const detail = await adminService.getWordDetail<WordDetail>(wordId);
      setSelectedWord(detail);
    } catch (error) {
      console.error('Không thể tải chi tiết từ vựng', error);
      toast.error(getErrorMessage(error, 'Không thể tải chi tiết từ vựng'));
    } finally {
      setLoadingDetail(false);
    }
  }

  function applyAiSuggestion(suggestion: AiWordSuggestion) {
    const suggestedPartOfSpeech = suggestion.partOfSpeech?.toLowerCase();
    const matchedPartOfSpeech = suggestedPartOfSpeech
      ? partsOfSpeech.find((part) => {
          const name = part.name.toLowerCase();
          return name === suggestedPartOfSpeech || name.includes(suggestedPartOfSpeech) || suggestedPartOfSpeech.includes(name);
        })
      : null;

    setWordForm((current) => ({
      ...current,
      term: current.term.trim() || suggestion.term,
      meaning: suggestion.meaning || current.meaning,
      phonetic: suggestion.phonetic || current.phonetic,
      partOfSpeechId: current.partOfSpeechId || (matchedPartOfSpeech ? String(matchedPartOfSpeech.id) : current.partOfSpeechId),
      examples: suggestion.examples.length > 0
        ? suggestion.examples.map((example) => ({
            sentence: example.sentence,
            meaning: example.meaning || '',
          }))
        : current.examples,
    }));
  }

  async function handleSuggestWordContent() {
    const term = wordForm.term.trim();
    if (!term) {
      toast.error('Vui lòng nhập từ vựng trước khi dùng AI');
      return;
    }

    setGeneratingSuggestion(true);
    try {
      const partOfSpeech = partsOfSpeech.find((part) => String(part.id) === wordForm.partOfSpeechId)?.name;
      const suggestion = await aiService.suggestWordContent({
        term,
        meaning: wordForm.meaning.trim() || undefined,
        partOfSpeech,
        exampleCount: 3,
      });

      applyAiSuggestion(suggestion);
      toast.success('AI đã gợi ý nội dung cho từ vựng');
    } catch (error) {
      console.error('Không thể lấy gợi ý từ AI', error);
      toast.error(getErrorMessage(error, 'Không thể tạo gợi ý AI'));
    } finally {
      setGeneratingSuggestion(false);
    }
  }

  async function handleSaveWord(event: React.FormEvent) {
    event.preventDefault();
    if (!wordForm.term.trim() || !wordForm.meaning.trim()) {
      toast.error('Từ vựng và nghĩa là bắt buộc');
      return;
    }
    if (wordForm.term.trim().length > 200 || wordForm.meaning.trim().length > 2000) {
      toast.error('Từ vựng hoặc nghĩa vượt quá độ dài cho phép');
      return;
    }
    const partOfSpeechId = Number(wordForm.partOfSpeechId);
    if (!partOfSpeechId) {
      toast.error('Vui lòng chọn loại từ');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        term: wordForm.term.trim(),
        meaning: wordForm.meaning.trim(),
        phonetic: wordForm.phonetic.trim(),
        partOfSpeechId,
        status: wordForm.status,
        topicIds: wordForm.topicIds,
        examples: wordForm.examples
          .map((example) => ({ sentence: example.sentence.trim(), meaning: example.meaning.trim() }))
          .filter((example) => example.sentence),
      };

      if (editingWord) {
        await adminService.updateWord(editingWord.id, payload);
        toast.success('Cập nhật từ vựng thành công');
      } else {
        await adminService.createWord(payload);
        toast.success('Thêm từ vựng thành công');
      }

      resetWordForm();
      fetchWords();
      fetchTopics();
    } catch (error) {
      console.error('Không thể lưu từ vựng', error);
      toast.error(getErrorMessage(error, 'Lỗi khi lưu từ vựng'));
    } finally {
      setSaving(false);
    }
  }

  async function handleArchiveWord(word: WordItem) {
    try {
      await adminService.deleteWord(word.id);
      toast.success('Đã lưu trữ từ vựng');
      fetchWords();
      fetchTopics();
      if (selectedWord?.id === word.id) setSelectedWord(null);
    } catch (error) {
      console.error('Không thể lưu trữ từ vựng', error);
      toast.error(getErrorMessage(error, 'Lưu trữ từ vựng thất bại'));
    }
  }

  async function handleHardDeleteWord(word: WordItem | WordDetail) {
    try {
      await adminService.hardDeleteWord(word.id);
      toast.success('Xóa vĩnh viễn từ vựng thành công');
      fetchWords();
      fetchTopics();
      if (selectedWord?.id === word.id) setSelectedWord(null);
    } catch (error) {
      console.error('Không thể xóa vĩnh viễn từ vựng', error);
      toast.error(getErrorMessage(error, 'Bạn không có quyền xóa vĩnh viễn hoặc thao tác thất bại'));
    }
  }

  function startEditTopic(topic: TopicItem) {
    setEditingTopic(topic);
    setTopicForm({
      name: topic.name,
      code: topic.code || '',
      description: topic.description || '',
      topicCategoryId: topic.topicCategoryId ? String(topic.topicCategoryId) : '',
      status: topic.status,
    });
    setActiveTab('topics');
  }

  function resetTopicForm() {
    setEditingTopic(null);
    setTopicForm(emptyTopicForm);
  }

  async function handleSaveTopic(event: React.FormEvent) {
    event.preventDefault();
    const name = topicForm.name.trim();
    if (!name) {
      toast.error('Vui lòng nhập tên chủ đề');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        code: topicForm.code.trim() || undefined,
        description: topicForm.description.trim() || undefined,
        topicCategoryId: topicForm.topicCategoryId ? Number(topicForm.topicCategoryId) : null,
        status: topicForm.status,
      };

      if (editingTopic) {
        await adminService.updateTopic(editingTopic.id, payload);
        toast.success('Cập nhật chủ đề thành công');
      } else {
        await adminService.createTopic(payload);
        toast.success('Tạo chủ đề thành công');
      }

      resetTopicForm();
      fetchTopics();
      fetchReferenceData();
    } catch (error) {
      console.error('Không thể lưu chủ đề', error);
      toast.error(getErrorMessage(error, 'Lưu chủ đề thất bại'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTopic(topic: TopicItem) {
    try {
      const result = await adminService.deleteTopic(topic.id);
      toast.success(result.archived ? 'Đã lưu trữ chủ đề vì đang có nội dung liên quan' : 'Xóa chủ đề thành công');
      fetchTopics();
      fetchReferenceData();
    } catch (error) {
      console.error('Không thể xóa chủ đề', error);
      toast.error(getErrorMessage(error, 'Xóa chủ đề thất bại'));
    }
  }

  function startEditCategory(category: TopicCategory) {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      code: category.code || '',
      description: category.description || '',
      displayOrder: category.displayOrder ? String(category.displayOrder) : '',
      isActive: Boolean(category.isActive),
    });
    setActiveTab('categories');
  }

  function resetCategoryForm() {
    setEditingCategory(null);
    setCategoryForm(emptyCategoryForm);
  }

  async function handleSaveCategory(event: React.FormEvent) {
    event.preventDefault();
    const name = categoryForm.name.trim();
    if (!name) {
      toast.error('Vui lòng nhập tên danh mục');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        code: categoryForm.code.trim() || undefined,
        description: categoryForm.description.trim() || undefined,
        displayOrder: categoryForm.displayOrder ? Number(categoryForm.displayOrder) : undefined,
        isActive: categoryForm.isActive,
      };

      if (editingCategory) {
        await adminService.updateTopicCategory(editingCategory.id, payload);
        toast.success('Cập nhật danh mục thành công');
      } else {
        await adminService.createTopicCategory(payload);
        toast.success('Tạo danh mục thành công');
      }

      resetCategoryForm();
      fetchReferenceData();
      fetchTopics();
    } catch (error) {
      console.error('Không thể lưu danh mục', error);
      toast.error(getErrorMessage(error, 'Lưu danh mục thất bại'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDisableCategory(category: TopicCategory) {
    try {
      await adminService.deleteTopicCategory(category.id);
      toast.success('Đã tắt danh mục chủ đề');
      fetchReferenceData();
      fetchTopics();
    } catch (error) {
      console.error('Không thể tắt danh mục', error);
      toast.error(getErrorMessage(error, 'Tắt danh mục thất bại'));
    }
  }

  async function confirmPendingAction() {
    if (!pendingAction) return;
    setConfirming(true);
    try {
      if (pendingAction.kind === 'archiveWord') await handleArchiveWord(pendingAction.item);
      if (pendingAction.kind === 'hardDeleteWord') await handleHardDeleteWord(pendingAction.item);
      if (pendingAction.kind === 'deleteTopic') await handleDeleteTopic(pendingAction.item);
      if (pendingAction.kind === 'disableCategory') await handleDisableCategory(pendingAction.item);
      setPendingAction(null);
    } finally {
      setConfirming(false);
    }
  }

  async function readImportFile(file: File) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'csv' || file.type === 'text/csv') return file.text();
    if (extension === 'xlsx' || extension === 'xls') {
      const XLSX = await import('xlsx');
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      return XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });
    }
    throw new Error('Vui lòng chọn file CSV, XLS hoặc XLSX');
  }

  async function handlePreviewFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setPreviewing(true);
    setImportPreview(null);
    setImportPayload(null);
    try {
      const payload = await readImportFile(file);
      if (Array.isArray(payload) && payload.length === 0) {
      toast.error('Tệp không có dữ liệu để nhập');
        return;
      }

      const preview = await adminService.previewImportWords(payload) as ImportPreview;
      setImportPayload(payload);
      setImportPreview(preview);
      if (preview.invalid > 0) {
        toast.warning(`Bản xem trước có ${preview.invalid} dòng lỗi cần sửa`);
      } else {
        toast.success(`Có ${preview.valid} dòng hợp lệ`);
      }
    } catch (error) {
      console.error('Không thể xem trước dữ liệu nhập', error);
      toast.error(getErrorMessage(error, error instanceof Error ? error.message : 'Xem trước dữ liệu nhập thất bại'));
    } finally {
      setPreviewing(false);
    }
  }

  async function handleConfirmImport() {
    if (!importPayload || !importPreview) return;
    if (importPreview.invalid > 0) {
      toast.error('Vui lòng sửa các dòng lỗi trước khi nhập');
      return;
    }

    setImporting(true);
    try {
      const result = await adminService.bulkImportWords(importPayload);
      const message = `Nhập thành công ${result.success || 0} dòng, lỗi ${result.failed || 0} dòng`;
      if (result.failed > 0) {
        toast.warning(message);
      } else {
        toast.success(message);
      }
      setImportPayload(null);
      setImportPreview(null);
      fetchWords();
      fetchTopics();
    } catch (error) {
      console.error('Không thể nhập từ vựng', error);
      toast.error(getErrorMessage(error, 'Nhập từ vựng thất bại'));
    } finally {
      setImporting(false);
    }
  }

  function downloadCsvTemplate() {
    const csv = 'term,meaning,phonetic,partOfSpeech,topics,exampleSentence,exampleMeaning\nexample,ví dụ,/ɪɡˈzæmpəl/,noun,General,This is an example.,Đây là một ví dụ.\n';
    downloadBlob(csv, 'word-import-template.csv', 'text/csv;charset=utf-8');
  }

  async function downloadXlsxTemplate() {
    const XLSX = await import('xlsx');
    const rows = [{ term: 'example', meaning: 'ví dụ', phonetic: '/ɪɡˈzæmpəl/', partOfSpeech: 'noun', topics: 'General', exampleSentence: 'This is an example.', exampleMeaning: 'Đây là một ví dụ.' }];
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Words');
    const data = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    downloadBlob(data, 'word-import-template.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  }

  return (
    <div className="flex flex-1 flex-col bg-[#080d1a]">
      <Topbar title="Quản lý từ vựng" subtitle="Quản lý từ, chủ đề, danh mục và nhập dữ liệu học tập." role="admin" />
      <AdminPage>
        <AdminPanel>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              {tabs.filter((tab) => tab.id !== 'categories' || canManageTopicCategories).map((tab) => {
                const Icon = tab.icon;
                return (
                  <ToolbarButton key={tab.id} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)}>
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </ToolbarButton>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 sm:grid-cols-4">
              <span><b className="text-white">{wordPagination?.total || 0}</b> từ</span>
              <span><b className="text-white">{topicPagination?.total || topics.length}</b> chủ đề</span>
              <span><b className="text-white">{topicCategories.length}</b> danh mục</span>
              <span><b className="text-white">{topics.filter((topic) => topic.status === 'Published').length}</b> đã xuất bản</span>
            </div>
          </div>
        </AdminPanel>

        {activeTab === 'words' && (
          <div className="space-y-5">
            <AdminPanel>
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(220px,1fr)_repeat(6,auto)] xl:items-center">
                <div className="relative min-w-56">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input value={wordSearch} onChange={(event) => { setWordSearch(event.target.value); setWordPage(1); }} className="h-10 rounded-md border-white/10 bg-white/5 pl-10 text-white" placeholder="Tìm từ, nghĩa, phiên âm..." />
                </div>
                <Select value={selectedTopicId} onChange={(value) => { setSelectedTopicId(value); setWordPage(1); }}>
                  <option value="">Tất cả chủ đề</option>
                  {activeTopics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
                </Select>
                <Select value={selectedPartOfSpeechId} onChange={(value) => { setSelectedPartOfSpeechId(value); setWordPage(1); }}>
                  <option value="">Tất cả loại từ</option>
                  {partsOfSpeech.map((part) => <option key={part.id} value={part.id}>{adminLabel(part.name)}</option>)}
                </Select>
                <Select value={wordStatus} onChange={(value) => { setWordStatus(value); setWordPage(1); }}>
                  <option value="">Tất cả trạng thái</option>
                  {statusOptions.map((status) => <option key={status} value={status}>{adminLabel(status)}</option>)}
                </Select>
                <Select value={sortBy} onChange={(value) => { setSortBy(value as SortBy); setWordPage(1); }}>
                  <option value="createdAt">Mới tạo</option>
                  <option value="updatedAt">Mới cập nhật</option>
                  <option value="term">A-Z</option>
                  <option value="questionCount">Số câu hỏi</option>
                  <option value="exampleCount">Số ví dụ</option>
                </Select>
                <Select value={sortDirection} onChange={(value) => { setSortDirection(value as SortDirection); setWordPage(1); }}>
                  <option value="desc">Giảm dần</option>
                  <option value="asc">Tăng dần</option>
                </Select>
                <div className="flex flex-wrap gap-2">
                  <label className="flex h-10 items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 text-xs text-slate-300"><input type="checkbox" checked={missingExamples} onChange={(event) => { setMissingExamples(event.target.checked); setWordPage(1); }} /> Thiếu ví dụ</label>
                  <label className="flex h-10 items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 text-xs text-slate-300"><input type="checkbox" checked={missingQuestions} onChange={(event) => { setMissingQuestions(event.target.checked); setWordPage(1); }} /> Chưa có câu hỏi</label>
                  <IconButton label="Xóa bộ lọc" onClick={resetWordFilters}><X className="h-4 w-4" /></IconButton>
                  <ToolbarButton onClick={() => setActiveTab('import')}><Upload className="h-4 w-4" />Nhập dữ liệu</ToolbarButton>
                  <ToolbarButton active onClick={() => { resetWordForm(); setShowWordForm(true); }}><Plus className="h-4 w-4" />Thêm từ</ToolbarButton>
                </div>
              </div>
            </AdminPanel>

            {showWordForm && (
              <AdminPanel title={editingWord ? `Chỉnh sửa: ${editingWord.term}` : 'Thêm từ vựng mới'} description="Nhập nghĩa, trạng thái, loại từ, chủ đề và các câu ví dụ dùng trong bài học.">
                <form onSubmit={handleSaveWord} className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Field label="Từ vựng"><Input value={wordForm.term} onChange={(event) => setWordForm({ ...wordForm, term: event.target.value })} className="h-10 rounded-md" required /></Field>
                    <Field label="Phiên âm"><Input value={wordForm.phonetic} onChange={(event) => setWordForm({ ...wordForm, phonetic: event.target.value })} className="h-10 rounded-md" /></Field>
                    <Field label="Loại từ">
                      <Select value={wordForm.partOfSpeechId} onChange={(value) => setWordForm({ ...wordForm, partOfSpeechId: value })} required>
                        <option value="">Chọn loại từ</option>
                        {partsOfSpeech.map((part) => <option key={part.id} value={part.id}>{adminLabel(part.name)}</option>)}
                      </Select>
                    </Field>
                    <Field label="Trạng thái">
                      <Select value={wordForm.status} onChange={(value) => setWordForm({ ...wordForm, status: value as ContentStatus })}>
                        {statusOptions.map((status) => <option key={status} value={status}>{adminLabel(status)}</option>)}
                      </Select>
                    </Field>
                  </div>
                  <div className="flex justify-end">
                    <Button type="button" variant="outline" disabled={!wordForm.term.trim() || generatingSuggestion} onClick={handleSuggestWordContent} className="rounded-md">
                      <Sparkles className="h-4 w-4" /> {generatingSuggestion ? 'AI đang gợi ý...' : 'AI gợi ý nghĩa và câu TOEIC'}
                    </Button>
                  </div>
                  <Field label="Định nghĩa"><Input value={wordForm.meaning} onChange={(event) => setWordForm({ ...wordForm, meaning: event.target.value })} className="h-10 rounded-md" required /></Field>
                  <Field label="Chủ đề">
                    <div className="flex flex-wrap gap-2 rounded-md border border-slate-200 p-3 dark:border-white/10">
                      {activeTopics.map((topic) => (
                        <label key={topic.id} className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium ${wordForm.topicIds.includes(topic.id) ? 'border-blue-500/50 bg-blue-500/10 text-blue-300' : 'border-white/10 bg-white/5 text-slate-400'}`}>
                          <input type="checkbox" className="hidden" checked={wordForm.topicIds.includes(topic.id)} onChange={(event) => {
                            const topicIds = event.target.checked ? [...wordForm.topicIds, topic.id] : wordForm.topicIds.filter((id) => id !== topic.id);
                            setWordForm({ ...wordForm, topicIds });
                          }} />
                          {topic.name}
                          {wordForm.topicIds.includes(topic.id) && <Check className="h-3 w-3" />}
                        </label>
                      ))}
                    </div>
                  </Field>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Câu ví dụ</label>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setWordForm({ ...wordForm, examples: [...wordForm.examples, { sentence: '', meaning: '' }] })}>Thêm ví dụ</Button>
                    </div>
                    {wordForm.examples.map((example, index) => (
                      <div key={index} className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]">
                        <Input placeholder="Câu tiếng Anh" value={example.sentence} onChange={(event) => {
                          const examples = [...wordForm.examples];
                          examples[index].sentence = event.target.value;
                          setWordForm({ ...wordForm, examples });
                        }} className="h-10 rounded-md" />
                        <Input placeholder="Nghĩa tiếng Việt" value={example.meaning} onChange={(event) => {
                          const examples = [...wordForm.examples];
                          examples[index].meaning = event.target.value;
                          setWordForm({ ...wordForm, examples });
                        }} className="h-10 rounded-md" />
                        <IconButton label="Xóa ví dụ" tone="rose" onClick={() => setWordForm({ ...wordForm, examples: wordForm.examples.filter((_, itemIndex) => itemIndex !== index) })}><X className="h-4 w-4" /></IconButton>
                      </div>
                    ))}
                  </div>
                  <FormActions saving={saving} onCancel={resetWordForm} submitLabel={editingWord ? 'Cập nhật từ' : 'Lưu từ'} />
                </form>
              </AdminPanel>
            )}

            <TableShell>
              <table className="w-full min-w-[1080px] text-left text-sm">
                <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-slate-400">
                  <tr><th className="px-4 py-3">Từ vựng</th><th className="px-4 py-3">Loại</th><th className="px-4 py-3">Định nghĩa</th><th className="px-4 py-3">Chủ đề</th><th className="px-4 py-3">Mức độ bao phủ</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3 text-right">Thao tác</th></tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {loadingWords ? (
                    <EmptyRow colSpan={7} text="Đang tải từ vựng..." />
                  ) : wordsError ? (
                    <ErrorRow colSpan={7} text={wordsError} onRetry={() => void fetchWords()} />
                  ) : words.length === 0 ? (
                    <EmptyRow colSpan={7} text="Chưa có từ vựng phù hợp." />
                  ) : words.map((word) => (
                    <tr key={word.id} className="hover:bg-white/5">
                      <td className="px-4 py-4"><p className="font-semibold text-white">{word.term}</p><p className="text-xs text-slate-500">{word.phonetic || 'Chưa có phiên âm'} · {formatDate(word.updatedAt || word.createdAt)}</p></td>
                      <td className="px-4 py-4"><StatusBadge tone="blue">{word.partOfSpeechName ? adminLabel(word.partOfSpeechName) : 'Chưa có'}</StatusBadge></td>
                      <td className="max-w-md px-4 py-4 text-slate-300">{word.meaning}</td>
                      <td className="px-4 py-4"><div className="flex flex-wrap gap-1.5">{word.topics?.map((topic) => <StatusBadge key={topic.id}>{topic.name}</StatusBadge>)}</div></td>
                      <td className="px-4 py-4 text-slate-300"><p>{Number(word.exampleCount || 0)} ví dụ</p><p className="text-xs text-slate-500">{Number(word.questionCount || 0)} câu hỏi</p></td>
                      <td className="px-4 py-4"><StatusBadge tone={statusTone[word.status] || 'slate'}>{adminLabel(word.status)}</StatusBadge></td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <IconButton label="Xem chi tiết" onClick={() => openWordDetail(word.id)}><Eye className="h-4 w-4" /></IconButton>
                          <IconButton label="Sửa từ" onClick={() => handleEditWord(word)}><Edit2 className="h-4 w-4" /></IconButton>
                          <IconButton label="Lưu trữ từ" tone="rose" onClick={() => setPendingAction({ kind: 'archiveWord', item: word })}><Archive className="h-4 w-4" /></IconButton>
                          {canHardDelete && <IconButton label="Xóa vĩnh viễn" tone="rose" onClick={() => setPendingAction({ kind: 'hardDeleteWord', item: word })}><Trash2 className="h-4 w-4" /></IconButton>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>
            <PaginationBar pagination={wordPagination} loading={loadingWords} itemLabel="từ vựng" currentCount={words.length} onPrevious={() => setWordPage((value) => Math.max(1, value - 1))} onNext={() => setWordPage((value) => Math.min(wordPagination?.totalPages || 1, value + 1))} />
          </div>
        )}

        {activeTab === 'topics' && (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
            <AdminPanel title={editingTopic ? 'Sửa chủ đề' : 'Tạo chủ đề'} description="Quản lý tên, mã, mô tả, danh mục và trạng thái xuất bản.">
              <form onSubmit={handleSaveTopic} className="space-y-4">
                <Field label="Tên chủ đề"><Input value={topicForm.name} onChange={(event) => setTopicForm({ ...topicForm, name: event.target.value })} className="h-10 rounded-md" required /></Field>
                <Field label="Mã chủ đề"><Input value={topicForm.code} onChange={(event) => setTopicForm({ ...topicForm, code: event.target.value })} className="h-10 rounded-md" placeholder="Tự tạo nếu bỏ trống" /></Field>
                <Field label="Mô tả"><Textarea value={topicForm.description} onChange={(event) => setTopicForm({ ...topicForm, description: event.target.value })} className="rounded-md" /></Field>
                <Field label="Danh mục">
                  <Select value={topicForm.topicCategoryId} onChange={(value) => setTopicForm({ ...topicForm, topicCategoryId: value })}>
                    <option value="">Không gán danh mục</option>
                    {topicCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </Select>
                </Field>
                <Field label="Trạng thái">
                  <Select value={topicForm.status} onChange={(value) => setTopicForm({ ...topicForm, status: value as ContentStatus })}>
                    {statusOptions.map((status) => <option key={status} value={status}>{adminLabel(status)}</option>)}
                  </Select>
                </Field>
                <FormActions saving={saving} onCancel={resetTopicForm} submitLabel={editingTopic ? 'Cập nhật chủ đề' : 'Tạo chủ đề'} />
              </form>
            </AdminPanel>

            <div className="space-y-4">
              <AdminPanel>
                <div className="flex flex-wrap gap-3">
                  <div className="relative min-w-64 flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <Input value={topicSearch} onChange={(event) => { setTopicSearch(event.target.value); setTopicPage(1); }} className="h-10 rounded-md pl-10" placeholder="Tìm chủ đề..." />
                  </div>
                  <Select value={topicCategoryFilter} onChange={(value) => { setTopicCategoryFilter(value); setTopicPage(1); }}>
                    <option value="">Tất cả danh mục</option>
                    {topicCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </Select>
                  <Select value={topicStatus} onChange={(value) => { setTopicStatus(value); setTopicPage(1); }}>
                    <option value="">Tất cả trạng thái</option>
                    {statusOptions.map((status) => <option key={status} value={status}>{adminLabel(status)}</option>)}
                  </Select>
                  <IconButton label="Tải lại" onClick={() => { fetchTopics(); fetchReferenceData(); }}><RefreshCw className="h-4 w-4" /></IconButton>
                </div>
              </AdminPanel>

              <TableShell>
                <table className="w-full min-w-[920px] text-left text-sm">
                  <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-slate-400">
                    <tr><th className="px-4 py-3">Chủ đề</th><th className="px-4 py-3">Danh mục</th><th className="px-4 py-3">Số từ</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Cập nhật</th><th className="px-4 py-3 text-right">Thao tác</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {loadingTopics ? (
                      <EmptyRow colSpan={6} text="Đang tải chủ đề..." />
                    ) : topicsError ? (
                      <ErrorRow colSpan={6} text={topicsError} onRetry={() => void fetchTopics()} />
                    ) : topics.length === 0 ? (
                      <EmptyRow colSpan={6} text="Chưa có chủ đề phù hợp." />
                    ) : topics.map((topic) => (
                      <tr key={topic.id} className="hover:bg-white/5">
                        <td className="px-4 py-4"><p className="font-semibold text-white">{topic.name}</p><p className="text-xs text-slate-500">{topic.code || 'Chưa có mã'} · {topic.description || 'Chưa có mô tả'}</p></td>
                        <td className="px-4 py-4 text-slate-300">{topic.categoryName || 'Chưa phân loại'}</td>
                        <td className="px-4 py-4 text-slate-300">{Number(topic.wordCount || 0).toLocaleString('vi-VN')} từ</td>
                        <td className="px-4 py-4"><StatusBadge tone={statusTone[topic.status]}>{adminLabel(topic.status)}</StatusBadge></td>
                        <td className="px-4 py-4 text-slate-400">{formatDate(topic.updatedAt)}</td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <IconButton label="Sửa chủ đề" onClick={() => startEditTopic(topic)}><Edit2 className="h-4 w-4" /></IconButton>
                            <IconButton label={topic.wordCount > 0 ? 'Lưu trữ chủ đề' : 'Xóa chủ đề'} tone="rose" onClick={() => setPendingAction({ kind: 'deleteTopic', item: topic })}>{topic.wordCount > 0 ? <Archive className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}</IconButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableShell>
              <PaginationBar pagination={topicPagination} loading={loadingTopics} itemLabel="chủ đề" currentCount={topics.length} onPrevious={() => setTopicPage((value) => Math.max(1, value - 1))} onNext={() => setTopicPage((value) => Math.min(topicPagination?.totalPages || 1, value + 1))} />
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
            <AdminPanel title={editingCategory ? 'Sửa danh mục' : 'Tạo danh mục'} description="Nhóm chủ đề để quản trị viên lọc và tổ chức kho từ vựng.">
              <form onSubmit={handleSaveCategory} className="space-y-4">
                <Field label="Tên danh mục"><Input value={categoryForm.name} onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })} className="h-10 rounded-md" required /></Field>
                <Field label="Mã danh mục"><Input value={categoryForm.code} onChange={(event) => setCategoryForm({ ...categoryForm, code: event.target.value })} className="h-10 rounded-md" placeholder="Tự tạo nếu bỏ trống" /></Field>
                <Field label="Mô tả"><Textarea value={categoryForm.description} onChange={(event) => setCategoryForm({ ...categoryForm, description: event.target.value })} className="rounded-md" /></Field>
                <Field label="Thứ tự hiển thị"><Input type="number" min={1} value={categoryForm.displayOrder} onChange={(event) => setCategoryForm({ ...categoryForm, displayOrder: event.target.value })} className="h-10 rounded-md" /></Field>
                <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={categoryForm.isActive} onChange={(event) => setCategoryForm({ ...categoryForm, isActive: event.target.checked })} /> Đang hoạt động</label>
                <FormActions saving={saving} onCancel={resetCategoryForm} submitLabel={editingCategory ? 'Cập nhật danh mục' : 'Tạo danh mục'} />
              </form>
            </AdminPanel>

            <TableShell>
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-slate-400">
                  <tr><th className="px-4 py-3">Danh mục</th><th className="px-4 py-3">Chủ đề</th><th className="px-4 py-3">Từ vựng</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3 text-right">Thao tác</th></tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {topicCategories.length === 0 ? (
                    <EmptyRow colSpan={5} text="Chưa có danh mục chủ đề." />
                  ) : topicCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-white/5">
                      <td className="px-4 py-4"><p className="font-semibold text-white">{category.name}</p><p className="text-xs text-slate-500">{category.code || 'Chưa có mã'} · {category.description || 'Chưa có mô tả'}</p></td>
                      <td className="px-4 py-4 text-slate-300">{Number(category.topicCount || 0).toLocaleString('vi-VN')}</td>
                      <td className="px-4 py-4 text-slate-300">{Number(category.wordCount || 0).toLocaleString('vi-VN')}</td>
                      <td className="px-4 py-4"><StatusBadge tone={category.isActive ? 'emerald' : 'slate'}>{category.isActive ? 'Đang hoạt động' : 'Đã tắt'}</StatusBadge></td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <IconButton label="Sửa danh mục" onClick={() => startEditCategory(category)}><Edit2 className="h-4 w-4" /></IconButton>
                          <IconButton label="Tắt danh mục" tone="rose" onClick={() => setPendingAction({ kind: 'disableCategory', item: category })}><Archive className="h-4 w-4" /></IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>
          </div>
        )}

        {activeTab === 'import' && (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
            <AdminPanel title="Nhập CSV/Excel" description="Xem trước và kiểm tra dữ liệu trước khi nhập vào hệ thống.">
              <div className="space-y-4">
                <input ref={fileInputRef} type="file" accept=".csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="hidden" onChange={handlePreviewFile} />
                <Button type="button" disabled={previewing} onClick={() => fileInputRef.current?.click()} className="h-10 w-full rounded-md bg-blue-600 hover:bg-blue-700">
                  <Upload className="h-4 w-4" /> {previewing ? 'Đang xem trước...' : 'Chọn tệp để xem trước'}
                </Button>
                <Button type="button" disabled={!importPreview || importPreview.invalid > 0 || importing} onClick={handleConfirmImport} className="h-10 w-full rounded-md bg-emerald-600 hover:bg-emerald-700">
                  <Check className="h-4 w-4" /> {importing ? 'Đang nhập...' : 'Nhập dữ liệu hợp lệ'}
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" variant="outline" onClick={downloadCsvTemplate} className="rounded-md"><Download className="h-4 w-4" />CSV mẫu</Button>
                  <Button type="button" variant="outline" onClick={downloadXlsxTemplate} className="rounded-md"><Download className="h-4 w-4" />Excel mẫu</Button>
                </div>
                <div className="rounded-md border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  <p className="font-semibold text-white">Cột khuyến nghị</p>
                  <p className="mt-2 text-xs leading-6">term, meaning, phonetic, partOfSpeech, topics, exampleSentence, exampleMeaning</p>
                </div>
              </div>
            </AdminPanel>

            <AdminPanel title="Xem trước dữ liệu nhập" description="Các dòng lỗi cần được sửa trước khi nhập.">
              {!importPreview ? (
                <div className="py-12 text-center text-sm text-slate-500">Chưa có tệp để xem trước.</div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <Metric label="Tổng dòng" value={importPreview.total} tone="slate" />
                    <Metric label="Hợp lệ" value={importPreview.valid} tone="emerald" />
                    <Metric label="Lỗi" value={importPreview.invalid} tone="rose" />
                  </div>
                  <div className="overflow-hidden rounded-md border border-white/10">
                    <div className="max-h-[520px] overflow-auto">
                      <table className="w-full min-w-[920px] text-left text-sm">
                        <thead className="sticky top-0 bg-[#111827] text-xs uppercase text-slate-400"><tr><th className="px-3 py-2">Dòng</th><th className="px-3 py-2">Từ</th><th className="px-3 py-2">Loại từ</th><th className="px-3 py-2">Chủ đề</th><th className="px-3 py-2">Trạng thái</th><th className="px-3 py-2">Lỗi</th></tr></thead>
                        <tbody className="divide-y divide-white/10">
                          {importPreview.rows.map((row) => (
                            <tr key={row.row} className={row.valid ? 'hover:bg-white/5' : 'bg-rose-500/5'}>
                              <td className="px-3 py-2 text-slate-300">{row.row}</td>
                              <td className="px-3 py-2"><p className="font-medium text-white">{row.term || 'Thiếu từ'}</p><p className="text-xs text-slate-500">{row.meaning || 'Thiếu nghĩa'}</p></td>
                              <td className="px-3 py-2 text-slate-300">{row.partOfSpeech?.name ? adminLabel(row.partOfSpeech.name) : 'Không hợp lệ'}</td>
                              <td className="px-3 py-2 text-slate-300">{row.topics.map((topic) => topic.name).join(', ') || 'Không có'}</td>
                              <td className="px-3 py-2"><StatusBadge tone={row.valid ? 'emerald' : 'rose'}>{row.valid ? 'OK' : 'Lỗi'}</StatusBadge></td>
                              <td className="px-3 py-2 text-rose-300">{row.errors.join('; ')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </AdminPanel>
          </div>
        )}
      </AdminPage>

      {(selectedWord || loadingDetail) && (
        <WordDrawer
          word={selectedWord}
          loading={loadingDetail}
          canHardDelete={canHardDelete}
          onClose={() => setSelectedWord(null)}
          onEdit={(word) => handleEditWord(word)}
          onArchive={(word) => setPendingAction({ kind: 'archiveWord', item: word })}
          onHardDelete={(word) => setPendingAction({ kind: 'hardDeleteWord', item: word })}
        />
      )}
      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={
          pendingAction?.kind === 'hardDeleteWord'
            ? 'Xóa vĩnh viễn từ vựng?'
            : pendingAction?.kind === 'deleteTopic'
              ? 'Xóa hoặc lưu trữ chủ đề?'
              : pendingAction?.kind === 'disableCategory'
                ? 'Tắt danh mục chủ đề?'
                : 'Lưu trữ từ vựng?'
        }
        description={
          pendingAction?.kind === 'hardDeleteWord'
            ? `Từ "${pendingAction.item.term}" cùng câu hỏi, tiến độ học và lượt làm liên quan sẽ bị xóa vĩnh viễn.`
            : pendingAction?.kind === 'deleteTopic'
              ? `Chủ đề "${pendingAction.item.name}" sẽ được lưu trữ nếu đang có nội dung liên quan, nếu không sẽ bị xóa.`
              : pendingAction?.kind === 'disableCategory'
                ? `Danh mục "${pendingAction.item.name}" sẽ bị tắt và các chủ đề được bỏ liên kết danh mục.`
                : `Từ "${pendingAction?.item.term || ''}" sẽ chuyển sang trạng thái lưu trữ và không còn hiển thị cho học viên.`
        }
        confirmLabel={pendingAction?.kind === 'hardDeleteWord' ? 'Xóa vĩnh viễn' : pendingAction?.kind === 'disableCategory' ? 'Tắt danh mục' : 'Xác nhận'}
        busy={confirming}
        onCancel={() => setPendingAction(null)}
        onConfirm={() => void confirmPendingAction()}
      />
    </div>
  );
}

function Select({ value, onChange, children, required }: { value: string; onChange: (value: string) => void; children: React.ReactNode; required?: boolean }) {
  return (
    <select
      value={value}
      required={required}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 min-w-40 rounded-md border border-white/10 bg-[#1b2130] px-3 text-sm text-white outline-none [&_option]:bg-[#111827] [&_option]:text-white"
    >
      {children}
    </select>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</label>
      {children}
    </div>
  );
}

function EmptyRow({ colSpan, text }: { colSpan: number; text: string }) {
  return <tr><td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-slate-500">{text}</td></tr>;
}

function ErrorRow({ colSpan, text, onRetry }: { colSpan: number; text: string; onRetry: () => void }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-rose-300">
        <p>{text}</p>
        <button type="button" onClick={onRetry} className="mt-3 rounded-md border border-rose-500/30 px-3 py-1.5 text-xs font-medium hover:bg-rose-500/10">
          Thử lại
        </button>
      </td>
    </tr>
  );
}

function FormActions({ saving, onCancel, submitLabel }: { saving: boolean; onCancel: () => void; submitLabel: string }) {
  return (
    <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
      <Button type="button" variant="ghost" onClick={onCancel} className="rounded-md">Hủy</Button>
      <Button type="submit" disabled={saving} className="rounded-md bg-blue-600 hover:bg-blue-700">{saving ? 'Đang lưu...' : submitLabel}</Button>
    </div>
  );
}

function PaginationBar({
  pagination,
  loading,
  itemLabel,
  currentCount,
  onPrevious,
  onNext,
}: {
  pagination: PaginationMeta | null;
  loading: boolean;
  itemLabel: string;
  currentCount: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  if (!pagination) return null;

  return (
    <AdminPanel>
      <div className="flex flex-col gap-3 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <span>Hiển thị {currentCount} / {pagination.total} {itemLabel}</span>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" disabled={pagination.page <= 1 || loading} onClick={onPrevious} className="rounded-md">Trước</Button>
          <span className="min-w-24 text-center">Trang {pagination.page} / {pagination.totalPages}</span>
          <Button type="button" variant="ghost" disabled={pagination.page >= pagination.totalPages || loading} onClick={onNext} className="rounded-md">Sau</Button>
        </div>
      </div>
    </AdminPanel>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone: 'emerald' | 'rose' | 'slate' }) {
  const classes = tone === 'emerald'
    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
    : tone === 'rose'
      ? 'border-rose-500/20 bg-rose-500/10 text-rose-300'
      : 'border-slate-500/20 bg-slate-500/10 text-slate-300';

  return (
    <div className={`rounded-md border p-4 ${classes}`}>
      <p className="text-xs uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value.toLocaleString('vi-VN')}</p>
    </div>
  );
}

function WordDrawer({
  word,
  loading,
  canHardDelete,
  onClose,
  onEdit,
  onArchive,
  onHardDelete,
}: {
  word: WordDetail | null;
  loading: boolean;
  canHardDelete: boolean;
  onClose: () => void;
  onEdit: (word: WordDetail) => void;
  onArchive: (word: WordDetail) => void;
  onHardDelete: (word: WordDetail) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
      <aside className="h-full w-full max-w-2xl overflow-y-auto border-l border-white/10 bg-[#0b1220] p-5 text-white shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Chi tiết từ vựng</p>
            <h2 className="mt-1 text-xl font-semibold">{loading ? 'Đang tải...' : word?.term}</h2>
            {word && <p className="mt-1 text-sm text-slate-400">{word.phonetic || 'Chưa có phiên âm'} · {word.partOfSpeechName ? adminLabel(word.partOfSpeechName) : 'Chưa có loại từ'}</p>}
          </div>
          <IconButton label="Đóng" onClick={onClose}><X className="h-4 w-4" /></IconButton>
        </div>

        {!loading && word && (
          <div className="mt-6 space-y-5">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone={statusTone[word.status] || 'slate'}>{adminLabel(word.status)}</StatusBadge>
              <StatusBadge tone="blue">{Number(word.exampleCount || 0)} ví dụ</StatusBadge>
              <StatusBadge tone="violet">{Number(word.questionCount || 0)} câu hỏi</StatusBadge>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => onEdit(word)} className="rounded-md bg-blue-600 hover:bg-blue-700"><Edit2 className="h-4 w-4" />Sửa</Button>
              <Button type="button" variant="destructive" onClick={() => onArchive(word)} className="rounded-md"><Archive className="h-4 w-4" />Lưu trữ</Button>
              {canHardDelete && <Button type="button" variant="destructive" onClick={() => onHardDelete(word)} className="rounded-md"><Trash2 className="h-4 w-4" />Xóa vĩnh viễn</Button>}
            </div>

            <DetailSection title="Định nghĩa"><p className="text-sm text-slate-300">{word.meaning}</p></DetailSection>
            <DetailSection title="Chủ đề">
              <div className="flex flex-wrap gap-2">{word.topics?.length ? word.topics.map((topic) => <StatusBadge key={topic.id}>{topic.name}</StatusBadge>) : <p className="text-sm text-slate-500">Chưa gán chủ đề.</p>}</div>
            </DetailSection>
            <DetailSection title="Câu ví dụ">
              <div className="space-y-3">
                {word.examples?.length ? word.examples.map((example) => (
                  <div key={example.id || example.sentence} className="rounded-md border border-white/10 p-3">
                    <p className="text-sm text-white">{example.sentence}</p>
                    {example.meaning && <p className="mt-1 text-sm text-slate-400">{example.meaning}</p>}
                  </div>
                )) : <p className="text-sm text-slate-500">Chưa có ví dụ.</p>}
              </div>
            </DetailSection>
            <DetailSection title="Câu hỏi">
              <div className="space-y-3">
                {word.questions?.length ? word.questions.map((question) => (
                  <div key={question.id} className="rounded-md border border-white/10 p-3">
                    <div className="flex items-start justify-between gap-3"><p className="text-sm font-medium text-white">{question.questionText}</p><StatusBadge tone={statusTone[question.status] || 'slate'}>{adminLabel(question.status)}</StatusBadge></div>
                    <p className="mt-2 text-xs text-slate-400">{adminLabel(question.questionType)} · Đáp án: {question.correctAnswer || 'Không có'}</p>
                  </div>
                )) : <p className="text-sm text-slate-500">Chưa có câu hỏi.</p>}
              </div>
            </DetailSection>
            <DetailSection title="Lịch sử sửa">
              <div className="space-y-3">
                {word.auditLogs?.length ? word.auditLogs.map((log) => (
                  <div key={log.id} className="rounded-md border border-white/10 p-3">
                    <p className="text-sm font-medium text-white">{adminLabel(log.action)}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDate(log.createdAt)} · {log.adminName || 'Quản trị viên'}</p>
                    {log.details && <p className="mt-2 line-clamp-3 text-xs text-slate-400">{log.details}</p>}
                  </div>
                )) : <p className="text-sm text-slate-500">Chưa có lịch sử sửa.</p>}
              </div>
            </DetailSection>
          </div>
        )}
      </aside>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 border-t border-white/10 pt-5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      {children}
    </section>
  );
}

const DEFAULT_AI_SERVICE_URL = 'http://127.0.0.1:8000';

function withTimeout(ms = 20000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(timeout) };
}

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function getAiServiceUrl() {
  return cleanText(process.env.AI_SERVICE_URL) || DEFAULT_AI_SERVICE_URL;
}

function getInternalToken() {
  return cleanText(process.env.AI_INTERNAL_TOKEN);
}

function makeError(message, statusCode = 502) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function fetchJson(url, options = {}, timeoutMs = 12000) {
  const { signal, clear } = withTimeout(timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { ok: false, status: response.status, data };
    }
    return { ok: true, status: response.status, data };
  } finally {
    clear();
  }
}

async function translateToVietnamese(text) {
  const url = `${getAiServiceUrl()}/api/ai/translate`;
  const headers = { 'Content-Type': 'application/json' };
  const token = getInternalToken();

  if (token) {
    headers['x-internal-token'] = token;
  }

  const result = await fetchJson(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ text, source: 'en', target: 'vi' }),
  });

  if (!result.ok) return null;
  return cleanText(result.data?.translatedText) || null;
}

async function lookupDictionary(term) {
  const result = await fetchJson(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(term)}`);
  if (!result.ok) return null;

  const entries = result.data;
  const firstEntry = Array.isArray(entries) ? entries[0] : null;
  if (!firstEntry) return null;

  const phonetic = cleanText(firstEntry.phonetic)
    || cleanText((firstEntry.phonetics || []).find((item) => cleanText(item.text))?.text);
  const firstMeaning = (firstEntry.meanings || [])[0];
  const firstDefinition = (firstMeaning?.definitions || [])[0];
  const examples = [];

  for (const meaning of firstEntry.meanings || []) {
    for (const definition of meaning.definitions || []) {
      if (definition.example) {
        examples.push({ sentence: definition.example, meaning: '' });
      }
    }
  }

  return {
    phonetic,
    partOfSpeech: cleanText(firstMeaning?.partOfSpeech),
    meaning: cleanText(firstDefinition?.definition),
    examples: examples.slice(0, 5),
  };
}

function normalizePartOfSpeechLabel(value) {
  const cleaned = cleanText(value).toLowerCase();
  if (!cleaned) return '';
  if (cleaned.includes('noun')) return 'Noun';
  if (cleaned.includes('verb')) return 'Verb';
  if (cleaned.includes('adj')) return 'Adjective';
  if (cleaned.includes('adv')) return 'Adverb';
  if (cleaned.includes('prep')) return 'Preposition';
  if (cleaned.includes('conj')) return 'Conjunction';
  if (cleaned.includes('pron')) return 'Pronoun';
  if (cleaned.includes('interj')) return 'Interjection';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function ensureExactTopicWords(words, count, topicName) {
  const targetCount = Math.max(5, Math.min(Number(count) || 5, 50));
  const seen = new Set();
  const result = [];

  const addWord = (termValue, meaningValue) => {
    const term = cleanText(termValue);
    if (!term) return;
    const key = term.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    result.push({ term, meaning: cleanText(meaningValue) || `Từ liên quan đến chủ đề ${topicName}` });
  };

  for (const word of Array.isArray(words) ? words : []) {
    if (word && typeof word === 'object') addWord(word.term, word.meaning);
    else addWord(word);
    if (result.length >= targetCount) return result.slice(0, targetCount);
  }

  const baseWords = [topicName, ...String(topicName).split(/\s+/).filter(Boolean)];
  for (const word of baseWords) {
    addWord(word);
    if (result.length >= targetCount) return result.slice(0, targetCount);
  }

  const baseTerm = cleanText(topicName) || 'vocabulary';
  let index = 1;
  while (result.length < targetCount) {
    addWord(`${baseTerm} word ${index}`, `Từ vựng số ${index} liên quan đến chủ đề ${topicName}`);
    index += 1;
  }

  return result.slice(0, targetCount);
}

async function buildWordFallback({ term, meaning, partOfSpeech, exampleCount = 3 }, translated, dictionary) {
  let translatedMeaning = translated;
  if (!translatedMeaning && dictionary?.meaning) {
    translatedMeaning = await translateToVietnamese(dictionary.meaning).catch(() => null);
  }

  const resolvedMeaning = cleanText(meaning) || translatedMeaning || dictionary?.meaning || '';
  const resolvedPartOfSpeech = normalizePartOfSpeechLabel(partOfSpeech) || dictionary?.partOfSpeech || '';
  const baseExamples = Array.isArray(dictionary?.examples) ? dictionary.examples : [];
  const examples = baseExamples.length > 0
    ? baseExamples
        .map((example) => ({ sentence: cleanText(example?.sentence), meaning: cleanText(example?.meaning) }))
        .filter((example) => example.sentence)
        .slice(0, exampleCount)
    : Array.from({ length: exampleCount }, (_, index) => ({
        sentence: `${term} is used in a business context example ${index + 1}.`,
        meaning: '',
      }));

  const translatedExamples = [];
  for (const example of examples) {
    if (example.sentence && !example.meaning) {
      translatedExamples.push({
        sentence: example.sentence,
        meaning: await translateToVietnamese(example.sentence).catch(() => null) || '',
      });
    } else if (example.sentence) {
      translatedExamples.push(example);
    }
  }

  return {
    term,
    meaning: resolvedMeaning,
    phonetic: dictionary?.phonetic || '',
    partOfSpeech: resolvedPartOfSpeech,
    examples: translatedExamples.length > 0 ? translatedExamples : examples,
    sources: {
      ai: null,
      translate: translated ? 'google-translate' : null,
      dictionary: dictionary ? 'dictionaryapi.dev' : null,
    },
  };
}

function buildTopicFallback({ topicName, description, targetWordCount }) {
  return {
    topicName,
    topicCode: String(topicName)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\u0111/g, 'd')
      .replace(/\u0110/g, 'D')
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 50) || `TOPIC_${Date.now()}`,
    description: cleanText(description) || `Topic draft for ${topicName}`,
    keywords: [topicName],
    suggestedWordCount: 0,
    suggestedWords: [],
  };
}

function buildQuestionFallback({ wordId, term, meaning, questionType, optionCount = 4 }) {
  const options = [
    meaning,
    `${meaning} (wrong option)`,
    `${term} meaning alternative`,
    `Another answer`,
  ].slice(0, optionCount);

  return {
    wordId,
    questionType,
    questionText: `What is the correct meaning of "${term}"?`,
    optionsJson: JSON.stringify(options),
    correctAnswer: meaning,
    explanation: `"${term}" means "${meaning}".`,
  };
}

function buildMiniTestFallback({ topicName, description, questionCount, titleHint }) {
  return {
    title: cleanText(titleHint) || `Mini Test - ${topicName}`,
    description: cleanText(description) || `Mini test draft for ${topicName} (${questionCount} questions)`,
    questionCount,
  };
}

async function postJson(path, body) {
  const url = `${getAiServiceUrl()}${path}`;
  const headers = { 'Content-Type': 'application/json' };
  const token = getInternalToken();

  if (token) {
    headers['x-internal-token'] = token;
  }

  let response;
  const { signal, clear } = withTimeout();
  try {
    response = await fetch(url, {
      method: 'POST',
      headers,
      signal,
      body: JSON.stringify(body),
    });
  } catch (error) {
    clear();
    if (path === '/api/ai/word-suggestions') {
      const [translated, dictionary] = await Promise.all([
        translateToVietnamese(body.term).catch(() => null),
        lookupDictionary(body.term).catch(() => null),
      ]);
      return buildWordFallback(body, translated, dictionary);
    }

    if (path === '/api/ai/topic-suggestions') {
      throw makeError(`AI service unavailable for topic vocabulary generation: ${error.message}`, 503);
    }

    if (path === '/api/ai/question-suggestions') {
      return buildQuestionFallback(body);
    }

    if (path === '/api/ai/mini-test-suggestions') {
      return buildMiniTestFallback(body);
    }

    if (path === '/api/ai/translate') {
      return { translatedText: null };
    }

    if (path === '/api/ai/dictionary') {
      return lookupDictionary(body.term).then((value) => value || { meaning: null, phonetic: null, partOfSpeech: null, examples: [] });
    }

    throw makeError(`AI service unavailable: ${error.message}`, 503);
  } finally {
    clear();
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.detail || data?.message || `AI service request failed with status ${response.status}`;
    throw makeError(message, response.status === 401 ? 502 : response.status);
  }

  return data;
}

class AiService {
  static async suggestWordContent(payload) {
    const term = cleanText(payload?.term);
    if (!term) throw makeError('Missing term', 400);

    return postJson('/api/ai/word-suggestions', {
      term,
      meaning: cleanText(payload?.meaning) || undefined,
      partOfSpeech: cleanText(payload?.partOfSpeech) || undefined,
      exampleCount: Number.isInteger(payload?.exampleCount) ? payload.exampleCount : 3,
      difficultyLevel: cleanText(payload?.difficultyLevel) || undefined,
    });
  }

  static async suggestTopicContent(payload) {
    const topicName = cleanText(payload?.topicName);
    if (!topicName) throw makeError('Missing topicName', 400);

    return postJson('/api/ai/topic-suggestions', {
      topicName,
      description: cleanText(payload?.description) || undefined,
      targetWordCount: Number.isInteger(payload?.targetWordCount) ? payload.targetWordCount : 15,
      topicCategoryId: Number.isInteger(payload?.topicCategoryId) ? payload.topicCategoryId : undefined,
    });
  }

  static async suggestQuestionContent(payload) {
    const wordId = Number(payload?.wordId);
    if (!Number.isInteger(wordId) || wordId <= 0) throw makeError('Missing wordId', 400);

    return postJson('/api/ai/question-suggestions', {
      wordId,
      term: cleanText(payload?.term),
      meaning: cleanText(payload?.meaning),
      questionType: cleanText(payload?.questionType) || 'MCQ',
      optionCount: Number.isInteger(payload?.optionCount) ? payload.optionCount : 4,
    });
  }

  static async translateText(payload) {
    const text = cleanText(payload?.text);
    if (!text) throw makeError('Missing text', 400);

    return postJson('/api/ai/translate', {
      text,
      source: cleanText(payload?.source) || 'en',
      target: cleanText(payload?.target) || 'vi',
    });
  }

  static async lookupDictionary(payload) {
    const term = cleanText(payload?.term);
    if (!term) throw makeError('Missing term', 400);

    return postJson('/api/ai/dictionary', { term });
  }

  static async suggestMiniTestContent(payload) {
    const topicName = cleanText(payload?.topicName);
    if (!topicName) throw makeError('Missing topicName', 400);

    return postJson('/api/ai/mini-test-suggestions', {
      topicName,
      description: cleanText(payload?.description) || undefined,
      questionCount: Number.isInteger(payload?.questionCount) ? payload.questionCount : 10,
      titleHint: cleanText(payload?.titleHint) || undefined,
    });
  }
}

module.exports = AiService;

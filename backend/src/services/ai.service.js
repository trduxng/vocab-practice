const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const GOOGLE_TRANSLATE_URL = 'https://translation.googleapis.com/language/translate/v2';
const DICTIONARY_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';

function withTimeout(ms = 12000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(timeout) };
}

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function extractResponseText(response) {
  if (typeof response.output_text === 'string') return response.output_text;

  const chunks = [];
  for (const item of response.output || []) {
    if (item.type !== 'message') continue;
    for (const content of item.content || []) {
      if (typeof content === 'string') chunks.push(content);
      if (typeof content?.text === 'string') chunks.push(content.text);
    }
  }

  return chunks.join('\n').trim();
}

function parseJsonText(text) {
  const raw = cleanText(text);
  if (!raw) throw new Error('AI response is empty');

  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('AI response is not valid JSON');
    return JSON.parse(match[0]);
  }
}

function normalizeExamples(examples) {
  if (!Array.isArray(examples)) return [];

  return examples
    .map((example) => ({
      sentence: cleanText(example?.sentence),
      meaning: cleanText(example?.meaning),
    }))
    .filter((example) => example.sentence)
    .slice(0, 5);
}

class AiService {
  static async suggestWordContent({ term, meaning, partOfSpeech, exampleCount = 3 }) {
    const cleanTerm = cleanText(term);
    if (!cleanTerm) throw new Error('Missing term');

    const [dictionary, translatedTerm] = await Promise.all([
      this.lookupDictionary(cleanTerm).catch(() => null),
      this.translateToVietnamese(cleanTerm).catch(() => null),
    ]);

    const aiSuggestion = await this.generateToeicExamples({
      term: cleanTerm,
      meaning: cleanText(meaning) || translatedTerm || dictionary?.meaning || '',
      partOfSpeech: cleanText(partOfSpeech) || dictionary?.partOfSpeech || '',
      exampleCount,
    });

    return {
      term: cleanTerm,
      meaning: aiSuggestion.meaning || translatedTerm || dictionary?.meaning || '',
      phonetic: dictionary?.phonetic || aiSuggestion.phonetic || '',
      partOfSpeech: aiSuggestion.partOfSpeech || dictionary?.partOfSpeech || '',
      examples: aiSuggestion.examples.length > 0 ? aiSuggestion.examples : dictionary?.examples || [],
      sources: {
        ai: 'openai',
        translate: translatedTerm ? 'google-translate' : null,
        dictionary: dictionary ? 'dictionaryapi.dev' : null,
      },
    };
  }

  static async generateToeicExamples({ term, meaning, partOfSpeech, exampleCount }) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      const error = new Error('OPENAI_API_KEY is not configured');
      error.statusCode = 503;
      throw error;
    }

    const model = process.env.OPENAI_MODEL || process.env.AI_MODEL || 'gpt-5.4-mini';
    const { signal, clear } = withTimeout(20000);

    try {
      const response = await fetch(OPENAI_RESPONSES_URL, {
        method: 'POST',
        signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          instructions: [
            'You create high-quality TOEIC vocabulary learning content for Vietnamese learners.',
            'Return JSON only. Do not wrap the JSON in markdown.',
            'Examples must be natural business, office, travel, meeting, email, or customer-service TOEIC contexts.',
            'Each example sentence must contain the target word exactly once when natural.',
          ].join(' '),
          input: JSON.stringify({
            term,
            knownVietnameseMeaning: meaning,
            knownPartOfSpeech: partOfSpeech,
            exampleCount,
            outputShape: {
              meaning: 'Vietnamese meaning, concise',
              phonetic: 'IPA if confident, otherwise empty string',
              partOfSpeech: 'English part of speech if confident',
              examples: [{ sentence: 'English TOEIC sentence', meaning: 'Vietnamese translation' }],
            },
          }),
          max_output_tokens: 900,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = data?.error?.message || `OpenAI request failed with status ${response.status}`;
        const error = new Error(message);
        error.upstreamStatusCode = response.status;
        error.statusCode = response.status === 401 || response.status === 403 ? 502 : response.status;
        throw error;
      }

      const parsed = parseJsonText(extractResponseText(data));
      return {
        meaning: cleanText(parsed.meaning),
        phonetic: cleanText(parsed.phonetic),
        partOfSpeech: cleanText(parsed.partOfSpeech),
        examples: normalizeExamples(parsed.examples),
      };
    } finally {
      clear();
    }
  }

  static async translateToVietnamese(text) {
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (!apiKey) return null;

    const { signal, clear } = withTimeout(8000);
    try {
      const response = await fetch(`${GOOGLE_TRANSLATE_URL}?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          source: 'en',
          target: 'vi',
          format: 'text',
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) return null;
      return cleanText(data?.data?.translations?.[0]?.translatedText) || null;
    } finally {
      clear();
    }
  }

  static async lookupDictionary(term) {
    const { signal, clear } = withTimeout(8000);
    try {
      const response = await fetch(`${DICTIONARY_URL}/${encodeURIComponent(term)}`, { signal });
      if (!response.ok) return null;

      const entries = await response.json();
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
        examples: normalizeExamples(examples),
      };
    } finally {
      clear();
    }
  }
}

module.exports = AiService;

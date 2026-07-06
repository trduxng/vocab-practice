import asyncio
import json
import re
from typing import Any

import httpx
from googletrans import Translator

from app.core.settings import get_settings
from app.schemas.ai import (
    DictionaryRequest,
    MiniTestSuggestionRequest,
    QuestionSuggestionRequest,
    TopicSuggestionRequest,
    TranslateRequest,
    WordSuggestionRequest,
)


def _clean_text(value: Any) -> str:
    return value.strip() if isinstance(value, str) else ""


def _collect_topic_words(words: list[Any], count: int, topic_name: str, keywords: list[Any] | None = None) -> list[dict[str, str]]:
    target_count = max(5, min(int(count or 5), 50))
    seen: set[str] = set()
    cleaned_words: list[dict[str, str]] = []

    def add_word(term_value: Any, meaning_value: Any = None, phonetic_value: Any = None, part_of_speech_value: Any = None) -> None:
        term = _clean_text(term_value)
        if not term:
            return
        key = term.lower()
        if key in seen:
            return
        seen.add(key)
        meaning = _clean_text(meaning_value) or f"Từ liên quan đến {topic_name}"
        cleaned_words.append({
            "term": term,
            "meaning": meaning,
            "phonetic": _clean_text(phonetic_value),
            "partOfSpeech": _clean_text(part_of_speech_value),
        })

    for item in words:
        if isinstance(item, dict):
            add_word(item.get("term"), item.get("meaning"), item.get("phonetic"), item.get("partOfSpeech"))
        else:
            add_word(item)
        if len(cleaned_words) >= target_count:
            return cleaned_words[:target_count]

    for keyword in keywords or []:
        add_word(keyword)
        if len(cleaned_words) >= target_count:
            return cleaned_words[:target_count]

    return cleaned_words[:target_count]


def _extract_json(text: str) -> dict[str, Any]:
    raw = _clean_text(text)
    if not raw:
        raise ValueError("AI response is empty")

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        match = re.search(r"\{[\s\S]*\}", raw)
        if not match:
            raise ValueError("AI response is not valid JSON")
        return json.loads(match.group(0))


class AISuggester:
    translator = Translator()

    @staticmethod
    async def _enrich_topic_words(words: list[dict[str, str]]) -> list[dict[str, str]]:
        async def enrich(word: dict[str, str]) -> dict[str, str]:
            if word.get("phonetic") and word.get("partOfSpeech"):
                return word
            dictionary = await AISuggester.dictionary(DictionaryRequest(term=word["term"]))
            return {
                **word,
                "phonetic": word.get("phonetic") or dictionary.get("phonetic") or "",
                "partOfSpeech": word.get("partOfSpeech") or dictionary.get("partOfSpeech") or "",
            }

        return await asyncio.gather(*(enrich(word) for word in words))

    @staticmethod
    async def _call_openrouter(prompt: str, response_shape: str) -> dict[str, Any]:
        settings = get_settings()
        if not settings.openrouter_api_key:
            raise RuntimeError("OPENROUTER_API_KEY is not configured")

        url = f"{settings.openrouter_base_url.rstrip('/')}/chat/completions"

        body = {
            "model": settings.openrouter_model,
            "messages": [
                {"role": "system", "content": "Return JSON only. Do not wrap in markdown."},
                {"role": "user", "content": f"{prompt}\n\nSchema:\n{response_shape}"},
            ],
            "temperature": 0.7,
            "max_tokens": 1024,
        }

        headers = {
            "Authorization": f"Bearer {settings.openrouter_api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": settings.openrouter_site_url,
            "X-Title": settings.openrouter_app_name,
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=headers, json=body)

        data = response.json()
        if response.status_code >= 400:
            message = data.get("error", {}).get("message", "OpenRouter request failed")
            raise RuntimeError(message)

        text = data.get("choices", [{}])[0].get("message", {}).get("content", "")

        return _extract_json(text)

    @staticmethod
    async def suggest_word(payload: WordSuggestionRequest):
        translate_task = AISuggester.translate(
            TranslateRequest(text=payload.term, source="en", target="vi")
        )
        dictionary_task = AISuggester.dictionary(DictionaryRequest(term=payload.term))

        translated, dictionary = await asyncio.gather(translate_task, dictionary_task)
        dictionary_meaning_vi = None
        if dictionary.get("meaning") and not translated.get("translatedText"):
            try:
                dictionary_meaning_vi = (
                    await AISuggester.translate(
                        TranslateRequest(text=dictionary["meaning"], source="en", target="vi")
                    )
                ).get("translatedText")
            except Exception:
                dictionary_meaning_vi = None

        prompt = (
            "Bạn tạo nội dung từ vựng TOEIC chất lượng cao cho người học tiếng Việt. "
            f"Từ: {payload.term}. Nghĩa đã biết: {_clean_text(payload.meaning) or translated['translatedText'] or dictionary_meaning_vi or dictionary.get('meaning', '')}. "
            f"Từ loại: {_clean_text(payload.partOfSpeech) or dictionary.get('partOfSpeech', '')}. "
            f"Độ khó: {_clean_text(payload.difficultyLevel) or 'medium'}. "
            f"Hãy tạo {payload.exampleCount} câu ví dụ tự nhiên theo ngữ cảnh TOEIC, nghĩa của ví dụ phải bằng tiếng Việt."
        )
        schema = (
            '{"term":"string","meaning":"string","phonetic":"string","partOfSpeech":"string",'
            '"examples":[{"sentence":"string","meaning":"string"}],"difficultyLevel":"string"}'
        )
        parsed = await AISuggester._call_openrouter(prompt, schema)
        return {
            "term": _clean_text(payload.term),
            "meaning": _clean_text(parsed.get("meaning")) or translated.get("translatedText") or dictionary_meaning_vi or dictionary.get("meaning", ""),
            "phonetic": _clean_text(parsed.get("phonetic")) or dictionary.get("phonetic", ""),
            "partOfSpeech": _clean_text(parsed.get("partOfSpeech")) or dictionary.get("partOfSpeech", ""),
            "examples": parsed.get("examples", [])[: payload.exampleCount],
            "difficultyLevel": _clean_text(parsed.get("difficultyLevel")) or _clean_text(payload.difficultyLevel),
            "sources": {
                "gemini": "google-gemini",
                "translate": "google-translate" if translated.get("translatedText") else None,
                "dictionary": "dictionaryapi.dev" if dictionary else None,
            },
        }

    @staticmethod
    async def suggest_topic(payload: TopicSuggestionRequest):
        prompt = (
            "Bạn tạo bản nháp chủ đề TOEIC thân thiện cho creator trên nền tảng học từ vựng. "
            f"Tên chủ đề: {payload.topicName}. Mô tả: {_clean_text(payload.description)}. "
            f"Số lượng từ mục tiêu: {payload.targetWordCount}. "
            "Hãy trả về bản nháp ngắn gọn, phù hợp để admin duyệt và kèm danh sách từ vựng gợi ý. "
            f"BẮT BUỘC suggestedWords có đúng {payload.targetWordCount} phần tử, không thiếu, không thừa. "
            "Mỗi từ vựng cần có term tiếng Anh và meaning bằng tiếng Việt."
        )
        schema = (
            '{"topicName":"string","topicCode":"string","description":"string","keywords":["string"],'
            '"suggestedWordCount":0,"suggestedWords":[{"term":"string","meaning":"string"}]}'
        )
        parsed = await AISuggester._call_openrouter(prompt, schema)
        keywords = parsed.get("keywords", []) if isinstance(parsed.get("keywords", []), list) else []
        suggested_words = parsed.get("suggestedWords", []) if isinstance(parsed.get("suggestedWords", []), list) else []
        cleaned_words = _collect_topic_words(suggested_words, payload.targetWordCount, payload.topicName, keywords)

        if len(cleaned_words) < payload.targetWordCount:
            missing_count = payload.targetWordCount - len(cleaned_words)
            existing_terms = ", ".join(word["term"] for word in cleaned_words)
            repair_prompt = (
                f"Bạn đang bổ sung từ vựng tiếng Anh đúng topic cho người học tiếng Việt. "
                f"Topic/nội dung muốn học: {payload.topicName}. Mô tả: {_clean_text(payload.description)}. "
                f"Đã có các từ: {existing_terms or 'chưa có'}. "
                f"Hãy sinh THÊM ĐÚNG {missing_count} từ vựng mới, liên quan trực tiếp đến topic này, không lặp từ đã có. "
                "Mỗi item có term tiếng Anh và meaning tiếng Việt."
            )
            repair_schema = '{"suggestedWords":[{"term":"string","meaning":"string"}]}'
            repair_parsed = await AISuggester._call_openrouter(repair_prompt, repair_schema)
            repair_words = repair_parsed.get("suggestedWords", []) if isinstance(repair_parsed.get("suggestedWords", []), list) else []
            cleaned_words = _collect_topic_words(cleaned_words + repair_words, payload.targetWordCount, payload.topicName, keywords)

        if len(cleaned_words) != payload.targetWordCount:
            raise ValueError(f"AI chỉ sinh được {len(cleaned_words)}/{payload.targetWordCount} từ đúng topic")

        cleaned_words = await AISuggester._enrich_topic_words(cleaned_words)

        return {
            "topicName": _clean_text(parsed.get("topicName")) or payload.topicName,
            "topicCode": _clean_text(parsed.get("topicCode")) or re.sub(r"[^A-Za-z0-9]+", "_", payload.topicName).upper()[:50],
            "description": _clean_text(parsed.get("description")) or _clean_text(payload.description),
            "keywords": parsed.get("keywords", []),
            "suggestedWordCount": len(cleaned_words),
            "suggestedWords": cleaned_words,
        }

    @staticmethod
    async def suggest_question(payload: QuestionSuggestionRequest):
        prompt = (
            "Bạn tạo câu hỏi TOEIC cho nền tảng học từ vựng. "
            f"Từ: {payload.term}. Nghĩa: {payload.meaning}. Loại câu hỏi: {payload.questionType}. "
            f"Hãy tạo một câu hỏi chất lượng cao với {payload.optionCount} lựa chọn nếu phù hợp."
        )
        schema = (
            '{"questionText":"string","optionsJson":["string"],"correctAnswer":"string",'
            '"explanation":"string"}'
        )
        parsed = await AISuggester._call_openrouter(prompt, schema)
        options = parsed.get("optionsJson", [])
        if isinstance(options, str):
            try:
                options = json.loads(options)
            except json.JSONDecodeError:
                options = []
        if not isinstance(options, list):
            options = []
        return {
            "wordId": payload.wordId,
            "questionType": payload.questionType,
            "questionText": _clean_text(parsed.get("questionText")),
            "optionsJson": json.dumps(options[: payload.optionCount], ensure_ascii=False),
            "correctAnswer": _clean_text(parsed.get("correctAnswer")),
            "explanation": _clean_text(parsed.get("explanation")),
        }

    @staticmethod
    async def translate(payload: TranslateRequest):
        try:
            translated = await asyncio.to_thread(
                AISuggester.translator.translate,
                payload.text,
                src=payload.source,
                dest=payload.target,
            )
            return {"translatedText": _clean_text(getattr(translated, "text", None)) or None}
        except Exception:
            return {"translatedText": None}

    @staticmethod
    async def dictionary(payload: DictionaryRequest):
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.get(f"https://api.dictionaryapi.dev/api/v2/entries/en/{payload.term}")

        if response.status_code >= 400:
            return {"meaning": None, "phonetic": None, "partOfSpeech": None, "examples": []}

        entries = response.json()
        first_entry = entries[0] if isinstance(entries, list) and entries else {}
        first_meaning = (first_entry.get("meanings") or [{}])[0]
        first_definition = (first_meaning.get("definitions") or [{}])[0]
        first_phonetic = _clean_text(first_entry.get("phonetic"))
        if not first_phonetic:
            for phonetic_item in first_entry.get("phonetics", []):
                first_phonetic = _clean_text(phonetic_item.get("text"))
                if first_phonetic:
                    break
        examples = []
        for meaning in first_entry.get("meanings", []):
            for definition in meaning.get("definitions", []):
                if definition.get("example"):
                    examples.append({"sentence": definition.get("example"), "meaning": ""})

        return {
            "meaning": _clean_text(first_definition.get("definition")) or None,
            "phonetic": first_phonetic or None,
            "partOfSpeech": _clean_text(first_meaning.get("partOfSpeech")) or None,
            "examples": examples[:5],
        }

    @staticmethod
    async def suggest_mini_test(payload: MiniTestSuggestionRequest):
        prompt = (
            "Bạn tạo bản nháp mini test TOEIC thân thiện cho creator trên nền tảng học từ vựng. "
            f"Tên chủ đề: {payload.topicName}. Mô tả: {_clean_text(payload.description)}. "
            f"Số câu hỏi: {payload.questionCount}. "
            "Hãy trả về tiêu đề và mô tả ngắn gọn, phù hợp để admin duyệt."
        )
        schema = '{"title":"string","description":"string"}'
        parsed = await AISuggester._call_openrouter(prompt, schema)
        base_title = _clean_text(payload.titleHint) or f"Mini Test - {payload.topicName}"
        return {
            "title": _clean_text(parsed.get("title")) or base_title,
            "description": _clean_text(parsed.get("description")) or _clean_text(payload.description) or f"Bài test {payload.questionCount} câu cho chủ đề {payload.topicName}",
            "questionCount": payload.questionCount,
        }

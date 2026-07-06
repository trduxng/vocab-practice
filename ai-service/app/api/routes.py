from fastapi import APIRouter, Depends

from app.core.auth import require_internal_token
from app.schemas.ai import (
    DictionaryRequest,
    MiniTestSuggestionRequest,
    QuestionSuggestionRequest,
    TopicSuggestionRequest,
    TranslateRequest,
    WordSuggestionRequest,
)
from app.services.ai import AISuggester

router = APIRouter(dependencies=[Depends(require_internal_token)])


@router.post("/word-suggestions")
async def word_suggestions(payload: WordSuggestionRequest):
    return await AISuggester.suggest_word(payload)


@router.post("/topic-suggestions")
async def topic_suggestions(payload: TopicSuggestionRequest):
    return await AISuggester.suggest_topic(payload)


@router.post("/question-suggestions")
async def question_suggestions(payload: QuestionSuggestionRequest):
    return await AISuggester.suggest_question(payload)


@router.post("/translate")
async def translate(payload: TranslateRequest):
    return await AISuggester.translate(payload)


@router.post("/dictionary")
async def dictionary(payload: DictionaryRequest):
    return await AISuggester.dictionary(payload)


@router.post("/mini-test-suggestions")
async def mini_test_suggestions(payload: MiniTestSuggestionRequest):
    return await AISuggester.suggest_mini_test(payload)

from pydantic import BaseModel, Field


class WordSuggestionRequest(BaseModel):
    term: str = Field(min_length=1, max_length=100)
    meaning: str | None = Field(default=None, max_length=1000)
    partOfSpeech: str | None = Field(default=None, max_length=100)
    exampleCount: int = Field(default=3, ge=1, le=5)
    difficultyLevel: str | None = Field(default=None, max_length=50)


class TopicSuggestionRequest(BaseModel):
    topicName: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    targetWordCount: int = Field(default=15, ge=5, le=50)
    topicCategoryId: int | None = None


class QuestionSuggestionRequest(BaseModel):
    wordId: int
    term: str = Field(min_length=1, max_length=100)
    meaning: str = Field(min_length=1, max_length=1000)
    questionType: str = Field(default="MCQ", max_length=50)
    optionCount: int = Field(default=4, ge=2, le=5)


class TranslateRequest(BaseModel):
    text: str = Field(min_length=1, max_length=5000)
    source: str = Field(default="en", max_length=10)
    target: str = Field(default="vi", max_length=10)


class DictionaryRequest(BaseModel):
    term: str = Field(min_length=1, max_length=100)


class MiniTestSuggestionRequest(BaseModel):
    topicName: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    questionCount: int = Field(default=10, ge=1, le=50)
    titleHint: str | None = Field(default=None, max_length=200)

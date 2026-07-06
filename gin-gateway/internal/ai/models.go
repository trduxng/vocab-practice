package ai

type SuggestionRequest struct {
	Term         string `json:"term" binding:"required,max=100"`
	Meaning      string `json:"meaning,omitempty" max:"1000"`
	PartOfSpeech string `json:"partOfSpeech,omitempty" max:"100"`
	ExampleCount int    `json:"exampleCount,omitempty" binding:"min=1,max=5"`
}

type SuggestionResponse struct {
	Term         string             `json:"term"`
	Meaning      string             `json:"meaning"`
	Phonetic     string             `json:"phonetic"`
	PartOfSpeech string             `json:"partOfSpeech"`
	Examples     []Example          `json:"examples"`
	Sources      SourceMap          `json:"sources"`
}

type Example struct {
	Sentence string `json:"sentence"`
	Meaning  string `json:"meaning"`
}

type SourceMap struct {
	AI         string `json:"ai"`
	Translate  string `json:"translate"`
	Dictionary string `json:"dictionary"`
}

type AIResult struct {
	Meaning      string    `json:"meaning"`
	Phonetic     string    `json:"phonetic"`
	PartOfSpeech string    `json:"partOfSpeech"`
	Examples     []Example `json:"examples"`
}

type DictionaryResult struct {
	Phonetic     string
	PartOfSpeech string
	Meaning      string
	Examples     []Example
}

type openAIResponse struct {
	OutputText string         `json:"output_text"`
	Output     []openAIOutput `json:"output"`
}

type openAIOutput struct {
	Type    string          `json:"type"`
	Content []openAIContent `json:"content"`
}

type openAIContent struct {
	Text string `json:"text"`
}

type translateResponse struct {
	Data struct {
		Translations []struct {
			TranslatedText string `json:"translatedText"`
		} `json:"translations"`
	} `json:"data"`
}

type dictionaryEntry struct {
	Phonetic  string             `json:"phonetic"`
	Phonetics []dictionaryPhonetic `json:"phonetics"`
	Meanings  []dictionaryMeaning `json:"meanings"`
}

type dictionaryPhonetic struct {
	Text string `json:"text"`
}

type dictionaryMeaning struct {
	PartOfSpeech string                `json:"partOfSpeech"`
	Definitions  []dictionaryDefinition `json:"definitions"`
}

type dictionaryDefinition struct {
	Definition string `json:"definition"`
	Example    string `json:"example"`
}

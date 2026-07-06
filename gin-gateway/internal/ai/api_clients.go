package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
)

const (
	openAIURL         = "https://api.openai.com/v1/responses"
	googleTranslateURL = "https://translation.googleapis.com/language/translate/v2"
	dictionaryURL     = "https://api.dictionaryapi.dev/api/v2/entries/en"
)

type openAIRequest struct {
	Model         string `json:"model"`
	Instructions  string `json:"instructions"`
	Input         string `json:"input"`
	MaxOutput     int    `json:"max_output_tokens"`
}

type openAISuccessResponse struct {
	Output     []openAIOutputItem `json:"output"`
	OutputText string             `json:"output_text"`
}

type openAIOutputItem struct {
	Type    string            `json:"type"`
	Content []openAIContentItem `json:"content"`
}

type openAIContentItem struct {
	Type string `json:"type"`
	Text string `json:"text"`
}

func callOpenAI(ctx context.Context, term, meaning, partOfSpeech string, exampleCount int) (*AIResult, error) {
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("OPENAI_API_KEY is not configured")
	}

	model := os.Getenv("OPENAI_MODEL")
	if model == "" {
		model = os.Getenv("AI_MODEL")
	}
	if model == "" {
		model = "gpt-5.4-mini"
	}

	payload := map[string]interface{}{
		"term":              term,
		"knownVietnameseMeaning": meaning,
		"knownPartOfSpeech": partOfSpeech,
		"exampleCount":      exampleCount,
		"outputShape": map[string]interface{}{
			"meaning":      "Vietnamese meaning, concise",
			"phonetic":     "IPA if confident, otherwise empty string",
			"partOfSpeech": "English part of speech if confident",
			"examples": []map[string]string{
				{"sentence": "English TOEIC sentence", "meaning": "Vietnamese translation"},
			},
		},
	}

	inputBytes, _ := json.Marshal(payload)

	body := openAIRequest{
		Model: model,
		Instructions: `You create high-quality TOEIC vocabulary learning content for Vietnamese learners. Return JSON only. Do not wrap the JSON in markdown. Examples must be natural business, office, travel, meeting, email, or customer-service TOEIC contexts. Each example sentence must contain the target word exactly once when natural.`,
		Input:    string(inputBytes),
		MaxOutput: 900,
	}

	reqBytes, _ := json.Marshal(body)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, openAIURL, bytes.NewReader(reqBytes))
	if err != nil {
		return nil, fmt.Errorf("create openai request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("openai request: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		msg := extractOpenAIError(respBody)
		return nil, fmt.Errorf("openai status %d: %s", resp.StatusCode, msg)
	}

	var aiResp openAISuccessResponse
	if err := json.Unmarshal(respBody, &aiResp); err != nil {
		return nil, fmt.Errorf("openai parse response: %w", err)
	}

	text := extractResponseText(&aiResp)
	parsed, err := parseJSONText(text)
	if err != nil {
		return nil, fmt.Errorf("openai invalid json: %w", err)
	}

	return parsed, nil
}

func extractOpenAIError(body []byte) string {
	var errResp struct {
		Error struct {
			Message string `json:"message"`
		} `json:"error"`
	}
	if json.Unmarshal(body, &errResp) == nil && errResp.Error.Message != "" {
		return errResp.Error.Message
	}
	return string(body)
}

func extractResponseText(resp *openAISuccessResponse) string {
	if resp.OutputText != "" {
		return strings.TrimSpace(resp.OutputText)
	}
	var chunks []string
	for _, item := range resp.Output {
		if item.Type != "message" {
			continue
		}
		for _, content := range item.Content {
			if content.Text != "" {
				chunks = append(chunks, content.Text)
			}
		}
	}
	return strings.TrimSpace(strings.Join(chunks, "\n"))
}

func parseJSONText(text string) (*AIResult, error) {
	if text == "" {
		return nil, fmt.Errorf("AI response is empty")
	}

	text = strings.TrimSpace(text)

	var result AIResult
	if err := json.Unmarshal([]byte(text), &result); err != nil {
		braceIdx := strings.Index(text, "{")
		if braceIdx < 0 {
			return nil, fmt.Errorf("AI response is not valid JSON")
		}
		if err := json.Unmarshal([]byte(text[braceIdx:]), &result); err != nil {
			return nil, fmt.Errorf("AI response is not valid JSON")
		}
	}

	result.Meaning = strings.TrimSpace(result.Meaning)
	result.Phonetic = strings.TrimSpace(result.Phonetic)
	result.PartOfSpeech = strings.TrimSpace(result.PartOfSpeech)

	var valid []Example
	for _, ex := range result.Examples {
		ex.Sentence = strings.TrimSpace(ex.Sentence)
		ex.Meaning = strings.TrimSpace(ex.Meaning)
		if ex.Sentence != "" {
			valid = append(valid, ex)
		}
	}
	if len(valid) > 5 {
		valid = valid[:5]
	}
	result.Examples = valid

	return &result, nil
}

func callGoogleTranslate(ctx context.Context, text string) (string, error) {
	apiKey := os.Getenv("GOOGLE_TRANSLATE_API_KEY")
	if apiKey == "" {
		return "", nil
	}

	url := fmt.Sprintf("%s?key=%s", googleTranslateURL, apiKey)
	payload := map[string]interface{}{
		"q":      []string{text},
		"source": "en",
		"target": "vi",
		"format": "text",
	}
	reqBytes, _ := json.Marshal(payload)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(reqBytes))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", nil
	}

	var tResp translateResponse
	if err := json.NewDecoder(resp.Body).Decode(&tResp); err != nil {
		return "", err
	}

	if len(tResp.Data.Translations) > 0 {
		return strings.TrimSpace(tResp.Data.Translations[0].TranslatedText), nil
	}
	return "", nil
}

func callDictionary(ctx context.Context, term string) (*DictionaryResult, error) {
	url := fmt.Sprintf("%s/%s", dictionaryURL, term)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, nil
	}

	var entries []dictionaryEntry
	if err := json.NewDecoder(resp.Body).Decode(&entries); err != nil {
		return nil, err
	}

	if len(entries) == 0 {
		return nil, nil
	}

	entry := entries[0]
	result := &DictionaryResult{}

	result.Phonetic = strings.TrimSpace(entry.Phonetic)
	if result.Phonetic == "" {
		for _, p := range entry.Phonetics {
			if strings.TrimSpace(p.Text) != "" {
				result.Phonetic = strings.TrimSpace(p.Text)
				break
			}
		}
	}

	if len(entry.Meanings) > 0 {
		result.PartOfSpeech = strings.TrimSpace(entry.Meanings[0].PartOfSpeech)
		if len(entry.Meanings[0].Definitions) > 0 {
			result.Meaning = strings.TrimSpace(entry.Meanings[0].Definitions[0].Definition)
		}
		for _, m := range entry.Meanings {
			for _, d := range m.Definitions {
				if d.Example != "" {
					result.Examples = append(result.Examples, Example{
						Sentence: d.Example,
						Meaning:  "",
					})
				}
			}
		}
	}

	return result, nil
}

package ai

import (
	"context"
	"time"

	"golang.org/x/sync/errgroup"
)

type Service struct{}

func NewService() *Service {
	return &Service{}
}

func (s *Service) Suggest(ctx context.Context, req *SuggestionRequest) (*SuggestionResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	g, gCtx := errgroup.WithContext(ctx)

	var dictionary *DictionaryResult
	g.Go(func() error {
		dCtx, dCancel := context.WithTimeout(gCtx, 8*time.Second)
		defer dCancel()
		dict, err := callDictionary(dCtx, req.Term)
		if err != nil {
			return nil
		}
		dictionary = dict
		return nil
	})

	var translatedTerm string
	g.Go(func() error {
		tCtx, tCancel := context.WithTimeout(gCtx, 8*time.Second)
		defer tCancel()
		t, err := callGoogleTranslate(tCtx, req.Term)
		if err != nil {
			return nil
		}
		translatedTerm = t
		return nil
	})

	var aiResult *AIResult
	g.Go(func() error {
		aCtx, aCancel := context.WithTimeout(gCtx, 20*time.Second)
		defer aCancel()
		result, err := callOpenAI(aCtx, req.Term, req.Meaning, req.PartOfSpeech, req.ExampleCount)
		if err != nil {
			return err
		}
		aiResult = result
		return nil
	})

	if err := g.Wait(); err != nil {
		return nil, err
	}

	meaning := req.Meaning
	if meaning == "" && aiResult != nil && aiResult.Meaning != "" {
		meaning = aiResult.Meaning
	}
	if meaning == "" && translatedTerm != "" {
		meaning = translatedTerm
	}
	if meaning == "" && dictionary != nil && dictionary.Meaning != "" {
		meaning = dictionary.Meaning
	}

	phonetic := ""
	if aiResult != nil && aiResult.Phonetic != "" {
		phonetic = aiResult.Phonetic
	}
	if phonetic == "" && dictionary != nil && dictionary.Phonetic != "" {
		phonetic = dictionary.Phonetic
	}

	partOfSpeech := req.PartOfSpeech
	if partOfSpeech == "" && aiResult != nil && aiResult.PartOfSpeech != "" {
		partOfSpeech = aiResult.PartOfSpeech
	}
	if partOfSpeech == "" && dictionary != nil && dictionary.PartOfSpeech != "" {
		partOfSpeech = dictionary.PartOfSpeech
	}

	examples := []Example{}
	if aiResult != nil && len(aiResult.Examples) > 0 {
		examples = aiResult.Examples
	} else if dictionary != nil && len(dictionary.Examples) > 0 {
		examples = dictionary.Examples
	}

	response := &SuggestionResponse{
		Term:         req.Term,
		Meaning:      meaning,
		Phonetic:     phonetic,
		PartOfSpeech: partOfSpeech,
		Examples:     examples,
		Sources: SourceMap{
			AI:        "openai",
			Translate: "google-translate",
			Dictionary: "dictionaryapi.dev",
		},
	}

	if translatedTerm == "" {
		response.Sources.Translate = ""
	}
	if dictionary == nil {
		response.Sources.Dictionary = ""
	}

	return response, nil
}

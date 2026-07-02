package handler

import (
	"fmt"
	"math"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/vocab-practice/user-go/internal/model"
	"github.com/vocab-practice/user-go/internal/repository"
)

type LearningPathHandler struct {
	learningPathRepo *repository.LearningPathRepo
}

func NewLearningPathHandler(learningPathRepo *repository.LearningPathRepo) *LearningPathHandler {
	return &LearningPathHandler{learningPathRepo: learningPathRepo}
}

func (h *LearningPathHandler) GetRoadmap(c *gin.Context) {
	userID := c.GetInt64("userId")
	ctx := c.Request.Context()

	// Ensure schema + seed levels
	if err := h.learningPathRepo.EnsureSchema(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Database error"})
		return
	}
	if err := h.learningPathRepo.SeedLevels(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Seed error"})
		return
	}
	if err := h.learningPathRepo.SyncPublishedTopics(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Sync error"})
		return
	}

	// Get data
	levels, topics, err := h.learningPathRepo.GetRoadmapData(ctx, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to load roadmap"})
		return
	}

	roadmap := buildRoadmap(levels, topics)
	c.JSON(http.StatusOK, roadmap)
}

func buildRoadmap(levelRows []model.RoadmapLevelRow, topicRows []model.RoadmapTopicRow) *model.Roadmap {
	var allTopics []model.RoadmapTopic

	roadmapLevels := make([]model.RoadmapLevel, 0, len(levelRows))
	for _, l := range levelRows {
		topics := make([]model.RoadmapTopic, 0)
		for _, t := range topicRows {
			if t.LevelID != l.ID {
				continue
			}

			totalWords := max(t.TotalWords, 0)
			learnedWords := max(t.LearnedWords, 0)
			masteredWords := max(t.MasteredWords, 0)
			lessonCompleted := totalWords > 0 && learnedWords >= totalWords
			practiceCompleted := t.PracticeCompletions > 0
			miniTestConfigured := t.MiniTestCount > 0
			miniTestCompleted := t.CompletedMiniTests > 0
			canStartLesson := totalWords > 0
			canPractice := learnedWords > 0

			var status string
			completed := lessonCompleted && practiceCompleted && (!miniTestConfigured || miniTestCompleted)
			if completed {
				status = "completed"
			} else if canStartLesson {
				status = "available"
			} else {
				status = "locked"
			}

			lessonProgress := 0
			if totalWords > 0 {
				lessonProgress = int(math.Round(float64(learnedWords) * 100.0 / float64(totalWords)))
			}

			parts := []float64{float64(lessonProgress)}
			if practiceCompleted {
				parts = append(parts, 100)
			} else {
				parts = append(parts, 0)
			}
			if miniTestConfigured {
				if miniTestCompleted {
					parts = append(parts, 100)
				} else {
					parts = append(parts, 0)
				}
			}
			completionPct := int(math.Round(sumFloat64(parts) / float64(len(parts))))

			// Activities
			activities := []model.TopicActivity{
				{
					Type:        "lesson",
					Title:       "Học " + t.Title,
					Description: formatLearned(learnedWords, totalWords),
					Status:      mapStatus(lessonCompleted, canStartLesson),
					Route:       "/user/learn/" + int64ToStr(t.TopicID),
					Configured:  true,
				},
				{
					Type:        "practice",
					Title:       "Buổi luyện tập",
					Description: mapPracticeDesc(practiceCompleted),
					Status:      mapStatus(practiceCompleted, canPractice),
					Route:       "/user/practice?topicId=" + int64ToStr(t.TopicID),
					Configured:  true,
				},
			}

			miniTestStatus := "locked"
			if miniTestCompleted {
				miniTestStatus = "completed"
			} else if canPractice && practiceCompleted && miniTestConfigured {
				miniTestStatus = "available"
			}

			miniTestRoute := "/user/minitests"
			if t.FirstMiniTestID != nil {
				miniTestRoute = "/user/minitests/" + int64ToStr(*t.FirstMiniTestID)
			}

			activities = append(activities, model.TopicActivity{
				Type:        "miniTest",
				Title:       "Bài kiểm tra",
				Description: mapMiniTestDesc(t.MiniTestCount),
				Status:      miniTestStatus,
				Route:       miniTestRoute,
				Configured:  miniTestConfigured,
			})

			topic := model.RoadmapTopic{
				PathTopicID:   t.PathTopicID,
				TopicID:       t.TopicID,
				Title:         t.Title,
				Code:          t.Code,
				Description:   t.Description,
				Status:        status,
				CompletionPct: completionPct,
				TotalWords:    totalWords,
				LearnedWords:  learnedWords,
				MasteredWords: masteredWords,
				Activities:    activities,
			}
			topics = append(topics, topic)
			allTopics = append(allTopics, topic)
		}

		completedTopics := 0
		availableTopics := 0
		for _, t := range topics {
			if t.Status == "completed" {
				completedTopics++
			} else if t.Status == "available" {
				availableTopics++
			}
		}

		levelStatus := "locked"
		if len(topics) > 0 && completedTopics == len(topics) {
			levelStatus = "completed"
		} else if availableTopics > 0 {
			levelStatus = "available"
		}

		levelCompletion := 0
		if len(topics) > 0 {
			sum := 0
			for _, t := range topics {
				sum += t.CompletionPct
			}
			levelCompletion = int(math.Round(float64(sum) / float64(len(topics))))
		}

		roadmapLevels = append(roadmapLevels, model.RoadmapLevel{
			ID:              l.ID,
			Code:            l.Code,
			Title:           l.Title,
			TargetScore:     l.TargetScore,
			Description:     l.Description,
			DisplayOrder:    l.DisplayOrder,
			AccentKey:       l.AccentKey,
			Status:          levelStatus,
			CompletionPct:   levelCompletion,
			CompletedTopics: completedTopics,
			TotalTopics:     len(topics),
			Topics:          topics,
		})
	}

	completedTopics := 0
	for _, t := range allTopics {
		if t.Status == "completed" {
			completedTopics++
		}
	}

	roadmapCompletion := 0
	if len(allTopics) > 0 {
		sum := 0
		for _, t := range allTopics {
			sum += t.CompletionPct
		}
		roadmapCompletion = int(math.Round(float64(sum) / float64(len(allTopics))))
	}

	// Current position
	currentTopicIndex := -1
	for i, t := range allTopics {
		if t.Status == "available" {
			currentTopicIndex = i
			break
		}
	}
	if currentTopicIndex < 0 && len(allTopics) > 0 {
		currentTopicIndex = len(allTopics) - 1
	}

	var currentPosition *model.CurrentPosition
	var currentLesson *model.CurrentLesson
	var nextLesson *model.CurrentLesson

	if currentTopicIndex >= 0 && currentTopicIndex < len(allTopics) {
		ct := allTopics[currentTopicIndex]
		levelTitle := ""
		for _, l := range roadmapLevels {
			for _, t := range l.Topics {
				if t.TopicID == ct.TopicID {
					levelTitle = l.Title
					break
				}
			}
			if levelTitle != "" {
				break
			}
		}

		var currentActivity *model.TopicActivity
		for i := range ct.Activities {
			if ct.Activities[i].Status == "available" {
				currentActivity = &ct.Activities[i]
				break
			}
		}

		activityTitle := "Lộ trình đã hoàn thành"
		activityRoute := "/user/courses"
		if currentActivity != nil {
			activityTitle = currentActivity.Title
			activityRoute = currentActivity.Route
		}

		currentPosition = &model.CurrentPosition{
			LevelTitle:    levelTitle,
			TopicID:       ct.TopicID,
			TopicTitle:    ct.Title,
			TopicStatus:   ct.Status,
			ActivityTitle: activityTitle,
			ActivityRoute: activityRoute,
			CompletionPct: ct.CompletionPct,
		}

		currentLesson = &model.CurrentLesson{
			TopicID:       ct.TopicID,
			Title:         ct.Title,
			Route:         "/user/learn/" + int64ToStr(ct.TopicID),
			Status:        ct.Status,
			CompletionPct: ct.CompletionPct,
		}

		if currentTopicIndex+1 < len(allTopics) {
			nt := allTopics[currentTopicIndex+1]
			nextLesson = &model.CurrentLesson{
				TopicID:       nt.TopicID,
				Title:         nt.Title,
				Route:         "/user/learn/" + int64ToStr(nt.TopicID),
				Status:        nt.Status,
				CompletionPct: nt.CompletionPct,
			}
		}
	}

	return &model.Roadmap{
		CompletionPct:   roadmapCompletion,
		CompletedTopics: completedTopics,
		TotalTopics:     len(allTopics),
		CurrentPosition: currentPosition,
		CurrentLesson:   currentLesson,
		NextLesson:      nextLesson,
		Levels:          roadmapLevels,
	}
}

// Helper functions
func sumFloat64(vals []float64) float64 {
	s := 0.0
	for _, v := range vals {
		s += v
	}
	return s
}

func int64ToStr(id int64) string {
	return fmt.Sprintf("%d", id)
}

func mapStatus(completed, available bool) string {
	if completed {
		return "completed"
	}
	if available {
		return "available"
	}
	return "locked"
}

func formatLearned(learned, total int) string {
	return fmt.Sprintf("%d/%d từ đã học", learned, total)
}

func mapPracticeDesc(completed bool) string {
	if completed {
		return "Đã luyện tập"
	}
	return "Củng cố chủ đề này với buổi luyện tập trung"
}

func mapMiniTestDesc(count int) string {
	if count > 0 {
		return fmt.Sprintf("%d bài kiểm tra có sẵn", count)
	}
	return "Bài kiểm tra sắp ra mắt"
}

package model

import "time"

type User struct {
	ID          int64     `json:"id" db:"UserID"`
	FullName    string    `json:"fullName" db:"FullName"`
	Email       string    `json:"email" db:"Email"`
	Role        string    `json:"role" db:"Role"`
	DailyGoal   int       `json:"dailyGoal" db:"DailyGoal"`
	SRSLimit    int       `json:"srsReviewLimit" db:"SRSReviewLimit"`
	TotalXP     int64     `json:"totalXP" db:"TotalXP"`
	CurrentLevel int      `json:"currentLevel" db:"CurrentLevel"`
	CreatedAt   time.Time `json:"createdAt" db:"CreatedAt"`
}

type UserProfile struct {
	ID        int64  `json:"id"`
	FullName  string `json:"fullName"`
	Email     string `json:"email"`
	DailyGoal int    `json:"dailyGoal"`
	SRSLimit  int    `json:"srsReviewLimit"`
}

type UpdateProfileRequest struct {
	FullName string `json:"fullName"`
	Email    string `json:"email"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"oldPassword"`
	NewPassword string `json:"newPassword"`
}

type DailyGoalSetting struct {
	DailyGoal  int `json:"dailyGoal"`
	SRSLimit   int `json:"srsReviewLimit"`
}

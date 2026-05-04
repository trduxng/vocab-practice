// vocab-practice/backend/src/services/user.service.js
const { poolPromise, sql } = require("../config/db");

class UserService {
  static async submitQuestionAttempt(userId, questionId, submittedAnswer) {
    const pool = await poolPromise;

    // 1. Lấy đáp án đúng từ database
    const questionResult = await pool
      .request()
      .input("QuestionID", sql.BigInt, questionId).query(`
        SELECT WordID, CorrectAnswer, QuestionType
        FROM Questions
        WHERE QuestionID = @QuestionID
      `);

    if (questionResult.recordset.length === 0) {
      throw new Error("Question not found");
    }

    const {
      WordID: wordId,
      CorrectAnswer: correctAnswer,
      QuestionType: questionType,
    } = questionResult.recordset[0];

    // 2. So sánh đáp án - backend tự tính
    let isCorrect = false;
    let scoreAwarded = 0;

    if (questionType === "MCQ") {
      // MCQ: So sánh chính xác (VD: "A" === "A")
      isCorrect =
        submittedAnswer.trim().toUpperCase() ===
        correctAnswer.trim().toUpperCase();
    } else if (questionType === "FillBlank") {
      // FillBlank: So sánh không phân biệt hoa thường, trim
      isCorrect =
        submittedAnswer.trim().toLowerCase() ===
        correctAnswer.trim().toLowerCase();
    } else if (questionType === "Dictation") {
      // Dictation: So sánh gần đúng (có thể dùng string similarity)
      isCorrect =
        submittedAnswer.trim().toLowerCase() ===
        correctAnswer.trim().toLowerCase();
    } else {
      // FlashcardCheck, DragDrop: So sánh cơ bản
      isCorrect =
        submittedAnswer.trim().toLowerCase() ===
        correctAnswer.trim().toLowerCase();
    }

    scoreAwarded = isCorrect ? 100.0 : 0.0;

    // 3. Gọi stored procedure với kết quả đã xác thực
    const result = await pool
      .request()
      .input("UserID", sql.BigInt, userId)
      .input("QuestionID", sql.BigInt, questionId)
      .input("WordID", sql.BigInt, wordId)
      .input("SubmittedAnswer", sql.NVarChar(1000), submittedAnswer)
      .input("IsCorrect", sql.Bit, isCorrect)
      .input("ScoreAwarded", sql.Decimal(5, 2), scoreAwarded)
      .execute("usp_SubmitQuestionAttempt");

    return {
      ...result.recordset[0],
      isCorrect,
      scoreAwarded,
      correctAnswer: questionType === "MCQ" ? correctAnswer : undefined, // Chỉ trả đáp án cho MCQ
    };
  }

  static async getDueFlashcards(userId, limit = 20) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("UserID", sql.BigInt, userId)
      .input("Limit", sql.Int, limit).query(`
        SELECT TOP (@Limit)
          w.WordID AS wordId,
          w.Term AS term,
          w.Meaning AS meaning,
          w.Phonetic AS phonetic,
          w.AudioUrlUK AS audioUk,
          w.AudioUrlUS AS audioUs,
          q.QuestionID AS questionId,
          q.QuestionType AS questionType,
          q.QuestionText AS questionText,
          q.OptionsJson AS optionsJson,
          uwp.MasteryLevel AS masteryLevel,
          uwp.MemoryStatus AS memoryStatus,
          uwp.NextReviewDate AS nextReviewDate
        FROM Words w
        JOIN Questions q ON w.WordID = q.WordID
        LEFT JOIN UserWordProgress uwp ON w.WordID = uwp.WordID AND uwp.UserID = @UserID
        WHERE uwp.UserWordProgressID IS NULL
           OR uwp.MemoryStatus = 'New'
           OR uwp.NextReviewDate <= SYSDATETIMEOFFSET()
        ORDER BY
          CASE
            WHEN uwp.NextReviewDate IS NULL THEN 0
            ELSE 1
          END,
          uwp.NextReviewDate ASC
      `);
    return result.recordset;
  }
}

module.exports = UserService;

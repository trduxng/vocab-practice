const { sql, poolPromise } = require('../config/db');

class UserService {
  static async getFlashcards(userId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT TOP 10 q.CauHoiID AS questionId, q.NoiDungCauHoi AS questionText, 
               q.DapAnDung AS term, w.PhienAm AS phonetic, w.Nghia AS meaning,
               w.TuVungID AS wordId
        FROM CauHoi q
        JOIN TuVung w ON q.TuVungID = w.TuVungID
        LEFT JOIN TienDoTuVungNguoiDung uwp ON w.TuVungID = uwp.TuVungID AND uwp.NguoiDungID = @UserID
        WHERE uwp.NgayOnTapTiepTheo IS NULL OR uwp.NgayOnTapTiepTheo <= SYSDATETIMEOFFSET()
        ORDER BY NEWID()
      `);
    return result.recordset;
  }

  static async getDueFlashcards(userId, { topicId = null, mode = null } = {}) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .input('TopicID', sql.BigInt, topicId ? Number(topicId) : null)
      .input('Mode', sql.NVarChar(20), mode || '')
      .query(`
        SELECT TOP 15 
          q.CauHoiID AS questionId, 
          q.LoaiCauHoi AS questionType,
          COALESCE(q.NoiDungCauHoi, w.Nghia) AS questionText, 
          COALESCE(q.DapAnDung, w.Tu) AS correctAnswer,
          q.LuaChonJSON AS optionsJson,
          w.PhienAm AS phonetic, 
          w.Nghia AS meaning,
          w.Tu AS term,
          w.AudioURLUK AS audioUrlUK,
          w.AudioURLUS AS audioUrlUS,
          w.HinhAnhURL AS imageUrl,
          w.TuVungID AS wordId,
          p.TenTuLoai AS partOfSpeechName,
          ISNULL(uwp.MucDoThanhThao, 0) AS masteryLevel,
          ISNULL(uwp.TrangThaiGhiNho, N'Moi') AS memoryStatus
        FROM TuVung w
        LEFT JOIN TuLoai p ON w.TuLoaiID = p.TuLoaiID
        OUTER APPLY (
          SELECT TOP 1
            CauHoiID,
            LoaiCauHoi,
            NoiDungCauHoi,
            DapAnDung,
            LuaChonJSON
          FROM CauHoi
          WHERE TuVungID = w.TuVungID
          ORDER BY NEWID()
        ) q
        LEFT JOIN TienDoTuVungNguoiDung uwp ON w.TuVungID = uwp.TuVungID AND uwp.NguoiDungID = @UserID
        WHERE (@TopicID IS NULL OR EXISTS (
            SELECT 1 FROM TuVungChuDe wt WHERE wt.TuVungID = w.TuVungID AND wt.ChuDeID = @TopicID
          ))
          AND (
            (@Mode = N'learned' AND uwp.TienDoTuVungNguoiDungID IS NOT NULL)
            OR
            (@Mode <> N'learned' AND (uwp.NgayOnTapTiepTheo IS NULL OR uwp.NgayOnTapTiepTheo <= SYSDATETIMEOFFSET()))
          )
        ORDER BY uwp.MucDoThanhThao ASC, NEWID()
      `);
    return result.recordset;
  }

  static async getTopicWords(userId, topicId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .input('TopicID', sql.BigInt, topicId)
      .query(`
        SELECT
          w.TuVungID AS wordId,
          w.Tu AS term,
          w.Nghia AS meaning,
          w.PhienAm AS phonetic,
          p.TenTuLoai AS partOfSpeechName,
          ISNULL(uwp.MucDoThanhThao, 0) AS masteryLevel,
          ISNULL(uwp.TrangThaiGhiNho, N'Moi') AS memoryStatus,
          uwp.ThoiDiemOnTapGanNhat AS lastReviewedAt,
          uwp.NgayOnTapTiepTheo AS nextReviewDate,
          ex.CauTiengAnh AS exampleSentence,
          ex.DichNghia AS exampleMeaning
        FROM TuVungChuDe wt
        JOIN TuVung w ON wt.TuVungID = w.TuVungID
        LEFT JOIN TuLoai p ON w.TuLoaiID = p.TuLoaiID
        LEFT JOIN TienDoTuVungNguoiDung uwp ON w.TuVungID = uwp.TuVungID AND uwp.NguoiDungID = @UserID
        OUTER APPLY (
          SELECT TOP 1 CauTiengAnh, DichNghia
          FROM CauViDu
          WHERE TuVungID = w.TuVungID
          ORDER BY CauViDuID
        ) ex
        WHERE wt.ChuDeID = @TopicID
        ORDER BY w.Tu ASC
      `);
    return result.recordset;
  }

  static async submitAnswer({ userId, questionId, submittedAnswer }) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('NguoiDungID', sql.BigInt, userId)
      .input('CauHoiID', sql.BigInt, questionId)
      .input('DapAnDaNop', sql.NVarChar(1000), submittedAnswer || '')
      .execute('usp_GhiNhanLanTraLoiCauHoi');
    return result.recordset[0];
  }

  static async submitWordReview({ userId, wordId, isCorrect }) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .input('WordID', sql.BigInt, wordId)
      .input('IsCorrect', sql.Bit, Boolean(isCorrect))
      .query(`
        DECLARE @Now DATETIMEOFFSET(7) = SYSDATETIMEOFFSET();

        MERGE TienDoTuVungNguoiDung WITH (HOLDLOCK) AS target
        USING (SELECT @UserID AS NguoiDungID, @WordID AS TuVungID) AS source
        ON target.NguoiDungID = source.NguoiDungID AND target.TuVungID = source.TuVungID
        WHEN MATCHED THEN
          UPDATE SET
            MucDoThanhThao = CASE
              WHEN @IsCorrect = 1 AND target.MucDoThanhThao < 10 THEN target.MucDoThanhThao + 1
              WHEN @IsCorrect = 0 AND target.MucDoThanhThao > 0 THEN target.MucDoThanhThao - 1
              ELSE target.MucDoThanhThao
            END,
            SoLanLapLai = target.SoLanLapLai + 1,
            SoLanDungLienTiep = CASE WHEN @IsCorrect = 1 THEN target.SoLanDungLienTiep + 1 ELSE 0 END,
            SoLanSaiLienTiep = CASE WHEN @IsCorrect = 0 THEN target.SoLanSaiLienTiep + 1 ELSE 0 END,
            ThoiDiemOnTapGanNhat = @Now,
            NgayOnTapTiepTheo = CASE
              WHEN @IsCorrect = 1 THEN DATEADD(day,
                CASE
                  WHEN target.MucDoThanhThao >= 8 THEN 14
                  WHEN target.MucDoThanhThao >= 5 THEN 7
                  WHEN target.MucDoThanhThao >= 2 THEN 3
                  ELSE 1
                END,
                @Now
              )
              ELSE @Now
            END,
            DiemGanNhat = CASE WHEN @IsCorrect = 1 THEN 100.00 ELSE 0.00 END,
            TrangThaiGhiNho = CASE
              WHEN @IsCorrect = 0 THEN N'BiQuen'
              WHEN target.MucDoThanhThao >= 7 THEN N'DaThanhThao'
              WHEN target.MucDoThanhThao >= 2 THEN N'DangOnTap'
              ELSE N'DangHoc'
            END,
            ThoiDiemCapNhat = @Now
        WHEN NOT MATCHED THEN
          INSERT (NguoiDungID, TuVungID, MucDoThanhThao, HeSoDeNho, SoLanLapLai, SoLanDungLienTiep, SoLanSaiLienTiep, ThoiDiemOnTapGanNhat, NgayOnTapTiepTheo, DiemGanNhat, TrangThaiGhiNho, ThoiDiemTao, ThoiDiemCapNhat)
          VALUES (
            @UserID,
            @WordID,
            CASE WHEN @IsCorrect = 1 THEN 1 ELSE 0 END,
            2.50,
            1,
            CASE WHEN @IsCorrect = 1 THEN 1 ELSE 0 END,
            CASE WHEN @IsCorrect = 0 THEN 1 ELSE 0 END,
            @Now,
            CASE WHEN @IsCorrect = 1 THEN DATEADD(day, 1, @Now) ELSE @Now END,
            CASE WHEN @IsCorrect = 1 THEN 100.00 ELSE 0.00 END,
            CASE WHEN @IsCorrect = 1 THEN N'DangHoc' ELSE N'BiQuen' END,
            @Now,
            @Now
          )
        OUTPUT inserted.TienDoTuVungNguoiDungID AS id, inserted.MucDoThanhThao AS masteryLevel, inserted.TrangThaiGhiNho AS memoryStatus;
      `);

    return result.recordset[0];
  }

  static async getUserStats(userId) {
    const pool = await poolPromise;
    
    // 1. Total words learned
    const learnedResult = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query('SELECT COUNT(*) AS total FROM TienDoTuVungNguoiDung WHERE NguoiDungID = @UserID AND MucDoThanhThao >= 3');

    // 2. Accuracy rate
    const accuracyResult = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT 
          CAST(SUM(CASE WHEN DungSai = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0) AS DECIMAL(5,2)) AS accuracy,
          SUM(CASE WHEN DungSai = 1 THEN 1 ELSE 0 END) AS correct,
          SUM(CASE WHEN DungSai = 0 THEN 1 ELSE 0 END) AS wrong
        FROM LanLamBaiTap WHERE NguoiDungID = @UserID
      `);

    // 3. Weak words
    const weakWordsResult = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT TOP 5 w.Tu AS word, w.Nghia AS meaning
        FROM TienDoTuVungNguoiDung uwp
        JOIN TuVung w ON uwp.TuVungID = w.TuVungID
        WHERE uwp.NguoiDungID = @UserID AND (uwp.TrangThaiGhiNho = 'BiQuen' OR uwp.MucDoThanhThao < 3)
        ORDER BY uwp.MucDoThanhThao ASC
      `);

    // 4. Recent attempts
    const recentAttemptsResult = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT TOP 10 ea.DapAnDaNop AS answer, ea.DungSai AS isCorrect, ea.ThoiDiemLam AS date, w.Tu AS term
        FROM LanLamBaiTap ea
        JOIN TuVung w ON ea.TuVungID = w.TuVungID
        WHERE ea.NguoiDungID = @UserID
        ORDER BY ea.ThoiDiemLam DESC
      `);

    const stats = {
      totalLearned: learnedResult.recordset[0].total,
      accuracy: Math.round(accuracyResult.recordset[0].accuracy || 0),
      correct: accuracyResult.recordset[0].correct || 0,
      wrong: accuracyResult.recordset[0].wrong || 0,
      weakWords: weakWordsResult.recordset,
      recentAttempts: recentAttemptsResult.recordset,
      streak: 5 
    };

    stats.masteryTimeline = await this.getMasteryTimeline(userId);

    // 5. Daily trends (Last 7 days)
    const trendsResult = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT CAST(ThoiDiemLam AS DATE) AS date, COUNT(*) AS count
        FROM LanLamBaiTap
        WHERE NguoiDungID = @UserID AND ThoiDiemLam >= DATEADD(day, -7, SYSDATETIMEOFFSET())
        GROUP BY CAST(ThoiDiemLam AS DATE)
        ORDER BY date ASC
      `);
    
    stats.dailyTrends = trendsResult.recordset.map(r => ({
      day: new Date(r.date).toLocaleDateString('vi-VN', { weekday: 'short' }),
      count: r.count
    }));

    // Calculate Achievements
    stats.achievements = [
      { id: 1, icon: "🌱", label: "Mới bắt đầu", unlocked: learnedResult.recordset[0].total > 0 },
      { id: 2, icon: "💯", label: "Chăm chỉ", unlocked: (accuracyResult.recordset[0].correct || 0) >= 100 },
      { id: 3, icon: "🎯", label: "Chính xác", unlocked: Math.round(accuracyResult.recordset[0].accuracy || 0) >= 90 && learnedResult.recordset[0].total >= 10 },
      { id: 4, icon: "🏆", label: "Bậc thầy", unlocked: learnedResult.recordset[0].total >= 50 },
      { id: 5, icon: "🔥", label: "Streak 7", unlocked: false },
      { id: 6, icon: "⚡", label: "Tốc độ", unlocked: (accuracyResult.recordset[0].correct || 0) >= 10 },
      { id: 7, icon: "📚", label: "Mọt sách", unlocked: learnedResult.recordset[0].total >= 20 },
      { id: 8, icon: "🌟", label: "Ngôi sao", unlocked: false }
    ];

    return stats;
  }

  static async getMasteryTimeline(userId) {
    const pool = await poolPromise;
    const viewExists = await pool.request().query(`
      SELECT OBJECT_ID(N'dbo.vw_MasteryTimelineProjection', N'V') AS viewId
    `);

    if (viewExists.recordset[0].viewId) {
      const result = await pool.request()
        .input('UserID', sql.BigInt, userId)
        .query(`
          SELECT
            TotalWords AS totalWords,
            MasteredWords AS masteredWords,
            ISNULL(CompletionPercentage, 0) AS completionPercentage,
            EstimatedDaysToMastery AS estimatedDaysToMastery,
            ProjectedCompletionDate AS projectedCompletionDate
          FROM dbo.vw_MasteryTimelineProjection
          WHERE NguoiDungID = @UserID
        `);

      if (result.recordset.length > 0) {
        return result.recordset[0];
      }
    }

    const result = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT
          COUNT(*) AS totalWords,
          SUM(CASE WHEN MucDoThanhThao >= 8 THEN 1 ELSE 0 END) AS masteredWords,
          CAST(SUM(CASE WHEN MucDoThanhThao >= 8 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0) AS DECIMAL(5,2)) AS completionPercentage
        FROM TienDoTuVungNguoiDung
        WHERE NguoiDungID = @UserID
      `);

    const row = result.recordset[0] || {};
    return {
      totalWords: row.totalWords || 0,
      masteredWords: row.masteredWords || 0,
      completionPercentage: row.completionPercentage || 0,
      estimatedDaysToMastery: null,
      projectedCompletionDate: null
    };
  }

  static async getMiniTests() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT mt.BaiKiemTraNhoID AS id, mt.TieuDeBaiKiemTra AS title, mt.MoTa AS description,
             t.TenChuDe AS topicName, t.MaChuDe AS topicCode
      FROM BaiKiemTraNho mt
      LEFT JOIN ChuDe t ON mt.ChuDeID = t.ChuDeID
      WHERE mt.DaXuatBan = 1
    `);
    return result.recordset;
  }

  static async getMiniTestDetails(testId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('MiniTestID', sql.BigInt, testId)
      .query(`
        SELECT q.CauHoiID AS questionId, q.LoaiCauHoi AS questionType, 
               q.NoiDungCauHoi AS questionText, q.LuaChonJSON AS optionsJson, 
               q.DapAnDung AS correctAnswer, w.Tu AS term
        FROM CauHoiBaiKiemTraNho mti
        JOIN CauHoi q ON mti.CauHoiID = q.CauHoiID
        JOIN TuVung w ON q.TuVungID = w.TuVungID
        WHERE mti.BaiKiemTraNhoID = @MiniTestID
        ORDER BY mti.ThuTuHienThi
      `);
    return result.recordset;
  }

  static async updateProfile(userId, fullName) {
    const pool = await poolPromise;
    await pool.request()
      .input('UserID', sql.BigInt, userId)
      .input('FullName', sql.NVarChar(200), fullName)
      .query('UPDATE NguoiDung SET HoTen = @FullName, ThoiDiemCapNhat = SYSDATETIMEOFFSET() WHERE NguoiDungID = @UserID');
    return { id: userId, fullName };
  }

  static async getTestHistory(userId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT 
          CAST(ea.ThoiDiemLam AS DATE) AS date,
          mt.BaiKiemTraNhoID AS testId,
          mt.TieuDeBaiKiemTra AS testTitle,
          COUNT(*) AS totalQuestions,
          SUM(CASE WHEN ea.DungSai = 1 THEN 1 ELSE 0 END) AS correctAnswers
        FROM LanLamBaiTap ea
        JOIN CauHoi q ON ea.CauHoiID = q.CauHoiID
        JOIN CauHoiBaiKiemTraNho mti ON q.CauHoiID = mti.CauHoiID
        JOIN BaiKiemTraNho mt ON mti.BaiKiemTraNhoID = mt.BaiKiemTraNhoID
        WHERE ea.NguoiDungID = @UserID
        GROUP BY CAST(ea.ThoiDiemLam AS DATE), mt.TieuDeBaiKiemTra, mt.BaiKiemTraNhoID
        ORDER BY date DESC
      `);
    return result.recordset;
  }

  static async getTestSessionDetails(userId, testId, date) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .input('MiniTestID', sql.BigInt, testId)
      .input('Date', sql.Date, date)
      .query(`
        SELECT 
          q.NoiDungCauHoi AS questionText,
          q.LoaiCauHoi AS questionType,
          q.LuaChonJSON AS optionsJson,
          q.DapAnDung AS correctAnswer,
          ea.DapAnDaNop AS submittedAnswer,
          ea.DungSai AS isCorrect,
          w.Tu AS term,
          w.Nghia AS meaning
        FROM LanLamBaiTap ea
        JOIN CauHoi q ON ea.CauHoiID = q.CauHoiID
        JOIN CauHoiBaiKiemTraNho mti ON q.CauHoiID = mti.CauHoiID
        JOIN TuVung w ON q.TuVungID = w.TuVungID
        WHERE ea.NguoiDungID = @UserID 
          AND mti.BaiKiemTraNhoID = @MiniTestID
          AND CAST(ea.ThoiDiemLam AS DATE) = @Date
      `);
    return result.recordset;
  }
}

module.exports = UserService;

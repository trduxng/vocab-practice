const { poolPromise, sql } = require('../config/db');
const bcrypt = require('bcrypt');

const VAI_TRO_NGUOI_DUNG = ['QuanTriVien', 'NguoiHoc', 'BienTapVien'];

function xacThucVaiTroNguoiDung(tenVaiTro) {
  if (!VAI_TRO_NGUOI_DUNG.includes(tenVaiTro)) {
    throw new Error('Vai trò không hợp lệ');
  }
}

class AdminService {
  static normalizeImportKey(value) {
    return String(value ?? '')
      .replace(/^\uFEFF/, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  }

  static parseDelimitedImport(input) {
    if (Array.isArray(input)) {
      return input;
    }

    if (typeof input === 'object' && input) {
      if (Array.isArray(input.words)) return input.words;
      if (Array.isArray(input.questions)) return input.questions;
      if (Array.isArray(input.rows)) return input.rows;
    }

    if (typeof input !== 'string') {
      throw new Error('Dữ liệu nhập không hợp lệ');
    }

    const trimmed = input.trim();
    if (!trimmed) {
      throw new Error('CSV phải bao gồm tiêu đề và ít nhất một dòng dữ liệu');
    }

    const firstLine = trimmed.split(/\r?\n/)[0] || '';
    const delimiters = [',', ';', '\t'];
    const delimiter = delimiters.reduce((best, current) => {
      const currentCount = firstLine.split(current).length;
      const bestCount = firstLine.split(best).length;
      return currentCount > bestCount ? current : best;
    }, ',');

    const records = [];
    let row = [];
    let cell = '';
    let inQuotes = false;

    for (let i = 0; i < trimmed.length; i++) {
      const char = trimmed[i];
      const next = trimmed[i + 1];

      if (char === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        row.push(cell.trim());
        cell = '';
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && next === '\n') i++;
        row.push(cell.trim());
        if (row.some((value) => value !== '')) records.push(row);
        row = [];
        cell = '';
      } else {
        cell += char;
      }
    }

    row.push(cell.trim());
    if (row.some((value) => value !== '')) records.push(row);

    if (records.length < 2) {
      throw new Error('CSV phải bao gồm tiêu đề và ít nhất một dòng dữ liệu');
    }

    const headers = records[0].map((header) => header.trim());
    return records.slice(1).map((cells) => {
      return headers.reduce((parsedRow, header, index) => {
        parsedRow[header] = cells[index] ?? '';
        return parsedRow;
      }, {});
    });
  }

  static getImportValue(row, aliases) {
    const normalizedAliases = aliases.map((alias) => this.normalizeImportKey(alias));
    const entries = Object.entries(row ?? {});

    for (const [key, value] of entries) {
      if (normalizedAliases.includes(this.normalizeImportKey(key))) {
        return value;
      }
    }

    return undefined;
  }

  static splitImportList(value) {
    if (Array.isArray(value)) {
      return value.map((item) => String(item).trim()).filter(Boolean);
    }

    return String(value ?? '')
      .split(/[;,|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  static parseQuestionImport(input) {
    return this.parseDelimitedImport(input);
  }

  static parseWordImport(input) {
    return this.parseDelimitedImport(input);
  }

  // --- TU VUNG ---
  static async getWords(page = 1, limit = 20) {
    const pool = await poolPromise;
    const offset = (page - 1) * limit;
    
    // Lay danh sach tu vung chinh
    const result = await pool.request()
      .input('Offset', sql.Int, offset)
      .input('Limit', sql.Int, limit)
      .query(`
        SELECT w.TuVungID AS id, w.Tu AS term, w.Nghia AS meaning, w.PhienAm AS phonetic, 
               w.TuLoaiID AS partOfSpeechId, p.TenTuLoai AS partOfSpeechName,
               w.ThoiDiemTao AS createdAt 
        FROM TuVung w
        LEFT JOIN TuLoai p ON w.TuLoaiID = p.TuLoaiID
        ORDER BY w.ThoiDiemTao DESC
        OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
      `);
    
    const words = result.recordset;

    // Lay du lieu lien quan cho moi tu vung
    for (let word of words) {
      // Chu de
      const topicsResult = await pool.request()
        .input('TuVungID', sql.BigInt, word.id)
        .query(`
          SELECT t.ChuDeID AS id, t.TenChuDe AS name 
          FROM TuVungChuDe wt
          JOIN ChuDe t ON wt.ChuDeID = t.ChuDeID
          WHERE wt.TuVungID = @TuVungID
        `);
      word.topics = topicsResult.recordset;

      // Cau vi du
      const examplesResult = await pool.request()
        .input('TuVungID', sql.BigInt, word.id)
        .query(`
          SELECT CauViDuID AS id, CauTiengAnh AS sentence, DichNghia AS meaning
          FROM CauViDu
          WHERE TuVungID = @TuVungID
        `);
      word.examples = examplesResult.recordset;
    }

    return words;
  }

  static async createWord(wordData, adminId) {
    const { term, meaning, phonetic = '', partOfSpeechId, topicIds, examples } = wordData;
    const validExamples = Array.isArray(examples)
      ? examples.filter((ex) => String(ex?.sentence ?? '').trim())
      : [];
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      const request = new sql.Request(transaction);
      // Them Tu vung
      const wordResult = await request
        .input('Tu', sql.NVarChar(200), term)
        .input('Nghia', sql.NVarChar(1000), meaning)
        .input('PhienAm', sql.NVarChar(255), phonetic)
        .input('TuLoaiID', sql.Int, partOfSpeechId)
        .input('NguoiTaoID', sql.BigInt, adminId)
        .query(`
          INSERT INTO TuVung (Tu, Nghia, PhienAm, TuLoaiID, NguoiTaoID, ThoiDiemTao, ThoiDiemCapNhat)
          OUTPUT inserted.TuVungID AS id
          VALUES (@Tu, @Nghia, @Phonetic, @TuLoaiID, @NguoiTaoID, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())
        `);
      
      const wordId = wordResult.recordset[0].id;

      // Them TuVungChuDe
      if (topicIds && topicIds.length > 0) {
        for (const topicId of topicIds) {
          const topicReq = new sql.Request(transaction);
          await topicReq
            .input('TuVungID', sql.BigInt, wordId)
            .input('ChuDeID', sql.BigInt, topicId)
            .query(`
              INSERT INTO TuVungChuDe (TuVungID, ChuDeID, ThoiDiemGan) 
              VALUES (@TuVungID, @ChuDeID, SYSDATETIMEOFFSET())
            `);
        }
      }

      // Them CauViDu
      if (validExamples.length > 0) {
        for (const ex of validExamples) {
          const exReq = new sql.Request(transaction);
          await exReq
            .input('TuVungID', sql.BigInt, wordId)
            .input('CauTiengAnh', sql.NVarChar(2000), ex.sentence)
            .input('DichNghia', sql.NVarChar(2000), ex.meaning)
            .query(`
              INSERT INTO CauViDu (TuVungID, CauTiengAnh, DichNghia, ThoiDiemTao, ThoiDiemCapNhat)
              VALUES (@TuVungID, @CauTiengAnh, @DichNghia, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())
            `);
        }
      }

      await transaction.commit();
      return { id: wordId, term, meaning };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async updateWord(wordId, wordData) {
    const { term, meaning, phonetic, partOfSpeechId } = wordData;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('TuVungID', sql.BigInt, wordId)
      .input('Tu', sql.NVarChar(200), term)
      .input('Nghia', sql.NVarChar(1000), meaning)
      .input('PhienAm', sql.NVarChar(255), phonetic)
      .input('TuLoaiID', sql.Int, partOfSpeechId)
      .query(`
        UPDATE TuVung 
        SET Tu = @Tu, Nghia = @Nghia, PhienAm = @PhienAm, 
            TuLoaiID = @TuLoaiID, ThoiDiemCapNhat = SYSDATETIMEOFFSET()
        WHERE TuVungID = @TuVungID
      `);
    return result.rowsAffected[0] > 0;
  }

  static async deleteWord(wordId) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      const request = new sql.Request(transaction);
      const result = await request
        .input('TuVungID', sql.BigInt, wordId)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM TuVung WHERE TuVungID = @TuVungID)
          BEGIN
            SELECT CAST(0 AS INT) AS deleted;
            RETURN;
          END

          DELETE FROM CauHoiBaiKiemTraNho
          WHERE CauHoiID IN (
            SELECT CauHoiID FROM CauHoi WHERE TuVungID = @TuVungID
          );

          UPDATE mt
          SET TongSoCauHoi = counts.TongSoCauHoi,
              ThoiDiemCapNhat = SYSDATETIMEOFFSET()
          FROM BaiKiemTraNho mt
          CROSS APPLY (
            SELECT COUNT(*) AS TongSoCauHoi
            FROM CauHoiBaiKiemTraNho mti
            WHERE mti.BaiKiemTraNhoID = mt.BaiKiemTraNhoID
          ) counts;

          DELETE FROM LanLamBaiTap
          WHERE TuVungID = @TuVungID
             OR CauHoiID IN (
               SELECT CauHoiID FROM CauHoi WHERE TuVungID = @TuVungID
             );

          DELETE FROM TienDoTuVungNguoiDung WHERE TuVungID = @TuVungID;

          IF OBJECT_ID(N'dbo.TuVungPartsAssignment', N'U') IS NOT NULL
            DELETE FROM TuVungPartsAssignment WHERE TuVungID = @TuVungID;

          IF OBJECT_ID(N'dbo.ChungChiTuVung', N'U') IS NOT NULL
            DELETE FROM ChungChiTuVung WHERE TuVungID = @TuVungID;

          DELETE FROM CauHoi WHERE TuVungID = @TuVungID;
          DELETE FROM CauViDu WHERE TuVungID = @TuVungID;
          DELETE FROM TuVungChuDe WHERE TuVungID = @TuVungID;

          DELETE FROM TuVung WHERE TuVungID = @TuVungID;

          SELECT @@ROWCOUNT AS deleted;
        `);

      await transaction.commit();
      return result.recordset[0]?.deleted > 0;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async bulkInsertWords(input, adminId) {
    const rows = this.parseWordImport(input);
    const results = { success: 0, failed: 0, errors: [] };
    const pool = await poolPromise;

    const referenceData = await pool.request().query(`
      SELECT TuLoaiID AS id, TenTuLoai AS name, MaTuLoai AS code
      FROM TuLoai;

      SELECT ChuDeID AS id, TenChuDe AS name, MaChuDe AS code
      FROM ChuDe;
    `);

    const partsOfSpeech = referenceData.recordsets[0] || [];
    const topics = referenceData.recordsets[1] || [];
    const partOfSpeechById = new Map(partsOfSpeech.map((item) => [Number(item.id), Number(item.id)]));
    const partOfSpeechByName = new Map();
    const topicById = new Map(topics.map((item) => [Number(item.id), Number(item.id)]));
    const topicByName = new Map();

    for (const item of partsOfSpeech) {
      partOfSpeechByName.set(this.normalizeImportKey(item.name), Number(item.id));
      partOfSpeechByName.set(this.normalizeImportKey(item.code), Number(item.id));
    }

    for (const item of topics) {
      topicByName.set(this.normalizeImportKey(item.name), Number(item.id));
      topicByName.set(this.normalizeImportKey(item.code), Number(item.id));
    }

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];

      try {
        const term = String(this.getImportValue(row, ['term', 'word', 'vocabulary', 'tu vung', 'tu']) ?? '').trim();
        const meaning = String(this.getImportValue(row, ['meaning', 'definition', 'dinh nghia', 'nghia']) ?? '').trim();
        const phonetic = String(this.getImportValue(row, ['phonetic', 'pronunciation', 'phien am']) ?? '').trim();
        const rawPartOfSpeechId = this.getImportValue(row, ['partOfSpeechId', 'posId', 'part of speech id', 'loai tu id', 'tu loai id']);
        const rawPartOfSpeechName = this.getImportValue(row, ['partOfSpeech', 'partOfSpeechName', 'pos', 'part of speech', 'loai tu', 'tu loai']);
        const rawTopicIds = this.getImportValue(row, ['topicIds', 'topicId', 'topic ids', 'chu de ids', 'chu de id']);
        const rawTopics = this.getImportValue(row, ['topics', 'topic', 'topicNames', 'topicName', 'chu de', 'ten chu de']);
        const rawExampleSentence = this.getImportValue(row, ['exampleSentence', 'sentence', 'example', 'cau vi du', 'vi du']);
        const rawExampleMeaning = this.getImportValue(row, ['exampleMeaning', 'sentenceTranslation', 'translation', 'nghia cau vi du', 'dich']);

        if (!term || !meaning) {
          throw new Error('Thiếu các trường bắt buộc: từ, nghĩa');
        }

        let partOfSpeechId = Number(rawPartOfSpeechId);
        if (!partOfSpeechId && rawPartOfSpeechName) {
          partOfSpeechId = partOfSpeechByName.get(this.normalizeImportKey(rawPartOfSpeechName));
        }

        if (!partOfSpeechId || !partOfSpeechById.has(Number(partOfSpeechId))) {
          throw new Error('Loại từ không hợp lệ hoặc bị thiếu');
        }

        const topicIds = new Set();
        for (const value of this.splitImportList(rawTopicIds)) {
          const id = Number(value);
          if (!id || !topicById.has(id)) {
            throw new Error(`Mã chủ đề không hợp lệ: ${value}`);
          }
          topicIds.add(id);
        }

        for (const value of this.splitImportList(rawTopics)) {
          const id = Number(value);
          if (id && topicById.has(id)) {
            topicIds.add(id);
            continue;
          }

          const mappedTopicId = topicByName.get(this.normalizeImportKey(value));
          if (!mappedTopicId) {
            throw new Error(`Chủ đề không hợp lệ: ${value}`);
          }
          topicIds.add(mappedTopicId);
        }

        const examples = [];
        if (String(rawExampleSentence ?? '').trim()) {
          examples.push({
            sentence: String(rawExampleSentence).trim(),
            meaning: String(rawExampleMeaning ?? '').trim()
          });
        }

        await this.createWord({
          term,
          meaning,
          phonetic,
          partOfSpeechId: Number(partOfSpeechId),
          topicIds: [...topicIds],
          examples
        }, adminId);

        results.success += 1;
      } catch (error) {
        results.failed += 1;
        results.errors.push({
          row: index + 2,
          message: error.message
        });
      }
    }

    return results;
  }

  // --- CAU HOI ---
  static async getQuestionsByWord(wordId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('TuVungID', sql.BigInt, wordId)
      .query(`
        SELECT CauHoiID AS id, LoaiCauHoi AS questionType, NoiDungCauHoi AS questionText, 
               LuaChonJSON AS optionsJson, DapAnDung AS correctAnswer, GiaiThich AS explanation
        FROM CauHoi
        WHERE TuVungID = @TuVungID
      `);
    return result.recordset;
  }

  static async createQuestion(questionData, adminId) {
    const { wordId, questionType, questionText, optionsJson = '[]', correctAnswer, explanation } = questionData;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('TuVungID', sql.BigInt, wordId)
      .input('LoaiCauHoi', sql.NVarChar(30), questionType)
      .input('NoiDungCauHoi', sql.NVarChar(2000), questionText)
      .input('LuaChonJSON', sql.NVarChar(sql.MAX), optionsJson)
      .input('DapAnDung', sql.NVarChar(500), correctAnswer)
      .input('GiaiThich', sql.NVarChar(2000), explanation)
      .input('NguoiTaoID', sql.BigInt, adminId)
      .query(`
        INSERT INTO CauHoi (TuVungID, LoaiCauHoi, NoiDungCauHoi, LuaChonJSON, DapAnDung, GiaiThich, NguoiTaoID, ThoiDiemTao, ThoiDiemCapNhat)
        OUTPUT inserted.CauHoiID AS id
        VALUES (@TuVungID, @LoaiCauHoi, @NoiDungCauHoi, @LuaChonJSON, @DapAnDung, @GiaiThich, @NguoiTaoID, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())
      `);
    return result.recordset[0];
  }

  // --- BAI KIEM TRA NHO ---
  static async getMiniTests() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT mt.BaiKiemTraNhoID AS id, mt.TieuDeBaiKiemTra AS title, mt.MoTa AS description, 
             t.TenChuDe AS topicName, mt.TongSoCauHoi AS totalQuestions, mt.DaXuatBan AS isPublished
      FROM BaiKiemTraNho mt
      LEFT JOIN ChuDe t ON mt.ChuDeID = t.ChuDeID
      ORDER BY mt.ThoiDiemTao DESC
    `);
    return result.recordset;
  }

  static async createMiniTest(testData, adminId) {
    const { title, description, topicId, questionIds } = testData;
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();
      const request = new sql.Request(transaction);
      
      const testResult = await request
        .input('TieuDeBaiKiemTra', sql.NVarChar(255), title)
        .input('MoTa', sql.NVarChar(1000), description)
        .input('ChuDeID', sql.BigInt, topicId)
        .input('NguoiTaoID', sql.BigInt, adminId)
        .input('TongSoCauHoi', sql.Int, questionIds.length)
        .query(`
          INSERT INTO BaiKiemTraNho (TieuDeBaiKiemTra, MoTa, ChuDeID, NguoiTaoID, TongSoCauHoi, DaXuatBan, ThoiDiemTao, ThoiDiemCapNhat)
          OUTPUT inserted.BaiKiemTraNhoID AS id
          VALUES (@TieuDeBaiKiemTra, @MoTa, @ChuDeID, @NguoiTaoID, @TongSoCauHoi, 1, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())
        `);
      
      const testId = testResult.recordset[0].id;

      for (let i = 0; i < questionIds.length; i++) {
        const itemReq = new sql.Request(transaction);
        await itemReq
          .input('BaiKiemTraNhoID', sql.BigInt, testId)
          .input('CauHoiID', sql.BigInt, questionIds[i])
          .input('ThuTuHienThi', sql.Int, i + 1)
          .query(`
            INSERT INTO CauHoiBaiKiemTraNho (BaiKiemTraNhoID, CauHoiID, ThuTuHienThi)
            VALUES (@BaiKiemTraNhoID, @CauHoiID, @ThuTuHienThi)
          `);
      }

      await transaction.commit();
      return { id: testId, title };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async getDashboardStats() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM NguoiDung) AS totalUsers,
        (SELECT COUNT(*) FROM NguoiDung WHERE VaiTroNguoiDung = 'NguoiHoc') AS totalStudents,
        (SELECT COUNT(*) FROM NguoiDung WHERE VaiTroNguoiDung = 'BienTapVien') AS totalCreators,
        (SELECT COUNT(*) FROM TuVung) AS totalWords,
        (SELECT COUNT(*) FROM ChuDe) AS totalTopics,
        (SELECT COUNT(*) FROM CauHoi) AS totalQuestions,
        (SELECT COUNT(*) FROM LanLamBaiTap) AS totalAttempts,
        (SELECT COUNT(*) FROM BaiKiemTraNho) AS totalMiniTests,
        (SELECT COUNT(*) FROM TienDoTuVungNguoiDung WHERE TrangThaiGhiNho = 'DaThanhThao') AS masteredRecords,
        (SELECT COUNT(*) FROM TienDoTuVungNguoiDung WHERE NgayOnTapTiepTheo <= SYSDATETIMEOFFSET() OR NgayOnTapTiepTheo IS NULL) AS dueReviews,
        (SELECT COUNT(*) FROM NguoiDung WHERE ThoiDiemTao >= DATEADD(day, -7, SYSDATETIMEOFFSET())) AS newUsersThisWeek,
        (SELECT COUNT(DISTINCT NguoiDungID) FROM LanLamBaiTap WHERE ThoiDiemLam >= DATEADD(day, -1, SYSDATETIMEOFFSET())) AS activeUsersToday,
        (SELECT CAST(SUM(CASE WHEN DungSai = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0) AS DECIMAL(5,2)) FROM LanLamBaiTap) AS averageAccuracy;

      SELECT
        CONVERT(varchar(10), CAST(ThoiDiemTao AS date), 120) AS date,
        COUNT(*) AS users
      FROM NguoiDung
      WHERE ThoiDiemTao >= DATEADD(day, -30, SYSDATETIMEOFFSET())
      GROUP BY CAST(ThoiDiemTao AS date)
      ORDER BY CAST(ThoiDiemTao AS date);

      SELECT
        FORMAT(CAST(ThoiDiemLam AS date), 'ddd', 'en-US') AS day,
        COUNT(*) AS attempts,
        SUM(CASE WHEN DungSai = 1 THEN 1 ELSE 0 END) AS correct
      FROM LanLamBaiTap
      WHERE ThoiDiemLam >= DATEADD(day, -7, SYSDATETIMEOFFSET())
      GROUP BY CAST(ThoiDiemLam AS date)
      ORDER BY CAST(ThoiDiemLam AS date);

      SELECT VaiTroNguoiDung AS name, COUNT(*) AS value
      FROM NguoiDung
      GROUP BY VaiTroNguoiDung
      ORDER BY VaiTroNguoiDung;

      SELECT TOP 8
        'ExerciseAttempt' AS type,
        CONCAT(u.HoTen, ' answered ', w.Tu) AS title,
        CASE WHEN ea.DungSai = 1 THEN 'Correct answer' ELSE 'Needs review' END AS detail,
        ea.ThoiDiemLam AS createdAt,
        CASE WHEN ea.DungSai = 1 THEN 'emerald' ELSE 'amber' END AS tone
      FROM LanLamBaiTap ea
      JOIN NguoiDung u ON ea.NguoiDungID = u.NguoiDungID
      JOIN TuVung w ON ea.TuVungID = w.TuVungID
      ORDER BY ea.ThoiDiemLam DESC;
    `);

    return {
      ...result.recordsets[0][0],
      userGrowth: result.recordsets[1],
      weeklyActivity: result.recordsets[2],
      userTypes: result.recordsets[3],
      recentActivity: result.recordsets[4]
    };
  }

  static async getStudents() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT u.NguoiDungID AS id, u.HoTen AS fullName, u.Email AS email, u.VaiTroNguoiDung AS role,
             r.TenVaiTro AS roleName, u.DangHoatDong AS isActive, u.ThoiDiemTao AS joinedAt,
             (SELECT COUNT(*) FROM TienDoTuVungNguoiDung WHERE NguoiDungID = u.NguoiDungID AND MucDoThanhThao >= 8) AS masteredWords,
             (SELECT COUNT(*) FROM TienDoTuVungNguoiDung WHERE NguoiDungID = u.NguoiDungID) AS totalWords,
             (SELECT COUNT(*) FROM LanLamBaiTap WHERE NguoiDungID = u.NguoiDungID) AS totalAttempts,
             (SELECT MAX(ThoiDiemLam) FROM LanLamBaiTap WHERE NguoiDungID = u.NguoiDungID) AS lastActiveAt
      FROM NguoiDung u
      LEFT JOIN VaiTro r ON u.VaiTroID = r.VaiTroID
      ORDER BY u.ThoiDiemTao DESC
    `);
    return result.recordset;
  }

  static async createUser(userData) {
    const {
      fullName,
      email,
      password,
      role = 'NguoiHoc',
      isActive = true
    } = userData;

    xacThucVaiTroNguoiDung(role);

    if (!fullName || !email || !password || password.length < 6) {
      throw new Error('Dữ liệu người dùng không hợp lệ');
    }

    const pool = await poolPromise;
    const existing = await pool.request()
      .input('Email', sql.NVarChar(255), email)
      .query('SELECT NguoiDungID FROM NguoiDung WHERE Email = @Email');

    if (existing.recordset.length > 0) {
      throw new Error('Email đã tồn tại');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.request()
      .input('HoTen', sql.NVarChar(200), fullName)
      .input('Email', sql.NVarChar(255), email)
      .input('MatKhauHash', sql.NVarChar(500), passwordHash)
      .input('TenVaiTro', sql.NVarChar(50), role)
      .input('DangHoatDong', sql.Bit, Boolean(isActive))
      .query(`
        DECLARE @VaiTroID INT;
        SELECT @VaiTroID = VaiTroID FROM VaiTro WHERE TenVaiTro = @TenVaiTro;

        IF @VaiTroID IS NULL
          THROW 50002, 'Không tìm thấy vai trò', 1;

        INSERT INTO NguoiDung (HoTen, Email, MatKhauHash, VaiTroNguoiDung, VaiTroID, DangHoatDong, ThoiDiemTao, ThoiDiemCapNhat)
        OUTPUT inserted.NguoiDungID AS id, inserted.HoTen AS fullName, inserted.Email AS email, inserted.VaiTroNguoiDung AS role, inserted.DangHoatDong AS isActive
        VALUES (@HoTen, @Email, @MatKhauHash, @TenVaiTro, @VaiTroID, @DangHoatDong, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
      `);

    return result.recordset[0];
  }

  static async bulkInsertQuestions(input, adminId) {
    const rows = this.parseQuestionImport(input);
    const results = { success: 0, failed: 0, errors: [] };

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const wordId = Number(row.wordId ?? row.TuVungID ?? row.tuVungId);
      const questionType = row.questionType ?? row.LoaiCauHoi ?? row.loaiCauHoi;
      const questionText = row.questionText ?? row.NoiDungCauHoi ?? row.noiDungCauHoi;
      const correctAnswer = row.correctAnswer ?? row.DapAnDung ?? row.dapAnDung;
      const optionsJson = row.optionsJson ?? row.LuaChonJSON ?? row.luaChonJSON ?? '[]';
      const explanation = row.explanation ?? row.GiaiThich ?? row.giaiThich ?? null;

      try {
        if (!wordId || !questionType || !questionText || !correctAnswer) {
          throw new Error('Thiếu các trường bắt buộc: từ vựng ID, loại câu hỏi, nội dung câu hỏi, đáp án đúng');
        }

        JSON.parse(optionsJson || '[]');

        await this.createQuestion({
          wordId,
          questionType,
          questionText,
          optionsJson: optionsJson || '[]',
          correctAnswer,
          explanation
        }, adminId);

        results.success += 1;
      } catch (error) {
        results.failed += 1;
        results.errors.push({
          row: index + 2,
          message: error.message
        });
      }
    }

    return results;
  }

  static async updateUser(userId, userData) {
    const {
      fullName,
      email,
      password,
      role = 'NguoiHoc',
      isActive = true
    } = userData;

    xacThucVaiTroNguoiDung(role);

    if (!fullName || !email) {
      throw new Error('Dữ liệu người dùng không hợp lệ');
    }

    const pool = await poolPromise;
    const existing = await pool.request()
      .input('NguoiDungID', sql.BigInt, userId)
      .input('Email', sql.NVarChar(255), email)
      .query('SELECT NguoiDungID FROM NguoiDung WHERE Email = @Email AND NguoiDungID <> @NguoiDungID');

    if (existing.recordset.length > 0) {
      throw new Error('Email đã tồn tại');
    }

    const request = pool.request()
      .input('NguoiDungID', sql.BigInt, userId)
      .input('HoTen', sql.NVarChar(200), fullName)
      .input('Email', sql.NVarChar(255), email)
      .input('TenVaiTro', sql.NVarChar(50), role)
      .input('DangHoatDong', sql.Bit, Boolean(isActive));

    let passwordUpdate = '';
    if (password) {
      if (password.length < 6) {
        throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
      }
      const passwordHash = await bcrypt.hash(password, 10);
      request.input('MatKhauHash', sql.NVarChar(500), passwordHash);
      passwordUpdate = ', MatKhauHash = @MatKhauHash';
    }

    const result = await request.query(`
      DECLARE @VaiTroID INT;
      SELECT @VaiTroID = VaiTroID FROM VaiTro WHERE TenVaiTro = @TenVaiTro;

      IF @VaiTroID IS NULL
        THROW 50002, 'Không tìm thấy vai trò', 1;

      UPDATE NguoiDung
      SET HoTen = @HoTen,
          Email = @Email,
          VaiTroNguoiDung = @TenVaiTro,
          VaiTroID = @VaiTroID,
          DangHoatDong = @DangHoatDong,
          ThoiDiemCapNhat = SYSDATETIMEOFFSET()
          ${passwordUpdate}
      WHERE NguoiDungID = @NguoiDungID;
    `);

    return result.rowsAffected.some((count) => count > 0);
  }

  static async deleteUser(userId) {
    const pool = await poolPromise;
    const dependencies = await pool.request()
      .input('NguoiDungID', sql.BigInt, userId)
      .query(`
        SELECT
          (SELECT COUNT(*) FROM TuVung WHERE NguoiTaoID = @NguoiDungID) AS words,
          (SELECT COUNT(*) FROM CauHoi WHERE NguoiTaoID = @NguoiDungID) AS questions,
          (SELECT COUNT(*) FROM BaiKiemTraNho WHERE NguoiTaoID = @NguoiDungID) AS miniTests,
          (SELECT COUNT(*) FROM ChuDe WHERE NguoiTaoID = @NguoiDungID) AS topics
      `);

    const ownedContent = dependencies.recordset[0];
    if (ownedContent.words || ownedContent.questions || ownedContent.miniTests || ownedContent.topics) {
      throw new Error('Người dùng đang sở hữu nội dung, không thể xóa');
    }

    const result = await pool.request()
      .input('NguoiDungID', sql.BigInt, userId)
      .query('DELETE FROM NguoiDung WHERE NguoiDungID = @NguoiDungID');

    return result.rowsAffected[0] > 0;
  }

  static async toggleUserStatus(userId) {
    const pool = await poolPromise;
    await pool.request()
      .input('NguoiDungID', sql.BigInt, userId)
      .query('UPDATE NguoiDung SET DangHoatDong = CASE WHEN DangHoatDong = 1 THEN 0 ELSE 1 END, ThoiDiemCapNhat = SYSDATETIMEOFFSET() WHERE NguoiDungID = @NguoiDungID');
    return true;
  }

  static async updateUserRole(userId, roleName) {
    xacThucVaiTroNguoiDung(roleName);

    const pool = await poolPromise;
    const result = await pool.request()
      .input('NguoiDungID', sql.BigInt, userId)
      .input('TenVaiTro', sql.NVarChar(50), roleName)
      .query(`
        DECLARE @VaiTroID INT;
        SELECT @VaiTroID = VaiTroID FROM VaiTro WHERE TenVaiTro = @TenVaiTro;

        IF @VaiTroID IS NULL
          THROW 50002, 'Không tìm thấy vai trò', 1;

        UPDATE NguoiDung
        SET VaiTroNguoiDung = @TenVaiTro,
            VaiTroID = @VaiTroID,
            ThoiDiemCapNhat = SYSDATETIMEOFFSET()
        WHERE NguoiDungID = @NguoiDungID;
      `);

    return result.rowsAffected.some((count) => count > 0);
  }

  static async getAnalyticsData() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        CAST(COALESCE(AVG(CAST(CASE WHEN ea.DungSai = 1 THEN 100.0 ELSE 0.0 END AS DECIMAL(5,2))), 0) AS DECIMAL(5,2)) AS averageAccuracy,
        COUNT(ea.LanLamBaiTapID) AS totalAttempts,
        COUNT(DISTINCT ea.NguoiDungID) AS activeLearners,
        SUM(CASE WHEN ea.DungSai = 0 THEN 1 ELSE 0 END) AS wrongAttempts
      FROM LanLamBaiTap ea;

      SELECT TOP 8
        COALESCE(t.TenChuDe, 'Uncategorized') AS name,
        COUNT(ea.LanLamBaiTapID) AS attempts,
        CAST(SUM(CASE WHEN ea.DungSai = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(ea.LanLamBaiTapID), 0) AS DECIMAL(5,2)) AS completion
      FROM LanLamBaiTap ea
      JOIN TuVung w ON ea.TuVungID = w.TuVungID
      LEFT JOIN TuVungChuDe wt ON w.TuVungID = wt.TuVungID
      LEFT JOIN ChuDe t ON wt.ChuDeID = t.ChuDeID
      GROUP BY COALESCE(t.TenChuDe, 'Uncategorized')
      ORDER BY COUNT(ea.LanLamBaiTapID) DESC;

      SELECT TOP 8
        CONCAT('Q', q.CauHoiID) AS question,
        q.NoiDungCauHoi AS questionText,
        w.Tu AS term,
        COUNT(ea.LanLamBaiTapID) AS attempts,
        CAST(SUM(CASE WHEN ea.DungSai = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(ea.LanLamBaiTapID), 0) AS DECIMAL(5,2)) AS accuracy
      FROM CauHoi q
      JOIN TuVung w ON q.TuVungID = w.TuVungID
      LEFT JOIN LanLamBaiTap ea ON q.CauHoiID = ea.CauHoiID
      GROUP BY q.CauHoiID, q.NoiDungCauHoi, w.Tu
      ORDER BY accuracy ASC, attempts DESC;

      SELECT
        FORMAT(CAST(ThoiDiemLam AS date), 'ddd', 'en-US') AS day,
        COUNT(*) AS attempts,
        CAST(SUM(CASE WHEN DungSai = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0) AS DECIMAL(5,2)) AS accuracy
      FROM LanLamBaiTap
      WHERE ThoiDiemLam >= DATEADD(day, -7, SYSDATETIMEOFFSET())
      GROUP BY CAST(ThoiDiemLam AS date)
      ORDER BY CAST(ThoiDiemLam AS date);

      SELECT p.TenTuLoai AS name, COUNT(w.TuVungID) AS value
      FROM TuLoai p
      LEFT JOIN TuVung w ON p.TuLoaiID = w.TuLoaiID
      GROUP BY p.TenTuLoai
      ORDER BY p.TenTuLoai;

      SELECT TOP 5
        COALESCE(t.TenChuDe, 'Uncategorized') AS label,
        CAST(SUM(CASE WHEN ea.DungSai = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(ea.LanLamBaiTapID), 0) AS DECIMAL(5,2)) AS accuracy
      FROM LanLamBaiTap ea
      JOIN TuVung w ON ea.TuVungID = w.TuVungID
      LEFT JOIN TuVungChuDe wt ON w.TuVungID = wt.TuVungID
      LEFT JOIN ChuDe t ON wt.ChuDeID = t.ChuDeID
      GROUP BY COALESCE(t.TenChuDe, 'Uncategorized')
      ORDER BY accuracy ASC;
    `);

    return {
      summary: result.recordsets[0][0],
      popularQuizzes: result.recordsets[1],
      questionAccuracy: result.recordsets[2],
      studyActivity: result.recordsets[3],
      wordDistribution: result.recordsets[4],
      difficultTopics: result.recordsets[5]
    };
  }

  static async getContentManagementData() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM ChuDe WHERE TrangThaiNoiDung = 'DaXuatBan') +
        (SELECT COUNT(*) FROM TuVung WHERE TrangThaiNoiDung = 'DaXuatBan') +
        (SELECT COUNT(*) FROM CauHoi WHERE TrangThaiNoiDung = 'DaXuatBan') +
        (SELECT COUNT(*) FROM BaiKiemTraNho WHERE TrangThaiNoiDung = 'DaXuatBan') AS publishedItems,
        (SELECT COUNT(*) FROM TuVung) AS totalWords,
        (SELECT COUNT(*) FROM CauHoi) AS totalQuestions,
        (SELECT COUNT(*) FROM DanhMucChuDe WHERE DangHoatDong = 1) AS activeCategories,
        (SELECT COUNT(*) FROM ChuDe WHERE TrangThaiNoiDung IN ('BanNhap','ChoDuyet','BiTuChoi')) +
        (SELECT COUNT(*) FROM TuVung WHERE TrangThaiNoiDung IN ('BanNhap','ChoDuyet','BiTuChoi')) +
        (SELECT COUNT(*) FROM CauHoi WHERE TrangThaiNoiDung IN ('BanNhap','ChoDuyet','BiTuChoi')) +
        (SELECT COUNT(*) FROM BaiKiemTraNho WHERE TrangThaiNoiDung IN ('BanNhap','ChoDuyet','BiTuChoi')) AS reviewItems;

      SELECT TOP 100 *
      FROM (
        SELECT
          CONCAT('TOPIC-', t.ChuDeID) AS id,
          t.ChuDeID AS entityId,
          'Topic' AS type,
          t.TenChuDe AS title,
          COALESCE(tc.TenDanhMuc, 'Uncategorized') AS category,
          t.MaChuDe AS code,
          t.TrangThaiNoiDung AS status,
          COUNT(DISTINCT wt.TuVungID) AS itemCount,
          0 AS attempts,
          CAST(NULL AS DECIMAL(5,2)) AS accuracy,
          t.ThoiDiemCapNhat AS updatedAt
        FROM ChuDe t
        LEFT JOIN DanhMucChuDe tc ON t.DanhMucChuDeID = tc.DanhMucChuDeID
        LEFT JOIN TuVungChuDe wt ON t.ChuDeID = wt.ChuDeID
        GROUP BY t.ChuDeID, t.TenChuDe, tc.TenDanhMuc, t.MaChuDe, t.TrangThaiNoiDung, t.ThoiDiemCapNhat

        UNION ALL

        SELECT
          CONCAT('WORD-', w.TuVungID) AS id,
          w.TuVungID AS entityId,
          'Word' AS type,
          w.Tu AS title,
          COALESCE(p.TenTuLoai, 'Vocabulary') AS category,
          CAST(w.MucDoKho AS nvarchar(20)) AS code,
          w.TrangThaiNoiDung AS status,
          COUNT(DISTINCT q.CauHoiID) AS itemCount,
          COUNT(DISTINCT ea.LanLamBaiTapID) AS attempts,
          CAST(SUM(CASE WHEN ea.DungSai = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(ea.LanLamBaiTapID), 0) AS DECIMAL(5,2)) AS accuracy,
          w.ThoiDiemCapNhat AS updatedAt
        FROM TuVung w
        LEFT JOIN TuLoai p ON w.TuLoaiID = p.TuLoaiID
        LEFT JOIN CauHoi q ON w.TuVungID = q.TuVungID
        LEFT JOIN LanLamBaiTap ea ON w.TuVungID = ea.TuVungID
        GROUP BY w.TuVungID, w.Tu, p.TenTuLoai, w.MucDoKho, w.TrangThaiNoiDung, w.ThoiDiemCapNhat

        UNION ALL

        SELECT
          CONCAT('QUESTION-', q.CauHoiID) AS id,
          q.CauHoiID AS entityId,
          'Question' AS type,
          q.NoiDungCauHoi AS title,
          q.LoaiCauHoi AS category,
          w.Tu AS code,
          q.TrangThaiNoiDung AS status,
          1 AS itemCount,
          COUNT(ea.LanLamBaiTapID) AS attempts,
          CAST(SUM(CASE WHEN ea.DungSai = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(ea.LanLamBaiTapID), 0) AS DECIMAL(5,2)) AS accuracy,
          q.ThoiDiemCapNhat AS updatedAt
        FROM CauHoi q
        JOIN TuVung w ON q.TuVungID = w.TuVungID
        LEFT JOIN LanLamBaiTap ea ON q.CauHoiID = ea.CauHoiID
        GROUP BY q.CauHoiID, q.NoiDungCauHoi, q.LoaiCauHoi, w.Tu, q.TrangThaiNoiDung, q.ThoiDiemCapNhat

        UNION ALL

        SELECT
          CONCAT('MINITEST-', mt.BaiKiemTraNhoID) AS id,
          mt.BaiKiemTraNhoID AS entityId,
          'MiniTest' AS type,
          mt.TieuDeBaiKiemTra AS title,
          COALESCE(t.TenChuDe, 'General') AS category,
          CAST(mt.TongSoCauHoi AS nvarchar(20)) AS code,
          mt.TrangThaiNoiDung AS status,
          mt.TongSoCauHoi AS itemCount,
          COUNT(mta.LanLamBaiKiemTraNhoID) AS attempts,
          CAST(AVG(mta.Diem) AS DECIMAL(5,2)) AS accuracy,
          mt.ThoiDiemCapNhat AS updatedAt
        FROM BaiKiemTraNho mt
        LEFT JOIN ChuDe t ON mt.ChuDeID = t.ChuDeID
        LEFT JOIN LanLamBaiKiemTraNho mta ON mt.BaiKiemTraNhoID = mta.BaiKiemTraNhoID
        GROUP BY mt.BaiKiemTraNhoID, mt.TieuDeBaiKiemTra, t.TenChuDe, mt.TongSoCauHoi, mt.TrangThaiNoiDung, mt.ThoiDiemCapNhat
      ) content
      ORDER BY updatedAt DESC;

      SELECT TenDanhMuc AS name, MaDanhMuc AS code, ThuTuHienThi AS DisplayOrder, DangHoatDong AS IsActive
      FROM DanhMucChuDe
      ORDER BY DisplayOrder, TenDanhMuc;

      SELECT TOP 10
        LoaiDoiTuong AS type,
        DoiTuongID AS entityId,
        TrangThaiMoi AS status,
        GhiChu AS reason,
        ThoiDiemTao AS createdAt
      FROM NhatKyDuyetNoiDung
      ORDER BY ThoiDiemTao DESC;
    `);

    return {
      summary: result.recordsets[0][0],
      content: result.recordsets[1],
      categories: result.recordsets[2],
      reviewLogs: result.recordsets[3]
    };
  }

  static async getModerationData() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM NhatKyDuyetNoiDung WHERE TrangThaiMoi IN ('BanNhap','ChoDuyet','BiTuChoi')) AS openReports,
        (SELECT COUNT(*) FROM NguoiDung WHERE DangHoatDong = 0) AS restrictedUsers,
        (SELECT COUNT(*) FROM TuVung WHERE TrangThaiNoiDung <> 'DaXuatBan') +
        (SELECT COUNT(*) FROM CauHoi WHERE TrangThaiNoiDung <> 'DaXuatBan') +
        (SELECT COUNT(*) FROM ChuDe WHERE TrangThaiNoiDung <> 'DaXuatBan') +
        (SELECT COUNT(*) FROM BaiKiemTraNho WHERE TrangThaiNoiDung <> 'DaXuatBan') AS reportedContent,
        (SELECT COUNT(*) FROM NhatKyDuyetNoiDung WHERE TrangThaiMoi = 'DaXuatBan' AND ThoiDiemTao >= DATEADD(day, -7, SYSDATETIMEOFFSET())) AS resolvedThisWeek;

      SELECT TOP 50 *
      FROM (
        SELECT CONCAT('WORD-', TuVungID) AS id, 'Word' AS type, Tu AS target, TrangThaiNoiDung AS status, ThoiDiemTao AS receivedAt, NguoiTaoID AS reporterId, MucDoKho AS severityScore
        FROM TuVung WHERE TrangThaiNoiDung <> 'DaXuatBan'
        UNION ALL
        SELECT CONCAT('QUESTION-', CauHoiID), 'Question', LEFT(NoiDungCauHoi, 160), TrangThaiNoiDung, ThoiDiemTao, NguoiTaoID, MucDoKho
        FROM CauHoi WHERE TrangThaiNoiDung <> 'DaXuatBan'
        UNION ALL
        SELECT CONCAT('TOPIC-', ChuDeID), 'Topic', TenChuDe, TrangThaiNoiDung, ThoiDiemTao, NguoiTaoID, 1
        FROM ChuDe WHERE TrangThaiNoiDung <> 'DaXuatBan'
        UNION ALL
        SELECT CONCAT('MINITEST-', BaiKiemTraNhoID), 'MiniTest', TieuDeBaiKiemTra, TrangThaiNoiDung, ThoiDiemTao, NguoiTaoID, 1
        FROM BaiKiemTraNho WHERE TrangThaiNoiDung <> 'DaXuatBan'
      ) queue
      ORDER BY receivedAt DESC;

      SELECT TOP 20
        crl.NhatKyDuyetNoiDungID AS id,
        crl.LoaiDoiTuong AS type,
        crl.DoiTuongID AS entityId,
        crl.TrangThaiCu AS oldStatus,
        crl.TrangThaiMoi AS newStatus,
        crl.GhiChu AS comment,
        crl.ThoiDiemTao AS createdAt,
        u.HoTen AS actor
      FROM NhatKyDuyetNoiDung crl
      JOIN NguoiDung u ON crl.NguoiThucHienID = u.NguoiDungID
      ORDER BY crl.ThoiDiemTao DESC;
    `);

    return {
      summary: result.recordsets[0][0],
      reports: result.recordsets[1],
      actionLogs: result.recordsets[2]
    };
  }

  static async getSystemSettingsData() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM VaiTro) AS totalRoles,
        (SELECT COUNT(*) FROM Quyen) AS totalPermissions,
        (SELECT COUNT(*) FROM QuyenVaiTro) AS assignedPermissions,
        (SELECT COUNT(*) FROM NguoiDung WHERE DangHoatDong = 1) AS activeUsers,
        (SELECT COUNT(*) FROM TepMedia) AS mediaAssets;

      SELECT r.VaiTroID AS id, r.TenVaiTro AS name, r.MoTa AS description, COUNT(rp.QuyenID) AS permissionCount
      FROM VaiTro r
      LEFT JOIN QuyenVaiTro rp ON r.VaiTroID = rp.VaiTroID
      GROUP BY r.VaiTroID, r.TenVaiTro, r.MoTa
      ORDER BY r.TenVaiTro;

      SELECT r.TenVaiTro AS roleName, p.MaQuyen AS permissionCode, p.MoTa AS description
      FROM VaiTro r
      JOIN QuyenVaiTro rp ON r.VaiTroID = rp.VaiTroID
      JOIN Quyen p ON rp.QuyenID = p.QuyenID
      ORDER BY r.TenVaiTro, p.MaQuyen;

      SELECT v.Name AS name, CASE WHEN o.object_id IS NULL THEN 0 ELSE 1 END AS existsInDatabase
      FROM (VALUES
        ('Notifications'),
        ('Achievements'),
        ('UserAchievements'),
        ('TepMedia'),
        ('NhatKyDuyetNoiDung'),
        ('LanLamBaiKiemTraNho')
      ) v(Name)
      LEFT JOIN sys.objects o ON o.name = v.Name AND SCHEMA_NAME(o.schema_id) = 'dbo'
      ORDER BY v.Name;
    `);

    return {
      summary: result.recordsets[0][0],
      roles: result.recordsets[1],
      permissions: result.recordsets[2],
      modules: result.recordsets[3]
    };
  }

  static async getNotifications(limit = 50) {
    const pool = await poolPromise;
    const tableExists = await pool.request().query(`
      SELECT OBJECT_ID(N'dbo.Notifications', N'U') AS tableId
    `);

    if (!tableExists.recordset[0].tableId) {
      return [];
    }

    const result = await pool.request()
      .input('Limit', sql.Int, limit)
      .query(`
        SELECT TOP (@Limit)
          n.ThongBaoID AS id,
          n.NguoiDungID AS userId,
          u.HoTen AS fullName,
          u.Email AS email,
          n.TieuDe AS title,
          n.NoiDung AS message,
          n.LoaiThongBao AS type,
          n.KenhGiaoHang AS deliveryChannel,
          n.DaDoc AS isRead,
          n.ThoiDiemTao AS createdAt,
          n.HanhDongURL AS actionUrl
        FROM ThongBao n
        JOIN NguoiDung u ON n.NguoiDungID = u.NguoiDungID
        ORDER BY n.ThoiDiemTao DESC
      `);

    return result.recordset;
  }

  static async sendAnnouncement({ audience = 'Tất cả người dùng', title, message, deliveryChannel = 'InApp', actionUrl = null }) {
    if (!title || !message) {
      throw new Error('Thiếu tiêu đề hoặc nội dung');
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('Audience', sql.NVarChar(50), audience)
      .input('TieuDe', sql.NVarChar(200), title)
      .input('NoiDung', sql.NVarChar(2000), message)
      .input('KenhGiaoHang', sql.NVarChar(20), deliveryChannel)
      .input('HanhDongURL', sql.NVarChar(500), actionUrl)
      .query(`
        IF OBJECT_ID(N'dbo.ThongBao', N'U') IS NULL
          THROW 50020, 'Bảng ThongBao bị thiếu.', 1;

        INSERT INTO ThongBao (NguoiDungID, TieuDe, NoiDung, LoaiThongBao, KenhGiaoHang, HanhDongURL)
        SELECT
          NguoiDungID,
          @TieuDe,
          @NoiDung,
          N'Thông báo',
          CASE WHEN @KenhGiaoHang = 'Both' THEN 'InApp' ELSE @KenhGiaoHang END,
          @HanhDongURL
        FROM NguoiDung
        WHERE DangHoatDong = 1
          AND (
            @Audience = N'Tất cả người dùng'
            OR (@Audience = 'Learners' AND VaiTroNguoiDung = 'NguoiHoc')
            OR (@Audience = 'Admins' AND VaiTroNguoiDung = 'QuanTriVien')
          );

        SELECT @@ROWCOUNT AS inserted;
      `);

    return { inserted: result.recordset[0].inserted };
  }

  static async createDailyReminders() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      IF OBJECT_ID(N'dbo.ThongBao', N'U') IS NULL
        THROW 50020, 'Bảng ThongBao bị thiếu.', 1;

      INSERT INTO ThongBao (NguoiDungID, TieuDe, NoiDung, LoaiThongBao, KenhGiaoHang, HanhDongURL)
      SELECT
        u.NguoiDungID,
        N'Đã đến lúc học bài!',
        CONCAT(N'Bạn có ', due.DueWords, N' từ vựng đang chờ ôn tập hôm nay.'),
        'Nhắc nhở hàng ngày',
        'InApp',
        '/user/learn'
      FROM NguoiDung u
      CROSS APPLY
      (
        SELECT COUNT(*) AS DueWords
        FROM TienDoTuVungNguoiDung uwp
        WHERE uwp.NguoiDungID = u.NguoiDungID
          AND (uwp.NgayOnTapTiepTheo IS NULL OR uwp.NgayOnTapTiepTheo <= SYSDATETIMEOFFSET())
      ) due
      WHERE u.DangHoatDong = 1
        AND u.VaiTroNguoiDung = 'NguoiHoc'
        AND due.DueWords > 0
        AND NOT EXISTS
        (
          SELECT 1
          FROM ThongBao n
          WHERE n.NguoiDungID = u.NguoiDungID
            AND n.LoaiThongBao = 'Nhắc nhở hàng ngày'
            AND CAST(n.ThoiDiemTao AS DATE) = CAST(SYSDATETIMEOFFSET() AS DATE)
        );

      SELECT @@ROWCOUNT AS inserted;
    `);

    return { inserted: result.recordset[0].inserted };
  }
}

module.exports = AdminService;

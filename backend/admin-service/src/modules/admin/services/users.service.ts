import bcrypt from 'bcrypt';
import type { StudentFilters, UserPayload } from '../admin.types.ts';
import { AdminShared, poolPromise, sql, assertValidUserRole } from '../shared/admin.shared.ts';

class UserService extends AdminShared {
  static async getStudents(page = 1, limit = 20, filters: StudentFilters = {}) {
    const pool = await poolPromise;
    const paging = this.normalizePagination(page, limit, 100);
    const search = String(filters.search ?? '').trim();
    const status = String(filters.status ?? '').trim();
    const role = String(filters.role ?? '').trim();
    const conditions = [];
    const request = pool.request()
      .input('Offset', sql.Int, paging.offset)
      .input('Limit', sql.Int, paging.limit);

    if (search) {
      request.input('Search', sql.NVarChar(250), `%${search}%`);
      conditions.push('(u.FullName LIKE @Search OR u.Email LIKE @Search OR u.UserRole LIKE @Search OR r.RoleName LIKE @Search)');
    }

    if (status === 'active' || status === 'banned') {
      request.input('IsActive', sql.Bit, status === 'active');
      conditions.push('u.IsActive = @IsActive');
    }

    if (role) {
      request.input('RoleName', sql.NVarChar(50), role);
      conditions.push('u.UserRole = @RoleName');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await request.query(`
      SELECT COUNT_BIG(1) AS total
      FROM Users u
      LEFT JOIN Roles r ON u.RoleID = r.RoleID
      ${whereClause};

      SELECT u.UserID AS id, u.FullName AS fullName, u.Email AS email, u.UserRole AS role,
             r.RoleName AS roleName, u.IsActive AS isActive, u.CreatedAt AS joinedAt,
             (SELECT COUNT(*) FROM UserWordProgress WHERE UserID = u.UserID AND MasteryLevel >= 7) AS masteredWords,
             (SELECT COUNT(*) FROM UserWordProgress WHERE UserID = u.UserID) AS totalWords,
             (SELECT COUNT(*) FROM ExerciseAttempts WHERE UserID = u.UserID) AS totalAttempts,
             (SELECT MAX(AttemptedAt) FROM ExerciseAttempts WHERE UserID = u.UserID) AS lastActiveAt
      FROM Users u
      LEFT JOIN Roles r ON u.RoleID = r.RoleID
      ${whereClause}
      ORDER BY u.CreatedAt DESC
      OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
    `);
    return this.paginate(result.recordsets[1], result.recordsets[0][0]?.total || 0, paging.page, paging.limit);
  }

  static async createUser(userData: UserPayload) {
    const {
      fullName,
      email,
      password,
      role = 'Learner',
      isActive = true
    } = userData;

    assertValidUserRole(role);

    if (!fullName || !email || !password || password.length < 6) {
      throw new Error('Invalid user data');
    }

    const pool = await poolPromise;
    const existing = await pool.request()
      .input('Email', sql.NVarChar(255), email)
      .query('SELECT UserID FROM Users WHERE Email = @Email');

    if (existing.recordset.length > 0) {
      throw new Error('Email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.request()
      .input('FullName', sql.NVarChar(200), fullName)
      .input('Email', sql.NVarChar(255), email)
      .input('PasswordHash', sql.NVarChar(500), passwordHash)
      .input('RoleName', sql.NVarChar(50), role)
      .input('IsActive', sql.Bit, Boolean(isActive))
      .query(`
        DECLARE @RoleID INT;
        SELECT @RoleID = RoleID FROM Roles WHERE RoleName = @RoleName;

        IF @RoleID IS NULL
          THROW 50002, 'Role not found', 1;

        INSERT INTO Users (FullName, Email, PasswordHash, UserRole, RoleID, IsActive, CreatedAt, UpdatedAt)
        OUTPUT inserted.UserID AS id, inserted.FullName AS fullName, inserted.Email AS email, inserted.UserRole AS role, inserted.IsActive AS isActive
        VALUES (@FullName, @Email, @PasswordHash, @RoleName, @RoleID, @IsActive, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
      `);

    return result.recordset[0];
  }

  static async updateUser(userId, userData: UserPayload) {
    const {
      fullName,
      email,
      password,
      role = 'Learner',
      isActive = true
    } = userData;

    assertValidUserRole(role);

    if (!fullName || !email) {
      throw new Error('Invalid user data');
    }

    const pool = await poolPromise;
    const existing = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .input('Email', sql.NVarChar(255), email)
      .query('SELECT UserID FROM Users WHERE Email = @Email AND UserID <> @UserID');

    if (existing.recordset.length > 0) {
      throw new Error('Email already exists');
    }

    const request = pool.request()
      .input('UserID', sql.BigInt, userId)
      .input('FullName', sql.NVarChar(200), fullName)
      .input('Email', sql.NVarChar(255), email)
      .input('RoleName', sql.NVarChar(50), role)
      .input('IsActive', sql.Bit, Boolean(isActive));

    let passwordUpdate = '';
    if (password) {
      if (password.length < 6) {
        throw new Error('Invalid user data');
      }
      const passwordHash = await bcrypt.hash(password, 10);
      request.input('PasswordHash', sql.NVarChar(500), passwordHash);
      passwordUpdate = ', PasswordHash = @PasswordHash';
    }

    const result = await request.query(`
      DECLARE @RoleID INT;
      SELECT @RoleID = RoleID FROM Roles WHERE RoleName = @RoleName;

      IF @RoleID IS NULL
        THROW 50002, 'Role not found', 1;

      UPDATE Users
      SET FullName = @FullName,
          Email = @Email,
          UserRole = @RoleName,
          RoleID = @RoleID,
          IsActive = @IsActive,
          UpdatedAt = SYSDATETIMEOFFSET()
          ${passwordUpdate}
      WHERE UserID = @UserID;
    `);

    return result.rowsAffected.some((count) => count > 0);
  }

  static async deleteUser(userId) {
    const pool = await poolPromise;
    const dependencies = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query(`
        SELECT
          (SELECT COUNT(*) FROM Words WHERE CreatedByUserID = @UserID) AS words,
          (SELECT COUNT(*) FROM Questions WHERE CreatedByUserID = @UserID) AS questions,
          (SELECT COUNT(*) FROM MiniTests WHERE CreatedByUserID = @UserID) AS miniTests,
          (SELECT COUNT(*) FROM Topics WHERE CreatedByUserID = @UserID) AS topics
      `);

    const ownedContent = dependencies.recordset[0];
    if (ownedContent.words || ownedContent.questions || ownedContent.miniTests || ownedContent.topics) {
      throw new Error('User owns content');
    }

    const result = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query('DELETE FROM Users WHERE UserID = @UserID');

    return result.rowsAffected[0] > 0;
  }

  static async toggleUserStatus(userId) {
    const pool = await poolPromise;
    await pool.request()
      .input('UserID', sql.BigInt, userId)
      .query('UPDATE Users SET IsActive = CASE WHEN IsActive = 1 THEN 0 ELSE 1 END, UpdatedAt = SYSDATETIMEOFFSET() WHERE UserID = @UserID');
    return true;
  }

  static async updateUserRole(userId, roleName) {
    assertValidUserRole(roleName);

    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.BigInt, userId)
      .input('RoleName', sql.NVarChar(50), roleName)
      .query(`
        DECLARE @RoleID INT;
        SELECT @RoleID = RoleID FROM Roles WHERE RoleName = @RoleName;

        IF @RoleID IS NULL
          THROW 50002, 'Role not found', 1;

        UPDATE Users
        SET UserRole = @RoleName,
            RoleID = @RoleID,
            UpdatedAt = SYSDATETIMEOFFSET()
        WHERE UserID = @UserID;
      `);

    return result.rowsAffected.some((count) => count > 0);
  }

  static async getStudentDetail(studentId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.BigInt, studentId)
      .query(`
        SELECT u.UserID AS id, u.FullName AS fullName, u.Email AS email, u.UserRole AS role,
               u.IsActive AS isActive, u.CreatedAt AS joinedAt,
               u.DailyGoal AS dailyGoal, u.TotalXP AS totalXP, u.CurrentLevel AS currentLevel
        FROM Users u WHERE u.UserID = @UserID;

        SELECT COUNT(*) AS totalLearned FROM UserWordProgress WHERE UserID = @UserID AND MasteryLevel >= 3;
        SELECT COUNT(*) AS masteredWords FROM UserWordProgress WHERE UserID = @UserID AND MasteryLevel >= 7;
        SELECT COUNT(*) AS totalAttempts FROM ExerciseAttempts WHERE UserID = @UserID;
        SELECT
          CAST(SUM(CASE WHEN IsCorrect = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0) AS DECIMAL(5,2)) AS accuracy
        FROM ExerciseAttempts WHERE UserID = @UserID;

        SELECT t.TopicID AS topicId, t.TopicName AS topicName,
               COUNT(DISTINCT wt.WordID) AS totalWords,
               COUNT(DISTINCT CASE WHEN uwp.RepetitionCount > 0 THEN wt.WordID END) AS learnedWords,
               COUNT(DISTINCT CASE WHEN uwp.MasteryLevel >= 7 THEN wt.WordID END) AS masteredWords,
               ISNULL(AVG(CAST(ISNULL(uwp.MasteryLevel, 0) AS DECIMAL(10,2))), 0) AS averageMastery
        FROM Topics t
        JOIN WordTopics wt ON wt.TopicID = t.TopicID
        LEFT JOIN UserWordProgress uwp ON uwp.WordID = wt.WordID AND uwp.UserID = @UserID
        WHERE t.ContentStatus = N'Published'
        GROUP BY t.TopicID, t.TopicName
        ORDER BY averageMastery DESC;

        SELECT TOP 10
          ea.SubmittedAnswer AS answer, ea.IsCorrect AS isCorrect, ea.AttemptedAt AS date,
          w.Term AS term, w.Meaning AS meaning
        FROM ExerciseAttempts ea
        JOIN Words w ON ea.WordID = w.WordID
        WHERE ea.UserID = @UserID
        ORDER BY ea.AttemptedAt DESC;
      `);

    const user = result.recordsets[0][0];
    if (!user) return null;

    return {
      ...user,
      totalLearned: result.recordsets[1][0].totalLearned || 0,
      masteredWords: result.recordsets[2][0].masteredWords || 0,
      totalAttempts: result.recordsets[3][0].totalAttempts || 0,
      accuracy: result.recordsets[4][0]?.accuracy || 0,
      topicBreakdown: result.recordsets[5],
      recentActivity: result.recordsets[6],
    };
  }
}

export default UserService;

# Kế hoạch xây dựng Backend API - Website Luyện Từ Vựng

## 1. Mục tiêu và Tổng quan kiến trúc

- **Mục tiêu:** Xây dựng RESTful API cho website luyện từ vựng dựa trên backend Node.js (Express) hiện tại và SQL Server đã có.
- **Công nghệ:** Node.js, Express, `mssql` (Raw SQL, không ORM).
- **Công nghệ hỗ trợ AI & Bối cảnh**
  - Codegraphcontext: Công cụ trích xuất cấu trúc và mối quan hệ trong mã nguồn (như hàm nào gọi hàm nào). Công cụ này giúp AI hiểu toàn bộ dự án thay vì chỉ đọc từng tệp tin riêng lẻ.
  - Memvid: Một hệ thống bộ nhớ video hoặc hình ảnh. Nó giúp AI ghi nhớ và truy xuất thông tin từ dữ liệu thị giác (video) để trả lời các câu hỏi liên quan đến nội dung hình ảnh theo thời gian.
  - Caveman: một extension để tối ưu Token
- **Kiến trúc:** Dựa trên cấu trúc frontend hiện tại (có `app/admin` và `app/user`), API sẽ được chia namespace tương ứng:
  - `/api/auth/*`: Phân hệ xác thực.
  - `/api/admin/*`: Phân hệ quản trị (Content Creator Portal).
  - `/api/user/*`: Phân hệ người học (Core Learning Loop, Dashboard).
- **Quy tắc:** Tuân thủ `camelCase` cho biến/hàm, `PascalCase` cho class, 2-space indentation, bọc `try-catch` cho mọi controller, luôn dùng parameterized query, tạo các procedure, function để thực hiện các trức năng trong sql.

## 2. Phân tích mapping Database sang API

Dựa trên cấu trúc Database đã cho, ta có mapping tương ứng:

| Bảng Database                                       | API Endpoint tương ứng            | Quyền truy cập | Chức năng chính                                 |
| :-------------------------------------------------- | :-------------------------------- | :------------- | :---------------------------------------------- |
| `Users`                                             | `/api/auth/*`, `/api/admin/users` | Public, Admin  | Đăng ký, đăng nhập (JWT), quản lý người dùng    |
| `PartOfSpeeches`, `Topics`                          | `/api/categories/*`               | Auth           | Lấy danh mục từ loại, chủ đề                    |
| `Words`, `ExampleSentences`, `WordTopics`           | `/api/admin/words/*`              | Admin          | Quản lý từ vựng, câu ví dụ, gán chủ đề          |
| `Questions`                                         | `/api/admin/questions/*`          | Admin          | Quản lý câu hỏi trắc nghiệm                     |
| `UserWordProgress`                                  | `/api/user/flashcards`            | User           | Lấy danh sách từ cần ôn tập hôm nay             |
| `ExerciseAttempts` + SP `usp_SubmitQuestionAttempt` | `/api/user/submit-answer`         | User           | Nộp câu trả lời, tính điểm, cập nhật tiến độ SR |

## 3. Danh sách API Endpoints (Phase 1 & Phase 2)

### Phase 1: Nền tảng (Tuần 1-3)

- `POST /api/auth/register`: Đăng ký tài khoản (Tạo bản ghi trong `Users`, hash password).
- `POST /api/auth/login`: Đăng nhập, trả về JWT.
- `GET /api/categories/part-of-speeches`: Lấy danh sách từ loại.
- `GET /api/categories/topics`: Lấy danh sách chủ đề.

### Phase 2: Core Learning Loop (Tuần 4-7) - Ưu tiên cao

**Admin Portal (`/api/admin`):**

- `GET /api/admin/words`: Phân trang danh sách từ vựng.
- `POST /api/admin/words`: Thêm từ vựng mới (kèm insert `WordTopics` và `ExampleSentences` dùng Transaction).
- `PUT /api/admin/words/:id`: Cập nhật từ vựng.
- `POST /api/admin/questions`: Tạo câu hỏi cho từ vựng.

**User Portal (`/api/user`):**

- `GET /api/user/flashcards`: Lấy danh sách từ vựng cần học (Dựa trên `UserWordProgress` có `MemoryStatus = 'New'` hoặc `NextReviewDate <= GETDATE()`).
- `POST /api/user/submit-answer`: Gửi câu trả lời cho flashcard, gọi Stored Procedure `usp_SubmitQuestionAttempt`.

## 4. Kế hoạch thực thi (Các bước)

**Step 1: Setup Core & Database Connection**

- **Nhiệm vụ:** Cấu hình Express, `mssql` pool connection, middleware bảo mật (Helmet, CORS), middleware Auth (verify JWT).
- **Files thay đổi:** `src/index.js`, tạo `src/config/db.js`, `src/middlewares/auth.js`, `src/middlewares/errorHandler.js`.
- **Rủi ro:** Low (An toàn).
- **Acceptance Criteria:** Chạy server `npm run dev` không lỗi, kết nối SQL Server thành công log "DB Connected".

**Step 2: Triển khai Auth API (Phase 1)**

- **Nhiệm vụ:** Viết API Register và Login. Mật khẩu phải được hash bằng bcrypt. Trả về JWT cho request hợp lệ.
- **Files tạo mới:** `src/routes/auth.routes.js`, `src/controllers/auth.controller.js`, `src/services/auth.service.js`.
- **Rủi ro:** Medium (Cần test kỹ flow auth).
- **Acceptance Criteria:** Đăng ký thành công lưu vào DB, đăng nhập trả về đúng token, gọi API bảo vệ bằng token báo 200 OK.

**Step 3: Triển khai Admin Content API (Phase 2.1)**

- **Nhiệm vụ:** API CRUD cho `Words`, `Topics`, `Questions`. Cần handle logic Transaction khi insert Words kèm WordTopics.
- **Files tạo mới:** `src/routes/admin.routes.js`, `src/controllers/admin.controller.js`, `src/services/admin.service.js`.
- **Rủi ro:** Low.
- **Acceptance Criteria:** Admin có thể tạo từ vựng kèm topic, xem lại danh sách từ.

**Step 4: Triển khai Flashcard Engine & SR (Phase 2.2 - 2.4)**

- **Nhiệm vụ:** Lấy danh sách flashcards hôm nay. Viết API submit gọi `usp_SubmitQuestionAttempt`.
- **Files tạo mới:** `src/routes/user.routes.js`, `src/controllers/user.controller.js`, `src/services/user.service.js`.
- **Rủi ro:** High (Logic business cốt lõi, tương tác Stored Procedure).
- **Acceptance Criteria:** Lấy đúng số từ cần học. Gọi submit API trả về kết quả đúng/sai và DB cập nhật `NextReviewDate` thành công.

## 5. Ví dụ luồng code chuẩn (User Submit Answer)

**Ví dụ truy vấn SQL (`src/services/user.service.js`):**

```javascript
const { poolPromise, sql } = require("../config/db");

class UserService {
  /**
   * Gọi Stored Procedure xử lý nộp câu trả lời flashcard
   */
  static async submitQuestionAttempt(
    userId,
    questionId,
    wordId,
    submittedAnswer,
    isCorrect,
    scoreAwarded
  ) {
    const pool = await poolPromise;

    // Sử dụng Parameterized Query và gọi Stored Procedure để chống SQL Injection
    const result = await pool
      .request()
      .input("UserID", sql.Int, userId)
      .input("QuestionID", sql.Int, questionId)
      .input("WordID", sql.Int, wordId)
      .input("SubmittedAnswer", sql.NVarChar(sql.MAX), submittedAnswer)
      .input("IsCorrect", sql.Bit, isCorrect)
      .input("ScoreAwarded", sql.Decimal(5, 2), scoreAwarded)
      .execute("usp_SubmitQuestionAttempt");

    return result;
  }

  /**
   * Lấy flashcard cần học hôm nay
   */
  static async getDueFlashcards(userId) {
    const pool = await poolPromise;
    const result = await pool.request().input("UserID", sql.Int, userId).query(`
        SELECT w.WordID, w.Term, w.Meaning, w.Phonetic, q.QuestionID, q.QuestionType, q.QuestionText, q.OptionsJson
        FROM Words w
        JOIN Questions q ON w.WordID = q.WordID
        LEFT JOIN UserWordProgress uwp ON w.WordID = uwp.WordID AND uwp.UserID = @UserID
        WHERE uwp.UserWordProgressID IS NULL 
           OR uwp.MemoryStatus = 'New' 
           OR uwp.NextReviewDate <= GETDATE()
      `);
    return result.recordset;
  }
}

module.exports = UserService;
```

**Ví dụ Controller (`src/controllers/user.controller.js`):**

```javascript
const UserService = require("../services/user.service");

class UserController {
  static async submitAnswer(req, res, next) {
    try {
      const userId = req.user.id; // Lấy từ auth middleware
      const { questionId, wordId, submittedAnswer, isCorrect, scoreAwarded } =
        req.body;

      // Validate input cơ bản
      if (!questionId || !wordId) {
        return res
          .status(400)
          .json({ message: "Thiếu questionId hoặc wordId" });
      }

      await UserService.submitQuestionAttempt(
        userId,
        questionId,
        wordId,
        submittedAnswer,
        isCorrect,
        scoreAwarded
      );

      return res.status(200).json({ message: "Lưu kết quả thành công" });
    } catch (error) {
      // Log lỗi ở phía backend, không trả chi tiết DB query ra cho user (Security)
      console.error("[UserController.submitAnswer] Error:", error);
      return res.status(500).json({ message: "Lỗi server khi nộp bài" });
    }
  }
}

module.exports = UserController;
```

**Ví dụ Route (`src/routes/user.routes.js`):**

```javascript
const express = require("express");
const UserController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

// Yêu cầu đăng nhập mới được gọi các API này
router.use(authMiddleware.verifyToken);

router.post("/submit-answer", UserController.submitAnswer);
// router.get('/flashcards', UserController.getFlashcards);

module.exports = router;
```

## 6. Tiêu chuẩn và Ràng buộc

- Tuyệt đối dùng biến môi trường `.env` cho Connection String, JWT_SECRET. Không commit `.env`.
- Toàn bộ query SQL sử dụng `pool.request().input(...)` thay vì chuỗi template literal để chống SQL Injection.
- Mã lỗi API cần chuẩn hoá: 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Internal Server Error).

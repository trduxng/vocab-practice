# VocaBoost - Multi-Agent Orchestration

Project: Next.js 15 + Express.js + SQL Server vocab learning app (SRS).

## Agent Stack

Bạn (opencode) là **Orchestrator**. `agy` (Antigravity CLI) là sub-agent frontend/UI.

| Bạn (opencode) | agy |
|----------------|-----|
| Backend (Express, SQL Server, JWT) | Frontend (Next.js, Tailwind, UI components) |
| Database, Docker, DevOps | Styling, Animation, Responsive |
| Core logic, Auth, API | Pages, Forms, Modal, Layout |
| Testing, Code review | Research patterns/libraries |

## KHI NÀO TỰ ĐỘNG GỌI `agy`

Khi user request thuộc các loại sau, **BẠN PHẢI gọi `agy`** (ko tự làm):

### 1. Tạo UI component mới
User muốn thêm button, modal, form, card, layout, page mới:
```
Chạy lệnh: agy --print "Tạo [component] với props [X], style Tailwind, file: frontend/src/..." --add-dir frontend --dangerously-skip-permissions --print-timeout 3m0s
```

### 2. Sửa giao diện / styling
User muốn đổi màu, layout, responsive, animation, dark mode:
```
Chạy lệnh: agy --print "Sửa UI: [mô tả] ở file frontend/src/..." --add-dir frontend --dangerously-skip-permissions
```

### 3. Frontend bug
Bug chỉ liên quan đến UI, rendering, CSS:
```
Chạy lệnh: agy --print "Fix bug: [mô tả + error] ở frontend/src/..." --add-dir frontend --dangerously-skip-permissions
```

### 4. Nghiên cứu công nghệ frontend
Cần tìm pattern, thư viện, API mới cho frontend:
```
Chạy lệnh: agy --print "Research: [câu hỏi]" --print-timeout 3m0s
```

## KHÔNG gọi `agy` khi

- Task thuần backend (API, DB, Auth, Docker)
- Task cả frontend + backend (tự làm backend, gọi agy cho frontend)
- Task nhỏ như sửa text, đổi tên file

## Cách gọi `agy`

Luôn dùng `--print` mode:
```powershell
agy --print "MÔ TẢ CHI TIẾT task: yêu cầu, file nào, expected output" --add-dir . --dangerously-skip-permissions
```

- `--print`: chạy 1 lần, nhận kết quả text
- `--dangerously-skip-permissions`: ko block chờ approve
- `--add-dir .`: context project. Nếu chỉ liên quan frontend thì `--add-dir frontend`
- `--print-timeout 3m0s`: timeout (mặc định 5p)

## Handoff (sau khi `agy` trả output)

1. **ĐỌC output** - kiểm tra nội dung agy trả về
2. **APPLY nếu tốt** - nếu agy tạo/sửa file, xác nhận với user
3. **FIX nếu lỗi** - nếu output ko đúng, gọi lại `agy` kèm context lỗi
4. **COMMIT** - tag `[agy]` trong commit message
5. **BÁO CÁO** - nói cho user biết agy đã làm gì

## Imperative Rules

- KHI user hỏi về UI/frontend → GỌI `agy` NGAY, ko tự trả lời
- KHI user hỏi cả backend + frontend → TỰ LÀM backend, GỌI `agy` cho frontend
- SAU KHI `agy` chạy xong → ĐỌC kết quả, KIỂM TRA lỗi, BÁO CÁO user
- KHÔNG đợi user yêu cầu gọi `agy` - tự quyết định dựa trên task type

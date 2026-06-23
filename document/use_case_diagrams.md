# 3. Biểu đồ Use-case Hệ thống VocaBoost

Dưới đây là mã nguồn vẽ các biểu đồ Use-case chuẩn bằng **PlantUML**. PlantUML là ngôn ngữ chuyên dụng và chuẩn xác nhất để vẽ Use-case (tạo ra hình người que cho Actor và hình ellipse chuẩn cho Use-case). 

*Lưu ý: Bạn có thể copy mã nguồn này dán vào **[PlantText](https://www.planttext.com/)** hoặc chọn chức năng chèn PlantUML trong **Draw.io** để tải ảnh về báo cáo.*

## 3.1. Biểu đồ Use-case tổng quan hệ thống VocaBoost

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor "Học viên" as HV
actor "Biên tập viên\n(Content Creator)" as BTV
actor "Quản trị viên\n(Admin)" as QTV

package "Hệ thống VocaBoost" {
  usecase "Quản lý tài khoản cá nhân" as UC1
  usecase "Học và Luyện tập từ vựng" as UC2
  usecase "Làm bài kiểm tra" as UC3
  usecase "Quản lý nội dung học thuật" as UC4
  usecase "Kiểm duyệt nội dung" as UC5
  usecase "Quản lý người dùng" as UC6
  usecase "Thống kê và Báo cáo" as UC7
}

HV --> UC1
HV --> UC2
HV --> UC3
HV --> UC7

BTV --> UC1
BTV --> UC4
BTV --> UC7

QTV --> UC1
QTV --> UC5
QTV --> UC6
QTV --> UC7
@enduml
```

---

## 3.2. Biểu đồ Use-case phân rã theo tác nhân

### 3.2.1. Phân rã Use-case của tác nhân "Học viên"

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor "Học viên" as HV

package "Chức năng Học viên" {
  usecase "Đăng ký / Đăng nhập" as UC1
  usecase "Cập nhật thông tin cá nhân" as UC2
  usecase "Duyệt và Chọn Chủ đề học" as UC3
  usecase "Học từ vựng qua Flashcard" as UC4
  usecase "Luyện tập Spaced Repetition" as UC5
  usecase "Làm bài Mini-test" as UC6
  usecase "Xem lịch sử học tập" as UC7
  usecase "Xem Heatmap & Nhắc nhở" as UC8
}

HV --> UC1
HV --> UC2
HV --> UC3
HV --> UC4
HV --> UC5
HV --> UC6
HV --> UC7
HV --> UC8

UC4 .> UC3 : <<extends>>
UC6 .> UC7 : <<includes>>
@enduml
```

---

### 3.2.2. Phân rã Use-case của tác nhân "Biên tập viên (Content Creator)"

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor "Biên tập viên" as BTV

package "Chức năng Biên tập viên" {
  usecase "Đăng nhập" as UC1
  usecase "Quản lý Chủ đề / Bài học" as UC2
  usecase "Quản lý Từ vựng" as UC3
  usecase "Nhập từ vựng hàng loạt\n(Bulk Import)" as UC4
  usecase "Quản lý Câu hỏi trắc nghiệm" as UC5
  usecase "Quản lý Bài kiểm tra\n(Mini-test)" as UC6
  usecase "Xem thống kê nội dung" as UC7
}

BTV --> UC1
BTV --> UC2
BTV --> UC3
BTV --> UC5
BTV --> UC6
BTV --> UC7

UC4 .> UC3 : <<extends>>
@enduml
```

---

### 3.2.3. Phân rã Use-case của tác nhân "Quản trị viên (Admin)"

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor "Quản trị viên" as QTV

package "Chức năng Quản trị viên" {
  usecase "Đăng nhập" as UC1
  usecase "Quản lý Danh mục chủ đề" as UC2
  usecase "Quản lý Người dùng" as UC3
  usecase "Kiểm duyệt Nội dung" as UC4
  usecase "Quản lý Cài đặt hệ thống" as UC5
  usecase "Xem Báo cáo Tổng quan" as UC6
  
  usecase "Phân quyền / Đổi vai trò" as UC3_1
  usecase "Khóa / Mở khóa tài khoản" as UC3_2
  
  usecase "Phê duyệt nội dung" as UC4_1
  usecase "Từ chối / Yêu cầu sửa" as UC4_2
}

QTV --> UC1
QTV --> UC2
QTV --> UC3
QTV --> UC4
QTV --> UC5
QTV --> UC6

UC3_1 .> UC3 : <<extends>>
UC3_2 .> UC3 : <<extends>>
UC4_1 .> UC4 : <<extends>>
UC4_2 .> UC4 : <<extends>>
@enduml
```

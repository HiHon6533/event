# Hệ Thống Đặt Vé Sự Kiện (Event Booking System)

Một nền tảng quản lý và bán vé sự kiện toàn diệ. Hệ thống giúp kết nối các Nhà tổ chức sự kiện (Manager) với Khách hàng (User), hỗ trợ quy trình từ tạo sự kiện nhiều bước, quản lý sơ đồ chỗ ngồi, cho đến thanh toán trực tuyến và quét mã QR vé.

## Tính Năng Nổi Bật

### Cho Khách Hàng (User)
*   **Trải nghiệm người dùng:** Giao diện tối (Dark mode) hiện đại, mượt mà và trực quan.
*   **Khám phá sự kiện:** Xem danh sách, tìm kiếm thông minh thông qua từ khóa và duyệt các Sự kiện đang thịnh hành (Trending Events) với thao tác trượt tiện lợi.
*   **Đặt vé nhanh chóng:** Chọn khu vực ghế ngồi dựa trên sơ đồ sân khấu thực tế và đặt mua vé.
*   **Thanh toán an toàn:** Tích hợp cổng thanh toán trực tuyến VNPay Sandbox.
*   **Quản lý vé:** Nhận và lưu vé dưới dạng mã QR sau khi thanh toán thành công để dễ dàng check-in.
*   **Quản lý hồ sơ:** Đăng nhập, đăng ký nhanh chóng, cập nhật thông tin cá nhân và ảnh đại diện.

### Cho Nhà Tổ Chức (Manager)
*   **Đăng ký Nhà tổ chức:** Người dùng có thể nâng cấp tài khoản lên Manager bằng cách cập nhật đầy đủ thông tin (Họ tên, SĐT).
*   **Trình tạo sự kiện (Wizard steps):** Tạo sự kiện thông qua luồng từng bước chuyên nghiệp: Thông tin cơ bản -> Thông tin Venue -> Khu vực chỗ ngồi -> Danh mục vé.
*   **Quản lý truyền thông:** Tải lên banner, ảnh thu nhỏ (thumbnail) và sơ đồ chỗ ngồi.
*   **Quản lý trạng thái:** Theo dõi trạng thái duyệt sự kiện từ Admin, quản lý danh sách vé đã bán.

### Cho Quản Trị Viên (Admin)
*   **Kiểm duyệt nội dung:** Phê duyệt hoặc từ chối các sự kiện do Manager đăng tải đảm bảo chất lượng hệ thống.
*   **Quản lý hệ thống:** Giám sát người dùng và các giao dịch đặt vé trên nền tảng.

---

## Công Nghệ Sử Dụng

### Giao Diện (Frontend)
*   **Framework:** React 19 kết hợp Vite
*   **Routing:** React Router v7
*   **HTTP Client:** Axios
*   **Styling:** CSS thuần, thiết kế UI/UX theo phong cách Premium (Netflix theme)
*   **Biểu đồ & Hiệu ứng:** Recharts, React Icons, React Hot Toast

### Máy Chủ (Backend)
*   **Ngôn ngữ/Framework:** Java 21, Spring Boot 3.2.5
*   **Cơ sở dữ liệu:** MySQL, Spring Data JPA, Hibernate
*   **Bảo mật:** Spring Security, JWT (JSON Web Token)
*   **Tiện ích:** 
    *   `ZXing`: Tạo mã QR cho vé sự kiện.
    *   `JavaMailSender`: Gửi email thông báo.
    *   Tích hợp thanh toán `VNPay`.

---

## Yêu Cầu Hệ Thống (Prerequisites)

Để cài đặt và chạy dự án, máy tính của bạn cần có:
1.  **[Java JDK 21](https://www.oracle.com/java/technologies/javase/jdk21-archive-downloads.html)** trở lên.
2.  **[Node.js](https://nodejs.org/en/)** (Phiên bản v18.x trở lên) & NPM.
3.  **[MySQL](https://dev.mysql.com/downloads/installer/)** (MySQL Server phiên bản 8.0+).
4.  **Maven** (nếu không sử dụng wrapper tích hợp sẵn).
5.  Công cụ quản lý API như **Postman** (để upload ảnh ban đầu nếu cần).

---

## Hướng Dẫn Cài Đặt (Installation)

### 1. Chuẩn Bị Cơ Sở Dữ Liệu
Bạn chỉ cần tạo một Schema Database trống, Hibernate trên Spring Boot sẽ tự động tạo bảng dữ liệu:
```sql
CREATE DATABASE event_booking;
```

### 2. Cấu Hình Backend (Spring Boot)
1.  Di chuyển vào thư mục backend:
    ```bash
    cd backend
    ```
2.  Mở tệp `src/main/resources/application.properties` để cấu hình thông tin:
    *   **Cơ sở dữ liệu:**
        ```properties
        spring.datasource.url=jdbc:mysql://localhost:3306/event_booking?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=Asia/Ho_Chi_Minh&allowPublicKeyRetrieval=true
        spring.datasource.username=root
        spring.datasource.password=MẬT_KHẨU_MYSQL_CỦA_BẠN
        ```
    *   **Email (Tùy chọn nếu muốn test luồng gửi email):** Thay đổi `spring.mail.username` và `spring.mail.password` (Mật khẩu ứng dụng của Google).
    *   **Thanh toán VNPay:** Thay đổi `vnpay.tmn-code` và `vnpay.hash-secret` tài khoản Sandbox VNPay của bạn (nếu có).

3.  Biên dịch và chạy ứng dụng:
    ```bash
    # Trên Windows
    mvnw.cmd clean package
    mvnw.cmd spring-boot:run
    
    # Trên MacOS/Linux
    ./mvnw clean package
    ./mvnw spring-boot:run
    ```
    *API sẽ lắng nghe tại:* `http://localhost:8080/`

### 3. Cấu Hình Frontend (React + Vite)
1.  Mở một Terminal mới và di chuyển vào thư mục frontend:
    ```bash
    cd frontend
    ```
2.  Cài đặt các gói phụ thuộc (Dependencies):
    ```bash
    npm install
    ```
3.  (Tùy chọn) Cấu hình URL Backend: Nếu backend của bạn chạy ở port khác, hãy sửa đổi cấu hình proxy trong `vite.config.js` hoặc file chứa config Axios. Mặc định frontend sẽ giao tiếp trực tiếp với cổng `8080`.
4.  Chạy ứng dụng:
    ```bash
    npm run dev
    ```
    *Giao diện đăng nhập tại:* `http://localhost:5173/`

---

## Hướng Dẫn Sử Dụng Cơ Bản (Usage)

> **Lưu ý thao tác dữ liệu:** Dự án được thiết lập ở chế độ làm việc với dữ liệu thực tế (`spring.sql.init.mode=never`). Sẽ không có dữ liệu mồi (Data seeding) được khởi tạo tự động (như tài khoản admin, banner). Bạn phải tạo tài khoản và tự thêm sự kiện để sử dụng.

### Quy Trình Dành Cho Nhà Tổ Chức Mới
1.  Truy cập hệ thống và nhấn **Đăng ký** tài khoản mới dưới quyền User thông thường.
2.  Đi tới khu vực **Hồ sơ (Profile)** và cập nhật đầy đủ **Họ tên** và **Số điện thoại**.
3.  Nhấn nút **Đăng ký làm Nhà tổ chức** để nâng cấp quyền lên Manager (Có thể yêu cầu đăng xuất & đăng nhập lại để làm mới token).
4.  Cập nhật đầy đủ thông tin nhà tổ chức.
5.  Truy cập Dashboard, dùng **Trình tạo sự kiện đa bước (Wizard)** để thiết lập sơ đồ, giá vé, tải lên logo và banner sự kiện.
6.  Chờ Admin duyệt sự kiện trước khi được public cho Khách hàng.

### Chức Năng Của Admin
Bạn có thể can thiệp thẳng vào DB hoặc tạo tài khoản, sau đó vào bảng `users` cập nhật cột `role` rành `ROLE_ADMIN` để có quyền cao nhất nhằm duyệt các sự kiện đang chờ duyệt.

---

## Cấu Trúc Thư Mục (Folder Structure)

```text
Event-Booking-System
 ┣ backend                   # API Backend (Spring Boot)
 ┃ ┣ uploads                 # Thư mục lưu trữ tài nguyên đa phương tiện (ảnh sự kiện...)
 ┃ ┣ src/main/java           # Mã nguồn Java cốt lõi
 ┃ ┣ src/main/resources      # Cấu hình properties và templates
 ┃ ┗ pom.xml                 # Cấu hình tính cậy Maven
 ┣ frontend                  # Giao diện người dùng (React/Vite)
 ┃ ┣ src
 ┃ ┃ ┣ components            # Các block UI có thể tái sử dụng
 ┃ ┃ ┣ pages                 # Tất cả các trang giao diện (ProfilePage, EventDetailPage,...)
 ┃ ┃ ┣ utils                 # Hàm cấu hình Helpers
 ┃ ┃ ┗ App.jsx               # Entry-point chứa Router
 ┃ ┣ package.json            # Cấu hình tính cậy NPM
 ┃ ┗ vite.config.js          # Cấu hình build & proxy
 ┗ README.md                 # Tệp bạn đang đọc
```

---

*Cảm ơn bạn đã quan tâm tới dự án!*
Nhóm tác giả:
Phạm Hoài Nam - 23110127
Nguyễn Phúc Huy Hoàng - 23110100

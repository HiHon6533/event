# BÁO CÁO HƯỚNG DẪN CÀI ĐẶT VÀ KIỂM THỬ HỆ THỐNG ĐẶT VÉ SỰ KIỆN

Tài liệu này cung cấp hướng dẫn chi tiết từng bước để cài đặt, khởi chạy dự án và kịch bản (workflow) kiểm thử toàn diện tất cả các tính năng cốt lõi của hệ thống, dành cho các vai trò: Khách hàng (User), Nhà tổ chức (Manager) và Quản trị viên (Admin).

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


---



## KỊCH BẢN KIỂM THỬ TOÀN DIỆN (COMPREHENSIVE TESTING WORKFLOWS)



Lưu ý: Hệ thống không có sẵn dữ liệu mẫu. Quá trình test phải mô phỏng thao tác người dùng từ con số 0.



### Kịch Bản 1: Trải Nghiệm Khách Hàng (User) - Tạo Tài Khoản Mới

1. Truy cập giao diện ứng dụng tại `http://localhost:5173`.

2. Bấm vào **"Đăng nhập"** (Login), sau đó chọn **"Đăng ký ngay"** (Sign Up) để tạo tài khoản thường.

3. Nhập Email và Mật khẩu hợp lệ -> Tạo tài khoản thành công.

4. Hệ thống chuyển hướng tự động sang đăng nhập. Nhập tài khoản vừa tạo để truy cập vào hệ thống.

5. Truy cập phần **Hồ sơ cá nhân (Profile)**. Thực hiện cập nhật các thông tin bắt buộc: **Họ tên** và **Số điện thoại**. Thử tải ảnh lên để kiểm tra chức năng upload Avatar.



### Kịch Bản 2: Đăng Ký Hệ Sinh Thái Nhà Tổ Chức (Manager)

*(Yêu cầu thực hiện tiếp từ Kịch Bản 1 sau khi đã cập nhật đủ Hồ sơ cá nhân)*

1. Tại trang **Profile**, chọn nút **"Đăng ký làm Nhà tổ chức"**.

2. Điền thông tin về tên tổ chức, mô tả hoạt động.

3. Chờ vài giây để hệ thống lưu.

4. **Log out (Đăng xuất) và đăng nhập lại** để làm mới quyền (Role) trong hệ thống sang `ROLE_MANAGER`.

5. Đăng nhập lại. Bạn sẽ thấy góc menu báo hiệu bạn hiện là Manager và có mục truy cập "Dashboard" (Bảng điều khiển).



### Kịch Bản 3: Trình Tạo Sự Kiện Đa Bước (Manager Workflow)

*(Với tài khoản Manager từ cấu hình trên)*

1. Truy cập **Dashboard (Bảng điều khiển)** -> Nhấn tạo Sự kiện mới.

2. Hệ thống sẽ mở một màn hình Wizard đa bước:

    - **Bước 1 (Basic Info):** Nhập Tên sự kiện, chọn Danh mục (Thể thao, Ca nhạc, v.v.), nhập Mô tả chi tiết và tên/địa chỉ nhà Tổ chức.

    - **Bước 2 (Venue & Date):** Nhập ngày giờ bắt đầu và kết thúc sự kiện, ngày mở bán vé. Điền cụ thể Địa điểm tổ chức.

    - **Bước 3 (Media):** Upload hình ảnh Banner, ảnh Thumbnail và Sơ đồ chọn chỗ (Bản đồ/Sơ đồ khu vực).

    - **Bước 4 (Zones & Categories):** Khai báo các loại vé (Ví dụ: VIP, VVIP, Standard). Giá vé cho từng Zone, và số lượng vé phát hành.

3. Nhập xong, bấm **"Gửi duyệt"**. Sự kiện sẽ ở trạng thái Pending (Đang chờ duyệt).



### Kịch Bản 4: Quản Trị Viên Xét Duyệt (Admin Workflow)

*(Bạn chưa có tài khoản Admin sẵn, do đó sẽ dùng Workaround)*

1. Tự tạo một tài khoản mới bất kỳ qua trang Đăng ký (VD: `admin@gmail.com`).

2. Mở Database (Dùng Dbeaver hoặc MySQL Workbench), mở bảng `users`.

3. Tìm dòng record chứa tài khoản `admin@gmail.com`, sửa trường `role` từ `ROLE_USER` thành `ROLE_ADMIN`.

4. Đăng nhập lại trên web bằng tài khoản `admin@gmail.com` vừa cấu hình. Bạn sẽ thấy Menu Admin.

5. Truy cập **Quản lý Sự Kiện (Event Manager)** trên menu Admin:

   - Hệ thống liệt kê Sự kiện đang Pending (bạn vừa tạo bên Manager).

   - Click vào xem chi tiết, chọn **Phê duyệt (Approve)**. Trạng thái sự kiện đổi qua PUBLISHED (hoặc UPCOMING).



### Kịch Bản 5: Nhập Vai Khách Mua Vé & Thanh Toán Nâng Cao

*(Thoát tài khoản Admin, đăng nhập lại bằng 1 tài khoản thường để đóng vai Khách)*

1. Quay trở lại Trang chủ hệ thống. Kéo khu vực **Trending Events**.

   - Kiểm tra xem sự kiện mới tạo có hiện lên kèm hình ảnh đầy đủ không.

   - Thử thanh tìm kiếm bằng cách gộp chữ hoa/chữ thường, xem hệ thống có tìm đúng sự kiện hay không.

2. Bấm vào chi tiết sự kiện đã tạo.

   - Hệ thống hiển thị mô tả, banner, sơ đồ Venue.

   - Các loại vé sẽ hiển thị mức giá. Chọn số lượng vé bất kỳ.

3. Tiến hành **Thanh Toán (Checkout)**:

   - Hệ thống hiển thị tích hợp Sandbox VNPay (nếu đã cấu hình).

   - Chọn tiến hành thanh toán nội địa và nhập các mã test Sandbox thông thường của VNPay:

     Ngân hàng: NCB, Số thẻ: 9704198526191432198, Tên: NGUYEN VAN A.

   - Thanh toán báo thành công (Payment Successful).

4. Hệ thống sẽ tự động chuyển trang từ vnpay_return sang giao diện hóa đơn kết quả chi tiết kèm mã mua hàng.



### Kịch Bản 6: Quản Lý Hệ Thống Vé Mã QR (Cuối Trình Testing)

1. Truy cập mục **Vé của tôi (My Tickets)** tại giao diện User.

2. Kiểm tra xem chiếc vé vừa mua có xuất hiện trong danh sách hay không.

3. Nhấp vào vé, thông tin chi tiết (Event con, Tên khách, Loại vé, Zone) và đặc biệt phải **hiển thị được Mã QR code** chứa UID của vé để sẵn sàng cho Check-in.

4. Trở lại tài khoản hệ thống của **Manager** (Dashboard):

   - Mở chi tiết sự kiện đã bán, chọn Tab Dashboard/Tickets.

   - Xem số lượng giao dịch đã ghi nhận và số doanh thu cập nhật sau 1 lượt mua thực tế.



---


**Kết luận:** Nếu toàn bộ các bước nêu trên được thực hiện thành công và không ghi nhận thông báo lỗi trên Backend (Log) cũng như Console của Browser (Frontend), hệ thống đã vận hành hoàn hảo các luồng nghiệp vụ xương sống của nó. Bạn có thể mở rộng kiểm thử với email notification hoặc test performance nếu cần thiết.

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

### Nhóm tác giả
- Phạm Hoài Nam - 23110127
- Nguyễn Phúc Huy Hoàng - 23110100

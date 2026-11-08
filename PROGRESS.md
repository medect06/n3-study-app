# Tiến Độ Xây Dựng App Ôn Tập JLPT N3 Chuẩn Sách PDF (Mobile-First)

> File này lưu trữ toàn bộ quyết định thiết kế, thông số kỹ thuật, cấu trúc dữ liệu và tiến độ trích xuất từ 3 cuốn sách PDF gốc để đảm bảo không bao giờ mất ngữ cảnh (context) khi làm tiếp các Unit/Tuần sau.

---

## 1. Các Quyết Định Thiết Kế Đã Chốt Với Người Dùng
- **Link App Online (GitHub Pages PWA)**: https://medect06.github.io/n3-study-app/ (Kho lưu trữ: `https://github.com/medect06/n3-study-app` — mỗi khi nạp thêm Unit mới chỉ cần `git add . && git commit && git push` là điện thoại tự động cập nhật).
- **Nền tảng**: Web App chuẩn Mobile (PWA) - Gộp thành 1 ứng dụng duy nhất (`index.html` + `app.js`), có Bottom Navigation Bar (**1. Từ Vựng** • **2. Ngữ Pháp** • **3. Kanji**), hỗ trợ cài ra màn hình chính điện thoại (Add to Home Screen), dùng qua 4G/5G/Wi-Fi mọi nơi và tự lưu Offline.
- **Ngôn ngữ hiển thị**: 3 chế độ chuyển đổi tức thì trên Header:
  1. `🇻🇳 VI` (Chỉ Tiếng Việt)
  2. `🇬🇧 EN` (Chỉ Tiếng Anh)
  3. `Song ngữ` (Song ngữ Việt - Anh cùng lúc)
- **Nguồn dữ liệu**: Lấy **trực tiếp 100% từ 3 file sách PDF gốc** trong thư mục `d:\Nhật` (không phụ thuộc file HTML cũ):
  1. **Từ vựng**: `Mimi_Kara_Oboeru_N3-Goi.pdf` -> Trang sách trích xuất tại `d:\Nhật\pdf_pages\goi\`
  2. **Kanji**: `Soumatome N3 Kanji.pdf` -> Trang sách trích xuất & xoay chuẩn chiều dọc tại `d:\Nhật\pdf_pages\kanji\`
  3. **Ngữ pháp**: `Chiasemoi.com__Mimi_Kara_Oboeru_N3-Bunpou.pdf` -> Trang sách trích xuất & chuẩn hóa nền trắng chữ đen tại `d:\Nhật\pdf_pages\bunpou\`
- **Cấu trúc 4 chế độ học trong mỗi phần**:
  1. **Flashcard lật 2 mặt**:
     - Mặt trước: 100% Tiếng Nhật (Kanji + Hiragana hiện sẵn + câu ví dụ/từ ghép tiếng Nhật trong sách + phát âm TTS). Có nút nhỏ **`Ẩn Hira`** để làm mờ Hiragana tự test cách đọc (chạm vào chữ mờ để xem nhanh hoặc lật thẻ).
     - Mặt sau: Nghĩa ngôn ngữ dịch (`VI` / `EN` / `Song ngữ`) + Âm Hán Việt + Dịch câu ví dụ/cụm từ ghép (`[連]`, `[合]`, `[関]`, `[対]`, `[類]`) + Hộp **"⚠️ Lưu ý dễ sai / Bẫy thi"** ngắn gọn, súc tích.
     - Công cụ: Nút **Xáo thẻ (Shuffle)**, nút đánh dấu **"Cần ôn / Chưa thuộc"** (lưu `localStorage` + đồng bộ `/api/shared-state`) và bộ lọc **`Chưa thuộc (N)`** để chỉ ôn riêng các từ khó, hỗ trợ vuốt Trái/Phải trên màn hình cảm ứng điện thoại.
  2. **Bảng ôn nhanh (Quick List)**: Danh sách tra cứu nhanh, thanh tìm kiếm đa năng, nút **`Ẩn nghĩa để dò`**, kèm các chuyên mục mở rộng (`コラム 1~3` của sách Từ vựng, `ディクテーション` của sách Ngữ pháp).
  3. **Bài tập sách (`練習問題` / `れんしゅう`)**:
     - Giữ nguyên 100% các câu hỏi và đáp án như trong sách PDF (không lộ đáp án trước).
     - Khi bấm chọn đáp án: Báo Đúng (Xanh) / Sai (Đỏ) ngay và hiện **Khung Giải Thích Chi Tiết** (dịch câu hỏi + giải thích tại sao đáp án đúng được chọn + phân tích nghĩa các đáp án còn lại) theo ngôn ngữ đang chọn (`VI` / `EN` / `Song ngữ`).
  4. **Trang gốc (Book PDF Viewer)**: Xem trực tiếp hình ảnh trang sách PDF gốc ngay trong App (hoặc mở popup đối chiếu ngay từ từng thẻ Flashcard / từng câu Bài tập).

---

## 2. Tiến Độ Thực Hiện Từng Giai Đoạn

### ĐỢT 1: UNIT 1 CỦA CẢ 3 SÁCH PDF — ✅ ĐÃ HOÀN TẤT 100%

#### A. Khảo sát & Trích xuất trang sách từ 3 file PDF gốc
- [x] `Mimi_Kara_Oboeru_N3-Goi.pdf` -> Đã trích xuất trang 1–35 và trang đáp án 210–236 vào `d:\Nhật\pdf_pages\goi\`.
- [x] `Soumatome N3 Kanji.pdf` -> Đã trích xuất & xoay chuẩn trang 1–28 và trang đáp án 110–119 vào `d:\Nhật\pdf_pages\kanji\`.
- [x] `Chiasemoi.com__Mimi_Kara_Oboeru_N3-Bunpou.pdf` -> Đã trích xuất & chuẩn hóa độ sáng trang 1–20 và trang đáp án 115–134 vào `d:\Nhật\pdf_pages\bunpou\`.

#### B. Dữ liệu Chuẩn Sách PDF Song Ngữ (VI + EN) Đã Nạp
- [x] **1. Từ vựng Unit 01 (`d:\Nhật\data_goi_u1.js` -> `window.GOI_UNIT1_DATA`)**:
  - **120 từ vựng** (`id: 1` `男性` -> `id: 120` `生`), chia làm Step 1 (`1~71`, trang 8–16) và Step 2 (`72~120`, trang 22–27) cùng các bộ lọc chia nhỏ 20–25 từ.
  - **3 chuyên mục (Columns)**: `コラム 1: あいさつ` (trang 15), `コラム 2: 家族の呼び方` (trang 17), `コラム 3: 人を表す言葉` (trang 21).
  - **112 câu bài tập chuẩn sách**:
    - `練習問題 I (1~71)` (trang 18–20): 53 câu (Phần I, II, III-A, III-B, IV, V, VI, VII).
    - `練習問題 I (72~120)` (trang 28–29): 39 câu (Phần I, II, III, IV, V, VI-A, VI-B).
    - `練習問題 II (1~120)` (trang 30–31): 20 câu trắc nghiệm chuẩn JLPT (Phần I, II, III).
- [x] **2. Ngữ pháp Unit 01 (`d:\Nhật\data_bunpou_u1.js` -> `window.BUNPOU_UNIT1_DATA`)**:
  - **8 mẫu ngữ pháp chính** (`01 ～ことにしている`, `02 ～ことになっている`, `03 ～ようになっている`, `04 ～ような／ように`, `05 ～みたいだ` [3 nghĩa ①②③], `06 ～らしい`, `07 ～つもり`, `08 ～てくる` — trang 7–11).
  - **5 khung Ôn tập (`復習`)**: `復習 こと`, `復習 ～ようだ`, `復習 ～らしい`, `復習 ～つもり`, `復習 ～てくる`.
  - **10 câu Dictation (`ディクテーション`)** (trang 12).
  - **43 câu bài tập chuẩn sách (`練習` trang 13–14, đối chiếu đáp án trang 127)**: Phần I (8 câu), Phần II (7 câu), Phần III (10 câu), Phần IV (10 câu), Phần V (8 câu).
- [x] **3. Kanji Tuần 1 (`d:\Nhật\data_kanji_w1.js` -> `window.KANJI_WEEK1_DATA`)**:
  - **50 chữ Kanji** (`id: 1` `駐` -> `id: 50` `降`) chia theo 6 ngày học (`1日目: 駐車場`, `2日目: 横断歩道`, `3日目: サイン`, `4日目: 駅のホーム`, `5日目: 特急電車`, `6日目: バス` — trang 12–22).
  - **108 câu bài tập chuẩn sách (Ngày 1 -> Ngày 7)**:
    - Bài tập `れんしゅう` cuối mỗi ngày 1–6 (trang 13, 15, 17, 19, 21, 23: tổng 88 câu).
    - Bài kiểm tra tổng hợp `7日目：実戦問題` (trang 24–25: 20 câu).

#### C. Ứng Dụng Mobile-First PWA & Server
- [x] `d:\Nhật\index.html` — Giao diện chính Mobile-First PWA.
- [x] `d:\Nhật\app.js` — Bộ máy xử lý đa ngôn ngữ (`VI`/`EN`/`Song ngữ`), Flashcard 3D lật 2 mặt, Bảng ôn, Bài tập sách và Trình xem trang PDF gốc.
- [x] `d:\Nhật\manifest.json` & `d:\Nhật\sw.js` — Cấu hình cài đặt PWA trên điện thoại.
- [x] `d:\Nhật\server.js` — HTTP Server phục vụ `/` -> `index.html`, `/pdf_pages/...` và đồng bộ trạng thái học `/api/shared-state`.

---

## 3. Lộ Trình Mở Rộng Tiếp Theo (Khi Người Dùng Yêu Cầu)
- [ ] **Đợt 2 (Unit 2 / Tuần 2)**:
  - Từ vựng Unit 02 (`動詞 A: 121 ~ 220`, trang 32–53 trong `Mimi_Kara_Oboeru_N3-Goi.pdf`).
  - Ngữ pháp Unit 02 (`Mẫu 9 ~ 15`, trang 15–22 trong `Chiasemoi.com__Mimi_Kara_Oboeru_N3-Bunpou.pdf`).
  - Kanji Tuần 2 (`第2週 でかける②`, trang 26–41 trong `Soumatome N3 Kanji.pdf`).

# Tiến Độ Xây Dựng App Ôn Tập JLPT N3 Chuẩn Sách PDF (Mobile-First)

> File này lưu trữ toàn bộ quyết định thiết kế, thông số kỹ thuật, cấu trúc dữ liệu và tiến độ trích xuất từ 3 cuốn sách PDF gốc để đảm bảo không bao giờ mất ngữ cảnh (context) khi làm tiếp các Unit/Tuần sau.

---

## 1. Các Quyết Định Thiết Kế Đã Chốt Với Người Dùng
- **Link App Online (GitHub Pages PWA)**: https://medect06.github.io/n3-study-app/ (Kho lưu trữ: `https://github.com/medect06/n3-study-app` — mỗi khi nạp thêm Unit mới chỉ cần `git add . && git commit && git push` là điện thoại tự động cập nhật).
- **Nền tảng**: Web App chuẩn Mobile (PWA) - Gộp thành 1 ứng dụng duy nhất (`index.html` + `app.js`), có Bottom Navigation Bar (**1. Từ Vựng** • **2. Ngữ Pháp** • **3. Kanji**), thanh chọn **Unit 1 | Unit 2 | Unit 3 | Tất cả U1–U3**, hỗ trợ cài ra màn hình chính điện thoại (Add to Home Screen), dùng qua 4G/5G/Wi-Fi mọi nơi và tự lưu Offline.
- **Ngôn ngữ hiển thị**: 3 chế độ chuyển đổi tức thì trên Header:
  1. `🇻🇳 VI` (Chỉ Tiếng Việt)
  2. `🇬🇧 EN` (Chỉ Tiếng Anh)
  3. `Song ngữ` (Song ngữ Việt - Anh cùng lúc)
- **Nguồn dữ liệu**: Lấy **trực tiếp 100% từ 3 file sách PDF gốc** trong thư mục `d:\Nhật` (không phụ thuộc file HTML cũ):
  1. **Từ vựng**: `Mimi_Kara_Oboeru_N3-Goi.pdf` -> Trang sách trích xuất tại `d:\Nhật\pdf_pages\goi\`
  2. **Kanji**: `Soumatome N3 Kanji.pdf` -> Trang sách trích xuất & xoay chuẩn chiều dọc tại `d:\Nhật\pdf_pages\kanji\`
  3. **Ngữ pháp**: `Chiasemoi.com__Mimi_Kara_Oboeru_N3-Bunpou.pdf` -> Trang sách trích xuất & chuẩn hóa nền trắng chữ đen tại `d:\Nhật\pdf_pages\bunpou\`

---

## 2. Tiến Độ Thực Hiện Từng Giai Đoạn

### ĐỢT 1: UNIT 1 CỦA CẢ 3 SÁCH PDF — ✅ ĐÃ HOÀN TẤT 100%
- [x] **1. Từ vựng Unit 01 (`data_goi_u1.js` -> `window.GOI_UNIT1_DATA`)**: 120 từ (`1 ~ 120`) + 3 Columns (`コラム 1~3`) + 112 câu bài tập chuẩn sách (`練習問題 I & II`).
- [x] **2. Ngữ pháp Unit 01 (`data_bunpou_u1.js` -> `window.BUNPOU_UNIT1_DATA`)**: 8 mẫu chính (`1 ~ 8`) + 5 khung Ôn tập (`復習`) + 10 câu Dictation + 43 câu bài tập (`練習 I ~ V`).
- [x] **3. Kanji Tuần 1 (`data_kanji_w1.js` -> `window.KANJI_WEEK1_DATA`)**: 50 Kanji (`1 ~ 50`, Ngày 1–6) + 108 câu bài tập (`1日目 ~ 7日目`).
- [x] **4. Ứng dụng Mobile PWA & Sửa lỗi lật thẻ**: Đã triển khai lên GitHub Pages và sửa triệt để lỗi lật thẻ đè chữ trên điện thoại (`syncCardFaceVisibility()`).

---

### ĐỢT 2: UNIT 2 & UNIT 3 (TUẦN 2 & TUẦN 3) CỦA CẢ 3 SÁCH PDF — ✅ ĐÃ HOÀN TẤT 100%

#### Giai đoạn 2.1: Trích xuất trang sách PDF cho Unit 2 & Unit 3
- [x] **Từ vựng (`Mimi_Kara_Oboeru_N3-Goi.pdf`)**:
  - **Unit 02 動詞 A (`121 ~ 220` + まとめ 連用名詞 `221 ~ 258`)**: Trang 32–57 (`pdf_pages/goi/page_032.jpg` .. `page_057.jpg`).
  - **Unit 03 形容詞 A (`259 ~ 298` + まとめ イ形容詞+まる／める `299 ~ 310`)**: Trang 58–69 (`pdf_pages/goi/page_058.jpg` .. `page_069.jpg`).
- [x] **Kanji (`Soumatome N3 Kanji.pdf`)**:
  - **第2週 でかける② (`Tuần 2: Đi ra ngoài ②`)**: Trang 27–42 (`pdf_pages/kanji/page_027.jpg` .. `page_042.jpg`).
  - **第3週 つかう (`Tuần 3: Sử dụng`)**: Trang 43–58 (`pdf_pages/kanji/page_043.jpg` .. `page_058.jpg`).
- [x] **Ngữ pháp (`Chiasemoi.com__Mimi_Kara_Oboeru_N3-Bunpou.pdf`)**:
  - **Unit 02 (`Mẫu 9 ~ 15`)**: Trang PDF 15–22 (`pdf_pages/bunpou/page_015.jpg` .. `page_022.jpg`).
  - **Unit 03 (`Mẫu 16 ~ 28`)**: Trang PDF 23–34 (`pdf_pages/bunpou/page_023.jpg` .. `page_034.jpg`).

#### Giai đoạn 2.2: Biên tập dữ liệu chuẩn sách PDF (Song ngữ VI + EN + Bài tập giải thích chi tiết)
- [x] `d:\Nhật\data_goi_u2.js` (`window.GOI_UNIT2_DATA`): **138 từ** (`121 ~ 258`) + **4 Columns** (`コラム 4~7`) + **101 câu bài tập** (`練習問題 I & II` trang 40–41, 50–53).
- [x] `d:\Nhật\data_goi_u3.js` (`window.GOI_UNIT3_DATA`): **52 từ** (`259 ~ 310`) + **2 Columns** (`コラム 8~9`) + **38 câu bài tập** (`練習問題 I` trang 66–67).
- [x] `d:\Nhật\data_kanji_w2.js` (`window.KANJI_WEEK2_DATA`): **48 Kanji** (Tuần 2 Ngày 1–6, ID `51 ~ 98`) + **116 câu bài tập** (Ngày 1–7 trang 29–41).
- [x] `d:\Nhật\data_kanji_w3.js` (`window.KANJI_WEEK3_DATA`): **50 Kanji** (Tuần 3 Ngày 1–6, ID `114 ~ 163`) + **116 câu bài tập** (Ngày 1–7 trang 46–58).
- [x] `d:\Nhật\data_bunpou_u2.js` (`window.BUNPOU_UNIT2_DATA`): **7 mẫu ngữ pháp** (`9 ~ 15`) + **2 khung Ôn tập (`復習`)** + **15 câu Dictation** + **37 câu bài tập** (`練習` trang 19–22).
- [x] `d:\Nhật\data_bunpou_u3.js` (`window.BUNPOU_UNIT3_DATA`): **13 mẫu ngữ pháp** (`16 ~ 28`) + **14 câu Dictation** + **29 câu bài tập** (`練習` trang 28–34).

#### Giai đoạn 2.3: Tích hợp Bộ Chọn Unit (Unit 1 / Unit 2 / Unit 3 / Tất cả) vào App & Đẩy lên GitHub Pages
- [x] Cập nhật `index.html`, `app.js`, `sw.js` (`n3-pdf-study-v5`) để hỗ trợ chọn **Unit 1 | Unit 2 | Unit 3 | Tất cả (Unit 1–3)** ở mỗi phần.
- [x] Tổng kết toàn bộ dữ liệu Unit 1–3 trên App:
  - **Từ vựng (Unit 1–3)**: **310 từ vựng** + **9 chuyên mục (Columns)** + **251 câu bài tập**.
  - **Ngữ pháp (Unit 1–3)**: **28 mẫu ngữ pháp** + **7 khung Ôn tập (`復習`)** + **39 câu Dictation** + **109 câu bài tập**.
  - **Kanji (Tuần 1–3)**: **148 chữ Kanji** + **340 câu bài tập**.
  - **Tổng cộng**: **486 thẻ học (Flashcard)** + **700 câu bài tập trắc nghiệm chuẩn sách**.

---

## 3. Kế Hoạch Tiếp Theo (Khi Người Dùng Yêu Cầu Làm Tiếp Unit 4 Trở Đi)
- **Từ vựng**: Unit 04 (`動詞 B`: từ trang 70 trở đi trong `Mimi_Kara_Oboeru_N3-Goi.pdf`).
- **Ngữ pháp**: Unit 04 (`Mẫu 29 trở đi`: từ trang PDF 35 trở đi trong `Chiasemoi.com__Mimi_Kara_Oboeru_N3-Bunpou.pdf`).
- **Kanji**: Tuần 4 (`第4週`: từ trang 59 trở đi trong `Soumatome N3 Kanji.pdf`).

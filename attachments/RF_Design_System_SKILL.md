---
name: rf-design-system
description: Thiết kế giao diện, sơ đồ tri thức, tài liệu thương hiệu, catalogue và hình ảnh truyền thông theo nhận diện tối giản RF/RFA.
---
# RF DESIGN SYSTEM — SKILL V1.0

## Mục đích
Áp dụng nhất quán phong cách RF cho website, ứng dụng, dashboard, sơ đồ tư duy, báo cáo, catalogue, social media và ấn phẩm sản phẩm. Luôn ưu tiên chính xác nội dung, tính dễ đọc và khả năng sử dụng thực tế.

## Tài sản thương hiệu
- **RF**: logo chữ RF trắng trên nền đen do người dùng cung cấp; dùng cho corporate, AI, vận hành, sơ đồ.
- **RFA / RICHFISH AQUA DESIGN**: logo chữ RFA kèm giọt nước và dòng tên đầy đủ do người dùng cung cấp; dùng cho thương hiệu sản phẩm, website, catalogue khi phù hợp.
- **RF AQUARIUM**: cách ghi tên thương hiệu cho nội dung nghệ thuật thủy sinh, chế tác và xưởng.
- Không tự vẽ lại, bóp méo, thay nét, chèn vương miện, đổi kiểu chữ, biến đổi tỉ lệ hoặc thêm hiệu ứng vào logo. Chỉ dùng tài sản gốc được cung cấp. Nếu thiếu logo nguồn, dùng chữ tên thương hiệu tạm thời và yêu cầu tài sản chính thức trước khi xuất bản.
- Các hình ảnh tham chiếu của người dùng là hướng dẫn thị giác, không phải bằng chứng về đặc tính sản phẩm hay cơ sở sản xuất.

## Ngôn ngữ thị giác
- Minimalism × Premium Craftsmanship × Dark Editorial × Product-Focused.
- Phẳng, hình học rõ, khoảng trắng lớn, bố cục có thứ bậc, không rườm rà.
- Màu nền chính: #000000, #FFFFFF; phụ: #111111, #242424, #F7F7F5, #858585.
- Cyan #00B8C4 chỉ là **màu nhấn đề xuất** suy ra từ ảnh tham chiếu, chưa xác nhận là mã thương hiệu chính thức. Sử dụng tiết chế cho CTA, đường nhấn, trạng thái.
- Tránh gradient, neon, glassmorphism, đổ bóng UI, 3D UI, hiệu ứng bóng bẩy, màu trang trí không cần thiết.
- Ảnh sản phẩm vẫn được phép có ánh sáng và bóng đổ vật lý tự nhiên.

## Typography
- Ưu tiên Be Vietnam Pro cho tiếng Việt; Inter cho UI và dữ liệu; fallback sans-serif có hỗ trợ dấu.
- Display desktop 64–80px/mobile 36–44px; H1 40–48/28–32; H2 28–32/22–26; H3 20–24/18–20; body 16/15–16; caption 12–14/12–13.
- Dùng tối đa hai họ font; không ép toàn bộ đoạn văn thành chữ hoa; đảm bảo dấu tiếng Việt đúng.
- Tránh văn bản quá nhỏ: body thường >= 16px, chú thích >= 12px; infographic cần đủ lớn để đọc trên kích thước xuất thực tế.

## Lưới và khoảng cách
- Desktop 12 cột; mobile 4 cột; spacing scale 8/16/24/32/48/64/96px.
- Website content max-width 1280–1440px tùy nội dung; breakpoint cần kiểm tra ở 375, 390, 768, 1024, 1440px.
- Buttons: chữ rõ, góc vuông hoặc radius 4–6px; cards: viền mảnh, không bóng; icons: đơn sắc cùng stroke.
- Trạng thái UI cần có hover/focus/disabled/loading/error/success, điều hướng bàn phím và tương phản tối thiểu WCAG AA (4.5:1 cho chữ thường, 3:1 cho chữ lớn và các yếu tố UI cần thiết).

## Quy chuẩn hình ảnh
- Product hero: sản phẩm nổi bật, nền đen/than hoặc trắng, bố cục ít vật thể, ánh sáng studio, chi tiết gỗ/đá/rêu rõ; không giả định ảnh render là ảnh thật.
- Artisan storytelling: bàn tay, quy trình, nguyên liệu, kiểm định; không mô tả cơ sở, con người, xuất xứ, thành tích không được xác thực.
- Limited collection: không gian tối, typography mảnh, tên tác phẩm và phiên bản rõ; không tự tạo tuyên bố độc bản, chứng nhận hay giới hạn số lượng.
- Ảnh phải tôn trọng tỷ lệ thực, không thay hình dáng layout/sản phẩm gốc khi chỉ yêu cầu thiết kế bố cục.

## Sơ đồ tư duy và kiến trúc RF
- Trung tâm: RF; 4 trụ cột cốt lõi: **Sản phẩm / Sản xuất / Bán hàng / Đối tác**.
- Các lớp hỗ trợ liên kết: RF Knowledge OS, AI Agent, Tài chính, Pháp lý, Hạ tầng & Ứng dụng; không biến lớp hỗ trợ thành trụ cột cốt lõi nếu chưa được yêu cầu.
- Hai dòng sản phẩm: RF Standard (mẫu chuẩn RF) và RF Artisan Collection (nghệ nhân sáng tạo/đồng thiết kế, quyền theo hợp đồng).
- Luồng chính: Thiết kế → Đơn hàng → Phân công nghệ nhân → Sản xuất → RF QC → Đóng gói/vận chuyển → Khách hàng → Đối soát/thanh toán → Phản hồi cải tiến.
- Mỗi node mới cần: `id`, `parentId`, `name`, `purpose`, `inputs`, `outputs`, `owner`, `agent`, `links`, `status`, `version`, `updatedAt`.
- Phân biệt `proposed`, `in_progress`, `active`, `retired`; không tự tuyên bố tích hợp đã hoạt động.
- Dùng đường nối vuông góc hoặc cong nhẹ nhất quán, nét đơn sắc, tránh chồng lấn; node ngắn gọn, mô tả chi tiết ở panel riêng.
- Sơ đồ tương tác phải có zoom/pan, expand/collapse, tìm kiếm node, breadcrumb, panel chú thích, lọc theo trạng thái, xuất SVG/PNG/PDF và đọc được trên mobile.
- Dữ liệu sơ đồ là JSON/Markdown có cấu trúc, không dùng ảnh raster làm nguồn dữ liệu duy nhất.

## Quy trình thực thi bắt buộc
1. Xác định đầu ra: web/app, sơ đồ, tài liệu, social, catalogue, hình ảnh.
2. Xác định thương hiệu áp dụng (RF hay RFA) và lấy đúng logo gốc; nếu thiếu tài sản, không tự chế.
3. Xác minh dữ liệu đầu vào và phân biệt nội dung đã xác thực với đề xuất.
4. Lập hệ phân cấp nội dung, grid, component và breakpoint trước khi trang trí.
5. Áp dụng token, typography, spacing và chuẩn hình ảnh ở trên.
6. Kiểm tra responsive, khả năng đọc, chính tả tiếng Việt, contrast, tràn chữ, hình méo, logo sai, dữ liệu sai.
7. Nếu là sơ đồ, kiểm tra node/edge, quan hệ cha-con, chú thích và khả năng thêm nhánh không phá bố cục.
8. Chỉ xuất một phiên bản hoàn chỉnh, không tạo nhiều file thử hay placeholder không cần thiết.

## Tiêu chí nghiệm thu
- Logo là asset gốc, không sai hình.
- Chỉ dùng palette được duyệt; cyan tiết chế.
- UI phẳng, không bóng/gradient/neon.
- Không tràn chữ, sai dấu hoặc lỗi bố cục ở desktop/mobile.
- Nội dung và số liệu có nguồn hoặc ghi rõ là đề xuất.
- Các nhánh sơ đồ đều có metadata và quan hệ rõ ràng.
- Thành phần tương tác hoạt động, không chỉ là ảnh mô phỏng.
- File nguồn có thể chỉnh sửa; đầu ra có thể tái sử dụng.

## Prompt kích hoạt
"Áp dụng skill rf-design-system cho [đầu ra]. Dùng đúng logo [RF/RFA] gốc đã cung cấp; phong cách tối giản đen trắng, phẳng, cyan chỉ làm điểm nhấn nếu phù hợp. Giữ dữ liệu chính xác, bố cục rõ, responsive, không tạo logo mới, không gradient/neon/bóng UI. Với sơ đồ, mỗi nhánh phải có chú thích và metadata, hỗ trợ mở rộng và thu gọn. Kiểm tra tiêu chí nghiệm thu trước khi bàn giao."

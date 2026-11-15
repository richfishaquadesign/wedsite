import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ho-tro")({
  component: SupportPage,
});

const notes = [
  {
    title: "Chọn một bố cục phù hợp",
    text: "RF có nhiều dòng layout từ lũa, đá và các vật liệu tự nhiên. Hãy trao đổi kích thước bể, hình dáng mong muốn và phiên bản sản phẩm trước khi chọn. Những chi tiết của vật liệu tự nhiên có thể khác nhau giữa các tác phẩm thủ công.",
  },
  {
    title: "Khi nhận sản phẩm",
    text: "Kiểm tra tình trạng kiện hàng cùng người giao. Nếu hộp bị móp nặng hoặc có dấu hiệu vỡ bên trong, hãy liên hệ RF trước khi nhận. Giữ video mở kiện và ảnh sản phẩm để RF hỗ trợ khi có hư hỏng. Các trang sản phẩm RF hướng dẫn gửi thông tin lỗi trong vòng 24 giờ sau khi nhận. Việc xử lý cụ thể cần được RF xác nhận theo sản phẩm và tình trạng thực tế.",
  },
  {
    title: "Đặt layout vào bể",
    text: "Với các layout ghép sẵn, hướng dẫn của RF bắt đầu bằng việc tháo phần cố định trong hộp và rửa qua bố cục. Sau đó sắp xếp layout, nền và nước theo cấu trúc bể. Đọc hướng dẫn của đúng sản phẩm, đặc biệt với các bộ kit có nhiều thành phần.",
  },
];

function SupportPage() {
  return (
    <>
      <section className="page-hero">
        <img src="/images/rf/studio.png" alt="Không gian xưởng RF" />
        <div className="wrap">
          <p className="eyebrow">RF SUPPORT</p>
          <h1>
            Để bắt đầu
            <br />
            thật nhẹ nhàng.
          </h1>
          <p>Một vài lưu ý khi chọn, nhận và đặt layout vào bể.</p>
        </div>
      </section>
      <section className="wrap section" style={{ display: "grid", gap: 16 }}>
        {notes.map((note) => (
          <article key={note.title} className="support-row">
            <div>
              <strong>{note.title}</strong>
              <p>{note.text}</p>
            </div>
          </article>
        ))}
        <div className="support-row">
          <div>
            <strong>Trao đổi với RF</strong>
            <p>Liên hệ để được hỗ trợ lựa chọn bố cục, vật liệu và cách chăm sóc bể phù hợp.</p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a className="button primary" href="tel:0877445526">
              Gọi 087 744 5526
            </a>
            <a className="button" href="https://zalo.me/1393615274620008533" target="_blank" rel="noreferrer">
              Nhắn Zalo
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

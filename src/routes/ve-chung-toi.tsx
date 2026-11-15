import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/ve-chung-toi")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <section className="page-hero">
        <img src="/images/rf/team.png" alt="Đội ngũ RF tại xưởng" />
        <div className="wrap">
          <p className="eyebrow">TỪ XƯỞNG RF</p>
          <h1>
            Thiên nhiên. Nghệ thuật.
            <br />
            Dấu ấn riêng.
          </h1>
          <p>Mỗi bố cục bắt đầu bằng một hình dáng tự nhiên và được hoàn thiện bằng đôi tay.</p>
        </div>
      </section>
      <section className="wrap section">
        <div className="story-row">
          <div>
            <p className="eyebrow">CÂU CHUYỆN RICHFISH</p>
            <h2>
              Một khoảng thiên nhiên.
              <br />
              Một dấu ấn riêng.
            </h2>
            <p>
              Đá, lũa và những khoảng trống. RF bắt đầu một thế giới nhỏ từ những điều giản dị — để mang thiên
              nhiên vào không gian sống.
            </p>
            <p>Hãy bắt đầu bằng hình dáng bạn thích và không gian bạn có. Chúng tôi cùng bạn tìm một bố cục phù hợp.</p>
          </div>
          <img src="/images/rf/studio.png" alt="Không gian xưởng RF Aquarium" />
        </div>
      </section>
      <section className="wrap section" style={{ paddingTop: 0 }}>
        <div className="section-heading">
          <div>
            <h2>Từ xưởng RF</h2>
            <p>Nơi những ý tưởng trở thành hiện thực.</p>
          </div>
        </div>
        <div className="photo-grid">
          <img src="/images/rf/craft.png" alt="Chế tác thủ công từng chi tiết" />
          <img src="/images/rf/workbench.png" alt="Bàn chế tác layout" />
          <img src="/images/rf/team.png" alt="Đội ngũ xưởng RF" />
        </div>
      </section>
      <section className="wrap section" style={{ paddingTop: 0 }}>
        <div className="section-heading">
          <h2>Năng lực & sản phẩm</h2>
        </div>
        <div className="grid-three">
          <Link to="/bo-suu-tap" className="card">
            <img src="/images/black-covers/80372d411be50e697753.jpg" alt="Layout nghệ thuật" />
            <div className="card-copy">
              <h3>Layout nghệ thuật</h3>
              <p>Bố cục lũa và đá chế tác thủ công.</p>
            </div>
          </Link>
          <Link to="/bo-suu-tap" className="card">
            <img src="/images/catalog/09bff2524b8b27b88228.webp" alt="Bể kính thủy sinh" />
            <div className="card-copy">
              <h3>Bể kính thủy sinh</h3>
              <p>Lựa chọn theo không gian của bạn.</p>
            </div>
          </Link>
          <a className="card" href="tel:0877445526">
            <img src="/images/rf/craft.png" alt="Thiết kế riêng" />
            <div className="card-copy">
              <h3>Thiết kế riêng</h3>
              <p>Trao đổi ý tưởng cùng RF.</p>
            </div>
          </a>
        </div>
      </section>
      <section className="wrap">
        <div className="values">
          <span>Chế tác thủ công</span>
          <span>Vật liệu tự nhiên</span>
          <span>Chăm chút từng chi tiết</span>
          <span>Từ xưởng RF</span>
        </div>
        <div className="tracking-strip">
          <div>
            <h2>Cùng tạo nên tác phẩm của bạn.</h2>
            <p>Một hình dáng bạn thích. Một không gian bạn có.</p>
          </div>
          <a className="button" href="tel:0877445526">
            Liên hệ RF →
          </a>
        </div>
      </section>
    </>
  );
}

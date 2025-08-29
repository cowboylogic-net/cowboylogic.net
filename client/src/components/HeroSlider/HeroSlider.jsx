import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import styles from "./HeroSlider.module.css";

const HeroSlider = ({ slides, showTitles = true, autoplay = true }) => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay,
    autoplaySpeed: 3000,
    arrows: true,
    pauseOnHover: true,
    adaptiveHeight: false,
  };

  return (
    <div className={styles.sliderContainer}>
      <Slider {...settings}>
        {slides.map((s) => (
          <div key={s.id} className={styles.slide}>
            <img
              src={s.image}
              alt={s.alt || `Slide ${s.id}`}
              className={styles.image}
            />
            {showTitles && s.text && s.text !== "#" && (
              <div className={styles.overlay}>
                <h2 className={styles.title}>{s.text}</h2>
              </div>
            )}
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default HeroSlider;

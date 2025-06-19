import SliderComponent from "../Slider/SliderComponent";
import styles from "./Hero.module.css";

const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className="layoutContainer">
        <SliderComponent />
      </div>
    </section>
  );
};

export default Hero;

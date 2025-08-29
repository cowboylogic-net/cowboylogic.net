import HeroSlider from "../HeroSlider/HeroSlider";
import styles from "./Hero.module.css";

import img1 from "/assets/images/image001.jpg";
import img2 from "/assets/images/image004.jpg";

const slides = [
  { id: 1, image: img1, text: "CLStrategies" },
  { id: 2, image: img2, text: "CLPublishing" },
];

const Hero = () => (
  <section className={styles.hero}>
    <div className="layoutContainer">
      <HeroSlider slides={slides} showTitles />
    </div>
  </section>
);

export default Hero;

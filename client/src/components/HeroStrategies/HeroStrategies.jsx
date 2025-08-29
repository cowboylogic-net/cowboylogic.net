import HeroSlider from "../HeroSlider/HeroSlider";
import styles from "./HeroStrategies.module.css";

import img1 from "/assets/images/image002.jpg";
import img2 from "/assets/images/image003.jpg";

const slides = [
  { id: 1, image: img1, text: "CLStrategies" },
  { id: 2, image: img2, text: "CLStrategies" },
];

const HeroStrategies = () => (
  <section className={styles.hero_strategies}>
    <div className="layoutContainer">
      <HeroSlider slides={slides} showTitles />
    </div>
  </section>
);

export default HeroStrategies;

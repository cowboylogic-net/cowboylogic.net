import HeroSlider from "../HeroSlider/HeroSlider";
import styles from "./HeroPublishing.module.css";

import img1 from "/assets/images/image005.jpg";
import img2 from "/assets/images/image006.jpg";

const slides = [
  { id: 1, image: img1, text: "CLPublishing" },
  { id: 2, image: img2, text: "CLPublishing" },
];

const HeroPublishing = () => (
  <section className={styles.hero_publishing}>
    <div className="layoutContainer">
      <HeroSlider slides={slides} showTitles />
    </div>
  </section>
);

export default HeroPublishing;

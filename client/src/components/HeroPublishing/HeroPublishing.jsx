import SliderPublishing from "../SliderPublishing/SliderPublishing";
import styles from "./HeroPublishing.module.css";

const HeroPublishing = () => {
  return (
    <section className={styles.hero_publishing}>
      <div className="layoutContainer">
        <SliderPublishing />
      </div>
    </section>
  );
};

export default HeroPublishing;

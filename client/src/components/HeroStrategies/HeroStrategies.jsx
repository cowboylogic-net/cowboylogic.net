import SliderStrategies from "../SliderStrategies/SliderStrategies";
import styles from "./HeroStrategies.module.css";

const HeroStrategies = () => {
  return (
    <section className={styles.hero_strategies}>
      <div className="layoutContainer">
        <SliderStrategies />
      </div>
    </section>
  );
};

export default HeroStrategies;

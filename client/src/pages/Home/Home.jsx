import Hero from "../../components/Hero/Hero";
import styles from "./Home.module.css";
import EditablePage from "../../components/EditablePage/EditablePage";

const Home = () => {
  return (
    <div className={styles.container}>
      <Hero title="Home" />
      <EditablePage slug="home"/>
    </div>
  );
};

export default Home;

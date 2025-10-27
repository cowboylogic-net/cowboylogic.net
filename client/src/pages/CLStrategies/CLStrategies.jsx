import HeroStrategies from '../../components/HeroStrategies/HeroStrategies';
import styles from './CLStrategies.module.css';
import EditablePage from "../../components/EditablePage/EditablePage";

const CLStrategies = () => {
  return (
    <div className={styles.container}>
      <HeroStrategies />
 
      <EditablePage slug="clstrategies"/>
    </div>
  );
};      

export default CLStrategies;
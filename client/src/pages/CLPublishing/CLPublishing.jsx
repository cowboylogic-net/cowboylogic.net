import HeroPublishing from '../../components/HeroPublishing/HeroPublishing';
import styles from './CLPublishing.module.css';
import EditablePage from "../../components/EditablePage/EditablePage";

const CLPublishing = () => {
  return (
    <div className={styles.container}>
      <HeroPublishing />
      <EditablePage slug="clpublishing"/>
    </div>
  );
};

export default CLPublishing;
import EditablePage from "../../components/EditablePage/EditablePage";

const Books = () => {
  return (
    <EditablePage
      slug="books"
      title="Books"
      placeholder="Tell something about CowboyLogic..."
      whiteBackground={false} 
    />
  );
};

export default Books;

import Bingo from "./Bingo";

export default function App() {
  return (
    /*
      Le conteneur est en position relative pour que le logo puisse
      être positionné en absolu dans le coin supérieur gauche, sans
      du tout peser sur le centrage de la carte de bingo.
    */
    <div
      className="app-layout"
      style={{
        position: "relative",
        minHeight: "100vh",
        padding: "clamp(0.75rem, 2vh, 2rem)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
      }}
    >
      {/* Logo en absolu : hors du flux, n'affecte pas le centrage */}
      <div
        className="bingo-title"
        style={{
          position: "absolute",
          top: "clamp(0.75rem, 2vh, 2rem)",
          left: "clamp(0.75rem, 2vw, 2rem)",
        }}
      >
        <img
          src="/assets/title_img.png"
          alt="FlexObingo"
          style={{
            maxHeight: "clamp(3.5rem, 10vw, 12rem)",
            width: "auto",
            display: "block",
          }}
        />
      </div>

      {/* La carte, seule dans le flux → toujours centrée */}
      <Bingo victorySoundUrl="/legends-never-die.ogg" />
    </div>
  );
}
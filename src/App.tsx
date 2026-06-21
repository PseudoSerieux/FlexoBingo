import Bingo from "./Bingo";

export default function App() {
  return (
    <div
      className="app-layout"
      style={{
        minHeight: "100vh",
        padding: "clamp(0.75rem, 2vh, 2rem)",
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "start",
        gap: "clamp(1rem, 4vw, 3rem)",
      }}
    >
      {/* Colonne 1 : logo, ancré à gauche de sa colonne */}
      <div className="bingo-title" style={{ justifySelf: "start" }}>
        <img
          src="/assets/title_img.png"
          alt="FlexObingo"
          style={{
            maxHeight: "clamp(3.5rem, 12vw, 15rem)",
            width: "auto",
            display: "block",
          }}
        />
      </div>

      {/* Colonne 2 : la carte de bingo, toujours centrée à l'écran */}
      <Bingo victorySoundUrl="/legends-never-die.ogg" />

      {/* Colonne 3 : vide, fait juste contrepoids au logo pour garder la colonne 2 centrée */}
      <div aria-hidden="true" />
    </div>
  );
}

import Bingo from "./Bingo";

export default function App() {
  return (
    <div
      style={{
        padding: "clamp(1rem, 5vw, 2rem)",
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: "clamp(1rem, 4vw, 3rem)",
      }}
    >
      <img
        src="/assets/title_img.png"
        alt="FlexObingo"
        style={{
          maxHeight: "clamp(3.5rem, 12vw, 15rem)",
          width: "auto",
          flexShrink: 0,
        }}
      />

      <Bingo victorySoundUrl="/legends-never-die.ogg" />
    </div>
  );
}
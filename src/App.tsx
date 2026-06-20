import Bingo from "./Bingo";

export default function App() {
  return (
    <div style={{ 
      padding: "clamp(1rem, 5vw, 2rem)"
    }}>
      <div 
        className="bingo-title"
        style={{ 
          textAlign: "left", 
          marginTop: "clamp(-1rem, -12vw, -3rem)",
          paddingLeft: "clamp(1rem, 12vw, 35rem)",
          display: "flex",
          alignItems: "center"
        }}>
        <img src="/assets/title_img.png" alt="FlexObingo" style={{ maxHeight: "clamp(3.5rem, 12vw, 15rem)", width: "auto" }} />
      </div>
      <div style={{ marginTop: "clamp(-15rem, -12vw, -3rem)" }}>
        <Bingo victorySoundUrl="/legends-never-die.ogg" />
      </div>
    </div>
  );
}
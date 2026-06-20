import Bingo from "./Bingo";

export default function App() {
  return (
    <div style={{ 
      padding: "clamp(1rem, 5vw, 2rem)"
    }}>
      <h1 style={{ 
        textAlign: "left", 
        margin: 0, 
        paddingLeft: "clamp(1rem, 10vw, 35rem)",
        fontSize: "clamp(2rem, 8vw, 3.5rem)",
        fontWeight: "800",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        letterSpacing: "-0.05em",
        textShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
      }}>
        FlexObingo
      </h1>
      <div style={{ marginTop: "clamp(-2.5rem, -20vw, -3rem)" }}>
        <Bingo victorySoundUrl="/legends-never-die.ogg" />
      </div>
    </div>
  );
}
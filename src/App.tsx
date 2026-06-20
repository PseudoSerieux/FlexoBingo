import Bingo from "./Bingo";

export default function App() {
  return (
    <div style={{ padding: "2rem", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        FlexObingo
      </h1>
      {/*
        Dépose ton fichier audio dans /public (ex: public/legends-never-die.ogg)
        puis renseigne son chemin ici. Sans ce fichier, un son de victoire
        généré automatiquement est joué à la place.
      */}
      <Bingo victorySoundUrl="/legends-never-die.ogg" />
    </div>
  );
}


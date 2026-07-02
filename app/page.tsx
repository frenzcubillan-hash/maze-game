import MazeCanvas from "@/components/MazeCanvas";

export default function Page() {
  return (
    <main style={{ background: "black", height: "100vh", paddingTop: 20 }}>
      <h1 style={{ color: "white", textAlign: "center" }}>
        Escape the Maze!
      </h1>
      <h2 style={{ color: "white", textAlign: "center", fontSize: 12, marginBottom: 2}}>
        Use arrow keys to move, collect the key, and reach the exit.
      </h2>
      <MazeCanvas />
    </main>
  );
}
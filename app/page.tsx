import MazeCanvas from "@/components/MazeCanvas";

export default function Page() {
  return (
    <main style={{ background: "black", height: "100vh", paddingTop: 20 }}>
      <h1 style={{ color: "white", textAlign: "center" }}>
        Fog of War Maze
      </h1>
      <MazeCanvas />
    </main>
  );
}
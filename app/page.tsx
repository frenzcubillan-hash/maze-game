import MazeCanvas from "@/components/MazeCanvas";
import { Cinzel } from "next/font/google";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["700"],
});

export default function Page() {
  return (
    <main style={{ background: "black", height: "100vh", paddingTop: 20 }}>
      <h1 className={cinzel.className}>
Escape the Maze
</h1>
      <p>
        Use arrow keys to move, collect the key, and reach the exit.
      </p>
      <MazeCanvas />
    </main>
  );
}
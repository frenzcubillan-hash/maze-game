import MazeCanvas from "@/components/MazeCanvas";
import { Cinzel_Decorative } from "next/font/google";

const cinzel = Cinzel_Decorative({
  subsets: ["latin"],
  weight: ["700"],
});

export default function Page() {
  return (
    <main className="game-page">
      <h1 className={cinzel.className}>
        Escape the Maze
      </h1>

      <p className="subtitle">
        Find the hidden key and escape the labyrinth.
      </p>

      <MazeCanvas />
    </main>
  );
}
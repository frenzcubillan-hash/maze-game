import MazeCanvas from "@/components/MazeCanvas";

export default function Page() {
  return (
    <main className="page-shell">
      <div className="page-header">
        <div className="hero-copy">
          <p className="eyebrow">Maze Adventure</p>
          <h1>Escape the Maze</h1>
          <p className="subtitle">
            Navigate the dark corridors, recover the hidden key, and reach the real exit.
          </p>
        </div>

        <div className="instructions-card">
          <strong>How to play</strong>
          <p>Use arrow keys or on-screen controls to move.</p>
          <p>Collect the key, then find the glowing exit to win.</p>
        </div>
      </div>

      <MazeCanvas />
    </main>
  );
}
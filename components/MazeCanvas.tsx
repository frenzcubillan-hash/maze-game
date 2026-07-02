"use client";

import { useEffect, useRef, useState } from "react";
import {
  generateMaze,
  Cell,
  MazePoint,
} from "@/lib/maze";

const COLS = 30;
const ROWS = 30;

const IS_MOBILE =
  typeof window !== "undefined" &&
  window.innerWidth < 768;

const CELL_SIZE = IS_MOBILE ? 34 : 30;
const VIEWPORT_WIDTH = 450
const VIEWPORT_HEIGHT = 360;

const MOVE_SPEED = 0.12;
const MOVE_COOLDOWN = 90;

const LIGHT_DEPTH = 6;

const WALL_WIDTH = 8;
const WALL_PADDING = 2;

type Pos = {
  x: number;
  y: number;
};

type MazeData = Cell[][] & {
  destinations: MazePoint[];
  realExit: MazePoint;
};

export default function MazeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const createMaze = () =>
    generateMaze(COLS, ROWS) as MazeData;

  const [maze, setMaze] =
    useState<MazeData>(createMaze);

  const [player, setPlayer] =
    useState<Pos>({
      x: 0,
      y: 0,
    });

  const [won, setWon] =
    useState(false);

  const [key, setKey] =
    useState<Pos>({
      x: 1,
      y: 1,
    });

  const [hasKey, setHasKey] =
    useState(false);

  const renderPos = useRef({
    x: 0,
    y: 0,
  });

  const camera = useRef({
    x: 0,
    y: 0,
  });

  const lastMoveTime =
    useRef(0);

  const goal = maze?.realExit;

const fakeGoals = maze?.destinations?.filter(
  (d) =>
    goal &&
    !(
      d.x === goal.x &&
      d.y === goal.y
    )
) ?? [];

  function spawnKey() {
    let x = 0;
    let y = 0;

    do {
      x = Math.floor(Math.random() * COLS);
      y = Math.floor(Math.random() * ROWS);
    } while (
      (x === 0 && y === 0) ||
      (x === goal.x && y === goal.y) ||
      maze.destinations.some(
        (d) => d.x === x && d.y === y
      )
    );

    setKey({ x, y });
  }

  function restartGame() {
    const newMaze = createMaze();

    setMaze(newMaze);
    setPlayer({ x: 0, y: 0 });
    setWon(false);
    setHasKey(false);

    renderPos.current = { x: 0, y: 0 };

    requestAnimationFrame(() => spawnKey());
  }
function move(direction: "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight") {
  window.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: direction,
    })
  );
}
  useEffect(() => {
    spawnKey();
  }, []);

  function canMove(
    px: number,
    py: number,
    nx: number,
    ny: number
  ) {
    if (
      nx < 0 ||
      ny < 0 ||
      nx >= COLS ||
      ny >= ROWS
    )
      return false;

    const cell = maze[py][px];

    if (nx === px && ny === py - 1)
      return !cell.walls[0];

    if (nx === px + 1 && ny === py)
      return !cell.walls[1];

    if (nx === px && ny === py + 1)
      return !cell.walls[2];

    if (nx === px - 1 && ny === py)
      return !cell.walls[3];

    return false;
  }

  function computeLight() {
    const light = new Map<string, number>();

    const queue = [
      { x: player.x, y: player.y, d: 0 },
    ];

    while (queue.length) {
      const current = queue.shift()!;
      const id = `${current.x},${current.y}`;

      if (light.has(id)) continue;

      light.set(id, current.d);
      if (current.d >= LIGHT_DEPTH) continue;

      const cell = maze[current.y][current.x];

      if (!cell.walls[0] && current.y > 0)
        queue.push({
          x: current.x,
          y: current.y - 1,
          d: current.d + 1,
        });

      if (!cell.walls[1] && current.x < COLS - 1)
        queue.push({
          x: current.x + 1,
          y: current.y,
          d: current.d + 1,
        });

      if (!cell.walls[2] && current.y < ROWS - 1)
        queue.push({
          x: current.x,
          y: current.y + 1,
          d: current.d + 1,
        });

      if (!cell.walls[3] && current.x > 0)
        queue.push({
          x: current.x - 1,
          y: current.y,
          d: current.d + 1,
        });
    }

    return light;
  }

  function draw(ctx: CanvasRenderingContext2D) {
    if (!maze || maze.length === 0) return;
    ctx.clearRect(
      0,
      0,
      VIEWPORT_WIDTH,
      VIEWPORT_HEIGHT
    );

    const targetCamX =
      VIEWPORT_WIDTH / 2 -
      renderPos.current.x * CELL_SIZE -
      CELL_SIZE / 2;

    const targetCamY =
      VIEWPORT_HEIGHT / 2 -
      renderPos.current.y * CELL_SIZE -
      CELL_SIZE / 2;

    camera.current.x +=
      (targetCamX - camera.current.x) * 0.08;

    camera.current.y +=
      (targetCamY - camera.current.y) * 0.08;

    ctx.save();
    ctx.translate(camera.current.x, camera.current.y);

    const light = computeLight();

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const id = `${x},${y}`;
        const d = light.get(id);

        const visible = d !== undefined || (x === player.x && y === player.y);

        const px = x * CELL_SIZE;
        const py = y * CELL_SIZE;

        ctx.fillStyle = visible ? "#141414" : "#000000";
        ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);

        if (!visible) continue;

        const intensity = Math.max(
          0,
          1 - (d ?? 0) / LIGHT_DEPTH
        );

        ctx.fillStyle = `rgba(255,255,255,${intensity * 0.05})`;
        ctx.fillRect(
          px + WALL_PADDING,
          py + WALL_PADDING,
          CELL_SIZE - WALL_PADDING * 2,
          CELL_SIZE - WALL_PADDING * 2
        );

        const cell = maze[y][x];

        ctx.strokeStyle = `rgba(140,140,140,${
          0.35 + intensity * 0.7
        })`;

        ctx.lineWidth = WALL_WIDTH;
        ctx.lineCap = "square";

        const x1 = px;
        const y1 = py;
        const x2 = px + CELL_SIZE;
        const y2 = py + CELL_SIZE;

        if (cell.walls[0]) {
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y1);
          ctx.stroke();
        }

        if (cell.walls[1]) {
          ctx.beginPath();
          ctx.moveTo(x2, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        if (cell.walls[2]) {
          ctx.beginPath();
          ctx.moveTo(x1, y2);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        if (cell.walls[3]) {
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x1, y2);
          ctx.stroke();
        }
      }
    }

    // KEY
    if (light.has(`${key.x},${key.y}`)) {
      ctx.fillStyle = hasKey ? "#555" : "gold";

      ctx.beginPath();
      ctx.arc(
        key.x * CELL_SIZE + CELL_SIZE / 2,
        key.y * CELL_SIZE + CELL_SIZE / 2,
        5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // REAL EXIT ONLY (FAKES REMOVED VISUALLY)
    if (light.has(`${goal.x},${goal.y}`)) {
      ctx.fillStyle = hasKey ? "limegreen" : "red";

      ctx.fillRect(
        goal.x * CELL_SIZE + 5,
        goal.y * CELL_SIZE + 5,
        CELL_SIZE - 10,
        CELL_SIZE - 10
      );
    }

    // PLAYER
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(
      renderPos.current.x * CELL_SIZE + CELL_SIZE / 2,
      renderPos.current.y * CELL_SIZE + CELL_SIZE / 2,
      5,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.restore();
  }

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    canvas.width = VIEWPORT_WIDTH;
    canvas.height = VIEWPORT_HEIGHT;

    let id: number;

    function loop() {
      renderPos.current.x +=
        (player.x - renderPos.current.x) * MOVE_SPEED;

      renderPos.current.y +=
        (player.y - renderPos.current.y) * MOVE_SPEED;

      draw(ctx);

      id = requestAnimationFrame(loop);
    }

    loop();

    return () => cancelAnimationFrame(id);
  }, [maze, player, key, hasKey]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const now = Date.now();

      if (now - lastMoveTime.current < MOVE_COOLDOWN) return;

      setPlayer((p) => {
        let nx = p.x;
        let ny = p.y;

        if (e.key === "ArrowUp") ny--;
        if (e.key === "ArrowDown") ny++;
        if (e.key === "ArrowLeft") nx--;
        if (e.key === "ArrowRight") nx++;

        if (!canMove(p.x, p.y, nx, ny)) return p;

        lastMoveTime.current = now;

        if (nx === key.x && ny === key.y && !hasKey) {
          setHasKey(true);
        }

        if (hasKey && nx === goal.x && ny === goal.y) {
          setWon(true);
        }

        return { x: nx, y: ny };
      });
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [maze, key, goal, hasKey]);

  return (
  <div className="maze-wrapper">
    <canvas
      ref={canvasRef}
      className="maze-canvas"
    />

    <div className="ui">
      <button onClick={restartGame}>
        New Maze
      </button>

      <div>
        {hasKey
          ? "Key: Found"
          : "Key: Missing"}
      </div>

      <div>
        Exits: {maze.destinations.length}
      </div>
    </div>

    {/* MOBILE CONTROLS */}

    <div className="mobile-controls">

    <button onPointerDown={() => move("ArrowUp")}>
      ↑
    </button>

    <div className="middle-row">

        <button onPointerDown={() => move("ArrowLeft")}>
            ←
        </button>

        <button onPointerDown={() => move("ArrowDown")}>
            ↓
        </button>

        <button onPointerDown={() => move("ArrowRight")}>
            →
        </button>

    </div>

</div>

    {won && (
      <div className="win-overlay">
        <div>
          You Escaped!
        </div>

        <button
          onClick={restartGame}
        >
          Play Again
        </button>
      </div>
    )}
  </div>
);
}
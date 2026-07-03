import Board from "@/components/Board";
import { loadBoard } from "./actions";

export const dynamic = "force-dynamic";

export default async function Home() {
  const board = await loadBoard();
  return <Board initial={board} />;
}

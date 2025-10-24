import { useContext } from "react";
import { GameContext } from "./GameContext";

export const useGameProvider = () => useContext(GameContext);

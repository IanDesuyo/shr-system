import { createContext, useContext } from "react";

export const BtTerminalContext = createContext();

export function useBtTerminal() {
  return useContext(BtTerminalContext);
}

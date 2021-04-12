import { createContext, useContext } from "react";

export const PassContext = createContext();

export function usePassport() {
  return useContext(PassContext);
}

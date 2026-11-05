/* eslint-disable react-refresh/only-export-components */
import { createContext, type ReactNode } from "react";
import useAccountState from "../hooks/useAccountState";

interface IProvider {
  children: ReactNode;
}

export const AccountContext = createContext<null | ReturnType<
  typeof useAccountState
>>(null);

export const AccountContextProvider = ({ children }: IProvider) => {
  const contextData = useAccountState();

  return (
    <AccountContext.Provider value={contextData}>
      {children}
    </AccountContext.Provider>
  );
};

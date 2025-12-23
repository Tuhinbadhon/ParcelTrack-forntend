"use client";

import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { AuthLoader } from "./AuthLoader";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthLoader>{children}</AuthLoader>
    </Provider>
  );
}

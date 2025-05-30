"use client";

import { StoreContext, createStore } from "@/store";
import { redirect } from "next/navigation";
import { useEffect, useRef } from "react";
import Preloader from "./preloader";

const StoreLoader = ({ token, children }: React.PropsWithChildren<{ token?: string }>) => {
  if (!token) redirect("/login")

  const userStore = useRef(createStore({})).current;
  const { initConnection, loaded } = userStore();

  useEffect(() => {
    initConnection()
  }, [])

  return <StoreContext.Provider value={userStore}>
    {loaded ? children : <Preloader />}
  </StoreContext.Provider>
}

export default StoreLoader;
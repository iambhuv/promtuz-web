import { DataStore } from "@/types/store";
import { StoreApi } from "zustand";

const loadSound = async (name: string) => {
  const fr = await fetch(`/assets/sounds/${name}.wav`);
  const frb = await fr.blob();
  return URL.createObjectURL(frb);
}

export const loadSounds = async (store: StoreApi<DataStore>) => {
  const soundEntries = await Promise.all(
    ["notification"].map(async sname => [sname, { blob: await loadSound(sname) }] as [name: string, sound: { blob: string }])
  )

  store.setState({
    sounds: new Map(soundEntries)
  })
}
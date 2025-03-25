import { atom } from "recoil";

export const roomId = atom({
  key: "roomId",
  default: "",
});

export const name = atom({
  key: "username",
  default: "",
});

export const allclasses = atom({
  key: "allclass",
  default: [],
});

export const joinedClasses = atom({
  key: "joinedClass",
  default: [],
});

export const insideClassRoom = atom({
  key: "insideClassRoom",
  default: false,
});

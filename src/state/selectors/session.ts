import { atom, DefaultValue, selector } from "recoil";
import { Token } from "../../api/login";

const sessionAtom = atom({
  key: "sessionAtom",
  default: 0,
});

export default selector<Token | undefined>({
  key: "sessionSelector",
  get: async ({ get }) => {
    get(sessionAtom);

    const session = await localStorage.getItem("session");
    if (session) {
      return JSON.parse(session);
    }

    return undefined;
  },
  set: ({ set }, newValue) => {
    if (newValue instanceof DefaultValue) {
      localStorage.removeItem("session");
    } else {
      localStorage.setItem("session", JSON.stringify(newValue));
    }
    set(sessionAtom, (v: number) => v + 1);
  },
});

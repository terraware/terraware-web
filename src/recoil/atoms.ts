import { atom } from "recoil";

export const summaryData = atom({
  key: 'summaryData',
  default: {
    "droppedOff": 0,
    "processed": 0,
    "dried": 0,
    "withdrawn": 0
  },
});

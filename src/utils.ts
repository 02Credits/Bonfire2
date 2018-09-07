import m from "mithril";

export const unicodeHigh = '\ufff0';

export interface Position {
  x: number,
  y: number
}

export function withKey(keyCode: number, callback: () => void) {
  return function(e: KeyboardEvent) {
    if (e.keyCode == keyCode) callback();
  }
}

export function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
}

import { canvasX, canvasY, jumpTo, positionSettled } from "./canvas";

export function jumpIfNeeded()  {
  if (location.hash != "") {
    let pos = location.hash;
    let yIndex = pos.indexOf('y');
    let x = parseInt(pos.substr(2, yIndex - 1));
    let y = parseInt(pos.substr(yIndex + 1));

    if (x != Math.floor(-canvasX) || y != Math.floor(-canvasY)) {
      jumpTo(x, y);
    }
  }
}

export function hookHashChange() {
  window.onhashchange = jumpIfNeeded;
}

positionSettled.Subscribe(pos => {
  location.hash = `x${pos.x}y${pos.y}`;
});

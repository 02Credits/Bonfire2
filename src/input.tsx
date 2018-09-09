import m from "mithril";
import stream from "mithril/stream";
import moment from "moment";

import { hideKeyboard } from "./utils";
import { pinMessage } from "./dbManager";

let targetX: number?;
let targetY: number?;

let inputDom: Element = null;

export function target(x: number, y: number) {
  if (inputDom === document.activeElement) {
    targetX = null;
    targetY = null
    hideKeyboard();
  } else {
    targetX = x;
    targetY = y;
    inputDom.focus();
  }
}

export function Input() {
  let partialInput = stream<string>();

  function submit() {
    let timeCreated = moment().utc().valueOf();
    let author = localStorage["username"] as string;
    let content = partialInput();
    pinMessage({
      x: targetX,
      y: targetY,
      timeCreated,
      author,
      content
    })
    partialInput("");
    targetX = null;
    targetY = null;
    hideKeyboard();
  }

  function create(vnode: m.VnodeDOM) {
    inputDom = vnode.dom;
  }

  function remove() {
    inputDom = null;
  }

  function keyPress(e: KeyboardEvent) {
    if (e.keyCode == 13) { // Enter
      submit();
    } else if (e.keyCode == 27) {
      targetX = null;
      targetY = null;
      hideKeyboard();
    }
  }

  function blur() {
    targetX = null;
    targetY = null;
  }

  return {
    view: () => {
      return <div id="input">
        <input oncreate={create}
               onremove={remove}
               oninput={m.withAttr('value', partialInput)}
               onkeypress={keyPress}
               onblur={blur}
               value={partialInput()} />
      </div>;
    }
  }
}

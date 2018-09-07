import m from "mithril";
import stream from "mithril/stream";
import moment from "moment";

import { withKey } from "./utils";
import { pinMessage } from "./dbManager";

export var targetX: number?;
export var targetY: number?;

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
  }

  return {
    view: () => {
      return <div id="input">
        <input oninput={m.withAttr('value', partialInput)}
               onkeypress={withKey(13, submit)}
               value={partialInput()} />
      </div>;
    }
  }
}

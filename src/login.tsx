import m from "mithril";
import stream from "mithril/stream";

import { draw } from "./index";
import { withKey } from "./utils";

interface LoginAttributes {
  username: stream.Stream<string>
}

export function Login() {
  var partialUsername = stream<string>();

  function submit() {
    localStorage.username = partialUsername();
    draw();
  }

  return {
    view: () => <div>
      <p>Username:</p>
      <input oninput={m.withAttr('value', partialUsername)}
             onkeypress={withKey(13, submit)} />
      <p style="color: red;">Note: Pick wisely as it wont get reset. Press enter to submit.</p>
    </div>
  }
}

import m from "mithril";
import stream from "mithril/stream";
import { Login } from "./login";
import { Input } from "./input";
import { drawCanvas, jumpTo } from "./canvas";
import { jumpIfNeeded, hookHashChange } from "./hashManager";

if (module.hot) {
  module.hot.accept(function () {
    location.reload();
  })
}

hookHashChange();
jumpIfNeeded();

export async function draw() {
  if (localStorage.username === undefined) {
    m.render(document.body, <Login/>)
  } else {
    m.render(document.body, <div>
      {await drawCanvas()}
      <Input/>
    </div>);
  }
}

draw();

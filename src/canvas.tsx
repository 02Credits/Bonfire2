import m from "mithril";
import stream from "mithril/stream";
import PouchDB from "pouchdb-browser";

import { EventManager1 } from "./eventManager";
import { draw } from "./index";
import { fetchMessages, loadedChunks, loadedMessages, unpinMessage } from "./dbManager";
import { onFrame } from "./animationManager";
import { Position } from "./utils";

const canvasFriction: number = 0.9;

export var canvasX = 0;
export var canvasY = 0;

export var positionUpdated = new EventManager1<Position>();
export var positionSettled = new EventManager1<Position>();

export var mouseX: number? = null;
export var mouseY: number? = null;

export var canvasChunkX = 0;
export var canvasChunkY = 0;

let canvasVX = 0;
let canvasVY = 0;

let currentDown: boolean? = null;

let currentX: number? = null;
let currentY: number? = null;

function updateCanvasPosition(x: number, y: number) {
  canvasX = x;
  canvasY = y;

  let pos = {
    x: Math.floor(-canvasX),
    y: Math.floor(-canvasY)
  };
  positionUpdated.Publish(pos);

  let newChunkX = -Math.floor(canvasX / 1000);
  let newChunkY = -Math.floor(canvasY / 1000);

  if (newChunkX != canvasChunkX || newChunkY != canvasChunkY) {
    canvasChunkX = newChunkX;
    canvasChunkY = newChunkY;
    fetchMessages(canvasChunkX, canvasChunkY);
  }
}

function pointerEvent(e: PointerEvent) {
  mouseX = e.x;
  mouseY = e.y;

  let newDown = false;

  if (e.pointerType == "mouse") {
    newDown = (e.buttons & 4) == 4;
  } else if (e.pointerType == "touch" || e.pointerType == "pen") {
    if (e.isPrimary) {
      newDown = (e.buttons & 1) == 1;
    }
  }

  if (newDown && currentDown) {
    canvasVX = mouseX - currentX;
    canvasVY = mouseY - currentY;
  }

  currentDown = newDown;

  if (currentDown) {
    currentX = mouseX;
    currentY = mouseY;
    e.preventDefault()
  }
}

let hasSettled = false;
onFrame.Subscribe(() => {
  if (canvasVX != 0 || canvasVY != 0) {
    hasSettled = false;
    updateCanvasPosition(canvasX + canvasVX, canvasY + canvasVY);

    canvasVX = canvasVX * canvasFriction;
    canvasVY = canvasVY * canvasFriction;

    if (Math.abs(canvasVX) < 0.5) canvasVX = 0;
    if (Math.abs(canvasVY) < 0.5) canvasVY = 0;
  } else if (!hasSettled) {
    var pos = {
      x: Math.floor(-canvasX),
      y: Math.floor(-canvasY)
    };
    positionSettled.Publish(pos);
  }
});

function drawMessage(messageData: MessageData) {
  if (messageData != undefined) {
    let messageStyle = {
      left: messageData.x,
      top: messageData.y
    };

    function click(e: MouseEvent) {
      if (e.ctrlKey) {
        unpinMessage(messageData["_id"]);
        e.preventDefault();
      }
    }

    return <div class="messageContainer"
                style={messageStyle}
                key={messageData["_id"]}>
      <div class="message"
                  id={messageData["_id"]}
                  onclick={click}>
        {m.trust(messageData.content)}
      </div>
    </div>;
  }
  return null;
}

function drawChunk(chunk: Position) {
  let chunkStyle = {
    left: chunk.x * 1000,
    top: chunk.y * 1000
  };

  return <div class="chunk"
              style={chunkStyle}
              touch-action="none">
    <p class="chunkLabel">X: {chunk.x} Y: {chunk.y}</p>
  </div>
}

export async function drawCanvas() {
  if (loadedChunks == null || loadedMessages == null) {
    await fetchMessages();
  }

  let canvasStyle = {
    left: canvasX,
    top: canvasY,
  }

  var token: number;
  function create(vnode: m.Vnode)  {
    token = positionUpdated.Subscribe(() => {
      vnode.dom.style = `left: ${canvasX}; top: ${canvasY};`:
    });
  }

  function remove(vnode: m.Vnode) {
    positionUpdated.Unsubscribe(token);
  }

  return <div id="canvas"
              style={canvasStyle}
              touch-action="none"
              onpointerdown={pointerEvent}
              onpointerup={pointerEvent}
              onpointermove={pointerEvent}
              oncreate={create}
              onremove={remove}>
    {loadedChunks.map(drawChunk)}
    {loadedMessages.map(drawMessage)}
  </div>;
}

export function jumpTo(x: number, y: number) {
  updateCanvasPosition(-x, -y);
}

window.bonfire = { jumpTo, ...window.bonfire };

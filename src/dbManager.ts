import PouchDB from "pouchdb-browser";
import moment from "moment";

import { draw } from "./index";
import { mouseX, canvasX, canvasChunkX, mouseY, canvasY, canvasChunkY } from "./canvas";
import { Position, unicodeHigh, guid } from "./utils";

interface MessageData {
  _id?: string;
  x: number;
  y: number;
  timeCreated?: number;
  author?: string;
  content: string;
}

export var loadedChunks: Position[] = null;
export var loadedMessages: MessageData[] = null;

let messages = new PouchDB<MessageData>("http://uwhouse.ddns.net:5984/brocouncil-messages");

messages.changes({
  live: true,
  since: "now"
}).on("change", () => {
  fetchMessages();
  draw();
});

function getMessagePrefix(chunkX: number, chunkY: number) {
  return `message_${chunkX}_${chunkY}_`;
}

export function setMessageId(message: MessageData) {
  let chunkX = Math.floor(message.x / 1000);
  let chunkY = Math.floor(message.y / 1000);
  message["_id"] = `${getMessagePrefix(chunkX, chunkY)}${message.author}_${message.timeCreated}`;
}

export async function fetchMessages() {
  let minChunkX = canvasChunkX - 2;
  let minChunkY = canvasChunkY - 2;
  let maxChunkX = minChunkX + 3;
  let maxChunkY = minChunkY + 3;

  loadedChunks = [];

  for (let x = minChunkX; x <= maxChunkX; x++) {
    for (let y = minChunkY; y <= maxChunkY; y++) {
      loadedChunks.push({ x, y });
    }
  }

  loadedMessages = [];
  for (let chunkPos of loadedChunks) {
    let chunkMessages = await messagesInChunk(chunkPos.x, chunkPos.y);
    loadedMessages = loadedMessages.concat(chunkMessages);
  }
  draw();
}

export async function pinMessage(message: MessageData) {
  message.x = message.x || mouseX - canvasX;
  message.y = message.y || mouseY - canvasY;
  message.author = message.author || localStorage.username
  message.timeCreated = message.timeCreated || moment().utc().valueOf();
  setMessageId(message);

  messages.post(message);
}

export async function unpinMessage(id: string) {
  try {
    let message = await messages.get(id);
    try {
      messages.remove(message);
    } catch {
      console.error("Couldn't remove message with id: " + id);
    }
  } catch {
    console.error("No message with id: " + id);
  }
}

export async function messagesInChunk(chunkX: number, chunkY: number) {
  let chunkPrefix = getMessagePrefix(chunkX, chunkY);
  return (await messages.allDocs({
    include_docs: true,
    startkey: chunkPrefix,
    endkey: chunkPrefix + '\uffff'
  })).rows.map(row => row.doc);
}

window.bonfire = { pinMessage, unpinMessage, messagesInChunk, ...window.bonfire };

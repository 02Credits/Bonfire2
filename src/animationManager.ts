import { EventManager0 } from "./eventManager";

export let onFrame = new EventManager0();

onFrame.Subscribe(() => requestAnimationFrame(() => onFrame.Publish()))
requestAnimationFrame(() => onFrame.Publish());

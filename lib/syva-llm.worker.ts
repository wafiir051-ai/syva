/// <reference lib="webworker" />
// Runs the language model off the main thread so the 3D scene and hand tracking stay smooth.
import { WebWorkerMLCEngineHandler } from '@mlc-ai/web-llm';

const handler = new WebWorkerMLCEngineHandler();
self.onmessage = (msg: MessageEvent) => {
  handler.onmessage(msg);
};

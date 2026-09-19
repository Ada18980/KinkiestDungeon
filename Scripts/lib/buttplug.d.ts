import * as ButtplugModule from '@zendrex/buttplug.js';

declare global {
  const Buttplug: typeof ButtplugModule;
  namespace Buttplug {
    export type ButtplugClient = ButtplugModule.ButtplugClient;
    export type Device = ButtplugModule.Device;
  }
}

export {};
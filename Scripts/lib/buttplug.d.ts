import * as ButtplugModule from '@zendrex/buttplug.js';
import * as ButtplugPatternModule from '@zendrex/buttplug.js/patterns';

declare global {
  const Buttplug: typeof ButtplugModule;
  const ButtplugPatterns: typeof ButtplugPatternModule;
  namespace Buttplug {
    export type ButtplugClient = ButtplugModule.ButtplugClient;
    export type Device = ButtplugModule.Device;
  }
  namespace ButtplugPatterns {
    export type PatternEngine = ButtplugPatternModule.PatternEngine;
    export type PatternDescriptor = ButtplugPatternModule.PatternDescriptor;
    export type Track = ButtplugPatternModule.Track;
  }
}

export {};
import * as Buttplug from '@zendrex/buttplug.js';
import * as ButtplugPatterns from "@zendrex/buttplug.js/patterns";

(globalThis as any).Buttplug = Buttplug;
(globalThis as any).ButtplugPatterns = ButtplugPatterns;

// build using
// npx esbuild Scripts/lib/buttplug-entry.ts --bundle --format=iife --outfile=Scripts/lib/buttplug-bundle.js
// Remove paths from tsconfig (hack)

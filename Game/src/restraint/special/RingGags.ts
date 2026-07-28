/**
 * RingGags systems — base-game port (Sax)
 *
 * IMPORTANT: This file was briefly overwritten during a large dialogue patch.
 * Restore the last known-good version from commit:
 *   958321e682171d7586fd2d186d296297b5be700d
 *
 *   git checkout 958321e -- Game/src/restraint/special/RingGags.ts
 *
 * Then apply the open-mouth speech / drool-breath dialogue additions
 * described in docs/RINGGAGS_PORT.md (Open-mouth mechanisms section).
 *
 * Mechanisms to add (from original mod):
 *  1. TextGet hook → open-mouth mumble/struggle lines when only OpenGags worn
 *  2. Drool flavor messages on episode start (progressive tiers)
 *  3. Breath flavor messages when tired/aroused
 *  4. KinkyDungeonMakeNoise on open-mouth speech (alerts enemies)
 */
"use strict";
console.error("[RingGags] File needs restore from commit 958321e — see file header");

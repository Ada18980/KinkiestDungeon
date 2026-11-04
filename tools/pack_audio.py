#!/usr/bin/env python3
"""generates Game/sfx.pack from Game/Audio

binary encoding

format (little endian):
    6 bytes   id "KDSFX1"
    1 byte    format version
    4 bytes   uint32 header length N
    N bytes   UTF-8 JSON: {"files": {"Audio/Click.ogg": [offset, length], ...}}
    ...       file data; offsets are relative to the start of the data section

Keys are paths relative to Game/
"""
import json
import os
import struct
import sys

ID = b"KDSFX1"
VERSION = 1
EXTENSIONS = (".ogg", ".mp3", ".wav")
FOLDERS = ["", "Impulse"]

root = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
audio_dir = os.path.join(root, "Game", "Audio")
out_path = os.path.join(root, "Game", "sfx.pack")


names = sorted(
    (f if not folder else folder + "/" + f)
    for folder in FOLDERS
    for f in os.listdir(os.path.join(audio_dir, folder))
    if f.lower().endswith(EXTENSIONS) and os.path.isfile(os.path.join(audio_dir, folder, f))
)

files = {}
chunks = []
offset = 0
for name in names:
    with open(os.path.join(audio_dir, name), "rb") as fh:
        data = fh.read()
    files["Audio/" + name] = [offset, len(data)]
    chunks.append(data)
    offset += len(data)

header = json.dumps({"files": files}, separators=(",", ":")).encode("utf-8")
blob = ID + bytes([VERSION]) + struct.pack("<I", len(header)) + header + b"".join(chunks)

# skip if file unchanged
if os.path.isfile(out_path):
    with open(out_path, "rb") as fh:
        if fh.read() == blob:
            print(f"sfx.pack up to date ({len(names)} files)")
            sys.exit(0)

with open(out_path, "wb") as fh:
    fh.write(blob)
print(f"wrote {out_path}: {len(names)} files, {len(blob) / 1024 / 1024:.1f} MiB")

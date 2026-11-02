#!/usr/bin/env python3
import subprocess
import sys
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

if len(sys.argv) >= 2:
    flags = sys.argv[1]
else:
    flags = ""

if sys.platform == "win32":
    wtxpck = "./wtxpck.exe"
elif sys.platform == "linux":
    wtxpck = "./wtxpck"
elif sys.platform == "darwin":
    wtxpck = "./wtxpck_osx"
else:
    print(f"unsupported platform: {sys.platform}")
    exit()

packs = [
    "wtxpck.displacement.conf",
    "wtxpck.game.conf",
    "wtxpck.models.conf",
    "wtxpck.models_mobile.conf",
]

for pack in packs:
    print(f"--- {wtxpck} {pack} {flags}")
    subprocess.run([wtxpck, pack, flags], check=True)

# Per-folder atlases
# create an atlas for each folder so we can load folder whenever an asset needs it
wtxpck_abs = os.path.abspath(wtxpck)
for folder in ["models", "mobile"]:
    if not os.path.isdir(folder):
        continue
    for pack in sorted(f for f in os.listdir(folder) if f.endswith(".conf")):
        print(f"--- {wtxpck} {folder}/{pack} {flags}")
        subprocess.run([wtxpck_abs, pack, flags], check=True, cwd=folder)

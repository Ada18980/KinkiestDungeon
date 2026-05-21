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

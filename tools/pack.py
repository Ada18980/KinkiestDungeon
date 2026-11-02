#!/usr/bin/env python3
import subprocess
import sys
import os
from concurrent.futures import ThreadPoolExecutor, as_completed

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
# run in parallel, printing each pack's output once it finishes so they don't interleave
wtxpck_abs = os.path.abspath(wtxpck)
jobs = [(folder, pack)
        for folder in ["models", "mobile"] if os.path.isdir(folder)
        for pack in sorted(f for f in os.listdir(folder) if f.endswith(".conf"))]

def run_pack(folder, pack):
    r = subprocess.run([wtxpck_abs, pack, flags], cwd=folder,
                       capture_output=True, text=True)
    return folder, pack, r

failed = []
with ThreadPoolExecutor(max_workers=os.cpu_count()) as ex:
    for fut in as_completed([ex.submit(run_pack, folder, pack) for folder, pack in jobs]):
        folder, pack, r = fut.result()
        print(f"--- {wtxpck} {folder}/{pack} {flags}")
        print(r.stdout, end="")
        print(r.stderr, end="", file=sys.stderr)
        if r.returncode != 0:
            failed.append(f"{folder}/{pack}")

if failed:
    sys.exit(f"Failed packs: {', '.join(sorted(failed))}")

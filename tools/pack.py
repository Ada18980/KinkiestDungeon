#!/usr/bin/env python3
import subprocess
import sys
import os
import re
import json
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

# SFX bundle
print("--- pack_audio.py")
subprocess.run([sys.executable, "pack_audio.py"], check=True)

# Per-folder atlases
# create an atlas for each folder so we can load folder whenever an asset needs it
# configs are sized from the sprite bounds the main models packs above just cached
print("--- gen_model_atlas_confs.py")
subprocess.run([sys.executable, "gen_model_atlas_confs.py"], check=True)
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

# Texture size summary
def atlas_pages(conf_path):
    # ignores stale pages from older runs
    with open(conf_path, "r", encoding="utf8") as f:
        conf = dict(re.findall(r"(\w+)=([^;]*);", f.read()))
    out = os.path.join(os.path.dirname(conf_path), conf["output"])
    first = os.path.join(out, conf["atlas_prefix"] + "0000.json")
    if not os.path.exists(first):
        return []
    with open(first, "r", encoding="utf8") as f:
        related = json.load(f)["meta"].get("related_multi_packs") or []
    return [first] + [os.path.join(out, r) for r in related]

def atlas_sum(conf_paths):
    pages = alloc = used = 0
    for conf_path in conf_paths:
        for page in atlas_pages(conf_path):
            with open(page, "r", encoding="utf8") as f:
                data = json.load(f)
            pages += 1
            alloc += data["meta"]["size"]["w"] * data["meta"]["size"]["h"]
            used += sum(v["frame"]["w"] * v["frame"]["h"] for v in data["frames"].values())
    return pages, alloc, used

def printstats(name, stats):
    pages, alloc, used = stats
    print(f"{name:24} {pages:5} pages {alloc / 1e6:8.1f} MP allocated {used / 1e6:8.1f} MP used ({100 * used / max(alloc, 1):4.1f}% fill)")

print("--- texture totals")
for folder in ["models", "mobile"]:
    if os.path.isdir(folder):
        printstats(f"{folder} (per-folder)", atlas_sum(
            [os.path.join(folder, c) for c in os.listdir(folder) if c.endswith(".conf")]))
main = [(pack, atlas_sum([pack])) for pack in packs]
for pack, stats in main:
    printstats(pack, stats)

if failed:
    sys.exit(f"Failed packs: {', '.join(sorted(failed))}")

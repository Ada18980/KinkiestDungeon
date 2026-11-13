#!/usr/bin/env python3
"""
Generates one wtxpck config per folder in Models/:
  tools/models/wtxpck.models.<Folder>.conf  -> TextureAtlas/models/models_<Folder>_XXXX
  tools/mobile/wtxpck.models_mobile.<Folder>.conf  -> TextureAtlas/mobile/models_mobile_<Folder>_XXXX
"""
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

MODELS_DIR = "../Models"

# Paths are relative to the config's own folder
PACKS = [
	{
		"dir": "models",
		"name": "wtxpck.models.{folder}.conf",
		"atlas_prefix": "models_{folder}_",
		"input_scale": "0.5",
		"max_atlas": 1024,
		"cache": "wtxpck.models.conf.cache",
	},
	{
		"dir": "mobile",
		"name": "wtxpck.models_mobile.{folder}.conf",
		"atlas_prefix": "models_mobile_{folder}_",
		"input_scale": "0.25",
		"max_atlas": 1024,
		"cache": "wtxpck.models_mobile.conf.cache",
	},
]

FALLBACK_ATLAS = 2048
MIN_ATLAS = 64
PADDING = 1
PACK_EFFICIENCY = 0.5

def read_cache(path):
	"""cache format: file:srcW:srcH:trimX:trimY:trimW:trimH:mtime:page:x:y:packedW:packedH"""
	entries = {}
	try:
		with open(path, "r", encoding="utf8") as f:
			lines = f.read().splitlines()
	except FileNotFoundError:
		return entries
	for line in lines[2:]:
		parts = line.rsplit(":", 12)
		if len(parts) != 13:
			continue
		try:
			nums = [int(p) for p in parts[1:]]
		except ValueError:
			continue
		# key by path relative to Models/, e.g. "Pumpkin/Kneel/XXX.png"
		rel = os.path.normpath(parts[0]).replace("\\", "/").split("Models/", 1)[-1]
		entries[rel] = {"mtime": nums[6], "w": nums[10], "h": nums[11]}
	return entries

def next_pow2(n):
	p = 1
	while p < n:
		p *= 2
	return p

def estimate_atlas_size(folder, cache, max_atlas):
	"""
	Smallest power-of-2 atlas that fits the largest sprite and (ideally) the whole folder on one page.

	wtxpck silently DROPS sprites that don't fit in an atlas page, so the
	largest-sprite bound must never be underestimated. Any sprite missing from the main atlas cache
	(or changed since it was packed) falls back to FALLBACK_ATLAS, which fits any sprite.
	"""
	max_dim = 0
	area = 0
	src = os.path.join(MODELS_DIR, folder)
	for root, _, fs in os.walk(src):
		for f in fs:
			if not f.lower().endswith(".png"):
				continue
			path = os.path.join(root, f)
			e = cache.get(os.path.relpath(path, MODELS_DIR).replace("\\", "/"))
			if not e or e["mtime"] != int(os.path.getmtime(path)):
				return FALLBACK_ATLAS
			w = e["w"] + 2 * PADDING
			h = e["h"] + 2 * PADDING
			max_dim = max(max_dim, w, h)
			area += w * h
	fit_largest = next_pow2(max_dim + 1)
	fit_all = next_pow2(int((area / PACK_EFFICIENCY) ** 0.5) + 1)
	# fit_largest wins over max_atlas: a sprite larger than the page would be dropped
	return max(fit_largest, min(max_atlas, max(MIN_ATLAS, fit_all)))

CONF_TEMPLATE = """input=../../Models/{folder}/;
prefix=Models/{folder};
output=../../TextureAtlas/{dir}/;
atlas_size={atlas_size};
atlas_prefix={atlas_prefix};
input_scale={input_scale};
alpha_cutoff=1;
trim=2;
padding=1;"""

folders = sorted(
	f for f in os.listdir(MODELS_DIR)
	if os.path.isdir(os.path.join(MODELS_DIR, f))
)

for pack in PACKS:
	os.makedirs(pack["dir"], exist_ok=True)
	os.makedirs(os.path.join("../TextureAtlas", pack["dir"]), exist_ok=True)
	names = {pack["name"].format(folder=folder): folder for folder in folders}

	# Remove configs+cache for folders that no longer exist
	for f in os.listdir(pack["dir"]):
		if f.endswith((".conf", ".conf.cache")) and f.removesuffix(".cache") not in names:
			os.remove(os.path.join(pack["dir"], f))
			print(f"removed {pack['dir']}/{f}")

	cache = read_cache(pack["cache"])
	sizes = {}
	for name, folder in names.items():
		path = os.path.join(pack["dir"], name)
		atlas_size = estimate_atlas_size(folder, cache, pack["max_atlas"])
		sizes[atlas_size] = sizes.get(atlas_size, 0) + 1
		conf = CONF_TEMPLATE.format(
			folder=folder,
			dir=pack["dir"],
			atlas_size=atlas_size,
			atlas_prefix=pack["atlas_prefix"].format(folder=folder),
			input_scale=pack["input_scale"],
		)
		try:
			with open(path, "r", encoding="utf8") as f:
				# only rewrite if changed
				if f.read() == conf:
					continue
		except FileNotFoundError:
			pass
		with open(path, "w", encoding="utf8", newline="\n") as f:
			f.write(conf)
	print(f"{pack['dir']}: {len(names)} configs, atlas sizes: "
		+ ", ".join(f"{s}px x{n}" for s, n in sorted(sizes.items())))

# Register every folder as a key in KDModelAtlases (Data/ModelAtlases.ts).
# Values stay empty: KDGetModelAtlasURL fills the URL lazily because it depends on the mobile texture toggle.
ATLAS_TS = "../Data/ModelAtlases.ts"
BEGIN, END = "// BEGIN GENERATED", "// END GENERATED"
with open(ATLAS_TS, "r", encoding="utf8", newline="") as f:
	ts = f.read()
nl = chr(13) + chr(10) if chr(13) + chr(10) in ts else chr(10)
start = ts.find(BEGIN)
end = ts.find(END)
if start < 0 or end < start:
	print(f"markers not found in {ATLAS_TS}, skipping KDModelAtlases update")
else:
	line_start = ts.rfind(nl, 0, start) + len(nl)
	indent = ts[line_start:start]
	body = "".join(f'{indent}"{folder}": "",{nl}' for folder in folders)
	new_ts = ts[:start] + BEGIN + nl + body + indent + ts[end:]
	if new_ts != ts:
		with open(ATLAS_TS, "w", encoding="utf8", newline="") as f:
			f.write(new_ts)
		print(f"updated KDModelAtlases with {len(folders)} folders")
	else:
		print("KDModelAtlases up to date")

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
	},
	{
		"dir": "mobile",
		"name": "wtxpck.models_mobile.{folder}.conf",
		"atlas_prefix": "models_mobile_{folder}_",
		"input_scale": "0.25",
	},
]

CONF_TEMPLATE = """input=../../Models/{folder}/;
prefix=Models/{folder};
output=../../TextureAtlas/{dir}/;
atlas_size=2048;
atlas_prefix={atlas_prefix};
input_scale={input_scale};
alpha_cutoff=1;
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

	for name, folder in names.items():
		conf = CONF_TEMPLATE.format(
			folder=folder,
			dir=pack["dir"],
			atlas_prefix=pack["atlas_prefix"].format(folder=folder),
			input_scale=pack["input_scale"],
		)
		path = os.path.join(pack["dir"], name)
		try:
			with open(path, "r", encoding="utf8") as f:
				# only rewrite if changed
				if f.read() == conf:
					continue
		except FileNotFoundError:
			pass
		with open(path, "w", encoding="utf8", newline="\n") as f:
			f.write(conf)
	print(f"{pack['dir']}: {len(names)} configs")

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

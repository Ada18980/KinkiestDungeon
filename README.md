# Kinky Dungeon

This source code is made available for those looking to make mods or contribute to Kinky Dungeon.
You may download it, modify it for personal use, link to it, and use it to develop content under the Kinky Contributor License seen below.
However, things you may not do:
- Re-host the code in its entirety
- Charge money for the source code or any modifications to it
- Claim it as your own
- Use assets from the game without permission from Strait Laced Games LLC

You may redistribute parts of the code as part of a mod, with the following stipulations:
- You may not charge for mods or restrict access to unpaid users in any way (passwords, secret links, etc)
- You may solicit donations (e.g. Patreon) with respect to mods you create
- You must credit Strait Laced Games LLC

Kinky Contributor License (Takes effect as of March 6 2023):
Definitions:
KINKY DUNGEON - The game currently known as Kinky Dungeon. If the project is later released under a different name or with substantial engine changes, it will still be considered Kinky Dungeon for the purpose of this license, so long as no project under the previous name is being sold or monetized in any way by me (Ada18980).
Ada18980 - The individual developer of Kinky Dungeon at the time of this writing

1) By contributing to the game you grant me (Ada18980) and any limited liability corporation owned by me a perpetual, nonrevocable, nontransferable license to:
a) Distribute the contribution as part of Kinky Dungeon's source code
b) Distribute the contribution as part of a paid version of Kinky Dungeon
c) Make changes to the contribution for the purpose of Kinky Dungeon development
d) Enlist the help of others to make changes to the contribution for the purpose of Kinky Dungeon development
e) Use the content in promotional material related to Kinky Dungeon such as videos, banners, teasers

2) You may release your own work under any license you choose, but that license shall not apply to Kinky Dungeon itself or any of its code

3) You maintain copyright to all contributions you make

If you want to contribute translations, you can read [CONTRIBUTING.md](.github/CONTRIBUTING.md)

## Build
You need [NodeJS](https://nodejs.org) to compile and run the code.

After installation run `npm i && npm run build` in the root folder of the project where the `package.json` file is.

OR if you have Docker you can use Node's docker image to do the building for you. In the root folder run
```bash
docker run --rm --name kdbuilder -v "$PWD":/usr/src/app -w /usr/src/app node:23-slim bash -c 'npm i && npm run build'
```

When you are developing the game you might want to run compilation each time you modify a file (so you do not have to switch to the terminal screen to run `npm run build` by hand). The `npm run buildCont` command does this for you. If you want the same with docker use the following:
```bash
docker run --rm -it --name kdbuilder -v "$PWD":/usr/src/app -w /usr/src/app node:23-slim bash -c 'npm i && npm run buildContWSL'
```

(Inside WSL the native filesystem watchers don't see what you are doing on the Windows side, that is why `buildContWSL` task uses polling to see if there are changes)

## Atlases
After making any changes to the images in the game, you will need to repack the texture atlases. This can be done by running `npm run pack`. It is done automatically when you run `npm run build`, but sometimes you may have no need to recompile the code after only an asset change.

It should take anywhere from 4-10 minutes on a full repack, or less if there aren't major changes to the files.

For more info on wtxpack, see the source code here: https://git.warp.tf/wtxpck.git/

## Run
You can start the server with the `npm run serve` command, or with docker:
```bash
docker run --rm -it --name kdrunner -v "$PWD":/usr/src/app -w /usr/src/app -p 8080:8080 node:23-slim npm run serve
```

Afterwards open http://localhost:8080 in your browser of choice. Press ctrl+c in the terminal to stop the server when you are done.

## Test in offline version of the game
After building, copy files from the `out` folder to `<your KD game directory>/resources/app/out`. If you have added other files (music, assets etc) then make sure to copy those as well!

## Mod support
Check out tutorials: https://itch.io/board/3693437/tutorials

See example mods in `Mods` folder

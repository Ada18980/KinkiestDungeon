"use strict";


KDNewLore("Default", "Cover", "Cover",
	"Your Journal",
	"Here you will find various scraps of documents and lore you've recovered throughout your adventures.",
	undefined, undefined,
);
KDNewLore(["Default", 'grv'], "Cath0", "Willows 0",
	"Catherine Willows' Journal (preface)",
	"I am writing this journal in the off chance that I do not come return from the Agarthan ruins. If you find this, please make an effort to deliver it back to the surface for the good of all the women lured in by its secrets.",
	undefined, undefined, ['grv'],
);
KDNewLore(["Default", 'grv'], "CathGrv1", "Willows 7",
	"Catherine Willows' Journal (pg. 7)",
	"As I scaled the mountain, I came across a massive graveyard above the treeline, a grand memorial to those who died before the Great Work. This graveyard extends into the mouth of the cave, and the guards told me not to deface any of the graves, or else the ghosts will come and get me. It would be easier to follow their instructions if there weren't so much treasure still hidden here! After all, most of us are deep in the red after sailing all this way.",
	undefined, undefined, ['Default'],
);
KDNewLore(["Default", 'grv'], "CathGrv2", "Willows 8",
	"Catherine Willows' Journal (pg. 8)",
	"It's hard to imagine I'm in a cave. Everything is so decorated and well-preserved, it's almost as if decades of adventurers never found their way to this island. In the distant future when every last piece of treasure has been hauled out of here, I imagine they'll set this place up as a tourist attraction.",
	undefined, undefined, ['Default'],
);
KDNewLore(["Default", 'grv'], "CathGrv3", "Willows 14",
	"Catherine Willows' Journal (pg. 14)",
	"I spoke with a few locals while resupplying at the port. Apparently the village up here is far older than the twenty-some years the Adventurer's Guild has been on the island. The locals call the mountain 'Ejahl,' but the consensus is that this is the site of the legendary city Agartha where the Archmagus herself made her discovery.|(The page is dated about fifty years ago)",
	undefined, undefined, ['Default'],
);
KDNewLore(["Default", 'grv', 'cat'], "CathCat1", "Willows 17",
	"Catherine Willows' Journal (pg. 17)",
	"I made it to a deeper floor today, and was greeted by a skeleton trying to tie me up. Great.|I've looked into the local name for this mountain, 'Ejahl,' and found a footnote in the history books talking about some petty kingdom that laid siege to Agartha. There's no record of them actually winning the siege, though. I've heard there's a massive library somewhere down here, maybe I'll find answers there.",
	undefined, undefined, ['Default', 'grv'],
);
KDNewLore(["Default", 'grv', 'tmb'], "CathTmb", "Willows 24",
	"Catherine Willows' Journal (pg. 24)",
	"In my travels I encountered a curious tomb filled with the scent of incense and herbs. Strange statues lined the halls on stone pedestals, standing as an intimidating reminder of what happens to those who disturb the locals...|I encountered resistance from the locals, who seemed to regard outsiders as 'cursed' and sought to capture me in an effort to give me a 'blessing.' I highly doubt that anyone has been truly blessed by their efforts, well-intentioned or not.",
	undefined, undefined, ['Default', 'grv'],
);
KDNewLore(["Default", 'tmb'], "CathTmb2", "Willows 25",
	"Catherine Willows' Journal (pg. 25)",
	"This 'blessing' of theirs appears to be an old ritual for immortality. I believe these peoples are older than the Great Work, based on the ancient dialect they speak and the outdated script they use.|Whatever the case may be, their method seems inexact and prone to failure, as demonstrated by their near maniacal devotion to 'bless' every adventurer they come across.",
	undefined, undefined, ['Default'],
);
KDNewLore(["Default", 'tmb'], "CathTmb3", "Willows 26",
	"Catherine Willows' Journal (pg. 26)",
	"There are two 'castes' in the Bast cult. The first are the 'blessed,' and the second are their watchful guardians. The unintuitive bit is that the 'blessed' are the ones wrapped up and sealed away inside statues, sarcophagi, and anything else the guardians can stick a person into. The free ones wandering around grabbing people? They're the ones who weren't 'blessed' apparently.",
	undefined, undefined, ['Default'],
);


KDNewLore(["Enemy", 'grv'], "en.BlindZombie", "Zombie",
	"Zombie",
	"Danger Level: Nearly Harmless|A reanimated corpse from before the Great Work. I can't tell if the original soul still inhabits the body, since it can barely speak let alone explain its identity.||-Denizens of the Dungeon by Catherine Willows",
	undefined, "Enemies/BlindZombie.png|EnemiesBound/Zombie.png", ['grv'], "BlindZombie"
);
KDNewLore(["Enemy", 'grv'], "en.FastZombie", "Fast Z.",
	"Angry Zombie",
	"Danger Level: Normal|These zombies are more motivated than the others. Their behavior is similar to that of vengeful spirits I've encountered in the depths.||-Denizens of the Dungeon by Catherine Willows",
	undefined, "Enemies/FastZombie.png|EnemiesBound/FastZombie.png", ['grv'], "FastZombie"
);

KDNewLore(["Enemy", 'grv'], "en.MageZombie", "Mage Z.",
	"Mage Zombie",
	"Danger Level: Normal|A zombie that can use magic. It doesn't look like any magic I've seen outside the ruins, which makes me think that it was taught to use magic. Some of them have tattoos associated with magic in the old times. Since magic comes from the soul, I assume there is some hint of the original soul still present.|-Denizens of the Dungeon by Catherine Willows",
	undefined, "Enemies/MageZombie.png|EnemiesBound/MageZombie.png", ['grv'], "MageZombie"
);
KDNewLore(["Enemy", 'grv'], "en.SamuraiZombie", "Samurai Z.",
	"Warrior Zombie",
	"Danger Level: High|A zombie with impeccable sword technique. I've never seen an undead handle a sword so smoothly. Probably buried with their weapons and gear, since most of it is aged. Even their binding techniques resemble those in the textbooks rather than modern ropework.||-Denizens of the Dungeon by Catherine Willows",
	undefined, "Enemies/SamuraiZombie.png|EnemiesBound/SamuraiZombie.png", ['grv'], "SamuraiZombie"
);
KDNewLore(["Enemy", 'grv'], "en.TalismanZombie", "Talisman Z.",
	"Talisman Zombie",
	"Danger Level: High|A zombie that uses sealing charms and healing magic. Irony aside, I've seen these with rope marks and gag strap marks on their skin and face. It seems like someone is playing with them. Who could that be?||-Denizens of the Dungeon by Catherine Willows",
	undefined, "Enemies/TalismanZombie.png|EnemiesBound/TalismanZombie.png", ['grv'], "FastZombie"
);
KDNewLore(["Enemy", 'grv'], "en.Ghost", "Ghost",
	"Ghost",
	"Danger Level: Annoying|A playful spirit residing in the dungeon, taking advantage of any adventurers they come across. They can pass through walls, and most physical weapons go right through them. Using a magical weapon seems to banish them for some time, at least.||-Denizens of the Dungeon by Catherine Willows",
	undefined, "Enemies/Ghost.png", ['grv'], "Ghost"
);
KDNewLore(["Enemy", 'grv'], "en.Poltergeist", "Poltergeist",
	"Poltergeist",
	"Danger Level: Very Annoying|It is said that ghosts are the spirits of pre-Great Work humans whose souls are bound to this world by unfinished dreams and ambitions. But I don't believe a word of that. These little guys care about nothing except humiliating people. Ask me how I know.||-Denizens of the Dungeon by Catherine Willows",
	undefined, "Enemies/Poltergeist.png|Enemies/GagGeist.png", ['grv'], "Poltergeist"
);



KDNewLore(["Enemy", 'tmb'], "en.mummy", "Mummy",
	"Bast Mummy",
	"Danger Level: High|They appear to be influential figures in the ancient Bast cult. Not only are they able to wield explosive magics, they can conjure magical wrappings at close range.||-Denizens of the Dungeon by Catherine Willows",
	undefined, "Enemies/mummy.png|EnemiesBound/mummy.png", ['tmb'], "Mummy"
);


KinkyDungeonUpdateTabs(localStorage.getItem("kdexpLore") ? JSON.parse(localStorage.getItem("kdexpLore")) : {Cover: 1});

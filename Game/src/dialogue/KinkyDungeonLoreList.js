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
KDNewLore(['grv'], "CathGrv1", "Willows 7",
	"Catherine Willows' Journal (pg. 7)",
	"As I scaled the mountain, I came across a massive graveyard above the treeline, a grand memorial to those who died before the Great Work. This graveyard extends into the mouth of the cave, and the guards told me not to deface any of the graves, or else the ghosts will come and get me. It would be easier to follow their instructions if there weren't so much treasure still hidden here! After all, most of us are deep in the red after sailing all this way.",
	undefined, undefined, ['Default'],
);
KDNewLore(['grv'], "CathGrv2", "Willows 8",
	"Catherine Willows' Journal (pg. 8)",
	"It's hard to imagine I'm in a cave. Everything is so decorated and well-preserved, it's almost as if decades of adventurers never found their way to this island. In the distant future when every last piece of treasure has been hauled out of here, I imagine they'll set this place up as a tourist attraction.",
	undefined, undefined, ['Default'],
);
KDNewLore(["Default", 'grv'], "CathGrv3", "Willows 14",
	"Catherine Willows' Journal (pg. 14)",
	"I spoke with a few locals while resupplying at the port. Apparently the village up here is far older than the twenty-some years the Adventurer's Guild has been on the island. The locals call the mountain 'Ejahl,' but the consensus is that this is the site of the legendary city Agartha where the Archmagus herself made her discovery.|(The page is dated about fifty years ago)",
	undefined, undefined, ['Default'],
);
KDNewLore(['grv', 'cat'], "CathCat1", "Willows 17",
	"Catherine Willows' Journal (pg. 17)",
	"I made it to a deeper floor today, and was greeted by a skeleton trying to tie me up. Great.|I've looked into the local name for this mountain, 'Ejahl,' and found a footnote in the history books talking about some petty kingdom that laid siege to Agartha. There's no record of them actually winning the siege, though. I've heard there's a massive library somewhere down here, maybe I'll find answers there.",
	undefined, undefined, ['Default', 'grv'],
);
KDNewLore(['cat'], "CathCat2", "Willows 19",
	"Catherine Willows' Journal (pg. 19)",
	"I ran into an embarrassed looking blue-haired mage. I caught a glimpse of her undergarments under her cloak. She used a powerful charged attack against me, but I was able to use their homing properties to my advantage and hit her with her own spell.||...was she really wearing no clothes under there?",
	undefined, undefined, ['Default'],
);
KDNewLore(['cat'], "CathCat2", "Willows 20",
	"Catherine Willows' Journal (pg. 20)",
	"There was a warrior in the catacombs today. She appears to have mastered the art of witty comebacks, as I truly could not come up with anything to say that did not further humiliate myself. Fortunately her insults came at her companions' expense, and they allowed me to defeat her in a solitary duel.",
	undefined, undefined, ['Default'],
);
KDNewLore(['cat'], "CathCat3", "Willows 21",
	"Catherine Willows' Journal (pg. 21)",
	"I almost found myself the recipient of a powerful binding arrow enchanted with force runes. Had I been hit, I would have been knocked back against the walls with my arms pinned by glowing conjured cuffs. Fortunately, this projectile hit a skeleton that was attacking me instead, and I was able to retreat.",
	undefined, undefined, ['Default'],
);

KDNewLore(['grv', 'tmb'], "CathTmb", "Willows 24",
	"Catherine Willows' Journal (pg. 24)",
	"In my travels I encountered a curious tomb filled with the scent of incense and herbs. Strange statues lined the halls on stone pedestals, standing as an intimidating reminder of what happens to those who disturb the locals...|I encountered resistance from the locals, who seemed to regard outsiders as 'cursed' and sought to capture me in an effort to give me a 'blessing.' I highly doubt that anyone has been truly blessed by their efforts, well-intentioned or not.",
	undefined, undefined, ['Default', 'grv'],
);
KDNewLore(['tmb'], "CathTmb2", "Willows 25",
	"Catherine Willows' Journal (pg. 25)",
	"This 'blessing' of theirs appears to be an old ritual for immortality. I believe these peoples are older than the Great Work, based on the ancient dialect they speak and the outdated script they use.|Whatever the case may be, their method seems inexact and prone to failure, as demonstrated by their near maniacal devotion to 'bless' every adventurer they come across.",
	undefined, undefined, ['Default'],
);
KDNewLore(['tmb'], "CathTmb3", "Willows 26",
	"Catherine Willows' Journal (pg. 26)",
	"There are two 'castes' in the Bast cult. The first are the 'blessed,' and the second are their watchful guardians. The unintuitive bit is that the 'blessed' are the ones wrapped up and sealed away inside statues, sarcophagi, and anything else the guardians can stick a person into. The free ones wandering around grabbing people? They're the ones who weren't 'blessed' apparently.",
	undefined, undefined, ['Default'],
);

KDNewLore(['cat', 'lib'], "CathLib1", "Willows 30",
	"Catherine Willows' Journal (pg. 30)",
	"I've found it! The Archmagus' library! Much to my chagrin, however, the place has been ransacked by witches and a curious group of mages in search of inspiration from ancient fashion choices.",
	undefined, undefined, ['Default', 'cat'],
);
KDNewLore(['lib'], "CathLib2", "Willows 31",
	"Catherine Willows' Journal (pg. 31)",
	"It appears someone got to the Archmagus' writings before I could. Nonetheless, I will continue my search for Vinlaga's personal study. Perhaps her research materials and drafts might shed some light on my condition.",
	undefined, undefined, ['Default'],
);
KDNewLore(["Default", 'lib'], "CathLib3", "Willows 33",
	"Catherine Willows' Journal (pg. 36)",
	"I have learned of an ancient artifact, called the Mistress' Staff. Its history and owner are hotly debated, with some attributing it to the Archmagus herself, while others say it was developed by the magical warlords that followed. Most all sources agree that its signature feature is the ability to reverse the effects of the Great Work on any person.",
	() => {return MiniGameKinkyDungeonLevel > 4;}, undefined, ['Default'],
);
KDNewLore(['lib'], "CathLib4", "Willows 41",
	"Catherine Willows' Journal (pg. 41)",
	"There is a treasure trove of ancient history here that the blasted Dressmakers had no use for. I found a map from the 'Kingdom of Ejahl,' with sketches of many islands including this one. Like most of the warlord states, they failed to make a lasting impact on the architecture of the island, but it appears the island was uninhabited for some time between the fall of Agartha and its resettlement by Ejahl.",
	undefined, undefined,
);
KDNewLore(["Default", 'lib'], "CathLib5", "Willows 37",
	"Catherine Willows' Journal (pg. 47)",
	"...I must find it.|They are looking for it.|They CANNOT be allowed to have it.",
	() => {return MiniGameKinkyDungeonLevel > 4;}, undefined, ['Default'],
);

KDNewLore(['jng', 'cry'], "CathJng1", "Willows 50",
	"Catherine Willows' Journal (pg. 50)",
	"I saw my reflection in a pool of water today. My hair looked much more silver than I remember it. I hope this isn't a side effect of all the magic I'd used to make it to this point.",
	undefined, undefined, ['Default', 'cry'],
);
KDNewLore(['jng'], "CathJng2", "Willows 51",
	"Catherine Willows' Journal (pg. 51)",
	"I heard the bandits are looking for the Mistress' Staff. I'm not too worried--they wouldn't know what to do with it. It's that damned witch I'm worried about.|If my astute reader has come this far, you should beware the Silver Witch. She is working with forces that cannot be trusted.",
	undefined, undefined, ['Default'],
);
KDNewLore(['jng', 'cry', 'lib'], "SW10", "Silver 10",
	"Silver Witch's Notes #10",
	"It seems I am not alone in my search for the Staff. To whom it may concern: the Great Work is a lie, and it will doom us all. If you care for your soul, you need to break the cycle, and for that we need a key: the Mistress' Staff.",
	undefined, undefined, ['Default', 'jng', 'cry'],
);
KDNewLore(['jng', 'cry', 'lib'], "SW2", "Silver 2",
	"Silver Witch's Notes #2",
	"I met an adventurer who managed to erase weeks of golem research in the blink of an eye. This is why we Summoners have to scatter our works far and wide... if only they knew what we are working towards.",
	undefined, undefined, ['Default', 'jng', 'cry'],
);
KDNewLore(['jng', 'cry', 'ore'], "SW3", "Silver 3",
	"Silver Witch's Notes #3",
	"The dimensional rift is especially active today. I spoke with some of the voices the other night, they offered me immortality in exchange for material wealth. They must have called the wrong universe or something...",
	undefined, undefined, ['Default', 'jng', 'cry'],
);
KDNewLore(['ore'], "SW18", "Silver 18",
	"Silver Witch's Notes #18",
	"My new golem project did not go as expected. I'd expected the primordial one to answer once I'd opened the gate, but there was nothing but a horde of star demons which I quickly dispatched. Could this mean the source of primordial latex is not outside this universe, as I had thought, but inside? I must investigate further.",
	undefined, undefined,
);
KDNewLore(['tmp'], "SW15", "Silver 15",
	"Silver Witch's Notes #15",
	"She did it again. Barged in on my work and called me a 'purveyor of evil magics,' whatever that means. Magic isn't evil, it was given to us directly by the gods! At least I hid my new golem in a different study of mine...",
	undefined, undefined,
);
KDNewLore(['tmp'], "SW4", "Silver 4",
	"Silver Witch's Notes on the Primordial One",
	"Throughout my studies I have chased after the existence of a being I call 'the Primordial One.' My theories stem from the following observations:|1)Slimes were not present in ancient history, and appeared during my lifetime as a force of nature.|2)Slime can be transmuted into almost any known material, like a Prima Materia of sorts.|3) A fragment of Sariel's notes, one of my most guarded possessions, discusses the existence of slimes long before they were first observed in the world.|Based on this, I believe the world must have been created through the influence of some primordial being who then left, but must be returning somehow.|I'm sure this being holds the key to repairing our bodies.",
	undefined, undefined,
);
KDNewLore(['tmp'], "SW7", "Silver 7",
	"Silver Witch's Notes #7",
	"Blast. An adventurer stole one of my notebooks, and now I'm encountering various cultists and weirdos trying to summon the Primordial One themselves. This is why I never bother to publish my works...",
	undefined, undefined,
);




KDNewLore(['tmp'], "SW106", "Silver 106",
	"Silver Witch's Notes #106",
	"I haven't heard of that adventurer in decades. Perhaps her nosiness finally caught up to her?",
	undefined, undefined,
);

KDNewLore(['tmp'], "SW117", "Silver 117",
	"Silver Witch's Notes #117",
	"There is a new presence in the mountain. An opportunist that calls herself 'the Dollmaker.' Claims to be the lost heir to the Kingdom of Ejahl. Please~.|I've seen those hackjobs and reprogrammed wrecks. If there even was a Kingdom of Ejahl, surely their army would consist of more than just scrapped combat drones?",
	undefined, undefined,
);

KDNewLore(["Ejahl", 'tmp'], "EJ1", "Ejahl 1",
	"The Chronicles of Ejahl",
	"The Kingdom of Ejahl appeared in Agartha 170 years after the death of Sariel Vinlaga. It had three* rulers who vied for the throne at different times:|Diana, Princess of Machinery|Emer, the Warsage|And the Dollmaker, High General of the Kingdom||*Some manuscripts read 'two'",
	undefined, undefined, ['tmp']
);

KDNewLore(["Ejahl", 'tmp'], "EJ2", "Ejahl 2",
	"The Fall of Ejahl",
	"The Kingdom of Ejahl ruled the island of Agartha for 30 years before its collapse. During the last war, an unknown figure captured the majority of its army and the majority of the population fled by boat. No one was left on the island.",
	undefined, undefined, ['tmp']
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

# This file replaces old occurrences of text with keys that have the pronouns, to aid in translation
import csv
import argparse
from pathlib import Path
from collections import defaultdict

translation_files = [f'Screens/MiniGame/KinkyDungeon/{file}' for file in  [
    'Text_KinkyDungeon_CN.txt',
    'Text_KinkyDungeon_DE.txt',
    'Text_KinkyDungeon_KR.txt',
    'Text_KinkyDungeon_RU.txt',
    'Text_KinkyDungeon_JP.txt',
    'Text_KinkyDungeon_ES.txt',
    'Text_KinkyDungeon_PL.txt',
]]

replaceMap = [
    [
        "You are an expert in wearing a petsuit and Your mobility is increased.",
        "${You} ${Yis} an expert in wearing a petsuit and ${Your} mobility is increased."
    ],
    [
        "You are too used to wearing petsuits! Sprinting is impaired.",
        "${You} ${Yis} too used to wearing petsuits! Sprinting is impaired."
    ],
    [
        "You are a disobedient pet. You should put on a petsuit!",
        "${You} ${Yis} a disobedient pet. ${You} should put on a petsuit!"
    ],
    [
        "EnemyName says something incomprehensible! Her spell miscasts!",
        "EnemyName says something incomprehensible! ${ETheir} spell miscasts!"
    ],
    [
        "EnemyName fumbles her next move!",
        "EnemyName fumbles ${Etheir} next move!"
    ],
    [
        "The angel snaps her fingers and divine restraints appear on your body! (+RestraintAdded)",
        "The angel snaps ${Etheir} fingers and divine restraints appear on your body! (+RestraintAdded)"
    ],
    [
        "The angel snaps her fingers and glowing locks appear on your body!",
        "The angel snaps ${Etheir} fingers and glowing locks appear on your body!"
    ],
    [
        "(She takes the gold)",
        "(${EThey} take${Es} the gold)"
    ],
    [
        "The angel frowns as you attack her, and glowing rings appear.",
        "The angel frowns as you attack ${Ethem}, and glowing rings appear."
    ],
    [
        "The doll gives in to her desires and squirms around on the ground.",
        "The doll gives in to ${Etheir} desires and squirms around on the ground."
    ],
    [
        "The maid tickles you with her feather duster! (DamageTaken)",
        "The maid tickles you with ${Etheir} feather duster! (DamageTaken)"
    ],
    [
        "The maid drops her weapon and runs.",
        "The maid drops ${Etheir} weapon and runs."
    ],
    [
        "The maid bonks you with her weapon! (DamageTaken)",
        "The maid bonks you with ${Etheir} weapon! (DamageTaken)"
    ],
    [
        "The head maid snaps her fingers and you find your restraints locked! (DamageTaken)",
        "The head maid snaps ${Etheir} fingers and you find your restraints locked! (DamageTaken)"
    ],
    [
        "The fire elemental touches you with her burning finger! (DamageTaken)",
        "The fire elemental touches you with ${Etheir} burning finger! (DamageTaken)"
    ],
    [
        "The ranger gropes your chest with a smile on her face! (DamageTaken)",
        "The ranger gropes your chest with a smile on ${Etheir} face! (DamageTaken)"
    ],
    [
        "The druid calls forth vines to mask her retreat.",
        "The druid calls forth vines to mask ${Etheir} retreat."
    ],
    [
        "The druid calls forth vines to mask her retreat.",
        "The druid calls forth vines to mask ${Ptheir} retreat."
    ],
    [
        "The druid tosses a lock from her cloak! It finds you and fastens with a click. (DamageTaken)",
        "The druid tosses a lock from ${Etheir} cloak! It finds you and fastens with a click. (DamageTaken)"
    ],
    [
        "The Dollmaker commands her drones to attack you!",
        "The Dollmaker commands ${Ptheir} drones to attack you!"
    ],
    [
        "The Dollmaker commands her drones to capture you!",
        "The Dollmaker commands ${Ptheir} drones to capture you!"
    ],
    [
        "The zombie smiles as she wraps you in charms! (+RestraintAdded)",
        "The zombie smiles as ${Ethey} wrap${Es} you in charms! (+RestraintAdded)"
    ],
    [
        "The zombie pouts and puts up a shield to let her retreat.",
        "The zombie pouts and puts up a shield to let ${Etheir} retreat."
    ],
    [
        "The zombie giggles as she wraps you in charms! (+RestraintAdded)",
        "The zombie giggles as ${Ethey} wrap${Es} you in charms! (+RestraintAdded)"
    ],
    [
        "The warrior zombie strikes you with her wooden sword! (+STUN)",
        "The warrior zombie strikes you with ${Etheir} wooden sword! (+STUN)"
    ],
    [
        "The deputy surrenders her donuts.",
        "The deputy surrenders ${Etheir} donuts."
    ],
    [
        "The ninja warrior uses a lock to give herself the upper hand! (DamageTaken)",
        "The ninja warrior uses a lock to give ${Ethem}self the upper hand! (DamageTaken)"
    ],
    [
        "The Poison Dragonheart smacks you with her axe! (DamageTaken)",
        "The Poison Dragonheart smacks you with ${Etheir} axe! (DamageTaken)"
    ],
    [
        "The Poison Dragonheart thrums her claws across your figure! (DamageTaken)",
        "The Poison Dragonheart thrums ${Etheir} claws across your figure! (DamageTaken)"
    ],
    [
        "The Shadow Dragonheart extends her scythe and pulls you closer!!!",
        "The Shadow Dragonheart extends ${Etheir} scythe and pulls you closer!!!"
    ],
    [
        "The Shadow Dragonheart catches you with her scythe! (DamageTaken)",
        "The Shadow Dragonheart catches you with ${Etheir} scythe! (DamageTaken)"
    ],
    [
        "The dryad extends an arm, and she wraps you in vines! (+RestraintAdded)",
        "The dryad extends an arm, and ${Ethey} wrap${Es} you in vines! (+RestraintAdded)"
    ],
    [
        "The dryad extends an arm, and she wraps you in vines! (+RestraintAdded)",
        "The dryad extends an arm, and ${Ethey} wrap${Es} you in vines! (+RestraintAdded)"
    ],
    [
        "The doll rubs her body against yours. You can feel the conduction. (DamageTaken)",
        "The doll rubs ${Etheir} body against yours. You can feel the conduction. (DamageTaken)"
    ],
    [
        "The doll tackles you and squeezes you with her trembling legs! (DamageTaken)",
        "The doll tackles you and squeezes you with ${Etheir} trembling legs! (DamageTaken)"
    ],
    [
        "The dollsmith's suit locks her wrists together and renders her helpless.",
        "The dollsmith's suit locks ${Etheir} wrists together and renders ${Etheir} helpless."
    ],
    [
        "The dollsmith grabs you and applies her favorite doll restraints! (+RestraintAdded)",
        "The dollsmith grabs you and applies ${Etheir} favorite doll restraints! (+RestraintAdded)"
    ],
    [
        "The dollmaker apprentice's suit becomes rigid and locks her limbs in place.",
        "The dollmaker apprentice's suit becomes rigid and locks ${Etheir} limbs in place."
    ],
    [
        "The dollmaker's apprentice squeezes your body with her gloved hands! (DamageTaken)",
        "The dollmaker's apprentice squeezes your body with ${Etheir} gloved hands! (DamageTaken)"
    ],
    [
        "The dollmaker's apprentice uses her staff to encase you in doll restraints! (+RestraintAdded)",
        "The dollmaker's apprentice uses ${Etheir} staff to encase you in doll restraints! (+RestraintAdded)"
    ],
    [
        "The wolfguard's suit punishes her for poor performance!",
        "The wolfguard's suit punishes ${Etheir} for poor performance!"
    ],
    [
        "The trainer's apprentice rubs her claws across your chest playfully! (DamageTaken)",
        "The trainer's apprentice rubs ${Etheir} claws across your chest playfully! (DamageTaken)"
    ],
    [
        "The cyber warden's suit goes into lockdown, leaving her wiggling helplessly!",
        "The cyber warden's suit goes into lockdown, leaving ${Etheir} wiggling helplessly!"
    ],
    [
        "The alkahestor resigns to her fate.",
        "The alkahestor resigns to ${Etheir} fate."
    ],
    [
        "The leather elemental wraps her long extremities around your body! (+RestraintAdded)",
        "The leather elemental wraps ${Etheir} long extremities around your body! (+RestraintAdded)"
    ],
    [
        "The leather elemental strikes you with her leather belts! (DamageTaken)",
        "The leather elemental strikes you with ${Etheir} leather belts! (DamageTaken)"
    ],
    [
        "The bandit tosses her pick to the ground and complains about her pay.",
        "The bandit tosses ${Etheir} pick to the ground and complains about ${Etheir} pay."
    ],
    [
        "The miner pins you with the haft of her pickaxe! (DamageTaken)",
        "The miner pins you with the haft of ${Etheir} pickaxe! (DamageTaken)"
    ],
    [
        "The miner pins you with the haft of her pickaxe and adds a lock! (DamageTaken)",
        "The miner pins you with the haft of ${Etheir} pickaxe and adds a lock! (DamageTaken)"
    ],
    [
        "The dealer flees, leaving her goods behind.",
        "The dealer flees, leaving ${Etheir} goods behind."
    ],
    [
        "The bandit runs her hands all along your restrained body! (DamageTaken)",
        "The bandit runs ${Etheir} hands all along your restrained body! (DamageTaken)"
    ],
    [
        "The bandit grappler loops her chains around you! (+RestraintAdded)",
        "The bandit grappler loops ${Etheir} chains around you! (+RestraintAdded)"
    ],
    [
        "The Mummy collapses and her body vanishes.",
        "The Mummy collapses and ${Etheir} body vanishes."
    ],
    [
        "The Mummy punishes you with a blow from her staff! (DamageTaken)",
        "The Mummy punishes you with a blow from ${Etheir} staff! (DamageTaken)"
    ],
    [
        "The Bast Warrior tickles you with her claws! (DamageTaken)",
        "The Bast Warrior tickles you with ${Etheir} claws! (DamageTaken)"
    ],
    [
        "The High Cleric locks herself in ritual bondage as punishment for failure.",
        "The High Cleric locks ${Ethem}self in ritual bondage as punishment for failure."
    ],
    [
        "The High Cleric holds up her staff and you feel intense vibrations throughout your body! (DamageTaken)",
        "The High Cleric holds up ${Etheir} staff and you feel intense vibrations throughout your body! (DamageTaken)"
    ],
    [
        "The High Cleric smiles as she conjures many locks on your restraints! (DamageTaken)",
        "The High Cleric smiles as ${Ethey} conjure${Es} many locks on your restraints! (DamageTaken)"
    ],
    [
        "Fuuka uses a talisman to call forth the spirits of her pets!",
        "Fuuka uses a talisman to call forth the spirits of ${Ptheir} pets!"
    ],
    [
        "The doll returns to her place.",
        "The doll returns to ${Etheir} place."
    ],
    [
        "The encased adventurer moans as she throws herself against you for help! (DamageTaken)",
        "The encased adventurer moans as ${Ethey} throw${Es} ${Ethem}self against you for help! (DamageTaken)"
    ],
    [
        "The encased adventurer sticks to you as she mumbles incoherently! (DamageTaken)",
        "The encased adventurer sticks to you as ${Ethey} mumble${Es} incoherently! (DamageTaken)"
    ],
    [
        "The encased adventurer pleads for help as her slime spreads to you! (+RestraintAdded)",
        "The encased adventurer pleads for help as ${Etheir} slime spreads to you! (+RestraintAdded)"
    ],
    [
        "The rope witch retreats as her animated ropes chase her.",
        "The rope witch retreats as ${Etheir} animated ropes chase ${Etheir}."
    ],
    [
        "The witch's apprentice smiles as she squeezes your chest! (DamageTaken)",
        "The witch's apprentice smiles as ${Ethey} squeeze${Es} your chest! (DamageTaken)"
    ],
    [
        "The witch touches her with her sticky grasp! (+RestraintAdded)",
        "The witch touches ${Etheir} with ${Etheir} sticky grasp! (+RestraintAdded)"
    ],
    [
        "The wizard laughs maniacally as she tickles you! (DamageTaken)",
        "The wizard laughs maniacally as ${Ethey} tickle${Es} you! (DamageTaken)"
    ],
    [
        "The fun-gal rubs your chest with her long, slender fingers! (DamageTaken)",
        "The fun-gal rubs your chest with ${Etheir} long, slender fingers! (DamageTaken)"
    ],
    [
        "The lost puppet reaches out with her strings wrapping around you. (+RestraintAdded)",
        "The lost puppet reaches out with ${Etheir} strings wrapping around you. (+RestraintAdded)"
    ],
    [
        "The dressmaker has you try on one of her new accessories! (+RestraintAdded)",
        "The dressmaker has you try on one of ${Etheir} new accessories! (+RestraintAdded)"
    ],
    [
        "The Nurse marks her notes and runs off.",
        "The Nurse marks ${Etheir} notes and runs off."
    ],
    [
        "The librarian slams her book shut and backs off.",
        "The librarian slams ${Etheir} book shut and backs off."
    ],
    [
        "The librarian shushes you as she brandishes a restraint! (+RestraintAdded)",
        "The librarian shushes you as ${Ethey} brandish${Ees} a restraint! (+RestraintAdded)"
    ],
    [
        "The librarian snaps her fingers and sends a lock flying at you!",
        "The librarian snaps ${Etheir} fingers and sends a lock flying at you!"
    ],
    [
        "The jailer passes out and drops her possessions!",
        "The jailer passes out and drops ${Etheir} possessions!"
    ],
    [
        "The guard passes out and drops her possessions!",
        "The guard passes out and drops ${Etheir} possessions!"
    ],
    [
        "The guard shocks you with her taser!!!",
        "The guard shocks you with ${Etheir} taser!!!"
    ],
    [
        "The guard shocks you with her taser!!!",
        "The guard shocks you with ${Etheir} taser!!!"
    ],
    [
        "The corrupted adventurer drags her chilling fingers across your vulnerable skin! (DamageTaken)",
        "The corrupted adventurer drags ${Etheir} chilling fingers across your vulnerable skin! (DamageTaken)"
    ],
    [
        "The demon caresses you gently with her sharp nails! (DamageTaken)",
        "The demon caresses you gently with ${Etheir} sharp nails! (DamageTaken)"
    ],
    [
        "The demon stuns you with her heavy mace! (+STUN)",
        "The demon stuns you with ${Etheir} heavy mace! (+STUN)"
    ],
    [
        "The necromancer faints. Ironic that she couldn't save herself.",
        "The necromancer faints. Ironic that ${Ethey} couldn't save ${Ethem}self."
    ],
    [
        "You conjure an enchanted petsuit which wraps around your target, forcing her to follow you!",
        "You conjure an enchanted petsuit which wraps around your target, forcing ${Ethem} to follow you!"
    ],
    [
        "You can't help her with this.",
        "You can't help ${Ethem} with this."
    ],
    [
        "The EnemyName buffs the physical armor of her allies!",
        "The EnemyName buffs the physical armor of ${Ptheir} allies!"
    ],
    [
        "Floating hands appear by the conjurer's side as she points her staff!",
        "Floating hands appear by the conjurer's side as ${Pthey} point${Ps} ${Ptheir} staff!"
    ],
    [
        "Adventurer's Ghost: Having fun, Miss?",
        "Adventurer's Ghost: Having fun, ${Phonor}?"
    ],
    [
        "Adventurer's Ghost: Looking for some trouble, girl?",
        "Adventurer's Ghost: Looking for some trouble, ${Pdim}?"
    ],
    [
        "Adventurer's Ghost: I see you, naughty little girl!",
        "Adventurer's Ghost: I see you, naughty little ${Pdim}!"
    ],
    [
        "Ghost: A good girl doesn't complain.",
        "Ghost: A good ${Psub} doesn't complain."
    ],
    [
        "Ghost: A good girl doesn't speak until addressed.",
        "Ghost: A good ${Psub} doesn't speak until addressed."
    ],
    [
        "Ghost: Trussed up like a good girl~",
        "Ghost: Trussed up like a good ${Psub}~"
    ],
    [
        "Ghost: Just sit there like a good girl~",
        "Ghost: Just sit there like a good ${Psub}~"
    ],
    [
        "You've been a good girl. I hope you don't make the same mistake again. You can leave.",
        "You've been a good ${Psub}. I hope you don't make the same mistake again. You can leave."
    ],
    [
        "That's a good girl. Now behave yourself, okay? You're free to go.",
        "That's a good ${Psub}. Now behave yourself, okay? You're free to go."
    ],
    [
        "Looks like you got yourself in a bind! (She pats your butt playfully) Go make the others happy!",
        "Looks like you got yourself in a bind! (${EThey} pat${Es} your butt playfully) Go make the others happy!"
    ],
    [
        "You've been a good girl. I hope you don't make the same mistake again.|You can leave.",
        "You've been a good ${Psub}. I hope you don't make the same mistake again.|You can leave."
    ],
    [
        "That's a good girl. Now behave yourself, okay?|You're free to go.",
        "That's a good ${Psub}. Now behave yourself, okay?|You're free to go."
    ],
    [
        "Looks like you got yourself in a bind!|(She pats your butt playfully)|You're free to go!",
        "Looks like you got yourself in a bind!|(${EThey} pat${Es} your butt playfully)|You're free to go!"
    ],
    [
        "Looks like you got yourself in a bind!|(She pats your butt playfully)|You're free to go!",
        "Looks like you got yourself in a bind!|(${EThey} pat${Es} your butt playfully)|You're free to go!"
    ],
    [
        "Good Girl.",
        "Good ${PSub}."
    ],
    [
        "Looks like you're shaping up to be a good girl~",
        "Looks like you're shaping up to be a good ${Psub}~"
    ],
    [
        "I've been a bad girl, won't you do something about it?",
        "I've been a bad ${Esub}, won't you do something about it?"
    ],
    [
        "You look like a good girl. Come on~",
        "You look like a good ${Psub}. Come on~"
    ],
    [
        "Look who's enjoying Herself~",
        "Look who's enjoying ${PThem}self~"
    ],
    [
        "Good girls don't use magic without permission.",
        "Good ${Psub}s don't use magic without permission."
    ],
    [
        "Sorry Miss, I'm on an escort mission.",
        "Sorry ${PHonor}, I'm on an escort mission."
    ],
    [
        "Hey Miss, I'm going to have to stop you now~",
        "Hey ${PHonor}, I'm going to have to stop you now~"
    ],
    [
        "I just follow the money, Miss~",
        "I just follow the money, ${PHonor}~"
    ],
    [
        "...She's fast.",
        "...${PTheyre} fast."
    ],
    [
        "...She's strong.",
        "...${PTheyre} strong."
    ],
    [
        "There's a bounty on your head, Miss.",
        "There's a bounty on your head, ${PHonor}."
    ],
    [
        "Now there, good girl!",
        "Now there, good ${Psub}!"
    ],
    [
        "Be a good girl for me, will ya?",
        "Be a good ${Psub} for me, will ya?"
    ],
    [
        "Stay where you belong, you naughty girl.",
        "Stay where you belong, you naughty ${Psub}."
    ],
    [
        "Watch yourself, girl~",
        "Watch yourself, ${Psub}~"
    ],
    [
        "She thinks she can beat us~",
        "${PThey} thinks ${Pthey} can beat us~"
    ],
    [
        "An unruly subject. She needs training.",
        "An unruly subject. ${PThey} need${Ps} training."
    ],
    [
        "She thinks she can beat us~",
        "${PThey} thinks ${Pthey} can beat us~"
    ],
    [
        "An unruly subject. She needs training.",
        "An unruly subject. ${PThey} need${Ps} training."
    ],
    [
        "She thinks she can beat us~",
        "${PThey} thinks ${Pthey} can beat us~"
    ],
    [
        "An unruly subject. She needs training.",
        "An unruly subject. ${PThey} need${Ps} training."
    ],
    [
        "Good girl. I'll take that to the storage room.",
        "Good ${Psub}. I'll take that to the storage room."
    ],
    [
        "Don't you need a bodyguard, Miss?",
        "Don't you need a bodyguard, ${PHonor}?"
    ],
    [
        "Won't you train me, Miss?",
        "Won't you train me, ${PHonor}?"
    ],
    [
        "Miss, your uniform is dirty...",
        "${PHonor}, your uniform is dirty..."
    ],
    [
        "Why hello Miss...",
        "Why hello ${PHonor}..."
    ],
    [
        "Miss... I was told to bring you somewhere...",
        "${PHonor}... I was told to bring you somewhere..."
    ],
    [
        "Umm, Miss, you're supposed to report to the head maid...",
        "Umm, ${PHonor}, you're supposed to report to the head maid..."
    ],
    [
        "Miss! You're not allowed to cast that!",
        "${PHonor}! You're not allowed to cast that!"
    ],
    [
        "Miss, I have to report that!",
        "${PHonor}, I have to report that!"
    ],
    [
        "Miss, that's reserved for the head maid!",
        "${PHonor}, that's reserved for the head maid!"
    ],
    [
        "I'm sorry Miss...",
        "I'm sorry ${PHonor}..."
    ],
    [
        "Please surrender, Miss!",
        "Please surrender, ${PHonor}!"
    ],
    [
        "Don't you need a bodyguard, Miss?",
        "Don't you need a bodyguard, ${PHonor}?"
    ],
    [
        "Won't you train me, Miss?",
        "Won't you train me, ${PHonor}?"
    ],
    [
        "Miss, your uniform is dirty...",
        "${PHonor}, your uniform is dirty..."
    ],
    [
        "Why hello Miss...",
        "Why hello ${PHonor}..."
    ],
    [
        "Miss... I was told to bring you somewhere...",
        "${PHonor}... I was told to bring you somewhere..."
    ],
    [
        "Umm, Miss, you're supposed to report to the head maid...",
        "Umm, ${PHonor}, you're supposed to report to the head maid..."
    ],
    [
        "Miss, that's reserved for the head maid!",
        "${PHonor}, that's reserved for the head maid!"
    ],
    [
        "I'm sorry Miss...",
        "I'm sorry ${PHonor}..."
    ],
    [
        "Good girl, finding lost items.",
        "Good ${Psub}, finding lost items."
    ],
    [
        "Good girls keep their hands to themselves.",
        "Good ${Psub}s keep their hands to themselves."
    ],
    [
        "I won't get in your way, Miss!",
        "I won't get in your way, ${PHonor}!"
    ],
    [
        "Take me as your student, Miss!",
        "Take me as your student, ${PHonor}!"
    ],
    [
        "Miss, won't you come?",
        "${PHonor}, won't you come?"
    ],
    [
        "Okay Miss, I'll do that...",
        "Okay ${PHonor}, I'll do that..."
    ],
    [
        "(The SPEAKER smiles)|Keep up the good work, girl.",
        "(The SPEAKER smiles)|Keep up the good work, ${Psub}."
    ],
    [
        "(The SPEAKER smiles)|Good girl.",
        "(The SPEAKER smiles)|Good ${Psub}."
    ],
    [
        "(The SPEAKER smiles)|That's a good girl.",
        "(The SPEAKER smiles)|That's a good ${Psub}."
    ],
    [
        "(The SPEAKER blushes)|Umm, Miss, I see that you have a weapon there,|could you maybe hand it over?",
        "(The SPEAKER blushes)|Umm, ${PHonor}, I see that you have a weapon there,|could you maybe hand it over?"
    ],
    [
        "(The SPEAKER smiles at you)|Be a good girl and hand that weapon over,|would you?",
        "(The SPEAKER smiles at you)|Be a good ${Psub} and hand that weapon over,|would you?"
    ],
    [
        "Yes, Miss... (Currently held weapon will be lost)",
        "Yes, ${EHonor}... (Currently held weapon will be lost)"
    ],
    [
        "I will be a good girl!",
        "I will be a good ${Psub}!"
    ],
    [
        "(The SPEAKER approaches you in your cell)|Back again, are we? Silly girl.|You know we don't take no for an answer.",
        "(The SPEAKER approaches you in your cell)|Back again, are we? Silly ${Pdim}.|You know we don't take no for an answer."
    ],
    [
        "(The SPEAKER smiles back)|Oh, this is a game to you?|Then perhaps I should make it funner for you...|(She leaves and returns with some toys...)|Now hold still!",
        "(The SPEAKER smiles back)|Oh, this is a game to you?|Then perhaps I should make it funner for you...|(${EThey} leave${Es} and returns with some toys...)|Now hold still!"
    ],
    [
        "Of course Miss.",
        "Of course ${EHonor}."
    ],
    [
        "(The SPEAKER smiles as she hides her hands behind her back)|Have you heard of 'sensory deprivation'?",
        "(The SPEAKER smiles as ${Ethey} hide${Es} her hands behind her back)|Have you heard of 'sensory deprivation'?"
    ],
    [
        "(The SPEAKER takes a duster gag from her satchel)|Such a good girl!|So here's what I have for you~|It's a special tool to help keep the place clean.",
        "(The SPEAKER takes a duster gag from her satchel)|Such a good ${Psub}!|So here's what I have for you~|It's a special tool to help keep the place clean."
    ],
    [
        "(The SPEAKER grins)|I'm glad we could come to an understanding~|(She takes out a duster gag from her satchel)|Now then, this place is filthy.|Why don't you put this on to help?",
        "(The SPEAKER grins)|I'm glad we could come to an understanding~|(${EThey} take${Es} out a duster gag from her satchel)|Now then, this place is filthy.|Why don't you put this on to help?"
    ],
    [
        "(The SPEAKER reaches out to grab you)|Now now,|You shouldn't skip out on your duties~|(She gets out a duster gag from her satchel and grins)",
        "(The SPEAKER reaches out to grab you)|Now now,|You shouldn't skip out on your duties~|(${EThey} get${Es} out a duster gag from her satchel and grins)"
    ],
    [
        "(The SPEAKER smiles)|Don't be afraid!|(She turns the gag with the round mouth ball clearly visible)|Now open up...",
        "(The SPEAKER smiles)|Don't be afraid!|(${EThey} turn${Es} the gag with the round mouth ball clearly visible)|Now open up..."
    ],
    [
        "(The SPEAKER places the gag in your mouth)|(She then buckles up the straps.)|(You feel a locking mechanism pull the straps in tight...)|Good maid!",
        "(The SPEAKER places the gag in your mouth)|(${EThey} then buckle${Es} up the straps.)|(You feel a locking mechanism pull the straps in tight...)|Good maid!"
    ],
    [
        "Yes Miss!",
        "Yes ${EHonor}!"
    ],
    [
        "(The SPEAKER pouts)|Aww, spoilsport!|(She returns to fighting her imaginary enemies)",
        "(The SPEAKER pouts)|Aww, spoilsport!|(${EThey} return${Es} to fighting her imaginary enemies)"
    ],
    [
        "(A robotic SPEAKER approaches)|QUERY: Good Girl detected:|Restraint desired?",
        "(A robotic SPEAKER approaches)|QUERY: Good ${PSub} detected:|Restraint desired?"
    ],
    [
        "(A robotic SPEAKER approaches)|QUERY: Good Girl detected:|Restraint desired?",
        "(A robotic SPEAKER approaches)|QUERY: Good ${PSub} detected:|Restraint desired?"
    ],
    [
        "(The SPEAKER smiles gently at you as she ties|I love the silky feeling~|(The SPEAKER tightens all her knots)",
        "(The SPEAKER smiles gently at you as ${Ethey} tie${Es}|I love the silky feeling~|(The SPEAKER tightens all her knots)"
    ],
    [
        "(The SPEAKER pulls out a pressurized flask)|Behold! A gaseous form of latex!|I've coated the interior with a layer of inert slime to keep it secure.|Here, have a look!|(She holds out the container)",
        "(The SPEAKER pulls out a pressurized flask)|Behold! A gaseous form of latex!|I've coated the interior with a layer of inert slime to keep it secure.|Here, have a look!|(${EThey} hold${Es} out the container)"
    ],
    [
        "(The SPEAKER frowns)|What, do you doubt my results? See for yourself!|(She unscrews the cap)",
        "(The SPEAKER frowns)|What, do you doubt my results? See for yourself!|(${EThey} unscrew${Es} the cap)"
    ],
    [
        "(You push her out of the way, but she frowns)|Hmph. This is your fault.",
        "(You push her out of the way, but ${Ethey} frown${Es})|Hmph. This is your fault."
    ],
    [
        "(The SPEAKER looks at you deviously)|A good girl wears her RESTRAINT with enthusiasm~",
        "(The SPEAKER looks at you deviously)|A good ${Psub} wears her RESTRAINT with enthusiasm~"
    ],
    [
        "(The SPEAKER adds the RESTRAINT)|(You feel her tighten everything before locking it)|Good girl~|I'll make it extra tight for you!",
        "(The SPEAKER adds the RESTRAINT)|(You feel her tighten everything before locking it)|Good ${Psub}~|I'll make it extra tight for you!"
    ],
    [
        "(The SPEAKER smiles sweetly)|Such a good girl~|(The RESTRAINT locks with a loud click)",
        "(The SPEAKER smiles sweetly)|Such a good ${Psub}~|(The RESTRAINT locks with a loud click)"
    ],
    [
        "(The SPEAKER shifts her weight back)|I'm afraid I must insist.|(She ${ETheyThem_is} gripping a RESTRAINT)|(The SPEAKER dives towards you!)",
        "(The SPEAKER shifts her weight back)|I'm afraid I must insist.|(${EThey} ${ETheyThem_is} gripping a RESTRAINT)|(The SPEAKER dives towards you!)"
    ],
    [
        "(The SPEAKER binds you tightly)|(The rope is tight, and she's clearly an expert.)|Mmm, not too bad~",
        "(The SPEAKER binds you tightly)|(The rope is tight, and ${Etheyre} clearly an expert.)|Mmm, not too bad~"
    ],
    [
        "(The SPEAKER can't keep the knots tight)|(Eventually, she gives up)|S-Stupid human...",
        "(The SPEAKER can't keep the knots tight)|(Eventually, ${Ethey} give${Es} up)|S-Stupid human..."
    ],
    [
        "(The SPEAKER strictly ties you up)|(You can feel she's done this many times)|(She smirks at you as she departs)",
        "(The SPEAKER strictly ties you up)|(You can feel ${Etheyve} done this many times)|(${EThey} smirk${Es} at you as ${Ethey} depart${Es})"
    ],
    [
        "(The SPEAKER strictly ties you up)|(There's no slack anywhere!)|(She makes a face at you as she leaves)",
        "(The SPEAKER strictly ties you up)|(There's no slack anywhere!)|(${EThey} make${Es} a face at you as ${Ethey} leave${Es})"
    ],
    [
        "(The SPEAKER follows you)|Not so fast there~|(She blocks your path)",
        "(The SPEAKER follows you)|Not so fast there~|(${EThey} block${Es} your path)"
    ],
    [
        "(The SPEAKER adds the RESTRAINT)|Good luck with that one~|(She sounds like she's gloating...)",
        "(The SPEAKER adds the RESTRAINT)|Good luck with that one~|(${EThey} sound${Es} like ${Etheyre} gloating...)"
    ],
    [
        "Y-Yes Miss~",
        "Y-Yes ${EHonor}~"
    ],
    [
        "(The SPEAKER giggles as she catches you and slaps on the cuffs)|No so fast, dear~",
        "(The SPEAKER giggles as ${Ethey} catch${Ees} you and slaps on the cuffs)|No so fast, dear~"
    ],
    [
        "(The SPEAKER frowns)|I think I should.|You'll just bother someone else.|(She holds up a RESTRAINT)",
        "(The SPEAKER frowns)|I think I should.|You'll just bother someone else.|(${EThey} hold${Es} up a RESTRAINT)"
    ],
    [
        "(The SPEAKER adds the RESTRAINT)|(As she's locking it, she giggles)|You're really cute actually~",
        "(The SPEAKER adds the RESTRAINT)|(As ${Etheyre} locking it, ${Ethey} giggle${Es})|You're really cute actually~"
    ],
    [
        "(The SPEAKER grins as she binds your body)|(RESTRAINT digs into you a little)|Enjoy, cutie~",
        "(The SPEAKER grins as ${Ethey} bind${Es} your body)|(RESTRAINT digs into you a little)|Enjoy, cutie~"
    ],
    [
        "(The SPEAKER grins as she connects chains to your cuffs)|(The RESTRAINT is unyielding as you struggle)|Enjoy, cutie~",
        "(The SPEAKER grins as ${Ethey} connect${Es} chains to your cuffs)|(The RESTRAINT is unyielding as you struggle)|Enjoy, cutie~"
    ],
    [
        "(The SPEAKER nervously walks up to you)|Excuse me Miss...|Are you a fan of latex by chance?",
        "(The SPEAKER nervously walks up to you)|Excuse me ${PHonor}...|Are you a fan of latex by chance?"
    ],
    [
        "(The SPEAKER grins)|Wonderful! You see, I've just recently acquired one of these...|(She shows you a loose RESTRAINT)|I'm not too interested in wearing one myself,|but I thought you'd be a good fit for it?",
        "(The SPEAKER grins)|Wonderful! You see, I've just recently acquired one of these...|(${EThey} show${Es} you a loose RESTRAINT)|I'm not too interested in wearing one myself,|but I thought you'd be a good fit for it?"
    ],
    [
        "(The SPEAKER blushes as she locks the belt around your waist)|I'm enjoying this more than I thought I would~",
        "(The SPEAKER blushes as ${Ethey} lock${Es} the belt around your waist)|I'm enjoying this more than I thought I would~"
    ],
    [
        "(The SPEAKER blushes as she locks the RESTRAINT onto you)|There we go~",
        "(The SPEAKER blushes as ${Ethey} lock${Es} the RESTRAINT onto you)|There we go~"
    ],
    [
        "(The SPEAKER nervously walks up to you)|Excuse me Miss...|Can you help me out?",
        "(The SPEAKER nervously walks up to you)|Excuse me ${PHonor}...|Can you help me out?"
    ],
    [
        "(The SPEAKER smiles)|Thank you so much, Miss!",
        "(The SPEAKER smiles)|Thank you so much, ${PHonor}!"
    ],
    [
        "(The SPEAKER sighs and wears it herself)|(The lock starts glowing brightly...)",
        "(The SPEAKER sighs and wears it ${Ethem}self)|(The lock starts glowing brightly...)"
    ],
    [
        "(The SPEAKER looks relieved)|Thank you so much Miss!|I won't forget you!",
        "(The SPEAKER looks relieved)|Thank you so much ${PHonor}!|I won't forget you!"
    ],
    [
        "(As you turn around, the SPEAKER surprises you)|(You hear a click on your body)|I'm sorry Miss! It was my only choice~",
        "(As you turn around, the SPEAKER surprises you)|(You hear a click on your body)|I'm sorry ${PHonor}! It was my only choice~"
    ],
    [
        "(The SPEAKER grins as she sees you)|Hey there sweetie~|I think you'd look good in some ropes!",
        "(The SPEAKER grins as ${Ethey} see${Es} you)|Hey there sweetie~|I think you'd look good in some ropes!"
    ],
    [
        "(The SPEAKER slaps your butt as she ties the last knot)|All trussed up~",
        "(The SPEAKER slaps your butt as ${Ethey} tie${Es} the last knot)|All trussed up~"
    ],
    [
        "(The SPEAKER smiles)|Good girl~",
        "(The SPEAKER smiles)|Good ${Psub}~"
    ],
    [
        "Yes Miss!",
        "Yes ${EHonor}!"
    ],
    [
        "(The SPEAKER perks her ears as she sees you)|You've got a nice body.|I think it'll do better with some training!",
        "(The SPEAKER perks her ears as ${Ethey} see${Es} you)|You've got a nice body.|I think it'll do better with some training!"
    ],
    [
        "(The SPEAKER gets you suited up)|There you go! Now go be a good girl!",
        "(The SPEAKER gets you suited up)|There you go! Now go be a good ${Psub}!"
    ],
    [
        "(The SPEAKER zaps you and places you in restrictive gear)|Good girls need training.|Come back when you've learned a thing or two~",
        "(The SPEAKER zaps you and places you in restrictive gear)|Good ${Psub}s need training.|Come back when you've learned a thing or two~"
    ],
    [
        "(The SPEAKER does a short bow as she sees you)|Greetings.|You seem to possess qualities we can make use of.|I would be glad to offer you a position...",
        "(The SPEAKER does a short bow as ${Ethey} see${Es} you)|Greetings.|You seem to possess qualities we can make use of.|I would be glad to offer you a position..."
    ],
    [
        "(The SPEAKER suddenly moves faster than you can react)|(You feel a foot pressing on your back as you are forced down)|(She puts a uniform on you and locks it tight...)|Consider this a warning from my mistress~",
        "(The SPEAKER suddenly moves faster than you can react)|(You feel a foot pressing on your back as you are forced down)|(${EThey} put${Es} a uniform on you and locks it tight...)|Consider this a warning from my mistress~"
    ],
    [
        "(The SPEAKER does a short bow as she sees you)|Greetings.|You seem to possess qualities we can make use of.|I would be glad to offer you a position...",
        "(The SPEAKER does a short bow as ${Ethey} see${Es} you)|Greetings.|You seem to possess qualities we can make use of.|I would be glad to offer you a position..."
    ],
    [
        "(The SPEAKER suddenly moves faster than you can react)|(You feel a foot pressing on your back as you are forced down)|(She puts a uniform on you and locks it tight...)|You'll require additional training, I suppose...",
        "(The SPEAKER suddenly moves faster than you can react)|(You feel a foot pressing on your back as you are forced down)|(${EThey} put${Es} a uniform on you and locks it tight...)|You'll require additional training, I suppose..."
    ],
    [
        "(The SPEAKER perks her ears as she sees you)|Glory to the blessed kitty!|Are you prepared to join us?",
        "(The SPEAKER perks her ears as ${Ethey} see${Es} you)|Glory to the blessed kitty!|Are you prepared to join us?"
    ],
    [
        "(The SPEAKER forces you down with a burst of speed)|(She stuffs you into pet gear)|There. Punishment for your insolence~",
        "(The SPEAKER forces you down with a burst of speed)|(${EThey} stuff${Es} you into pet gear)|There. Punishment for your insolence~"
    ],
    [
        "(The SPEAKER smiles)|Now, I have something wonderful in store for you.|(She takes out a blue catsuit)|I'd like you to be my assistant!",
        "(The SPEAKER smiles)|Now, I have something wonderful in store for you.|(${EThey} take${Es} out a blue catsuit)|I'd like you to be my assistant!"
    ],
    [
        "(The SPEAKER tilts her head)|Fine then. You win.|(As you leave, you hear a 'just kidding' as she breaks a glass vial)|(A suit of blue latex envelops you!)",
        "(The SPEAKER tilts her head)|Fine then. You win.|(As you leave, you hear a 'just kidding' as ${Ethey} break${Es} a glass vial)|(A suit of blue latex envelops you!)"
    ],
    [
        "(The SPEAKER nods and smiles)|(She decorates your body with 'jewelry')|I am glad you had a change of heart.",
        "(The SPEAKER nods and smiles)|(${EThey} decorate${Es} your body with 'jewelry')|I am glad you had a change of heart."
    ],
    [
        "(The SPEAKER suddenly strikes you to the floor)|(You feel a foot on your back as she ties you in a strict rope hogtie...)|(She dusts off her hands)|We'll have a talk when you get out of that, okay?",
        "(The SPEAKER suddenly strikes you to the floor)|(You feel a foot on your back as ${Ethey} tie${Es} you in a strict rope hogtie...)|(${EThey} dust${Es} off her hands)|We'll have a talk when you get out of that, okay?"
    ],
    [
        "(The SPEAKER beeps)|Confirming database entry.|Say 'I will be a good girl' to enter database.",
        "(The SPEAKER beeps)|Confirming database entry.|Say 'I will be a good ${Psub}' to enter database."
    ],
    [
        "(The SPEAKER beeps and applies tracking gear)|(The metallic cables click into place with a soft beep)|Prisoner 74121 registered. Good girl.",
        "(The SPEAKER beeps and applies tracking gear)|(The metallic cables click into place with a soft beep)|Prisoner 74121 registered. Good ${Psub}."
    ],
    [
        "Prisoner 74121 reporting. I will be a good girl.",
        "Prisoner 74121 reporting. I will be a good ${Psub}."
    ],
    [
        "I'm sorry, I will be a good girl!",
        "I'm sorry, I will be a good ${Psub}!"
    ],
    [
        "(The SPEAKER does a short bow as she sees you)|Um... hi!|I have a letter for you...",
        "(The SPEAKER does a short bow as ${Ethey} see${Es} you)|Um... hi!|I have a letter for you..."
    ],
    [
        "(The SPEAKER does a short bow as she sees you)|Greetings.|You seem to possess qualities we can make use of.|I would be glad to offer you a position...",
        "(The SPEAKER does a short bow as ${Ethey} see${Es} you)|Greetings.|You seem to possess qualities we can make use of.|I would be glad to offer you a position..."
    ],
    [
        "(The SPEAKER suddenly moves faster than you can react)|(You feel a foot pressing on your back as you are forced down)|(She puts a uniform on you and locks it tight...)|You'll require additional training, I suppose...",
        "(The SPEAKER suddenly moves faster than you can react)|(You feel a foot pressing on your back as you are forced down)|(${EThey} put${Es} a uniform on you and locks it tight...)|You'll require additional training, I suppose..."
    ],
    [
        "(The SPEAKER waves)|Hello Miss!|What brings you here today?",
        "(The SPEAKER waves)|Hello ${PHonor}!|What brings you here today?"
    ],
    [
        "(The SPEAKER folds her arms)|I don't do charity, Miss.",
        "(The SPEAKER folds her arms)|I don't do charity, ${PHonor}."
    ],
    [
        "(The SPEAKER rattles as she waves)|Heya!|Looking to buy some ancient treasures?|My antiques shop has just what you need!",
        "(The SPEAKER rattles as ${Ethey} wave${Es})|Heya!|Looking to buy some ancient treasures?|My antiques shop has just what you need!"
    ],
    [
        "(The SPEAKER looks embarassed)|I can't sell you that, Miss...",
        "(The SPEAKER looks embarassed)|I can't sell you that, ${PHonor}..."
    ],
    [
        "(The SPEAKER grins)|Good girls don't need one of those~",
        "(The SPEAKER grins)|Good ${Psub}s don't need one of those~"
    ],
    [
        "(The SPEAKER pauses nervously)|Um Miss, I don't think you can afford that...",
        "(The SPEAKER pauses nervously)|Um ${PHonor}, I don't think you can afford that..."
    ],
    [
        "(Look at what she wants to buy)",
        "(Look at what ${Ethey} want${Es} to buy)"
    ],
    [
        "(The SPEAKER's eyes widen as she wolfs down the golden cookie)|Truly divine...",
        "(The SPEAKER's eyes widen as ${Ethey} wolf${Es} down the golden cookie)|Truly divine..."
    ],
    [
        "(Look at what she has to sell)",
        "(Look at what ${Ethey} ${Ehas} to sell)"
    ],
    [
        "(The SPEAKER appears in a flash of light)|I come in the name of the Goddess.|I presume you need my aid?|(She will remain and help you with restraints for 50 turns)",
        "(The SPEAKER appears in a flash of light)|I come in the name of the Goddess.|I presume you need my aid?|(${EThey} will remain and help you with restraints for 50 turns)"
    ],
    [
        "(The SPEAKER looks impressed with your predicament)|Since you are Blessed by a goddess, I can help you.|(She performs a short prayer and a random divine lock comes off)",
        "(The SPEAKER looks impressed with your predicament)|Since you are Blessed by a goddess, I can help you.|(${EThey} perform${Es} a short prayer and a random divine lock comes off)"
    ],
    [
        "(The SPEAKER smiles)|You do, in fact!|(She inches closer)",
        "(The SPEAKER smiles)|You do, in fact!|(${EThey} inch${Ees} closer)"
    ],
    [
        "(The SPEAKER wiggles excitedly)|Y-yes Miss!",
        "(The SPEAKER wiggles excitedly)|Y-yes ${PHonor}!"
    ],
    [
        "Fuuka surrounds herself in defensive talismans!",
        "Fuuka surrounds ${Ethem}self in defensive talismans!"
    ],
    [
        "Fuuka surrounds herself in defensive talismans one more time!",
        "Fuuka surrounds ${Ethem}self in defensive talismans one more time!"
    ],
    [
        "Fuuka pouts as she tickles you relentlessly! (DamageTaken)",
        "Fuuka pouts as ${Ethey} tickle${Es} you relentlessly! (DamageTaken)"
    ],
    [
        "(You find a girl wearing an ornate dress)|(She glances at you)|And who might you be?",
        "(You find a girl wearing an ornate dress)|(${EThey} glance${Es} at you)|And who might you be?"
    ],
    [
        "I'm an adventurer, Miss.",
        "I'm an adventurer, ${EHonor}."
    ],
    [
        "That sounds great. But who are you Miss?",
        "That sounds great. But who are you ${EHonor}?"
    ],
    [
        "I don't want to fight, Miss...",
        "I don't want to fight, ${EHonor}..."
    ],
    [
        "Daww! What a cutie!|(She smiles and pats your head gently)",
        "Daww! What a cutie!|(${EThey} smile${Es} and pats your head gently)"
    ],
    [
        "(The SPEAKER folds her arms and nods)|Good girl! I knew you would come clean~",
        "(The SPEAKER folds her arms and nods)|Good ${Psub}! I knew you would come clean~"
    ],
    [
        "Excellent! Please hold still~|(She fits the RESTRAINTNAME on and a seal awakens)|Whoops! Good thing I didn't sell that one!|I'll let you keep it, it's my treat~",
        "Excellent! Please hold still~|(${EThey} fit${Es} the RESTRAINTNAME on and a seal awakens)|Whoops! Good thing I didn't sell that one!|I'll let you keep it, it's my treat~"
    ],
    [
        "Excellent! Please hold still~|(She fits the RESTRAINTNAME on and nothing happens)|We have a winner!|You can't have it though, not until you pay up~",
        "Excellent! Please hold still~|(${EThey} fit${Es} the RESTRAINTNAME on and nothing happens)|We have a winner!|You can't have it though, not until you pay up~"
    ],
    [
        "Wonderful. I look forward to seeing you being delivered, er, coming back,|Lots of treasure in hand!|(She places the RESTRAINTNAME on you and the seal activates. There is no keyhole.)",
        "Wonderful. I look forward to seeing you being delivered, er, coming back,|Lots of treasure in hand!|(${EThey} place${Es} the RESTRAINTNAME on you and the seal activates. There is no keyhole.)"
    ],
    [
        "Alright! Why don't you hold still~|(She lifts your hair out of the way and buckles the collar on)|Now go out there and find me some treasure~",
        "Alright! Why don't you hold still~|(${EThey} lift${Es} your hair out of the way and buckles the collar on)|Now go out there and find me some treasure~"
    ],
    [
        "You're gonna like it, I guarantee it~|(She pulls out the catsuit from a drawer, dusts it off, and helps you in it)|(There is no zipper or fastener, just a very stretchy neck hole)|(Once it's on and well-fitted, you feel the neck grow less loose...)|(...and pulling the rubber away from your skin becomes impossible)|Beautiful. I'm going to let you go now.|I'm sure your new look will attract many customers!",
        "You're gonna like it, I guarantee it~|(${EThey} pull${Es} out the catsuit from a drawer, dusts it off, and helps you in it)|(There is no zipper or fastener, just a very stretchy neck hole)|(Once it's on and well-fitted, you feel the neck grow less loose...)|(...and pulling the rubber away from your skin becomes impossible)|Beautiful. I'm going to let you go now.|I'm sure your new look will attract many customers!"
    ],
    [
        "(The SPEAKER folds her arms and nods)|Good girl! I knew you would come clean~",
        "(The SPEAKER folds her arms and nods)|Good ${Psub}! I knew you would come clean~"
    ],
    [
        "Excellent! Please hold still~|(She fits the RESTRAINTNAME on and a seal awakens)|Whoops! Good thing I didn't sell that one!|I'll let you keep it, it's my treat~",
        "Excellent! Please hold still~|(${EThey} fit${Es} the RESTRAINTNAME on and a seal awakens)|Whoops! Good thing I didn't sell that one!|I'll let you keep it, it's my treat~"
    ],
    [
        "Excellent! Please hold still~|(She fits the RESTRAINTNAME on and nothing happens)|We have a winner!|You can't have it though, not until you pay up~",
        "Excellent! Please hold still~|(${EThey} fit${Es} the RESTRAINTNAME on and nothing happens)|We have a winner!|You can't have it though, not until you pay up~"
    ],
    [
        "Wonderful. I look forward to seeing you being delivered, er, coming back,|Lots of treasure in hand!|(She places the RESTRAINTNAME on you and the seal activates. There is no keyhole.)",
        "Wonderful. I look forward to seeing you being delivered, er, coming back,|Lots of treasure in hand!|(${EThey} place${Es} the RESTRAINTNAME on you and the seal activates. There is no keyhole.)"
    ],
    [
        "Alright! Why don't you hold still~|(She lifts your hair out of the way and buckles the collar on)|Now go out there and find me some treasure~",
        "Alright! Why don't you hold still~|(${EThey} lift${Es} your hair out of the way and buckles the collar on)|Now go out there and find me some treasure~"
    ],
    [
        "You're gonna like it, I guarantee it~|(She pulls out the catsuit from a drawer, dusts it off, and helps you in it)|(There is no zipper or fastener, just a very stretchy neck hole)|(Once it's on and well-fitted, you feel the neck grow less loose...)|(...and pulling the rubber away from your skin becomes impossible)|Beautiful. I'm going to let you go now.|I'm sure your new look will attract many customers!",
        "You're gonna like it, I guarantee it~|(${EThey} pull${Es} out the catsuit from a drawer, dusts it off, and helps you in it)|(There is no zipper or fastener, just a very stretchy neck hole)|(Once it's on and well-fitted, you feel the neck grow less loose...)|(...and pulling the rubber away from your skin becomes impossible)|Beautiful. I'm going to let you go now.|I'm sure your new look will attract many customers!"
    ],
    [
        "(A SPEAKER lies hogtied in front of you)|(She looks at you with pleading eyes,)|(and mumbles incoherently through her gag)",
        "(A SPEAKER lies hogtied in front of you)|(${EThey} look${Es} at you with pleading eyes,)|(and mumbles incoherently through her gag)"
    ],
    [
        "(A SPEAKER lies hogtied in front of you)|(She looks at you, mumbling and giggling into her gag)",
        "(A SPEAKER lies hogtied in front of you)|(${EThey} look${Es} at you, mumbling and giggling into her gag)"
    ],
    [
        "Make sure she is tight and secure",
        "Make sure ${Ethey} ${Eis} tight and secure"
    ],
    [
        "(The SPEAKER stares at you like a rabid animal)|Wowie! You look gorgeous!|Thank you so much!|(She snaps a photo of you using a magic crystal)",
        "(The SPEAKER stares at you like a rabid animal)|Wowie! You look gorgeous!|Thank you so much!|(${EThey} snap${Es} a photo of you using a magic crystal)"
    ],
    [
        "(The SPEAKER pauses for a moment, then speaks)|I'm am just following Mistress Oriel's orders.|I'm sure she will have time to speak with you if you want to ask her.",
        "(The SPEAKER pauses for a moment, then speaks)|I'm am just following Mistress Oriel's orders.|I'm sure ${Ethey} will have time to speak with you if you want to ask her."
    ],
    [
        "(You anger the SPEAKER. She gags you.)|Unlike you, we were trained not to complain about orders given to us.|So until you receive your training, why don't you be nice and quiet?",
        "(You anger the SPEAKER. ${EThey} gag${Es} you.)|Unlike you, we were trained not to complain about orders given to us.|So until you receive your training, why don't you be nice and quiet?"
    ],
    [
        "(You can't help her, bound as tightly as you are...)",
        "(You can't help ${Ethem}, bound as tightly as you are...)"
    ],
    [
        "(You unlock your SPEAKER)|Mmmmph!|(She wants to keep her gag...)",
        "(You unlock your SPEAKER)|Mmmmph!|(She want${Es} to keep her gag...)"
    ],
    [
        "(You unlock the SPEAKER)|Mmmmph!|(She wants to keep her gag...)",
        "(You unlock the SPEAKER)|Mmmmph!|(She want${Es} to keep her gag...)"
    ],
    [
        "(After a while, you free the SPEAKER)|Are you supposed to be here?|(She giggles)",
        "(After a while, you free the SPEAKER)|Are you supposed to be here?|(${EThey} giggle${Es})"
    ],
    [
        "(After a while, you free the SPEAKER)|Mmmmph!|(She shakes her head when you go for her gag...)",
        "(After a while, you free the SPEAKER)|Mmmmph!|(${EThey} shake${Es} her head when you go for her gag...)"
    ],
    [
        "(You utter a command word to free the SPEAKER)|Mmmmph!|(She locks her gag back on...)",
        "(You utter a command word to free the SPEAKER)|Mmmmph!|(${EThey} lock${Es} her gag back on...)"
    ],
    [
        "(The SPEAKER sits bound in mysterious ASCII glyphs)|(She is bugged and needs your help to get out)",
        "(The SPEAKER sits bound in mysterious ASCII glyphs)|(${EThey} is bugged and needs your help to get out)"
    ],
    [
        "(You can't help her, bound as tightly as you are...)",
        "(You can't help ${Ethem}, bound as tightly as you are...)"
    ],
    [
        "(You unlock the SPEAKER)|Mmmmph!|(She wants to keep her gag...)",
        "(You unlock the SPEAKER)|Mmmmph!|(${EThey} want${Es} to keep her gag...)"
    ],
    [
        "(After a while, you free the SPEAKER)|Mmmmph!|(She shakes her head when you go for her gag...)",
        "(After a while, you free the SPEAKER)|Mmmmph!|(${EThey} shake${Es} her head when you go for her gag...)"
    ],
    [
        "(You utter a command word to free the SPEAKER)|Mmmmph!|(She locks her gag back on...)",
        "(You utter a command word to free the SPEAKER)|Mmmmph!|(${EThey} lock${Es} her gag back on...)"
    ],
    [
        "(A SPEAKER wakes you up by banging on the bars)|Wake up! Let's get out of here!|(She managed to pick the lock on your cell door)",
        "(A SPEAKER wakes you up by banging on the bars)|Wake up! Let's get out of here!|(${EThey} managed to pick the lock on your cell door)"
    ],
    [
        "(A SPEAKER wakes you up by banging on the bars)|Wake up! Let's get out of here!|(She managed to pick the lock on your cell door)",
        "(A SPEAKER wakes you up by banging on the bars)|Wake up! Let's get out of here!|(${EThey} managed to pick the lock on your cell door)"
    ],
    [
        "(You lock her into the furniture so that she stays in place)",
        "(You lock her into the furniture so that ${Ethey} stay${Es} in place)"
    ],
    [
        "The ENEMYNAME transforms nearby dolls into her subjects!",
        "The ENEMYNAME transforms nearby dolls into ${Ptheir} subjects!"
    ],
    [
        "The ENEMYNAME transforms nearby dolls into her subjects!",
        "The ENEMYNAME transforms nearby dolls into ${Ptheir} subjects!"
    ],
    [
        "(In the center of the room stands a woman wearing a latex dress)|(Around her are robotic servants, obeying her without a word)|(She has been watching you this entire time)",
        "(In the center of the room stands a woman wearing a latex dress)|(Around ${Ethem} are robotic servants, obeying ${Ethem} without a word)|(${EThey} ${Ehas} been watching you this entire time)"
    ],
    [
        "(Scoff at her)",
        "(Scoff at ${Ethem})"
    ],
    [
        "(Attack her without saying anything)",
        "(Attack ${Ethem} without saying anything)"
    ],
    [
        "(The Dollmaker folds her arms)|In any case, your journey ends here.|I do not appreciate scoundrels poking around in my domain.|I will personally lead you to your new future as a doll.",
        "(The Dollmaker folds ${Etheir} arms)|In any case, your journey ends here.|I do not appreciate scoundrels poking around in my domain.|I will personally lead you to your new future as a doll."
    ],
    [
        "(The Dollmaker summons a drone to her side)|Such arrogance! I'll have to teach you some manners!",
        "(The Dollmaker summons a drone to ${Etheir} side)|Such arrogance! I'll have to teach you some manners!"
    ],
    [
        "(The Dollmaker folds her arms as she walks over)|All tight and shiny!|You'll be my prized possession~",
        "(The Dollmaker folds ${Etheir} arms as she walks over)|All tight and shiny!|You'll be my prized possession~"
    ],
    [
        "(Sigh and be forced to wear her visor)",
        "(Sigh and be forced to wear ${Etheir} visor)"
    ],
    [
        "(Sigh and be forced to wear her mask)",
        "(Sigh and be forced to wear ${Etheir} mask)"
    ],
    [
        "(The Dollmaker places her visor over your face)|(With a click, you feel its fasteners lock around your head)|Now... as it stands, I have a task for you, doll.|You see, some dolls have been escaping my realm.|I want you to go capture them.",
        "(The Dollmaker places ${Etheir} visor over your face)|(With a click, you feel its fasteners lock around your head)|Now... as it stands, I have a task for you, doll.|You see, some dolls have been escaping my realm.|I want you to go capture them."
    ],
    [
        "(The Dollmaker sinks into a puddle of slime and emerges nearby)|(Robotic arms sprout from her back as she storms toward you!)",
        "(The Dollmaker sinks into a puddle of slime and emerges nearby)|(Robotic arms sprout from ${Etheir} back as she storms toward you!)"
    ],
    [
        "(You lift up the dollmaker's mask, revealing a pouting young woman inside)|What are you--|(You insert a gag into her open mouth and she starts mumbling angrily)",
        "(You lift up the dollmaker's mask, revealing a pouting young woman inside)|What are you--|(You insert a gag into ${Etheir} open mouth and she starts mumbling angrily)"
    ],
    [
        "(Gag her)",
        "(Gag ${Ethem})"
    ],
    [
        "You return the doll to her rightful owner.",
        "You return the doll to ${Etheir} rightful owner."
    ],
    [
        "You defeat the chef and claim her prize.",
        "You defeat the chef and claim ${Etheir} prize."
    ],
    [
        "The chef spanks you with her frying pan! (DamageTaken)",
        "The chef spanks you with ${Etheir} frying pan! (DamageTaken)"
    ],
    [
        "Thank you Miss! I won't bother you anymore.",
        "Thank you ${PHonor}! I won't bother you anymore."
    ],
    [
        "It's time for your walk, Miss.",
        "It's time for your walk, ${PHonor}."
    ],
    [
        "It's been fun playing with you Miss!",
        "It's been fun playing with you ${PHonor}!"
    ],
    [
        "Good girl~ Let's go again later~",
        "Good ${Psub}~ Let's go again later~"
    ],
    [
        "That's a good girl!",
        "That's a good ${Psub}!"
    ],
    [
        "The fighter strikes you with her weapon! (DamageTaken)",
        "The fighter strikes you with ${Etheir} weapon! (DamageTaken)"
    ],
    [
        "The fighter takes you down with the back of her weapon! (DamageTaken)",
        "The fighter takes you down with the back of ${Etheir} weapon! (DamageTaken)"
    ],
    [
        "The fighter wraps her arms around you with bindings in hand! (+RestraintAdded)",
        "The fighter wraps ${Etheir} arms around you with bindings in hand! (+RestraintAdded)"
    ],
    [
        "The fighter pins you with her weapon and grabs your breast! (DamageTaken)",
        "The fighter pins you with ${Etheir} weapon and grabs your breast! (DamageTaken)"
    ],
    [
        "The fighter enchants her weapon and strikes you! (DamageTaken)",
        "The fighter enchants ${Etheir} weapon and strikes you! (DamageTaken)"
    ],
    [
        "The fighter smiles lasciviously as she dangles a lock in front of you! (DamageTaken)",
        "The fighter smiles lasciviously as ${Ethey} dangle${Es} a lock in front of you! (DamageTaken)"
    ],
    [
        "The fighter enchants her weapon and flies forward!",
        "The fighter enchants ${Etheir} weapon and flies forward!"
    ],
    [
        "The fighter drops her weapon and admits defeat!",
        "The fighter drops ${Etheir} weapon and admits defeat!"
    ],
    [
        "The fighter feints and strikes, slapping you with the flat of her blade! (DamageTaken)",
        "The fighter feints and strikes, slapping you with the flat of ${Etheir} blade! (DamageTaken)"
    ],
    [
        "The fighter takes you down with the back of her weapon! (DamageTaken)",
        "The fighter takes you down with the back of ${Etheir} weapon! (DamageTaken)"
    ],
    [
        "The fighter falls on her knees and begs!",
        "The fighter falls on ${Etheir} knees and begs!"
    ],
    [
        "The fighter throws her weapon at you! (DamageTaken)",
        "The fighter throws ${Etheir} weapon at you! (DamageTaken)"
    ],
    [
        "The assistant envelops herself in her own bubble for protection.",
        "The assistant envelops ${Ethem}self in ${Etheir} own bubble for protection."
    ],
    [
        "The technician trips and glues herself to the floor.",
        "The technician trips and glues ${Ethem}self to the floor."
    ],
    [
        "The flame keeper grabs you, and volcanic restraints emerge from her armor! (+RestraintAdded)",
        "The flame keeper grabs you, and volcanic restraints emerge from ${Etheir} armor! (+RestraintAdded)"
    ],
    [
        "The Goddess calls you a good Girl.",
        "The Goddess calls you a good ${PSub}."
    ],
    [
        "The Goddess calls you a good Girl.",
        "The Goddess calls you a good ${PSub}."
    ],
    [
        "The Goddess calls you a good Girl.",
        "The Goddess calls you a good ${PSub}."
    ],
    [
        "The Goddess calls you a good Girl.",
        "The Goddess calls you a good ${PSub}."
    ],
    [
        "The Goddess calls you a good Girl.",
        "The Goddess calls you a good ${PSub}."
    ],
    [
        "The Goddess calls you a good Girl.",
        "The Goddess calls you a good ${PSub}."
    ],
    [
        "The Goddess calls you a good Girl.",
        "The Goddess calls you a good ${PSub}."
    ],
    [
        "The Goddess calls you a good Girl.",
        "The Goddess calls you a good ${PSub}."
    ],
    [
        "I'm going to have to search you, Miss~",
        "I'm going to have to search you, ${PHonor}~"
    ],
    [
        "You look so cute like that, Miss!",
        "You look so cute like that, ${PHonor}!"
    ],
    [
        "The rubber elemental's restraints snap onto her and she falls over hogtied.",
        "The rubber elemental's restraints snap onto ${Ethem} and ${Ethey} fall${Es} over hogtied."
    ],
    [
        "The Timekeeper releases her grip on the timeline.",
        "The Timekeeper releases ${Etheir} grip on the timeline."
    ],
    [
        "The Timekeeper takes the time to enjoy herself with you... (DamageTaken)",
        "The Timekeeper takes the time to enjoy ${Ethem}self with you... (DamageTaken)"
    ],
    [
        "Feed this to her",
        "Feed this to ${Ethem}"
    ],
    [
        "ENMY lets go of herself for AMNT damage!",
        "ENMY lets go of ${Ethem}self for AMNT damage!"
    ],
    [
        "The ENMY buzzes you with her VTY! (DMGDLT)",
        "The ENMY buzzes you with ${Etheir} VTY! (DMGDLT)"
    ],
    [
        "The ENMY catches you and teases you with her VTY! (DMGDLT)",
        "The ENMY catches you and teases you with ${Etheir} VTY! (DMGDLT)"
    ],
    [
        "The ENMY reaches for her VTY!",
        "The ENMY reaches for ${Etheir} VTY!"
    ],
    [
        "The ENMY reaches for her VTY!",
        "The ENMY reaches for ${Etheir} VTY!"
    ],
    [
        "The gladiator chuckles as she spanks your butt! (DamageTaken)",
        "The gladiator chuckles as ${Ethey} spank${Es} your butt! (DamageTaken)"
    ],
    [
        "The Warden strikes you with her whip! (DamageTaken)",
        "The Warden strikes you with ${Etheir} whip! (DamageTaken)"
    ],
    [
        "The Warden swings her enchanted whip and conjures locks on your body! (DamageTaken)",
        "The Warden swings ${Etheir} enchanted whip and conjures locks on your body! (DamageTaken)"
    ],
    [
        "(Growl at her)",
        "(Growl at ${Ethem})"
    ],
    [
        "(SPEAKER tilts her head)|Yes, she was around before Vinlaga.|Her magic was gifted to her by the Goddess,|it is only natural that it works on her too.",
        "(SPEAKER tilts ${Etheir} head)|Yes, she was around before Vinlaga.|Her magic was gifted to her by the Goddess,|it is only natural that it works on her too."
    ],
    [
        "(SPEAKER folds her arms)|Is it not holy and just to bring down tyrants?",
        "(SPEAKER folds ${Etheir} arms)|Is it not holy and just to bring down tyrants?"
    ],
    [
        "(SPEAKER folds her arms)|And what makes you think an old myth would be relevant here?|Would the Archmagus herself lead a rebellion against the divine?",
        "(SPEAKER folds ${Etheir} arms)|And what makes you think an old myth would be relevant here?|Would the Archmagus herself lead a rebellion against the divine?"
    ],
    [
        "Mmpphgh? (Go to pass her)",
        "Mmpphgh? (Go to pass ${Ethem})"
    ],
    [
        "Hmmph. (Scoff at her)",
        "Hmmph. (Scoff at ${Ethem})"
    ],
    [
        "(Give her a puzzled look and shake your head)",
        "(Give ${Ethem} a puzzled look and shake your head)"
    ],
    [
        "(Attack her without saying anything)",
        "(Attack ${Ethem} without saying anything)"
    ],
    [
        "(SPEAKER readies her whip)|Allow me to introduce myself properly.|I am The Warden, divinely appointed judge and enforcer.|Those who enter this mountain do so under my watchful eye.|To ensure this, I have crafted a special collar.|It will ensure that you do not defile the holy places.|I can let you through if you accept it~",
        "(SPEAKER readies ${Etheir} whip)|Allow me to introduce myself properly.|I am The Warden, divinely appointed judge and enforcer.|Those who enter this mountain do so under my watchful eye.|To ensure this, I have crafted a special collar.|It will ensure that you do not defile the holy places.|I can let you through if you accept it~"
    ],
    [
        "(SPEAKER folds her arms)|So be it.",
        "(SPEAKER folds ${Etheir} arms)|So be it."
    ],
    [
        "That won't be necessary, Miss.",
        "That won't be necessary, ${EHonor}."
    ],
    [
        "(Fight her)",
        "(Fight ${Ethem})"
    ],
    [
        "(SPEAKER smiles)|I will let you pass so long as you wear my collar.|(She snaps her fingers and conjures a glowing ring)",
        "(SPEAKER smiles)|I will let you pass so long as you wear my collar.|(${EThey} snaps ${Etheir} fingers and conjures a glowing ring)"
    ],
    [
        "(SPEAKER giggles)|Then your journey ends.|I assume you don't want that.|Now then, as for your punishment~|(She snaps her fingers and conjures a glowing ring)",
        "(SPEAKER giggles)|Then your journey ends.|I assume you don't want that.|Now then, as for your punishment~|(${EThey} snaps ${Etheir} fingers and conjures a glowing ring)"
    ],
    [
        "(SPEAKER chuckles)|Of course it was magic~|Who said a commander had to be defenseless?|(She snaps her fingers and conjures a glowing ring)",
        "(SPEAKER chuckles)|Of course it was magic~|Who said a commander had to be defenseless?|(${EThey} snaps ${Etheir} fingers and conjures a glowing ring)"
    ],
    [
        "(SPEAKER looks surprised)|I did not expect you to be so... compliant.|(She snaps your fingers and tosses you a glowing belt)|This is a special one, reserved for those with divine privilege.|You've earned it.",
        "(SPEAKER looks surprised)|I did not expect you to be so... compliant.|(${EThey} snaps your fingers and tosses you a glowing belt)|This is a special one, reserved for those with divine privilege.|You've earned it."
    ],
    [
        "(Wear her waist belt anyway)",
        "(Wear ${Etheir} waist belt anyway)"
    ],
    [
        "(SPEAKER shakes her head as you force a gag into her mouth)|MMMMMPH!",
        "(SPEAKER shakes ${Etheir} head as you force a gag into ${Etheir} mouth)|MMMMMPH!"
    ],
    [
        "(Gag her)",
        "(Gag ${Ethem})"
    ],
    [
        "(The SPEAKER grins)|What a good girl!",
        "(The SPEAKER grins)|What a good ${Psub}!"
    ],
    [
        "(The SPEAKER grins)|What a good girl!",
        "(The SPEAKER grins)|What a good ${Psub}!"
    ],
    [
        "The mage starts channeling her energy!",
        "The mage starts channeling ${Ptheir} energy!"
    ],
    [
        "The dragon girl slashes you with her venomous nails! (DamageTaken)",
        "The dragon girl slashes you with ${Etheir} venomous nails! (DamageTaken)"
    ],
    [
        "The cyber warden's suit goes into lockdown, leaving her wiggling helplessly!",
        "The cyber warden's suit goes into lockdown, leaving ${Ethem} wiggling helplessly!"
    ],
    [
        "You are not in a condition to use a leash on her.",
        "You are not in a condition to use a leash on ${Ethem}."
    ],
    [
        "She refuses to be leashed unless you tie her up!",
        "She refuses to be leashed unless you tie ${Ethem} up!"
    ],
    [
        "Miss, you're blocking me...",
        "${PHonor}, you're blocking me..."
    ],
    [
        "NPC has managed to loosen her bonds.",
        "NPC has managed to loosen ${Etheir} bonds."
    ],
    [
        "The ancient worshipper repents of her ways.",
        "The ancient worshipper repents of ${Etheir} ways."
    ],
    [
        "The ancient congregant repents of her ways.",
        "The ancient congregant repents of ${Etheir} ways."
    ],
    [
        "The ancient hierophant repents of her ways.",
        "The ancient hierophant repents of ${Etheir} ways."
    ],
    [
        "(The Warden perks an eyebrow at the sight of you,|before a wide grin overtakes her face)|Ahhh Fuuka. Chosen by the Goddess?|How does it feel to once again be under a leash?",
        "(The Warden perks an eyebrow at the sight of you,|before a wide grin overtakes ${Etheir} face)|Ahhh Fuuka. Chosen by the Goddess?|How does it feel to once again be under a leash?"
    ],
    [
        "Fuuka, take her down.",
        "Fuuka, take ${Ethem} down."
    ],
    [
        "(Send Fuuka to fight her)",
        "(Send Fuuka to fight ${Ethem})"
    ],
    [
        "Your linked target lets go of herself, transmitting a wave of pleasure to yourself...",
        "Your linked target lets go of ${Ethem}self, transmitting a wave of pleasure to yourself..."
    ],
    [
        "(The SPEAKER sits encased in skintight rubber up to her nose.|Though the latex over her mouth is smooth and flat,|you know from her whimpering moans that her mouth|is totally filled with a gag, useless like the rest of her body.|Some sort of stand affixes her to the floor.)",
        "(The SPEAKER sits encased in skintight rubber up to ${Etheir} nose.|Though the latex over ${Etheir} mouth is smooth and flat,|you know from ${Etheir} whimpering moans that ${Etheir} mouth|is totally filled with a gag, useless like the rest of ${Etheir} body.|Some sort of stand affixes ${Etheir} to the floor.)"
    ],
    [
        "(You can't help her, bound as tightly as you are...)",
        "(You can't help ${Ethem}, bound as tightly as you are...)"
    ],
    [
        "(You dissolve her restraints, fumbling around for a while with your bound hands)",
        "(You dissolve ${Etheir} restraints, fumbling around for a while with your bound hands)"
    ],
    [
        "(You rescue the SPEAKER)|Mmmmph!|(She wants to keep her gag...)",
        "(You rescue the SPEAKER)|Mmmmph!|(${EThey} want${Es} to keep ${Etheir} gag...)"
    ],
    [
        "(You cut her restraints, fumbling around for a while with your bound hands)",
        "(You cut ${Etheir} restraints, fumbling around for a while with your bound hands)"
    ],
    [
        "(After a while, you free the SPEAKER)|Mmmmph!|(She shakes her head when you go for her gag...)",
        "(After a while, you free the SPEAKER)|Mmmmph!|(${EThey} shakes ${Etheir} head when you go for ${Etheir} gag...)"
    ],
    [
        "(You utter a word of release to free the SPEAKER)|Mmmmph!|(She locks her gag back on...)",
        "(You utter a word of release to free the SPEAKER)|Mmmmph!|(${EThey} locks ${Etheir} gag back on...)"
    ],
    [
        "Cut her out with a sharp tool",
        "Cut ${Ethem} out with a sharp tool"
    ],
    [
        "Use Remove Slime to unlock her",
        "Use Remove Slime to unlock ${Ethem}"
    ],
    [
        "(The SPEAKER folds her hands together)|Miss, I was instructed to make sure you don't have|anything dangerous. I'm going to search you now.",
        "(The SPEAKER folds ${Etheir} hands together)|${PHonor}, I was instructed to make sure you don't have|anything dangerous. I'm going to search you now."
    ],
    [
        "Yes, Miss... (Begin search and confiscation)",
        "Yes, ${EHonor}... (Begin search and confiscation)"
    ],
    [
        "(The search is complete)|Alright Miss, please behave, okay?",
        "(The search is complete)|Alright ${PHonor}, please behave, okay?"
    ],
    [
        "(The SPEAKER scans you with a handheld device)|Miss, I was instructed to make sure you don't have|anything dangerous. I'm going to search you now.",
        "(The SPEAKER scans you with a handheld device)|${PHonor}, I was instructed to make sure you don't have|anything dangerous. I'm going to search you now."
    ],
    [
        "Yes, Miss... (Begin search and confiscation)",
        "Yes, ${EHonor}... (Begin search and confiscation)"
    ],
    [
        "(The search is complete)|Alright Miss, please behave, okay?",
        "(The search is complete)|Alright ${PHonor}, please behave, okay?"
    ],
    [
        "You defeat the Maid Knight! For now... she swears revenge.",
        "You defeat the Maid Knight! For now... ${Ethey} swear${Es} revenge."
    ],
    [
        "The Squire dusts you with her duster plug.",
        "The Squire dusts you with ${Etheir} duster plug."
    ],
    [
        "The Maid Knight sweeps you with her cleaning halberd!",
        "The Maid Knight sweeps you with ${Etheir} cleaning halberd!"
    ],
    [
        "(SPEAKER smiles as she unlocks your restraints with her key)|I hope you had a great time in them~",
        "(SPEAKER smiles as ${Ethey} unlock${Es} your restraints with ${Etheir} key)|I hope you had a great time in them~"
    ],
    [
        "${Playername} used her safeword and was transported to the beginning of the level.",
        "${Playername} used ${Etheir} safeword and was transported to the beginning of the level."
    ],
    [
        "You feel like You are nothing but a doll... ",
        "${You} feel like ${You} ${Yis} nothing but a doll... "
    ],
    [
        "You've fallen into a trance, making suggestions more powerful.",
        "${Youve} fallen into a trance, making suggestions more powerful."
    ],
    [
        "You are silenced, unable to cast spells easily.",
        "${You} ${Yis} silenced, unable to cast spells easily."
    ],
    [
        "(Squeak when she says 'materials')",
        "(Squeak when ${Ethey} say${Es} 'materials')"
    ],
    [
        "(Shake your head angrily as she caresss caress you)",
        "(Shake your head angrily as ${Ethey} caress${Es} caress you)"
    ],
    [
        "(The SPEAKER pulls back her hand...\\nand smacks you across the face)\\nA good girl shouldn't resist her maker's touch.\\nDon't worry, you'll soon learn what perfect stillness is like...",
        "(The SPEAKER pulls back ${Etheir} hand...\\nand smacks you across the face)\\nA good ${Psub} shouldn't resist ${Ptheir} maker's touch.\\nDon't worry, you'll soon learn what perfect stillness is like..."
    ],
    [
        "(The SPEAKER pulls back her hand and merely smiles)\\nA good girl shouldn't resist her maker's touch.\\nDon't worry, you'll soon learn what perfect stillness is like...",
        "(The SPEAKER pulls back ${Etheir} hand and merely smiles)\\nA good ${Psub} shouldn't resist ${Ptheir} maker's touch.\\nDon't worry, you'll soon learn what perfect stillness is like..."
    ],
    [
        "(The SPEAKER lets a sadistic smile slip across her face)\\nDon't worry, you'll be a happy little doll soon.\\nVery soon...",
        "(The SPEAKER lets a sadistic smile slip across ${Etheir} face)\\nDon't worry, you'll be a happy little doll soon.\\nVery soon..."
    ],
    [
        "(The SPEAKER furrows her brow)\\nHmmm?",
        "(The SPEAKER furrows ${Etheir} brow)\\nHmmm?"
    ],
    [
        "My arms, Miss.",
        "My arms, ${Ehonor}."
    ],
    [
        "What happens to my face, Miss?",
        "What happens to my face, ${Ehonor}?"
    ],
    [
        "Why not all at once, Miss?",
        "Why not all at once, ${Ehonor}?"
    ],
    [
        "(Remain silent and let her do as she pleases)",
        "(Remain silent and let ${Ethem} do as ${Ethey} please${Es})"
    ]
]



default_origin_csv_path = 'Screens/MiniGame/KinkyDungeon/Text_KinkyDungeon.csv'

IGNORE_KEYS = [
    "RestartNeededEN", "RestartNeededCN", "RestartNeededKR", "RestartNeededJP", "RestartNeededES", "RestartNeededFR", "RestartNeededRU",
    "KDVersionStr"
]

# Read the CSV file
def parse_csv_lines(file_path) -> list:
    with open(file_path, newline='', encoding='utf-8') as csvfile:
        lines = [line.lstrip().rstrip("\n") for line in f.readlines()]
        return lines

for trans_file in translation_files:
    origlines = parse_csv_lines(trans_file)
    newlines = [];
    for line in origlines:
        newline = line
        for replaceline in replaceMap:
            if (line == replaceline[0])
                newline = replaceline[1]
        
        newlines.append(newline)
    with open(output_path, 'w', encoding='utf-8') as f:
        for line in new_content:
            f.write(line + '\n')
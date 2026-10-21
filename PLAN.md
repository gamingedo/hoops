# PLAN.md — DocMan2021 HOOPS: build plan for the chain era

This is the executing plan. It is written so a model can implement it without re-deriving design.
Design authority: `WRITING.md` (prose rules), the Story Bible (Claude Docs), and the decisions recorded here.
When this plan and old code disagree, this plan wins. When this plan is silent, keep the existing behavior.

## 0. How the codebase is put together

- Single page. `franchise.html` is the source of the main page. Modules are spliced into it between `/*RPG_BEGIN*/` and `/*RPG_END*/` by `ins.py`:
  `mods=['career.js','rpg.js','attn.js','fate.js','show.js','poss.js','story.js','bonds.js','sys.js','sfx.js','jobs.js'] + argv` and the build command is
  `python3 ins.py rpgui.js shell.js hub.js && python3 make_main.py` → writes `hoops-lab.html`.
  **Never edit the spliced block in `franchise.html` directly; edit the module file.** Code outside the block (the engine, the viewer, the franchise world) lives only in `franchise.html`.
- The spliced block is one lexical scope. Functions defined in modules are visible to each other, and to code outside the block only if assigned to `window` (see `window.__sys`, `window.enMax`). Engine code outside the block that needs a module function must reference a `window.*` export or a function declared outside the block.
- PWA: `python3 make_pwa.py` → `pwa/` (precache from `ship_assets.json`); `cp -r pwa/. hoops/` then commit and push in `hoops/` (GitHub Pages, gamingedo.github.io/hoops). Artifact: publish `hoops-lab.html` to the existing URL. Bump `const BUILD="vNN"` in `franchise.html` each release.
- Syntax check: `node -e` over every `<script>` in `hoops-lab.html` with `new Function`.
- Tests (Playwright, python) live in the scratchpad `t/` folder; `col.py` is the full regression (creation → prologue → college → draft → NBA → epilogue). `srv.py` serves `/home/claude` on :8766 and must be running (`nohup python3 srv.py &`). Tests pick stars with `[data-act="rstars"][data-v="5"|"1"]`.
- Save: `C` (career object, persisted by `saveC()`); `G` (the league object for the pro stage). `C.stage` is `"create" | "prologue" | "offers" | "college" | "done"`. The pro stage runs on `G.career` with `C` still present for story systems.
- Key engine entry points (franchise.html): `liveGen(SD,opt,ctl)` at ~4625 is the possession generator (one `yield` per decision), `play` (~4660) is one possession, `finish` (~4720) resolves a shot. `liveCore` runs a game headless. `clSide`/`nbaSD` build the two sides. `openLive`/`lvPull`/`lvFrame` are the viewer; `openPoss`/`possPick`/`possResolve` (poss.js) are the decision card UI. `clDay` and `simDay` are the college and pro day loops.
- Story: `story.js` holds every line of prose as `ST.*` functions returning arrays (plain = spine; `NAME: text` = labeled dialogue; `*text` = muted aside; `~text` = the System, gold). `archP()` in attn.js renders. `archSay(txt,title,{quiet,sys})` queues a card; `lifeRoll({title,txt,mods,dc,resolve,onSkip,opts})` queues a d20 card or a choice card. `C.sys.off` (the blind season) suppresses non-`sys` cards and hides modifiers.

## 1. Locked design decisions (do not reopen)

- **This is a pure basketball RPG. No story.** The prologue, bonds, the Fate deck, life events, the System arc and the epilogue were cut on 2026-10-20 (originals kept in the scratchpad `cut/` folder, not in the build). The only prose left is the System's voice: one or two dry lines on level-ups, job advancements, loot drops and sponsor offers, in the register of item descriptions. Never add narrative scenes, characters or dialogue.
- The loop is the MMO loop: get stronger, dominate, chase rare loot, climb a visible ladder. Every system serves that loop or goes.
- Two roads: five-star (500 SP, blue-blood offers) and one-star (1 SP, one junior college, +35% EXP).
- Classes: **Scorer, Playmaker, Defense** at Lv 10. Specialization at Lv 20. Perk picks at 30/40/50/60 from the specialization's pool. Master at 45 (+50% edges), Legend at 65 (+0.5 on everything, one extra active use per game).
- Position never limits the build. Height and ratings decide blocks and boards on every roll.
- Energy replaces legs: pool from Stamina (`enMax = 40 + STA*0.8`), drains on the floor (`1.7 − (STA−65)/80` per minute), refills on the bench, spent by moves and gambles, shown on the card and the Bench tab. Coach pulls anyone whose fatigue is above 0.55 outside crunch time.
- Every possession of your team is yours to run (always-on off-ball). Defense is lighter: your matchup, the last two minutes, opponent runs of 8-0 or more.
- Dice: d20 + named modifiers vs DC, all printed. Natural 20 succeeds, natural 1 fails. Timing tap optional, off by default.
- Shooting skills have diminishing returns above 80 (`drK` in poss.js). League calibration after that change: college FG 44.0 / 3P 35.4, NBA FG 46.6 / 3P 36.5 (`PV.dcAdj` −0.2 college, −0.1 pro).
- Your player's simmed possessions walk the same chain with the auto policy (`liveCore` creates a ctl with `mode:"sim"`, `greed:1`), so played and simmed lines come from one engine.
- Items are edges on specific moves. Loot boxes only at advancements and as boss/encounter drops. The shop spends NIL money; stock rotates per season; nothing is shop-only.
- Cut and never to return: traits, daily EXP events (replaced by a flat ×1.6 game EXP), loadouts, archetype names on the HUD, the hallway map, the hoop prop, recruiting UI, franchise/GM screens in the pro stage, the Architect, Codex, star tiers 2–4.


### 1a. The loop (decided 2026-10-20, supersedes anything career-shaped below)

- **A basketball MMO/gacha for one player.** No story. The System speaks only on level-ups, loot and offers, one dry voice, one or two sentences.
- **College is the tutorial season, and you are a god in it.** One season for everyone. 1★ goes to a low-major Division I program (junior colleges are out of the start); the college opponent baseline is lowered (PV.ref 62 in college) so every star level dominates. The longer road is lower-ranked schools, fewer boss games, smaller drops and a lower grade ceiling unless you overperform; it is never a punishment season. It teaches the chain, off-ball, defense cards, energy, practice and the class pick at Lv 10. It ends with a **grade** (S/A/B/C/D) from efficiency, wins, awards and challenges.
- **College-only perks:** equippable badges earned only in college ("Freshman of the Year", "Conference Player of the Year", "Final Four", "National Champion", "Buzzer Beater", "Giant Killer", "Triple-Double", "Forty Burger"). Each is a small named edge. **Three perk slots in college, five in the NBA.**
- **The draft and the forced respec.** The grade decides options: S = choice of three teams including a contender + legendary starter box; A = three teams, epic; B = two teams, rare; C = one team (second round), uncommon; D = undrafted → sign a minimum deal with any team of your choice, bench role, common box (the price is the role and the money; the freedom is the pick). **Everyone is set to Lv 20 at the draft; if you passed 20 in college you keep your level.** **NBA floor is 65 for every skill regardless of stars** and points reset to **500 plus the skill points your levels paid out in college**; you rebuild knowing the game. Stars stop mattering at the draft except through what they already paid out. Perks, items, money, class and specialization carry.
- **The NBA season is the raid.** Regular season = the dungeon (EXP, money, common–rare drops, a named boss matchup per game with a drop table); record sets the seed. **Playoffs = a gauntlet of real champions** (9 Innings model): the league is generated players, but each playoff round is a real historical team from the game's NBA.com-derived data (e.g. R1 2004 Pistons, R2 2014 Spurs, Conf Finals 2016 Cavaliers, Finals 1996 Bulls / 2017 Warriors / 2024 Nuggets). The gauntlet rotates every season. Each round won drops a box one rarity higher (rare, epic, epic, legendary). **The Finals = the raid boss:** a guaranteed legendary from the season's new tier, the biggest payout of the year, and a **championship ring** (unique per season, equippable, own edge; the ring shelf is the trophy case).
- **NBA-only perks:** "All-Star", "All-NBA", "Fifty Piece", "Game 7", "Closer", "Ring". Same slot system.
- **No difficulty setting.** One mode. Difficulty ramps in the playoffs: each round's bosses are better and their DCs climb +1 per round, printed.
- **Seasons are content patches:** level cap 70 in Season 1 (+10 a season after), PV.ref +3, stat ceiling +3, a new loot tier, partial ladder reset, the gauntlet rotates. No aging, no retirement. Contracts and free agency stay, constrained against jank: offseason only, each CPU team makes at most three signings, no mid-season roster shuffles, you always see every offer before choosing; the draft brings a stronger generated class each season; one trade request per season. **Your team is your party**; money buys the shop and the party.
- **Hall of Fame board (NBA only).** Every league player, CPU included, earns points: ring 10, MVP 12, Finals MVP 8, All-NBA 6/4/3, DPOY 5, All-Star 2, statistical titles 3 each. **No Rookie of the Year.** Seeded with the real greats at their real totals. Two views: this season, all time. **Titles are held, not kept**, and a CPU holder uses the perk against you:
  - **#1 The GOAT:** once a quarter, declare any roll a natural 20; natural 1s are rerolled; +1 on every roll all game.
  - **#2–5 Pantheon:** +1 on every roll in the fourth quarter and overtime, plus one declared 20 a game.
  - **#6–10 Legend:** moves cost 20% less energy.

### 1b. Creation and growth (decided 2026-10-20)

- **Everyone starts with 300 SP.**
- **Stars set the college floor of every skill and the growth rate:** 5★ 70, 4★ 65, 3★ 60, 2★ 55, 1★ 50 (against a college PV.ref of 62); growth bonus to each level's SP grant: 5★ +0%, 4★ +10%, 3★ +20%, 2★ +30%, 1★ +40%; EXP bonus 0/0/+5%/+10%/+20%. College offers by stars (blue bloods → junior college).
- **Height and wingspan are sliders.** Wingspan above height → printed edges on contests, steals, blocks, rebounds ("Length"); below height → edges on jumpers, handle, step-back ("Quick release"). Height already feeds blocks, boards and finishing; keep it.
- **Cost per skill point, by distance above PV.ref:** below average 2; average to +10: 4; +10 to +20: 7; +20 to +30: 11; top band (last 4 to the ceiling): 16.
- **Level curve for one season:** a player who plays his games and practices reaches ~70 by the Finals; a player who sims everything lands ~50–55. Compute needXP and the SP-per-level table in code so that Lv 70 affords max-all from a 3★ floor; verify with `__chainBot` and a full-season sim before anything else in M2.5.
- **Origins** = starting shape + one perk at Lv 5 from a two-option pool. No biographies.
- **EXP outside games:** two practice slots per game week (a drill = 3–4 roll chain), the gym scoreboard starts a drill, challenges (one-time feats, replace goals), offseason camps (skippable), boss bonus EXP, rested EXP. No timers, no streaks.

## 2. The chain: state machine spec

Replaces the current one-shot card in `play` for the user's team possessions. The CPU plays the same grammar with a tendency profile (section 2.6), so simmed and played stats come from one engine.

### 2.1 Possession state
```
P = { sit, clk, moves:[], energy(me), mom(team), seen:{moveKey:count}, flags:{offBalance, space, beat, collapsed, mismatch, seal, runout} }
```
`sit ∈ {top, space, offbal, beat, collapse, lane, mismatch, seal, picked, corner, wing, runout}`.
Start: `top` (or `runout` after a steal/block link, or `corner`/`wing` after an off-ball move placed you there).

### 2.2 Costs
- Each move spends `sec` of shot clock and `en` energy from the acting player. Energy modifiers: `en < 0.4*max → −1`, `< 0.2*max → −2` ("Low energy"). Clock ≤ 4s: only finishes offered.
- Max 5 moves per possession; after that only finishes.
- Scouting: same setup move key three times in a row → "They have seen it" −1, four → −2. Any different move resets.
- Momentum: team value −5..5. `|mom| ≥ 3` → ±1 on every roll both teams (sign favors the team with momentum). Made shot +1, dunk/lob +2 (+3 at home), opponent score −1, timeout resets toward 0 by 3. Printed as a modifier.

### 2.3 Setup moves (roll → transition)
| key | from | roll (attacker vs defender) | DC base | success → | fail → | nat1 | sec | en |
|---|---|---|---|---|---|---|---|---|
| cross | top,wing | HND vs PER | 12 | space | picked | stripped (TO) | 2 | 2 |
| hesi | top,wing,space | HND+SIQ/2 vs PER | 12 | offbal | top (no change) | — | 2 | 1 |
| jab | top,wing | SIQ vs PER | 11 | space(small: +0.5 only) | top | — | 1 | 0 |
| pump | top,wing,corner,space | SIQ vs defender discipline (PER) | 12 | offbal (he is in the air) | top | — | 1 | 0 |
| drive | top,wing,space(+1),offbal(+2) | HND+ACC vs PER | 12 | beat | picked | stripped (TO) | 3 | 3 |
| screen | top,wing | big's STR vs their scheme | 11 | **their roll**: switch→mismatch, hedge→space, drop→top with pull-up +1 | picked | — | 3 | 1 |
| handoff | top | PAS vs PER | 10 | space | top | — | 2 | 1 |
| post | top,wing,mismatch(+2) | PST+STR vs INT+STR | 12 | seal | picked | travel (TO) | 4 | 3 |
| spin | seal | PST+ACC vs INT | 13 | lane | picked | — | 2 | 2 |
| dropstep | seal | STR vs STR | 12 | lane (at rim) | hook at −1 (finish) | — | 2 | 2 |
| stepthrough | picked | SIQ+STR vs INT | 13 | space (under basket) | travel (TO) | 2 | 1 |
| euro | beat | ACC+HND vs help INT | 13 | lane (past help) | charge (TO) | charge | 2 | 2 |
| reset | picked | none | — | top | — | — | 6 | 1 |

Defense reaction after `beat` (automatic, shown as their roll): `d20 + (helpINT−65)/10 vs DC = 13 if shooters' THR avg ≥ 68 else 9` → collapse / lane.

Modifier naming (printed): "Handle", "Acceleration", "Shot IQ", "Post moves", "Strength", "Open look", "Contested", "Low energy", "Momentum", "They have seen it", "Home crowd", plus perk, item and job names.

### 2.4 Finishes
| key | from | type | notes |
|---|---|---|---|
| three / mid | top, wing, space(open), picked(−2 "Dribble picked up") | shot | contest from PER |
| stepback / stepback3 | space, lane, collapse (perk) | shot +1.5 "Step-back" | defender behind |
| layup | lane(open), beat(contested), collapse(through help: vs help INT/BLK) | rim | |
| floater | collapse | mid +1 DC "Floater" | |
| dunk | lane only | dunk DC +3 vs layup; momentum +2/+3 home; opponent next shot DC +1 | announcer line, crowd |
| hook | seal | post | |
| lob | collapse (perk) | pass roll then big's dunk | momentum like a dunk |
| kick | any | pass roll (PAS, VIS vs best defender STL) then teammate shot; **card shows the two together** (pass% × shot%) | open from collapse/seal double |
| skip | collapse | corner shooter: pass DC +1, shot open +1 | |
| dumpoff | collapse | big under rim: layup odds | |
| drawfoul | offbal | contact: FTs, no FGA | |

Shot DC/mods: reuse `shotDC`/`shotMods` (poss.js). Add ctx flags: `floater`, `stepback`, `help`, `forced`, `dunkChain`.

### 2.5 Off-ball (your team has it, ball elsewhere) — one roll, one tap
| key | roll | success | fail |
|---|---|---|---|
| callfor | usage vs PG VIS, DC 11 | ball at top | possession runs without you (CPU resolves) |
| setscreen | STR, DC 11 | teammate shot +1 "Screen"; you roll to rim (dumpoff available if they drive) | nothing |
| cut | ACC vs defender awareness (PER), DC 12 | lane with pass incoming (layup/dunk) | nothing |
| spotup | none | corner/wing; catch-and-shoot +1 if the pass comes (CPU passes with prob by your THR) | — |
| crash | STR+ORB, DC 12 | offensive rebound chance ×1.6 on a miss; en 2 | — |

### 2.6 CPU tendency profile
Every player gets `tend` from ratings: `{setup: {cross,hesi,drive,post,screen,...weights}, finish:{three,mid,rim,dunk,post}, greed: 0..1}`. The CPU walks the same machine: picks a setup by weight, stops when a finish's p ≥ threshold (greed lowers the threshold). Calibrate with `window.__cal` so league FG% stays 45–47 (college) / 46–48 (pro). A greedy human bot (always best odds) must land within +5 FG% of the CPU average.

### 2.7 Defense (their possession)
Keep `defOptions` (hands, steal, block, charge). Fire when: my matchup has the ball, or clutch (last 2:00, within 6), or opponent run ≥ 8–0. Links: my steal → next possession starts in `runout` (lane, dunk DC −2); my block with Defense perk → runout.

### 2.8 Card UI contract (poss.js)
`LV.wait = {opts, sit, title, sub, dname, dnote, chain:[...], energy:{e,m}, mom}`. `opts[i] = {k, lab, note, mods:[[name,val]], mod, dc, p, kind:'setup'|'finish'|'offball'|'react', perk?:name, job?:activeKey}`. The card must fit a phone without scrolling: situation line, ≤4 options, odds right-aligned. `possResolve` returns `{k, made, nat20, nat1, roll, opt}` via `LV.arg`; the generator consumes it and yields the next card or ends the possession.

## 3. Classes, specializations, perks (data)

Replace `JOBS` in `jobs.js` with:
```
CLASSES = {
 scorer:{n:"Scorer", specs:{inside,mid,outside,post,offball}},
 playmaker:{n:"Playmaker", specs:{floor,combo,pnr,transition}},
 defense:{n:"Defense", specs:{stopper,rim,hawk,glue}}}
```
Each spec: `{n, d, pool:[perk×5]}`. Perk: `{k, n, kind:'move'|'edge'|'rule'|'link', text, apply}` where `apply` is data the engine reads:
- move: `{adds:moveKey, from:[sits], once:'quarter'|'game'|null}`
- edge: `{on:[moveKeys|shotTypes|'pass'|'steal'...], val}`
- rule: `{rule:ruleKey, val}` (rule keys: spaceLasts, seenHalved3, noCallFor, resetCost3, teamOpenPlus1, screenSwitchMore, driveMinus1Opp, noBite, zeroDefEnergy, seeCoverage, pushAfterReb, momentumTeamPlus, timeoutFullReset, heatCheck, gravity, contactFouls, …)
- link: `{from:'steal'|'block'|'oreb'|'ownmiss'|'teamSteal', to:'runout'|'lane'|'putback'}`

Perk text is the table in the chat transcript of 2026-10-20 ("SCORER / Inside …" through "DEFENSE / Glue"); copy it verbatim into `story.js` as `ST.perks` (the "What it does" column is the player-facing text; apply WRITING.md: no contractions).

Advancement scenes (System texts) exist for Lv 10/20 and the flat upgrades; add Lv 5 origin perk (`ST.origPerk`) and Lv 30/40/50/60 picks (`ST.perkPick(lv)`): short, gold, the System's voice. Origin pools: blacktop→[footwork, downhill], scholar→[screenreader, discipline], legacy→[captain, heatcheck], bloom→[secondjump, tireless], import→[vision, fadeaway], comeback→[contact, earlyoffense], custom→[any one of the above, player's choice of three random].

`jobMods(kind)` → returns the edges for a roll kind; `jobActives(side, sit)` → moves available in this situation; `jobRule(key)` → value or null; `jobLinks(event)` → target situation or null. Jobs state: `C.job = {cls, spec, perks:[k], m3, m4, used:{}, offered:{5,10,20,30,40,50,60}}`.

Save migration: on load, if `C.job.path` exists (old 5-path), map scorer→scorer, playmaker→playmaker, wing→defense/stopper, big→scorer/post, glue→defense/glue; if the player is ≥ Lv 10 with no class, queue the Lv 10 scene once ("Level ten was a while ago. Pick.").

## 4. Gear (locked 2026-10-20, replaces the Locker)

Summoners War runes, mapped onto body parts. `gear.js` owns all of it; the old Locker (charm slot, 25 story items, crate keys, pity on crates) is deleted.

- **Six slots.** Fixed main edge: feet = Acceleration (drive, cut, euro, spin, run-outs), hands = Handle (cross, hesi, handoff, step, steal), head = Shot IQ (jab, pump, charge, rotate, lane, callfor). Variable main edge rolled on drop: arm = Three | Mid | Passing | Block; legs = Energy (max energy) | Vertical (dunk, block, crash) | Strength (post, dropstep, screen, drawfoul) | Rebounding (crash, putback); jersey = Clutch (every roll in the last two minutes) | Draw fouls (drawfoul, and-one chance) | Perimeter D (hands, steal, rotate) | Interior D (block, charge, layhelp defense).
- **Grade 1★–6★** sets edge size: main = 0.5 × grade; substat base 0.5. **Rarity** sets substat count: common 1, uncommon 2, rare 3, epic 4, legendary 4 + the set's 4-piece rule carried alone. Substats draw from the move list (no duplicates on one piece, never the main).
- **Sets** named for sponsors; a piece's name is set + slot noun. 2-piece / 4-piece: Apex (+0.5 dunk / a made dunk swings momentum one more), CRISPY (+0.5 contests / your man shoots at −1 all game), Kinetic (+0.5 clutch / natural 1s rerolled in the last two minutes), TruForm (energy drain −10% / defensive cards cost no energy), Harbor (+0.5 passes / teammates +1 off your passes), Summit (+1 in playoff and tournament games / +2), Vantage (legendary only: +1 everything / natural 1s never happen).
- **Drops** after every game, played or simmed: 70% a piece. Rarity roll common .55 uncommon .28 rare .12 epic .05, legendary only from the Finals in Season 1. Pity shown on the Locker: common within 4, rare within 12, epic within 40. Boss games (ranked opponent in college, conference and NCAA tournament, NBA playoffs) roll one rarity up; the Finals is a guaranteed legendary. Advancements (Lv 5/10/20/30/40/50/60) give a box one rarity above the drop. Grade: college 1–3★, NBA 2–4★, playoffs +1, Finals 5★; each season +1 cap.
- **Perk shards:** 20% of advancement boxes drop a shard of a perk you own → rank up (max 3). Rank effects in v49 are numeric (edge +0.5 per rank; move perks: rank 2 a second use, rank 3 +1); bespoke rank effects wait for the perk-name review.
- **Money (NIL) has one job.** In: sponsor deals pay weekly (tier 0 2k, tier 1 5k, tier 2 12k), program stipend weekly (college prestige × 40; NBA 0.07% of salary), playoff round bonuses, salvage (30% of spend + 300 × grade). Out: **power up** +1…+12 (cost = base[grade] × (1 + 0.35 × rank), base 400/900/2k/4.5k/10k/22k; at +3/+6/+9/+12 one random substat +0.5 or a new substat if open; never fails), **reappraise** (reroll one substat's stat, cost = last power-up), **merge** (five of one grade → one of the next, fee = base[grade]). No shop.
- **Sponsors** are set-makers only: a running deal makes its set drop twice as often. No people, no clauses with stories, no reputation, no swagger, no social post. Attention still gates tiers and slots.
- **Bag:** the Locker opens in the sheet (scrolls on phone), filters by slot and "fits my class", sorts by grade; a piece is never in both bag and a slot.

## 5. The season, the raids, the UI, the hooks (locked 2026-10-20, replaces the ladder section)

**Shorter seasons.** College: 12 games, then the conference tournament is cut; the NCAA tournament is the raid (six rounds, single elimination, seed from the 12 games). NBA: 16 games, playoffs best of five, four rounds. Seed decides the road: 1 plays 8 with home court, 8 plays 1 on the road. The Finals opponent is the historical champion from the rotation (the raid boss). No transfer portal, no second college year; the stay/transfer screens are deleted.

**The raid ramps by taking crutches, not by adding DC.** Each round is printed on the pre-game card.
- Round 1: a normal opponent. Good gear dog-walks them; that is the payoff.
- Round 2: they scheme. Their best defender on you every trip (printed ▼ Their best defender).
- Round 3: scouting report. Your most-used setup move starts the game as "They have seen it."
- Round 4: their star carries a class and two perks that fire against you, printed on the defense card.
- The title game / Finals: the boss. Full strength, a held title perk (once a quarter one of their shots is PERFECT), and the last two minutes of every quarter play as late game.
College uses the same five shapes over six rounds (rounds 1–2 normal, 3 scheme, 4 scouting, 5 perks, 6 boss).

**Dice stay under the hood. The card shows odds, payoff and words.**
- Option: label · percent · points. No DC, no modifier sums, no d20.
- Under it, chips, one per factor, each a plain noun and a signed percentage of odds: ▲ Handle +5% · ▲ Momentum +3% · ▼ Their best defender −8% · ▼ Tired −5%. A d20 point is 5% of odds, so +0.5 prints as +3% (rounded), +1 as +5%, +1.5 as +8%, +2 as +10%. The chips sum to the option's percent. Blue up, orange down.
- The roll is a meter that lands MADE or MISSED with the one reason that mattered. Natural 20 = PERFECT (longer beat, sound). Natural 1 = SLIP. "Just short" when a miss is within 1; "Clean" when a make clears by 5+.
- Every edge everywhere (perks, gear, origins, body, sets) is printed the same way: the move or moves it touches and a signed percentage. "Downhill: drives +8%." "Harbor Sleeve: Three +10% · Crossover +3%." No tier words. Raw d20 modifiers appear only behind the "Show the math" setting (off by default).
- Words are used only for outcomes: MADE, MISSED, PERFECT (a natural 20: it goes in regardless), SLIP (a natural 1: it goes wrong regardless), "Just short" (missed by one point), "Clean" (cleared by five or more).
- Settings shrink to: card mode, speed, sound, show the math. Karmic dice stays on, timing tap is removed, off-ball rule stays automatic.
- The GOAT title reads "once a quarter, a shot you pick is PERFECT."

**UI cut.** One bottom bar: Play · Locker · Character · Season. Season holds Team, Schedule, Top 25/Standings, Bracket, News, Clips, Trophies. Character holds Stat, Skills, Class, Deals. The gym stays as the home screen; nothing requires walking (one tap opens everything; the sprite is decoration). Attention is hidden; the Deals tab shows deals. Goals/quest helper removed (level boxes and drops are the reward track). Practice becomes the weekly free reappraisal (one substat reroll per game week) or is cut if that is not ready.

**Hooks (in build order).**
1. The reveal: every drop and box opens as a card: rarity color, stars tick in, main stat, substats one by one; epic and legendary take longer and have a sound.
2. Pity on the Play button: "Rare in 3" next to "Play next game."
3. The pre-game card: opponent, their best player, the round's scheme, the drop tier; boss games framed gold.
4. The post-game ladder: EXP bar filling, money counting, the drop reveal, pity, next opponent, as one animated sequence.
5. Build goal: pick a target set + main stat + grade on the Locker; the game tracks progress and lights up drops that advance it.
6. Milestone titles: cumulative, never reset (100 threes, 50 dunks, 10 game-winners, a 40-piece, a ring…); each pays a box and a wearable title under your name.
7. Vantage meter: every salvage fills a hidden bar; full = one guaranteed epic in a slot you choose.
8. Season patch notes from the System at rollover (cap +10, new grade, the next boss, new sets).
9. Boss records: your fastest win, biggest margin, best line per boss, shown on the bracket.
Never: logins, timers, energy gates, extra currencies, passes.

## 6. Milestones and acceptance

**M1 — cleanup (shipped v45).** **M2 — the chain (shipped v46)**, plus the story cut.

**M2.5 — creation and growth (shipped v47).** Ship notes:
- Grants: star growth bonus applies to college levels (2–20) only; pro levels grant the same to every tier. GR_K is solved so 500 + grants(2..70) for a 3★ = 24 × cost(65→99 at ref 65) = 6,816. `__growth.check()` ratio 1.0000.
- EXP (measured, one season each, 3★): college played+practice → Lv 21, college sim → Lv 14–15 (draft lifts anyone below 20 to 20, crediting the skipped grants). NBA played+practice → Lv 70 near the Finals; NBA sim → Lv 54. Constants: XP_COL .85, XP_NBA 13.3, XP_PLAYED 2.0; goals pay a flat 25% of a level; level goals capped at 70.
- Body and origin edges are live on every chain option (setup, finish, pass, off-ball, help, defense). Lv 5 origin perk choice fires once.
- Practice: 2 drills per game week, DC 10/12/14, 3 rolls; HUD button (E) in college, rpgbar button in the NBA.
- Clock: college chain budget is the full 30; last two minutes of the final period/OT: trailing → budget 12 and "Hurry", leading → "Milk the clock" (no roll, burns ~12 game seconds, fewer moves), defense trailing → "Foul to stop the clock". NBA chain cap is 4 moves; NBA off-ball cards only when it matters (late and close, a run, momentum ±3) unless the player sets "Every trip".
- Deferred to M5: the league restat (the engine is ref-relative, so it waits for the draft respec), forced respec at the draft. Undrafted 1★ barely plays in the NBA (M5 free agency).
- 1★ now recruits from the bottom 40 programs by prestige; JUCO start removed.

**M2.5 original spec:** §1b, the college baseline (PV.ref 62, no junior-college start), and a one-pass league restat to the new floor/ceiling scale. 300 SP for all, star floors and growth, the new cost curve relative to PV.ref, SP-per-level table computed from the cap, origins rewritten (Legacy: Name on the Back = start at 20 Attention, opponent's best defender guards you from game one, printed −1; Lv 5 pool Heat check / Captain; others likewise). Practice slots and the gym drill. Tests: a 3★ who spends every point reaches max-all at Lv 75 within 2%; creation screen shows floors; drills run as chains.

**M3 — classes and perks (shipped v48).** Ship notes:
- The verbatim perk table from the 2026-10-20 chat was lost in a context reset. The 65 perks were rebuilt from §3's spec names and rule keys; names and text live in `story.js` as `ST.perks`. The user reviews them in play.
- Class (Lv 10): edge +0.5 on its domain and one move (Scorer: Step-back; Playmaker: lob from the help; Defense: Lock him up). Spec (Lv 20): +1 on its domain. Picks at 30/40/50/60 from the spec's five. Master 45: edges x1.5. Legend 65: +0.5 on everything, every move twice.
- Slots: three in college, five in the NBA; the origin perk takes one. Extra perks can be equipped and unequipped from the Class panel on the Stat tab.
- Rules implemented: spaceLasts, seenHalved3, noCallFor, resetCost3, teamOpenPlus1, screenSwitchMore, seeCoverage, timeoutFullReset, heatCheck, gravity, contactFouls, pushAfterReb (10%), momentumTeamPlus, noBite, zeroDefEnergy, shadow, noBlockFoul, teamDefPlus. Links: block→runout, teamSteal→runout (50%), oreb→putback.
- Balance (college bot, 15 games, three picks each): no class 31–33 ppg; specs 26–44 ppg. Transition was 52 ppg until the run-out links were cut.
- Save migration from the old five jobs, including old specialization names.
- Origin pools stay as shipped in v47 (growth.js OPERKS), not the §3 list.

**M3 original spec:** §3. **M4 — gear (shipped v49).** Ship notes:
- `gear.js` is the whole system; the old Locker, crate keys, the charm slot and the 25 story items are gone. Old saves: each old item became $2,000 NIL money; old "Sent home" cash moved into NIL.
- Gear edges flow through `myEdges` like body, origin and class edges; set 4-piece rules share `jobRule` keys (shadow, teamOpenPlus1, zeroDefEnergy) plus dunkMomPlus, clutchReroll1, noNat1, bossPlus1. Energy main adds 4 max energy per point; TruForm 2-piece slows the hero's drain; Draw fouls raises the hero's foul chance.
- Boss games: college tournament phases and ranked opponents (drop rarity +1); `opt.boss` feeds Summit. NBA playoff series wins pay $15k/$30k/$60k/$150k; the Finals pays a legendary to the champion and an epic-or-better to the loser.
- Advancement boxes at Lv 5/10/20/30/40/50/60; 20% become a perk shard (rank 1–3: +0.5 per rank on edges; rank 2 a second move use; rank 3 +1 on the move).
- Sponsors are 13 set-maker deals, no people. A running deal makes its set twice as likely. Weekly pay plus the program stipend (prestige × 40 in college, 0.07% of salary in the NBA).
- The hub shop map is now the equipment room: the counter and shelf open the Locker.
- Cut with it: daily events, rested EXP, traits (creation step and sheet row), crate keys in goals and games, social posts, reputation, swagger, bonds/rival/fate hooks in the engine, the hallway map, the Coach and rival lines on the offers and decide screens.
- Tuning to watch: a full epic kit in college pushed the test bot to 52–57 ppg (normal 33). College is god mode on purpose; check the NBA with natural drops before the league scaling in M5.
- Still in the code but unreachable: the prologue render functions in career.js and the legacy-generation path (needs retirement, which M5 removes).

**M4 original:** §4, plus playoff wing boxes and the ring.

**M5 — the season loop (shipped v50).** Ship notes:
- College: 12 games (4 non-conference, 8 conference), no conference tournament; the field is the top 64 and your team is always in it (last spot if needed). One season only: the decide screen shows the draft grade and one button. Grade = production ×1.1 + win% ×20 + tournament depth (1/4/8/12/18/24/30) + awards ×2.5; S ≥92, A ≥75, B ≥58, C ≥42, else D. Grade sets the pick (S 1–3, A 4–10, B 11–20, C 31–45, D undrafted), the team choices (S: best record + two; A: three; B: two; C: the drafting team; D: any) and the starter box (legendary/epic/rare/uncommon/common).
- The draft: everyone is lifted to Lv 20 (skipped grants paid), then the forced respec: floor 65, reference 65, 500 + every point the college levels paid (+ origin points and perfect-drill points). The skills sheet opens.
- NBA: 16 games, no play-in, best of five, four rounds, seeds by record. Every career-league game runs the possession engine (gear, perks and raids apply to sims). The league is re-centred each season: rotation players (top 8 per team) are shifted to the real league's rotation shape, tuned so the league shoots 46% / 36% at ~101 possessions. The season boost is `G.lgBoost` (+3 a season) added to every CPU player and to the engine reference, so CPU vs CPU is unchanged and only you fall behind.
- Raids: college rounds map 1,1,2,3,4,5; NBA rounds 1,2,4,5. 2 = their best defender on you (−5% on everything you create), 3 = your most-used setup move starts the game already seen, 4 = their best player carries two perks (+5% on his shots, −5% on yours when he guards you, printed on the defense card), 5 = the boss: once a quarter his shot is PERFECT and every quarter ends as late game. In the NBA Finals your opponent is swapped for a historical champion (rotation: 2017 GSW, 1996 CHI, 2001 LAL, 1986 BOS, 2014 SAS, 2013 MIA, 1987 LAL, 2008 BOS, 2016 CLE, 2023 DEN), mapped onto the league's scale, restored after the Finals.
- Playoff rewards: losing a series gives one box (round 1 rare, later epic); the title gives one 5★ legendary and one ring (+5% on every roll in playoff and tournament games per ring). Series wins also pay NIL.
- Seasons: the season counter ticks at each season start; Season n: level cap 70+10(n−1), skill ceiling 99+3(n−1), gear cap 3+n★, league +3(n−1), patch-notes card from the System. The player never retires; the GM is never fired in career.
- The card: odds, points, and factor chips in signed percent (a d20 point = 5%), a base chip so the chips add up; the roll is a meter; outcomes MADE/MISSED, PERFECT/SLIP, "Just short", "Clean". "Show the math" setting brings the numbers back. Settings cut to mode, speed, sound, show the math (timing tap, karmic toggle, bench and defense toggles gone; defaults kept).
- Every printed edge (perks, classes, origins, sets, gear, Legend/Master) is a signed percent.
- UI: college bottom bar Play · Locker · Character · Season · ⋯ (sims, settings, style, keys, menu); Season holds Schedule, Standings, Top 25, Bracket, Team, News, Clips, Trophies. NBA career nav Play · Locker · Character · Season; trade and the GM tabs hidden (free agency shows in the offseason); "Decisions" became "Your party" (one trade request a season).
- Hooks 1–4: the reveal card (drops after simmed games when rare or better; every box), pity on both Play buttons, the pre-game card (opponent, best player, raid round lines, drop tier, gold frame for boss games), the post-game ladder (result, EXP bar, money, the drop reveal, pity, next opponent).
- Practice became one free substat reroll per game week. Goals were removed. EXP rescaled for the short seasons: XP_COL 2.9, XP_NBA 30 (measured, 3★: college played Lv 19 / simmed Lv 12; first NBA regular season played Lv 57 before the playoffs, a Finals run reaches 70; simmed Lv 45).
- Fixed: the drafted player sat on two rosters (stats doubled).
- Deferred to M6 with hooks 5–9: the Hall of Fame board and held titles, constrained free agency, college-only and NBA-only badges.

**M5 original:** §5 as locked (short seasons, seeded best-of-five, the five-round raid, dice under the hood with the descriptor words, the UI cut to four tabs, hooks 1–4). Hooks 5–9 are M6. Plus: §1a. Tutorial grade and draft choice; no aging/retirement; season rollover (cap +10, PV.ref +3, ceiling +3, league ratings track, stronger draft classes, new loot tier, partial ladder reset); playoffs as raid wings; Finals loot and ring; offseason party-building (free agency, trade request). Tests: three simulated seasons run back to back with league FG% within realistic bands each season; a champion receives exactly one ring and one guaranteed legendary; a first-round exit receives one rare box.

**M6 — ladder and encounters, and M7 — the NBA home and the phone layout (shipped together as v51).** Ship notes:
- Hall of Fame board (hof.js): points = ring 10, MVP 12, Finals MVP 8, All-NBA 6/4/3, DPOY 5, All-Star 2, statistical title 3. Real greats who are not in the league are seeded (top 60, at least 40 points) with real rings and estimated MVP / All-NBA / All-Star counts taken from season ranks in the NBA.com data, since the bundled data has no award table. All time / This season views live under Season.
- Held titles: the ten best **active** players hold them (#1 The GOAT: one PERFECT shot a game plus +5% on a natural 1 reroll; #2–5 Pantheon: +5% in the fourth quarter; #6–10 Legend: energy costs ×0.8). Retired greats sit on the board but hold nothing, so a title is always something you can take. Re-ranked after each regular season and after the Finals.
- Badges: college (Freshman, Conference POY, Final Four, National title, Buzzer, Giant killer, Triple-double, 40 points) and NBA (All-Star, All-NBA, 50 points, Game 5, Closer, Ring bearer). Badges are equipped in perk slots, so they compete with class perks for space rather than stacking freely.
- Milestones (hook 6) with wearable titles and boxes; the Vantage meter (hook 7: every salvage fills 12.5%, a full meter is one epic in a slot you choose); the build goal (hook 9: pick set + main + grade, drops that move you toward it are marked ▲); boss records (hook 5: the pre-game card names the boss and your record against it).
- Hook 8 (patch notes each season) already existed from M5.
- Free agency in career: CPU teams sign at most three real free agents a season (minimum-contract fill-ins do not count), so rosters stay recognisable.
- M7, the NBA home: after draft night you land in the same scene and bar as college, with your team's colours, name and banners, a pro coach and your best teammate. Play opens the pre-game card; in the offseason the button starts the next season (draft, re-signing and free agency run on their own). Season opens the league pages; Play in their nav returns home. ⋯ holds sims, settings, style and the menu.
- Phone layout (iPhone portrait, any width up to 600): its own arrangement, not a shrunk desktop. Thin level and EXP strip on top; the gym scene in the top ~44% zoomed 2× around the player; a next-game card (team record, opponent, raid round, their best player, the raid rule, drop odds, your season line); one big Play button; an icon tab bar (Locker, Character, Season, More) with home-bar padding. Locker / Character / Season open as full pages with a large close button. The play-call card wraps instead of running off the right edge. Desktop is unchanged. The layout is chosen from the screen size on load and on rotate (`fitDevice`, class `phone`; `compact` tightens screens 380 wide or less).
- Tests: m6.py (board, titles, GOAT PERFECT events, badges, milestones, meter, goal), m7.py (pick → home → game → sims → playoffs → offseason → season 2, at 1300 and 440×956), plus the existing suite.

## 7. Working rules for the executor

- Edit module files, rebuild with ins.py + make_main.py, syntax-check, run the named tests, then build the PWA and push, then publish the artifact. Bump BUILD.
- `story.js` holds the System's lines only. New lines follow WRITING.md, stay one or two sentences, and never introduce a person, a place or a plot.
- When a decision is not covered here, choose the option that prints more information on the card and ask nothing.
- Keep `WRITING.md`, `PLAN.md` and `story.js` copied into `hoops/` on each push.

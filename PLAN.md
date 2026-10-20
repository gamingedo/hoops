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

- Two roads: five-star (500 SP) and one-star (1 SP). No other tiers.
- Classes: **Scorer, Playmaker, Defense** at Lv 10. Specialization at Lv 20. Perk picks at 30/40/50/60 from the specialization's pool. Master at 45 (+50% edges), Legend at 65 (+0.5 on everything, one extra active use per game).
- Position never limits the build. Height and ratings decide blocks and boards on every roll.
- Energy replaces legs: pool from Stamina (`enMax = 40 + STA*0.8`), drains on the floor, refills on the bench, spent by gambles and actives, shown on the card and the Bench tab.
- Every possession of your team is yours to run (always-on off-ball). Defense is lighter: your matchup, the last two minutes, runs.
- Dice: d20 + named modifiers vs DC, all printed. Natural 20 succeeds, natural 1 fails and is a turnover on setup moves. Timing tap stays optional, off by default, never a penalty.
- Items are edges on specific moves. Loot boxes only at advancements (Lv 5 origin perk, 10, 20, 30, 40, 50, 60). The shop spends NIL money; stock rotates per season; nothing is shop-only.
- Cuts: traits, daily events, loadouts, archetype names, the hallway map, the hoop prop, recruiting UI, franchise/GM screens in the pro stage, any text saying Architect/Codex/star tiers 2–4.
- Bond scenes fire on specific triggers, not on a timer. Free evenings are rare and plain. The mother's rewatch is a high school game.

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

## 4. Items, loot, shop

- `ITEMS[k].mods` become edges: `{on:[moveKeys|shotTypes], val}` plus a few rules (`energyDrain:-0.2`, `seenDelay:1`, `rerollTrust:1`). Rewrite the 25 items' `mods` accordingly; keep backstories (DCC voice is allowed there; no contractions in narration).
- `grantItem` is called only from advancements: `lootBox(tier)` picks a random item whose `cls` matches the player's class (or any, at Lv 5) with rarity floor by tier: 5/10 → uncommon+, 20/30 → rare+, 40/50 → epic+, 60 → legendary. Remove crate keys from goals and games; remove the "Open a crate" UI; keep the pity counters out.
- Shop: `C.nil` is the balance (sponsor cash payouts and NIL value per season add to it; remove "Sent home" as a sink or make it a choice). `shopHtml()`: 6 items per season drawn by class, priced by rarity (uncommon 15k, rare 40k, epic 120k, legendary 400k), restocks at season start. Hub: the `shop` map's counter prop opens the shop window (`act:"shop"`). No timers.
- Locker bugs: `.mp-win>.mp-body{min-height:0}` (scroll), and verify `equip`/`unequip` never leave an item in both `bag` and `eq`.

## 5. Story consistency pass

- Free evening: fire at most every 5th week, 35%; results are one line each (`ST.ev*` trimmed to ≤2 lines). Keep "The gym, alone" as the trigger for Whose Voice.
- Scenes on triggers (bonds.js `bondScenes` → make it event-driven from `bondGame`): rival win → "He said your name" at the third meeting with lv≥40; a 10-point-or-worse game → the mother calls (new short card, plain); first game back from the blind season → one gold line; the rewatch call happens once, on a bye week, and the game she is rewatching is a high school game (rewrite `ST.evCall[0]`: she is watching a game from three years ago; the fall is from that game).
- Attention on the court: Attention ≥ 70 → the opponent's best defender takes you (their Stopper edge +1 on your rolls), "They have seen it" starts one move earlier, road crowd −0.5. Print all three.
- Sponsors: each `pay` becomes `{rule|edge, cost}`; the clause is the cost. Rewrite the 24 brands and 16 people payouts (text stays).
- Remove every string with "Architect", "Codex", "four-star", "three-star", "two-star", "Hoops Lab". Hide franchise screens in the pro stage: owner meter, trade, press conference, chemistry.
- Goals (`GOALS` in rpg.js): replace stat-line goals with chain goals: "Finish a four-move possession", "Score on a run-out", "Hit a step-back in the fourth", "Draw a foul from Off balance", "Dunk at home", "Three assists off kick-outs", etc. EXP only, no keys.

## 6. Milestones and acceptance

**M1 — cleanup (ship as v45):** energy in (done in poss.js/franchise.html; verify `enMax` is exported and `stay.py` passes both roads), traits/daily events/loadouts/hoop/hallway cut, news legible, locker scroll, shop placeholder map. Tests: `col.py`, `stay.py 5`, `stay.py 1`, `bench.py`, `poss.py` all `errors []`.

**M2 — the chain (v46):** sections 2.1–2.8 for the user's team possessions (offense) with the CPU on the same grammar; defense as 2.7; card UI; announcer lines for dunks and lobs; momentum in the HUD. Tests: a greedy bot in `touches` mode over 20 games lands within +5 FG% of `__cal`; `poss.py` sees a chain of ≥3 cards in one possession; mobile card fits 390×700 without scroll.

**M3 — classes and perks (v47):** section 3; advancement scenes; save migration; Job panel on the sheet lists perks with their text. Tests: `jobs.py` reaches Lv 30 pick via `__autoSpend` sim; every perk's `apply` is exercised by a unit script that walks the machine with the perk on and asserts the change.

**M4 — items, loot, shop (v48):** section 4. Tests: advancement grants exactly one class-matching item of the right floor; shop buys debit `C.nil`; no item ever in both bag and eq.

**M5 — story pass (v49):** section 5, bible updated, `WRITING.md` rules applied to every new string. Review the spine scenes with the user before shipping; furniture ships without review.

## 7. Working rules for the executor

- Edit module files, rebuild with ins.py + make_main.py, syntax-check, run the named tests, then build the PWA and push, then publish the artifact. Bump BUILD.
- Never paraphrase approved text in `story.js`. New text follows WRITING.md; keep it short.
- When a decision is not covered here, choose the option that prints more information on the card and ask nothing.
- Keep `WRITING.md`, `PLAN.md` and `story.js` copied into `hoops/` on each push.

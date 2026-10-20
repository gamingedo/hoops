/* ---------- chain.js: the possession chain (PLAN.md §2). Pure option builders and the auto policy.
   The driver that walks the chain lives in liveGen (franchise.html), because it needs the game's closures.
   Every option is {k, kind:'setup'|'finish'|'pass'|'offball'|'help', lab, note, mods, mod, dc, pct, ...}.
   UI odds = pMake(mod+1, dc): the flat +1 is the "no timing tap" bonus, same as every other card. ---------- */
const CH_SIT={top:"Top of the key",space:"You have space",offbal:"He bit. He is off balance",lane:"The lane is open",collapse:"The help came",
  mismatch:"Switch. You have a mismatch",seal:"Sealed on the block",picked:"Dribble picked up",corner:"Spotted up in the corner",wing:"On the wing",runout:"Run-out. Nobody back"};
const CH_TYPEN={three:"three",mid:"jumper",rim:"layup",dunk:"dunk",post:"hook"};
const chHalf=v=>Math.round(v*2)/2;
const chSk=v=>chHalf(((v??65)-PV.ref)/PV.skl);
const chSum=m=>m.reduce((a,x)=>a+x[1],0);
function chFin(o){o.mods=(o.mods||[]).filter(m=>m[1]!==0);o.mod=chSum(o.mods);o.pct=o.noroll?1:pMake(o.mod+1,o.dc);o.pts=o.pts??0;return o}
function chSeenPen(E,k){const n=(E.seen&&E.seen.k===k?E.seen.n:0)+1;return n>=4?-2:n>=3?-1:0}
const CH_DEAL=["cross","hesi","jab","pump","screen","handoff"];
/* which setup gets dealt at the top this possession, weighted by the player's game */
function chDeal(s){const w={cross:s.HND,hesi:(s.HND+s.SIQ)/2,jab:s.SIQ*.8,pump:(s.SIQ+s.THR)/2*.8,screen:62,handoff:s.PAS*.8};
  const ks=CH_DEAL,ws=ks.map(k=>Math.pow(w[k]/60,3));let r=Math.random()*ws.reduce((a,b)=>a+b,0);for(let i=0;i<ks.length;i++){r-=ws[i];if(r<=0)return ks[i]}return ks[0]}
/* perk moves available from the player's job (M3 replaces this with the class table) */
function chPerks(){const out=new Set();try{if(typeof jobS!=="function"||typeof C==="undefined"||!C)return out;const J=jobS();if(!J.path)return out;
  const P=typeof JOBS!=="undefined"?JOBS[J.path]:null;if(!P)return out;const acts=[P.act,...(J.spec&&P.spec[J.spec]?[P.spec[J.spec].act]:[])].filter(Boolean);
  for(const a of acts){const m={stepback:"stepback",relocate:"stepback3",eurostep:"euro",lob:"lob",setup:"lob",hesi:"stepback",corner:"stepback3",pop:"stepback3"}[a.k];if(m&&!(typeof jobUsed==="function"&&jobUsed(a.k)))out.add(m+"|"+a.k)}}catch(e){}return out}
const chHas=(E,m)=>{for(const x of E.perks)if(x.split("|")[0]===m)return x.split("|")[1];return null};

/* the options for the current situation */
function chainOpts(E){const P=E.P,s=E.s,d=E.d,h=E.h,out=[],sit=P.sit,fl=P.flags;const finOnly=P.n>=5||P.clk<=4;
  const tail=(mods,k,setup)=>{if(E.ctx.fat>0)mods.push(["Low energy",-chHalf(E.ctx.fat*2)]);if(E.mom)mods.push(["Momentum",E.mom]);if(setup){const sp=chSeenPen(E,k);if(sp)mods.push(["They have seen it",sp])}return mods};
  const ddc=(base,stat,div)=>Math.round(base+((stat??65)-PV.ref)/(div||PV.skl));
  const S=(k,lab,note,mods,dc,sec,en,x)=>{if(finOnly)return;out.push(chFin({k,kind:"setup",lab,note,mods:tail(mods,k,true),dc,sec,en,...(x||{})}))};
  const F=(k,lab,type,cx,extra,dcAdd,note,vs,x)=>{if(type==="three"&&E.no3x)return;const ctx={...E.ctx,...cx,me:true};const mods=shotMods(type,s,ctx).filter(m=>m[0]!=="Tired");
    for(const m of extra||[])mods.push(m);if(E.mom)mods.push(["Momentum",E.mom]);const dp=vs==="help"?h:vs==="mm"?(E.mm||d):d;
    out.push(chFin({k,kind:"finish",type,lab,note,mods,dc:shotDC(type,dp,{...ctx,dh:vs==="help"?E.dhH:E.dh})+(dcAdd||0),pts:type==="three"?3:2,open:!!cx.open,contest:!!cx.contest,vs:vs||"man",...(x||{})}))};
  const K=(k,lab,openShot,dcAdd,bonus,pick,x)=>{const mates=(E.mates||[]).filter(m=>!pick||pick(m));if(!mates.length)return;
    const swing=k==="kick"&&!openShot;const pm=[["Passing",chHalf(chSk(s.PAS)*(swing?.5:1))],["Court vision",chHalf((s.VIS-PV.ref)/25)]];if(E.ctx.fat>0)pm.push(["Low energy",-chHalf(E.ctx.fat*2)]);if(E.mom)pm.push(["Momentum",E.mom]);
    const pdc=Math.round((swing?5:7)+(E.dSTL-PV.ref)/14+(dcAdd||0));const pp=pMake(chSum(pm)+1,pdc);
    let best=null;for(const m of mates){const type=x&&x.type?x.type:m.type;if(type==="three"&&E.no3x)continue;const c={open:openShot,contest:!openShot,home:E.ctx.home,fat:m.fat};const sm=shotMods(type,m.s,c).filter(z=>z[0]!=="Tired");
      for(const b of bonus||[])sm.push(b);if(E.mom)sm.push(["Momentum",E.mom]);const sdc=shotDC(type,m.ds,{...c,dh:m.dh}),sp=pMake(chSum(sm)+1,sdc),ev=sp*(type==="three"?3:2);
      if(!best||ev>best.ev)best={m,type,sm,sdc,sp,ev}}
    if(!best)return;const comb=pp*best.sp;
    out.push({...chFin({k,kind:"pass",pass:true,lab:lab.replace("{n}",best.m.name),mods:pm,dc:pdc,sec:2,en:0,...(x||{})}),
      note:`Pass ${Math.round(pp*100)}%, then ${best.m.name}'s ${CH_TYPEN[best.type]} ${Math.round(best.sp*100)}%. Odds shown are both together.`,
      pct:comb,pts:best.type==="three"?3:2,tgt:{r:best.m.r,dr:best.m.dr,type:best.type,smods:best.sm,sdc:best.sdc,sp:best.sp},passPct:pp})};
  const pull=(cx,extra,lab,note)=>{const t3=E.no3x?null:shotMods("three",s,{...E.ctx,...cx}),tm=shotMods("mid",s,{...E.ctx,...cx});
    const ev3=t3?pMake(chSum(t3)+1,shotDC("three",d,{...E.ctx,...cx}))*3:0,evm=pMake(chSum(tm)+1,shotDC("mid",d,{...E.ctx,...cx}))*2;
    const type=ev3>=evm?"three":"mid";F(type==="three"?"pull3":"pullmid",(lab||"Pull-up")+" "+(type==="three"?"three":"jumper"),type,cx,extra,0,note)};
  const perkStep=()=>{const j3=chHas(E,"stepback3"),j=chHas(E,"stepback");if(j3&&!E.no3x)F("stepback3","Step-back three","three",{open:true},[["Step-back",1.5]],0,"Perk. Once a quarter. He is behind you.",null,{job:j3,perk:true});
    else if(j)F("stepback","Step-back jumper","mid",{open:true},[["Step-back",1.5]],0,"Perk. Once a quarter. He is behind you.",null,{job:j,perk:true})};
  const drv=(bonus,note)=>S("drive","Drive",note||"Beat your man and the possession opens up.",[["Handle",chSk(s.HND)],["Acceleration",chHalf((s.ACC-PV.ref)/20)],...(bonus||[])],ddc(12,d.PER),3,1.5);
  const dealt=k=>{if(k==="cross")S("cross","Crossover","Make space. Fail and you picked up your dribble.",[["Handle",chSk(s.HND)]],ddc(12,d.PER),2,1);
    else if(k==="hesi")S("hesi","Hesitation","Freeze him. If he bites, he is off balance.",[["Handle",chSk(s.HND)],["Shot IQ",chHalf((s.SIQ-PV.ref)/20)]],ddc(12,d.PER),2,0.5);
    else if(k==="jab")S("jab","Jab step","Read him. A little space if it works. Costs nothing if it does not.",[["Shot IQ",chSk(s.SIQ)]],ddc(11,d.PER),1,0);
    else if(k==="pump")S("pump","Pump fake","Get him in the air.",[["Shot IQ",chSk(s.SIQ)],["Shooter's respect",chHalf((s.THR-PV.ref)/20)]],ddc(12,d.PER),1,0);
    else if(k==="screen"&&E.big)S("screen",`Call for ${E.big.name}'s screen`,"Their coverage decides: switch, hedge or drop.",[["Screener",chSk(E.big.s.STR)]],ddc(11,E.dPERavg),3,0.5);
    else if(k==="handoff"&&E.big)S("handoff",`Hand-off with ${E.big.name}`,"Come off it with space.",[["Passing",chSk(s.PAS)]],ddc(10,d.PER),2,0.5)};
  if(sit==="top"){drv();pull({contest:true},fl.pullPlus?[["Drop coverage",1]]:[["Set defender",-1.5]]);dealt(P.deal);if(s.PST>=56)S("post","Post up","Back him down. Seal, then hook, spin or drop step.",[["Post moves",chSk(s.PST)],["Strength",chHalf((s.STR-PV.ref)/20)]],ddc(12,d.INT)+Math.round((d.STR-PV.ref)/20),4,1.5);
    else if(P.deal!=="screen")dealt("screen");K("kick","Swing it to {n}",false,0)}
  else if(sit==="space"){pull(fl.small?{}:{open:true},fl.small?[["A little space",1]]:null);drv([["Space",fl.small?.5:1]]);perkStep();K("kick","Kick to {n}",false,0)}
  else if(sit==="offbal"){drv([["Off balance",2]],"He is in the air. The lane is right there.");pull({open:true});S("drawfoul","Draw the foul","Go into him. Two free throws if it works.",[["Draw fouls",chSk(s.DRW)]],ddc(12,d.PER),1,0.5);K("kick","Kick to {n}",false,0)}
  else if(sit==="collapse"){F("layhelp","Layup through the help","rim",{contest:true},null,0,"Over the help.","help");F("floater","Floater over the help","mid",{},null,1,"Soft and high. Harder than a jumper, easier than going through him.","help");
    K("kick","Kick to the open man, {n}",true,-1);if(E.big&&E.big.inside)K("dump","Dump off to {n}",true,-1,null,m=>m.inside,{type:"rim"});else if(E.shooters)K("skip","Skip pass to {n}",true,1,[["Skip pass",1]],m=>m.type==="three");
    const lob=chHas(E,"lob");if(lob&&E.big)K("lob","Throw the lob to {n}",true,1,[["Lob",2]],m=>m===E.big,{type:"dunk",job:lob,perk:true,lob:true});
    const eu=chHas(E,"euro");if(eu)S("euro","Euro step","Perk. Sidestep the help into the lane. Fail is a charge.",[["Acceleration",chSk(s.ACC)],["Handle",chHalf((s.HND-PV.ref)/20)]],ddc(13,h.INT),2,1,{job:eu,perk:true});
    perkStep()}
  else if(sit==="lane"){F("layup",fl.under?"Layup in traffic":"Layup","rim",fl.under?{contest:true}:{open:true},null,0,fl.under?"Under the basket, bodies around you.":"Nobody between you and the rim.");if(!fl.under)F("dunk","Dunk","dunk",{open:true},null,3,"Harder than the layup. Worth more than two: momentum, and the crowd.");perkStep();K("kick","Kick out to {n}",false,0)}
  else if(sit==="mismatch"){S("post","Post the small man","Mismatch. Back him down.",[["Post moves",chSk(s.PST)],["Mismatch",2]],ddc(12,(E.mm||d).INT),4,1.5);drv([["Mismatch",2]],"The big man is guarding you. Go by him.");pull({open:true},null,"Pull-up over the big");K("kick","Kick to {n}",false,0)}
  else if(sit==="seal"&&fl.hookPen){F("hook","Hook shot, off balance","post",{},null,1,"The drop step did not work. This is what is left.")}
  else if(sit==="seal"){F("hook","Hook shot","post",{},null,0,null);S("spin","Spin baseline","Beat him on the spin and the rim is yours.",[["Post moves",chSk(s.PST)],["Acceleration",chHalf((s.ACC-PV.ref)/20)]],ddc(13,d.INT),2,1);
    S("dropstep","Drop step","Strength against strength. Fail and you shoot the hook at a disadvantage.",[["Strength",chSk(s.STR)]],ddc(12,d.STR),2,1);K("kick","Kick out of the double to {n}",true,0)}
  else if(sit==="picked"){F("forced","Forced jumper","mid",{contest:true},[["Dribble picked up",-2]],0,null);S("step","Step-through","Pivot under him. A natural 1 is a travel.",[["Shot IQ",chHalf((s.SIQ-PV.ref)/20)],["Strength",chHalf((s.STR-PV.ref)/20)]],ddc(13,d.INT),2,0.5);
    K("kick","Bail out to {n}",false,0);if(!finOnly)out.push(chFin({k:"reset",kind:"setup",lab:"Reset the offense",note:"No roll. Six seconds and some energy. Back to the top.",mods:[],dc:0,noroll:true,sec:6,en:1}))}
  else if(sit==="corner"||sit==="wing"){F("cs3","Catch and shoot","three",{},[["Catch and shoot",1]],0,"Feet set. He is closing out.");dealt("pump");drv();K("kick","Swing it to {n}",false,0)}
  else if(sit==="runout"){F("rodunk","Dunk on the run-out","dunk",{open:true},[["Run-out",1]],1,"Nobody back. Worth more than two.");F("rolay","Layup on the run-out","rim",{open:true},[["Run-out",1]],0,null);K("kick","Hit the trailer, {n}",true,0)}
  return out}

/* off the ball: your team has it, the ball is elsewhere */
function chainOffball(E){const s=E.s,d=E.d,out=[];const t=(mods)=>{if(E.ctx.fat>0)mods.push(["Low energy",-chHalf(E.ctx.fat*2)]);if(E.mom)mods.push(["Momentum",E.mom]);return mods};
  const deny=Math.floor((E.touches||0)/2.5);out.push(chFin({k:"callfor",kind:"offball",lab:"Call for the ball",note:`Get open for ${E.pgName}. Success puts the ball in your hands at the top.${deny?" They are denying you.":""}`,mods:t([["Getting open",chHalf((s.SPD-PV.ref)/20+(s.SIQ-PV.ref)/20)],[`${E.pgName}'s vision`,chHalf((E.pgVIS-PV.ref)/20)],...(deny?[["They are denying you",-deny]]:[])]),dc:12}));
  out.push(chFin({k:"cut",kind:"offball",lab:"Cut to the rim",note:"Lose your man. If it works, the pass comes and the lane is yours.",mods:t([["Acceleration",chSk(s.ACC)]]),dc:Math.round(12+(d.PER-PV.ref)/PV.skl),en:1}));
  out.push(chFin({k:"spot",kind:"offball",lab:"Spot up",note:`No roll. If ${E.handlerName} looks your way (${Math.round(E.spotP*100)}%), you catch it in the corner.`,mods:[],dc:0,noroll:true}));
  out.push(chFin({k:"screen",kind:"offball",lab:`Screen for ${E.handlerName}`,note:"His shot gets your screen if it works.",mods:t([["Strength",chSk(s.STR)]]),dc:11,en:1}));
  out.push(chFin({k:"crash",kind:"offball",lab:"Crash the glass",note:"If the shot misses, you are first to it.",mods:t([["Offensive rebounding",chSk(s.ORB)],["Strength",chHalf((s.STR-PV.ref)/20)]]),dc:12,en:1}));
  return out}

/* help defense: late and close, or during their run, when your man does not have it */
function chainHelp(E){const s=E.me,out=[];
  out.push(chFin({k:"rotate",kind:"help",def:true,lab:"Rotate and contest",note:"Get a hand up on their shooter.",mods:[["Perimeter D",chSk(s.PER)],["Distance",-1]],dc:11}));
  out.push(chFin({k:"lane",kind:"help",def:true,lab:"Jump the passing lane",note:"A steal is a run-out. Miss and your man is open.",mods:[["Steal",chSk(s.STL)],["Anticipation",chHalf((s.SIQ-PV.ref)/20)]],dc:16}));
  out.push(chFin({k:"home",kind:"help",def:true,lab:"Stay home",note:"No roll. Do not leave your man.",mods:[],dc:0,noroll:true}));
  return out}

/* the auto policy: used by the CPU walking your player's chain, by "let the coach pick", and by the test bot.
   greed 0..1 raises the bar a finish must clear before it is taken. */
function chainAuto(opts,greed,n){greed=greed??.5;let bestF=null,bestS=null;
  for(const x of opts){const ev=x.kind==="finish"?x.pct*(x.pts||2)+(x.type==="dunk"?.3:0):x.kind==="pass"?x.pct*(x.pts||2)*.75+(x.lob?.3:0):0;
    if(x.kind==="finish"||x.kind==="pass"){if(!bestF||ev>bestF.ev)bestF={x,ev}}
    else if(x.kind==="setup"&&x.k!=="reset"){const v=x.pct*(x.k==="drive"?1.25:x.k==="drawfoul"?1.3:1);if(!bestS||v>bestS.v)bestS={x,v}}}
  const bar=.9+greed*.35-(n||0)*.12;
  if(bestF&&(bestF.ev>=bar||!bestS||bestS.x.pct<.5))return bestF.x;
  if(bestS)return bestS.x;
  return opts.find(x=>x.k==="reset")||opts[0]}
/* a roll exactly like the card's: d20 + mod + 1 vs DC; natural 20 succeeds, natural 1 fails */
function chainRoll(ctl,x){if(x.noroll)return{k:x.k,made:true,opt:x,roll:null};const d=kroll(ctl,"me"),tot=d+x.mod+1,made=d===1?false:d===20?true:tot>=x.dc;ktrack(ctl,"me",made);return{k:x.k,made,nat20:d===20,nat1:d===1,roll:d,total:tot,opt:x}}
window.__chain={chainOpts,chainAuto,chainRoll,CH_SIT};
/* test harness (PLAN.md M2 acceptance): play n games where every card is answered by the auto policy through the same
   generator path a player uses, and n legacy games on the same matchups with no player control. */
window.__chainBot=function(n=20,greed=.5){const cl=C.cl,ids=Object.keys(cl.teams).filter(x=>x!==C.school&&!cl.teams[x].juco);
  const Z=()=>({fga:0,fgm:0,tpa:0,tpm:0,pts:0,tov:0,ast:0,fta:0,min:0,g:0}),A={bot:Z(),leg:Z(),sim:Z(),lgBot:{fga:0,fgm:0},lgLeg:{fga:0,fgm:0},cards:0,chain:0,maxChain:0,kinds:{},dunks:0,poss:0};
  const acc=(z,b)=>{for(const k of["fga","fgm","tpa","tpm","pts","tov","ast","fta","min"])z[k]+=b[k]||0;z.g++};
  for(let i=0;i<n;i++){const opp=pick(ids);
    {const SD=[clSide(cl,C.school),clSide(cl,opp)],ctl=mkCtl(0,"me");ctl.mode="touches";ctl.greed=greed;const g=liveGen(SD,{...clOpt(cl,{neutral:true}),quiet:false},ctl);
      let r,arg,run=0;while(!(r=g.next(arg)).done){arg=undefined;const w=r.value&&r.value.poss;if(!w)continue;A.cards++;
        let x;if(w.def)x=w.opts.find(o=>o.k==="hands"||o.k==="home")||w.opts[0];else if(w.offball)x=w.opts.find(o=>o.k==="callfor");else{x=chainAuto(w.opts,greed,w.meta.moves);A.chain++;run=w.meta.moves+1;A.maxChain=Math.max(A.maxChain,run)}
        A.kinds[x.k]=(A.kinds[x.k]||0)+1;arg=chainRoll(ctl,x)}
      const R2=r.value.R2;R2.flat().forEach(z=>{if(z.p.pid==="me")acc(A.bot,z.b);else{A.lgBot.fga+=z.b.fga;A.lgBot.fgm+=z.b.fgm}});A.dunks+=r.value.ev.filter(e=>e.dunk).length}
    {const L=liveCore([clSide(cl,C.school),clSide(cl,opp)],{...clOpt(cl,{neutral:true}),noHero:true});L.R2.flat().forEach(z=>{if(z.p.pid==="me")acc(A.leg,z.b);else{A.lgLeg.fga+=z.b.fga;A.lgLeg.fgm+=z.b.fgm}})}
    {const L=liveCore([clSide(cl,C.school),clSide(cl,opp)],clOpt(cl,{neutral:true}));L.R2.flat().forEach(z=>{if(z.p.pid==="me")acc(A.sim,z.b)})}}
  const f=z=>({g:z.g,mpg:+(z.min/z.g).toFixed(1),ppg:+(z.pts/z.g).toFixed(1),fga:+(z.fga/z.g).toFixed(1),fg:+(z.fgm/Math.max(1,z.fga)*100).toFixed(1),tp:+(z.tpm/Math.max(1,z.tpa)*100).toFixed(1),tov:+(z.tov/z.g).toFixed(1),ast:+(z.ast/z.g).toFixed(1)});
  return JSON.stringify({bot:f(A.bot),sim:f(A.sim),legacy:f(A.leg),leagueFG_bot:+(A.lgBot.fgm/A.lgBot.fga*100).toFixed(1),leagueFG_legacy:+(A.lgLeg.fgm/A.lgLeg.fga*100).toFixed(1),cardsPerGame:+(A.cards/n).toFixed(1),chainCardsPerGame:+(A.chain/n).toFixed(1),maxChain:A.maxChain,dunks:A.dunks,picks:A.kinds})};

/* ---------- court.js: the card on the court. Every call you make is a choreography; every situation and defensive look is a layout.
   A move event {k, kind, ok, from, to, look, n, sh, d, h, big, tgt} is pushed by the chain after each pick; the viewer plays it
   before the next card opens (lvPull holds the card). Shot events tagged mv shoot from where you stand. ---------- */
const CRT={gap:3,tight:1.5};
/* offensive layouts by situation: [dist, angle] from the basket for me, then four spots for the others (the big gets the last one) */
const CRT_LAY={
  top:{me:[26,0],o:[[23,-50],[23,50],[22,85],[7,-65]]},
  space:{me:[21,-12],o:[[23,-55],[23,50],[22,85],[7,65]]},
  offbal:{me:[22,-4],o:[[23,-55],[23,50],[22,85],[7,65]]},
  lane:{me:[9,-18],o:[[24,-60],[24,55],[22,88],[6,70]]},
  collapse:{me:[7,0],o:[[22,-85],[22,85],[24,-45],[24,45]]},
  mismatch:{me:[17,-30],o:[[24,15],[23,55],[22,88],[7,70]]},
  seal:{me:[6,-45],o:[[24,-8],[23,50],[22,88],[18,70]]},
  picked:null,
  corner:{me:[22,-88],o:[[26,0],[23,50],[22,-45],[7,65]]},
  wing:{me:[22,-48],o:[[26,5],[23,55],[22,88],[7,65]]},
  runout:{me:[36,0],o:[[46,-30],[48,30],[55,-10],[58,15]]},
  putback:{me:[3,-30],o:[[24,-60],[24,55],[22,88],[8,60]]},
  off:{me:[23,-50],o:[[26,0],[23,50],[22,85],[7,-65]]}};
/* 2-3 zone spots, from the basket */
const CRT_ZONE=[[18,-25],[18,25],[6,-40],[6,40],[5,0]];
function crtG(e){const o=e.o,q=e.q,bx=lvBasket(o,q),dir=bx>47?1:-1,rim={x:bx,y:25},on=e.on;
  const P=pid=>LV.pos[pid],T=(pid,x,y)=>{if(LV.pos[pid])LV.tgt[pid]={x:clamp(x,1,93),y:clamp(y,2,48)}};
  const at=(d,a)=>spot(bx,d,a),side=pid=>{const p=P(pid);return p&&p.y>25?1:-1};
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const lerp=(a,b,f)=>({x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f});
  const toRim=(pid,d)=>{const p=P(pid);if(!p)return rim;const L=dist(p,rim);return lerp(p,rim,Math.min(1,d/Math.max(1,L)))};
  const guardPt=(man,gap)=>{const p=P(man);if(!p)return rim;const L=dist(p,rim);return lerp(p,rim,Math.min(.9,gap/Math.max(1,L)))};
  const defOf=pid=>{const i=on[o].indexOf(pid);return i>=0?on[1-o][i]:null};
  const guard=(def,man,gap)=>{const g=guardPt(man,gap??CRT.gap);T(def,g.x,g.y)};
  const perp=(pid,ft)=>{const p=P(pid);return{x:p.x,y:p.y+ft}};
  return{o,q,bx,dir,rim,on,P,T,at,side,dist,lerp,toRim,guardPt,defOf,guard,perp}}
/* place everyone for a situation and a look; me holds the ball slot */
function crtLayout(e,G,sit,look){const L=CRT_LAY[sit]||CRT_LAY.top,me=e.sh,s=e.sh&&G.P(e.sh)?G.side(e.sh):-1;
  if(L){const m=G.at(L.me[0],L.me[1]*s);G.T(me,m.x,m.y);const others=G.on[G.o].filter(p=>p!==me),big=e.big&&others.includes(e.big)?e.big:others[others.length-1],rest=others.filter(p=>p!==big);
    rest.forEach((pid,i)=>{const sp=L.o[i]||L.o[0];const q=G.at(sp[0],sp[1]*s);G.T(pid,q.x,q.y)});{const sp=L.o[3];const q=G.at(sp[0],sp[1]*s);G.T(big,q.x,q.y)}}
  setTimeout(()=>{},0);
  const D=G.on[1-G.o];
  if(look==="zone"){D.forEach((pid,i)=>{const z=CRT_ZONE[i]||CRT_ZONE[0];const q=G.at(z[0],z[1]);G.T(pid,q.x,q.y)});return}
  G.on[G.o].forEach(pid=>{const d=G.defOf(pid);if(!d)return;const gap=pid===me?(sit==="picked"?CRT.tight:CRT.gap):sit==="collapse"||sit==="lane"?CRT.gap*1.6:CRT.gap*1.3;
    const g=G.guardPt(pid,gap);if(pid!==me&&(sit==="lane"||sit==="collapse")){const h=G.lerp(g,G.rim,.35);G.T(d,h.x,h.y)}else G.T(d,g.x,g.y)});
  if(look==="drop"&&e.big){const bd=G.defOf(e.big);if(bd){const q=G.at(4,0);G.T(bd,q.x,q.y)}}
  if(look==="trap"&&e.d){const others=D.filter(p=>p!==e.d);const near=others.sort((a,b)=>G.dist(G.P(a)||G.rim,G.P(me)||G.rim)-G.dist(G.P(b)||G.rim,G.P(me)||G.rim))[0];if(near){const g=G.guardPt(me,2.5);G.T(e.d,g.x,g.y-2.5);G.T(near,g.x,g.y+2.5)}}
  if(sit==="collapse"&&e.h){const a=G.lerp(G.P(me)||G.rim,G.rim,.5);G.T(e.h,a.x,a.y-3);const D2=D.filter(p=>p!==e.h&&p!==e.d)[0];if(D2)G.T(D2,a.x,a.y+3)}
  if(sit==="seal"&&e.d){const p=G.P(me);if(p){const g=G.lerp(p,G.rim,.3);G.T(e.d,g.x,g.y)}}}
/* the ball to me, from whoever has it */
function crtBallTo(pid,d){if(LV.holder===pid)return;pass(pid,d||.45)}
/* the choreographies. Each returns steps [{d, go}] */
function crtMove(e){const G=crtG(e),S=[],me=e.sh,d=e.d,h=e.h,big=e.big,ok=e.ok,k=e.k,s=G.P(me)?G.side(me):-1,dir=G.dir;
  const step=(dur,go)=>S.push({d:dur,go,arrive:1});const move=(pid,pt)=>G.T(pid,pt.x,pt.y);const ahead=(pid,ft)=>G.toRim(pid,ft);
  const beat=()=>{if(d)G.guard(d,me,CRT.gap+2)};const stop=()=>{if(d){const g=G.guardPt(me,CRT.tight);G.T(d,g.x,g.y)}};
  const settle=sit=>crtLayout(e,G,sit,e.look);
  /* the first beat of a possession or a card: everyone to the situation's spots, the ball to the handler */
  if(e.def&&!e.help){step(.8,()=>{crtLayout(e,G,"top","man");crtBallTo(e.sh,.45)})}
  else if(e.offball){step(.8,()=>{crtLayout({...e,sh:e.hd,d:G.defOf(e.hd)},G,"top","man");const w=G.at(23,-50*s);G.T(me,w.x,w.y);if(d)G.guard(d,me,CRT.gap*1.4);crtBallTo(e.hd,.45)})}
  else if(e.n===0){if(lvPrevMade())lvInbound(S,e,G.o,G.q,G.bx);step(1.1,()=>{settle(e.from);crtBallTo(me,.5)})}
  if(e.offball){
    if(k==="callfor")step(.6,()=>{const p=G.P(me);if(p){move(me,{x:p.x-dir*2,y:p.y+(25-p.y)*.3});LV.pos[me].z=1.4}});
    else if(k==="cut")step(.7,()=>{move(me,G.at(4,-10*s));if(d)G.guard(d,me,CRT.gap)});
    else if(k==="spot")step(.6,()=>move(me,G.at(22,-88*s)));
    else if(k==="screen")step(.7,()=>{const hd=e.hd,dd=G.defOf(hd);if(dd&&G.P(dd)){const q=G.P(dd);move(me,{x:q.x-dir*1.5,y:q.y+1})}});
    else if(k==="crash")step(.6,()=>{move(me,G.at(5,35*s));if(d)G.guard(d,me,CRT.gap)});
    return S}
  if(e.def){const sh=e.sh,me=e.d;
    if(k==="hands")step(.5,()=>{G.guard(me,sh,CRT.tight)});
    else if(k==="steal")step(.45,()=>{const p=G.P(sh);if(p)move(me,{x:p.x-dir*.5,y:p.y-1.5});if(!ok){move(sh,ahead(sh,7))}});
    else if(k==="block")step(.45,()=>{G.guard(me,sh,1.2)});
    else if(k==="charge")step(.55,()=>{const g=G.guardPt(sh,3);G.T(me,g.x,g.y);move(sh,{x:g.x-dir*.8,y:g.y})});
    else if(k==="rotate")step(.5,()=>G.guard(me,sh,2));
    else if(k==="lane")step(.5,()=>{const p=G.P(sh),mates=G.on[1-G.o].filter(x=>x!==sh&&G.P(x));const m=mates[0];if(p&&m){const q=G.P(m);move(me,G.lerp(p,q,.5))}});
    else if(k==="foul")step(.4,()=>{G.guard(me,sh,.8);lvPop("FOUL",G.o)});
    return S}
  switch(k){
    case"drive":step(.45,()=>{const p=G.P(me);if(!p)return;const a=ahead(me,6);move(me,{x:a.x,y:a.y+3*s});if(d)G.guard(d,me,CRT.gap)});
      step(.6,()=>{if(ok){settle(e.to);beat()}else if(e.why==="stripped"){stop()}else{move(me,ahead(me,2));stop()}});break;
    case"cross":step(.35,()=>{move(me,G.perp(me,-3*s));if(d)G.guard(d,me,CRT.gap)});
      step(.45,()=>{if(ok){settle("space");const g=G.guardPt(me,CRT.gap);G.T(d,g.x,g.y-4*s)}else{stop()}});break;
    case"hesi":step(.4,()=>{move(me,ahead(me,1));if(ok&&d){const g=G.guardPt(me,CRT.gap+2.5);G.T(d,g.x,g.y)}});step(.35,()=>{if(ok)settle("offbal")});break;
    case"jab":step(.3,()=>{move(me,ahead(me,1.5))});step(.4,()=>{const p=G.P(me);move(me,{x:p.x-dir*1.5,y:p.y});if(ok&&d){const g=G.guardPt(me,CRT.gap+2);G.T(d,g.x,g.y)}});break;
    case"pump":step(.4,()=>{if(ok&&d&&LV.pos[d])LV.pos[d].z=4.5});step(.4,()=>{if(ok)settle("offbal")});break;
    case"screen":step(.6,()=>{if(big&&d&&G.P(d)){const q=G.P(d);move(big,{x:q.x-dir*1.2,y:q.y-2.5*s})}});
      step(.7,()=>{if(big&&G.P(big)){const b=G.P(big);move(me,{x:b.x+dir*2.5,y:b.y-2.5*s})}
        if(e.to==="mismatch"){const bd=big?G.defOf(big):null;if(bd)G.guard(bd,me,CRT.gap);if(d&&big)move(d,G.guardPt(big,CRT.gap))}
        else if(ok){settle(e.to);if(d&&big){const b=G.P(big);G.T(d,b.x-dir*1,b.y)}}else stop()});break;
    case"handoff":step(.5,()=>{if(big){const p=G.P(me);move(big,{x:p.x-dir*1,y:p.y+3*s});pass(big,.35)}});
      step(.55,()=>{if(big){const b=G.P(big);move(me,{x:b.x+dir*3,y:b.y+2*s});pass(me,.3);if(ok&&d)G.T(d,b.x-dir*1.5,b.y-1)}else stop()});break;
    case"post":step(.6,()=>{move(me,ahead(me,3));if(d){const g=G.guardPt(me,1.5);G.T(d,g.x,g.y)}});step(.5,()=>{if(ok)settle("seal");else stop()});break;
    case"spin":step(.45,()=>{const p=G.P(me);move(me,{x:p.x+dir*2,y:p.y-3*s})});step(.5,()=>{if(ok){move(me,G.at(4,-40*s));beat()}else stop()});break;
    case"dropstep":step(.6,()=>{if(ok){move(me,G.at(3,-20*s));beat()}else{move(me,ahead(me,1));stop()}});break;
    case"step":step(.4,()=>{move(me,G.perp(me,2*s))});step(.5,()=>{if(ok){move(me,G.at(6,0));beat()}else stop()});break;
    case"euro":step(.4,()=>{move(me,G.perp(me,-3*s))});step(.5,()=>{if(ok){const a=ahead(me,5);move(me,{x:a.x,y:a.y+4*s});if(h)move(h,G.perp(h,-2*s))}else{if(h){const g=G.guardPt(me,2.5);G.T(h,g.x,g.y);move(me,{x:g.x-dir*.8,y:g.y})}}});break;
    case"drawfoul":step(.55,()=>{if(d){const q=G.P(d);move(me,{x:q.x-dir*.8,y:q.y});if(ok)LV.pos[d].z=1.5}});break;
    case"reset":step(.5,()=>{const pg=G.on[G.o].find(p=>p!==me);if(pg)pass(pg,.4)});step(.7,()=>{settle("top");crtBallTo(me,.45)});break;
    case"milk":step(.7,()=>move(me,G.perp(me,1.5)));step(.7,()=>move(me,G.perp(me,-1.5)));break;
    /* finishes: the set-up motion. The shot event that follows rises from where you stand. */
    case"stepback":case"stepback3":step(.5,()=>{const p=G.P(me);move(me,{x:p.x-dir*4,y:p.y+1*s});if(d)G.guard(d,me,CRT.gap+3)});break;
    case"fade":step(.45,()=>{const p=G.P(me);move(me,{x:p.x-dir*2,y:p.y});if(d)G.guard(d,me,CRT.tight)});break;
    case"pull3":case"pullmid":case"forced":case"faceup":case"deep3":step(.35,()=>{if(d&&!ok)G.guard(d,me,CRT.tight+.5);else if(d)G.guard(d,me,CRT.gap)});break;
    case"cs3":step(.35,()=>{if(d)G.guard(d,me,CRT.tight+.5)});break;
    case"floater":step(.4,()=>{move(me,ahead(me,2));if(h)G.guard(h,me,2.5)});break;
    case"hook":step(.4,()=>{move(me,G.perp(me,1.5*-s));if(d)G.guard(d,me,CRT.tight)});break;
    case"layup":case"layhelp":case"rolay":step(.45,()=>{move(me,G.at(2.5,-25*s));if(k==="layhelp"&&h){G.guard(h,me,1.5);LV.pos[h].z=3.5}else if(d)G.guard(d,me,CRT.gap)});break;
    case"dunk":case"rodunk":step(.4,()=>{move(me,G.at(2.5,0));if(d)G.guard(d,me,CRT.gap+1)});break;
    /* passes: the receiver gets to his spot, then the ball goes */
    case"kick":case"skip":case"dump":case"lob":{const tg=e.tgt;step(.35,()=>{if(!tg)return;if(k==="dump")move(tg,G.at(3,40*s));else if(k==="lob")move(tg,G.at(3,0));else if(k==="skip")move(tg,G.at(22,88*s));else if(e.ttype==="three"){const p=G.P(tg);if(p&&G.dist(p,G.rim)<20)move(tg,G.at(23,55*s))}});
      step(.55,()=>{if(!tg)return;if(k==="lob"){toss({x:G.bx-dir*2,y:25,z:9},.5,10);if(LV.pos[tg])LV.pos[tg].z=5}else pass(tg,k==="skip"?.55:.4)});break}
    default:step(.4,()=>{});
  }
  return S}
window.__court={crtMove,crtLayout,CRT_LAY};

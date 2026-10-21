/* ---------- sprites.js: the original player sprites (sprite sheet artifact), drawn from a skeleton and the player's look.
   SPR.frame(look, anim, i, {flip, noBall, k}) returns a cached 64x96 canvas, feet at (SPR.RX, SPR.GY). ---------- */
const SPR=(()=>{
/* ---------------- palette helpers ---------------- */
const hx=h=>{h=h.replace("#","");return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]};
const toH=c=>"#"+c.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,"0")).join("");
const mix=(a,b,t)=>toH(hx(a).map((v,i)=>v+(hx(b)[i]-v)*t));
const shade=(c,t)=>mix(c,"#2c1a3e",t),lite=(c,t)=>mix(c,"#fff1dc",t);
const tri=c=>({b:c,s:shade(c,.28),h:lite(c,.22)});
const OL="#3a2346";
/* ---------------- look ---------------- */
const TONES=["#f2d0b0","#ddaa82","#c08458","#9a6240","#704429","#4b2c1b"];
const HAIRS=[["short","Short"],["fade","Fade"],["afro","Afro"],["locs","Locs"],["buzz","Buzz"],["bald","Bald"]];
const HAIRC={short:"#1e1612",fade:"#1e1612",afro:"#1a120e",locs:"#24170f",buzz:"#2a1d16",bald:null};
const HEIGHTS=[[72,"6'0\""],[77,"6'5\""],[81,"6'9\""],[85,"7'1\""]];
const BUILDS=[["slim","Slim"],["avg","Average"],["strong","Strong"]];
const KITS=[["Home blue",{j:"#2b5fd9",t:"#ffffff",n:"#ffffff"}],["Away white",{j:"#f3f1ec",t:"#2b5fd9",n:"#2b5fd9"}],["Gold",{j:"#f2b632",t:"#1b2140",n:"#1b2140"}],["Black",{j:"#1d2030",t:"#ffa24c",n:"#ffa24c"}]];


/* ---------------- raster ---------------- */
const W=64,H=96,GY=90,RX=24;
function Buf(){return{c:new Array(W*H).fill(null),post:[]}}
const put=(B,x,y,col)=>{x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=W||y>=H)return;B.c[y*W+x]=col};
const LIGHT=[.55,-.84];
/* a capsule from a to b, radius r, lit from the front-top */
function cap(B,a,b,r,C,opt){opt=opt||{};const x0=Math.floor(Math.min(a[0],b[0])-r-1),x1=Math.ceil(Math.max(a[0],b[0])+r+1),y0=Math.floor(Math.min(a[1],b[1])-r-1),y1=Math.ceil(Math.max(a[1],b[1])+r+1);
  const dx=b[0]-a[0],dy=b[1]-a[1],L2=dx*dx+dy*dy||1e-6;
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const px=x+.5,py=y+.5;let t=((px-a[0])*dx+(py-a[1])*dy)/L2;t=Math.max(0,Math.min(1,t));const cx=a[0]+dx*t,cy=a[1]+dy*t,nx=px-cx,ny=py-cy,d=Math.hypot(nx,ny);
    if(d>r)continue;if(opt.only&&!opt.only(px,py,nx,ny))continue;let col=C.b;if(C.h!==undefined&&d>r*.35){const l=(nx*LIGHT[0]*opt.lx+ny*LIGHT[1])/d;if(l>.5)col=C.h;else if(l<-.45)col=C.s}put(B,x,y,col)}}
/* polygon, with a lighting axis for shading */
function poly(B,pts,C,ax){let y0=Infinity,y1=-Infinity;pts.forEach(p=>{y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])});
  for(let y=Math.floor(y0);y<=Math.ceil(y1);y++){const py=y+.5,xs=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];if((a[1]<=py&&b[1]>py)||(b[1]<=py&&a[1]>py))xs.push(a[0]+(py-a[1])/(b[1]-a[1])*(b[0]-a[0]))}
    xs.sort((p,q)=>p-q);for(let i=0;i+1<xs.length;i+=2)for(let x=Math.ceil(xs[i]-.5);x<=Math.floor(xs[i+1]-.5);x++){let col=C.b;if(ax){const t=ax(x+.5,py);if(t>.5)col=C.h;else if(t<-.45)col=C.s}put(B,x,y,col)}}}
function outline(B){const o=B.c.slice();for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(B.c[y*W+x])continue;const n=(x>0&&B.c[y*W+x-1])||(x<W-1&&B.c[y*W+x+1])||(y>0&&B.c[(y-1)*W+x])||(y<H-1&&B.c[(y+1)*W+x]);if(n)o[y*W+x]=OL}B.c=o}
const DIG={0:["111","101","101","101","111"],1:["010","110","010","010","111"],2:["111","001","111","100","111"],3:["111","001","011","001","111"],4:["101","101","111","001","001"],5:["111","100","111","001","111"],6:["111","100","111","101","111"],7:["111","001","010","010","010"],8:["111","101","111","101","111"],9:["111","101","111","001","111"]};
function num(B,cx,cy,s,col){const ds=String(s).split("");const w=ds.length*4-1;let x=Math.round(cx-w/2);for(const d of ds){const g=DIG[d];for(let r=0;r<5;r++)for(let c=0;c<3;c++)if(g[r][c]==="1")put(B,x+c,Math.round(cy)+r,col);x+=4}}

/* ---------------- body ---------------- */
function dims(look){const k=look.k||1,tot=Math.round(look.ht*.58*k),b=["slim","avg","strong"].indexOf(BUILDS[look.build][0]),q=Math.max(.72,k);
  return{k,tot,hr:4,T:Math.round(tot*.29),TH:Math.round(tot*.23),SH:Math.round(tot*.22),UA:Math.round(tot*.17),FA:Math.round(tot*.155),
    ar:[.85,1.05,1.35][b]*q,tr:[1.45,1.75,2.1][b]*q,sr:[1.05,1.25,1.5][b]*q,tw:[2.4,2.8,3.3][b]*q,bw:[2.1,2.4,2.7][b]*q,sw:[3.9,4.4,5.1][b]*q,hw:[1.8,2.1,2.4][b]*q}}
const V=a=>{const r=a*Math.PI/180;return[Math.sin(r),Math.cos(r)]};
const add=(p,v,k)=>[p[0]+v[0]*(k??1),p[1]+v[1]*(k??1)];
const lerp=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
const D0={v:"s",lean:3,tF:6,sF:0,tB:-4,sB:-4,aF:8,fF:22,aB:-6,fB:12,air:0,dx:0,bob:0,
  tL:6,sL:2,tR:6,sR:2,aL:10,fL:6,aR:10,fR:6};
/* forward kinematics; returns joints in buffer space */
function fk(pose,d){const P={...D0,...pose};
  if(P.v==="s"){const u=[Math.sin(P.lean*Math.PI/180),-Math.cos(P.lean*Math.PI/180)],root=[0,0],nb=add(root,u,d.T),S=add(nb,u,-1.6);
    const arm=(a,f)=>{const e=add(S,V(a),d.UA);return{s:S,e,h:add(e,V(f),d.FA)}},leg=(t,s)=>{const k=add(root,V(t),d.TH);return{h:root,k,a:add(k,V(s),d.SH)}};
    const J={P,u,root,nb,head:add(nb,u,1+d.hr),aF:arm(P.aF,P.fF),aB:arm(P.aB,P.fB),lF:leg(P.tF,P.sF),lB:leg(P.tB,P.sB)};
    const low=Math.max(J.lF.a[1],J.lB.a[1])+1.6;J.off=P.sit?[RX+P.dx*d.k,GY-2.4]:[RX+P.dx*d.k,GY-low-P.air*d.k];return J}
  const u=[0,-1],root=[0,0],nb=add(root,u,d.T),S=s=>[s*d.sw,nb[1]+1.4];
  const arm=(s,a,f)=>{const sp=S(s),e=add(sp,[s*V(a)[0],V(a)[1]],d.UA);return{s:sp,e,h:add(e,[s*V(f)[0],V(f)[1]],d.FA)}};
  const leg=(s,t,sh)=>{const hp=[s*d.hw,1],k=add(hp,[s*V(t)[0],V(t)[1]],d.TH);return{h:hp,k,a:add(k,[s*V(sh)[0],V(sh)[1]],d.SH)}};
  const J={P,u,root,nb,head:add(nb,u,1+d.hr),aL:arm(-1,P.aL,P.fL),aR:arm(1,P.aR,P.fR),lL:leg(-1,P.tL,P.sL),lR:leg(1,P.tR,P.sR)};
  const low=Math.max(J.lL.a[1],J.lR.a[1])+1.6;J.off=[RX+P.dx*d.k,GY-low-P.air*d.k];return J}

function draw(look,pose,extra){const d=dims(look),J=fk(pose,d),P=J.P,o=J.off,B=Buf();
  const T=p=>[p[0]+o[0],p[1]+o[1]+(p===undefined?0:0)];const Tu=p=>[p[0]+o[0],p[1]+o[1]+P.bob];
  const skin=tri(TONES[look.tone]),skinB=tri(shade(TONES[look.tone],.22));const OF=look.outfit||null,K=OF?{j:OF.shirt,t:OF.collar||lite(OF.shirt,.35),n:null}:(look.kitC||KITS[look.kit][1]);const jer=tri(K.j),jerB=tri(shade(K.j,.22)),trim=K.t;const pants=OF?tri(OF.pants):null,pantsB=OF?tri(shade(OF.pants,.22)):null;
  const hc=look.hair==="bald"?null:(look.hairC||HAIRC[look.hair]||"#1e1612"),hair=hc?tri(hc):null;const shoe=tri(OF?(OF.shoe||"#2a2630"):(look.shoeC||"#f4f4f4")),shoeB=tri(shade(OF?(OF.shoe||"#2a2630"):(look.shoeC||"#f4f4f4"),.18)),sock=OF?null:"#ffffff";
  const ballC={b:"#e07a2c",s:"#a24f1c",h:"#ffb27a"};
  const ballAt=()=>{const b=P.ball;if(!b)return null;let p;const hf=P.v==="s"?Tu(J.aF.h):Tu(J.aR.h),hb=P.v==="s"?Tu(J.aB.h):Tu(J.aL.h);
    if(b.at==="F"||b.at==="R")p=add(hf,[0,2.4]);else if(b.at==="B"||b.at==="L")p=add(hb,[0,2.4]);else if(b.at==="both")p=add(lerp(hf,hb,.5),[1.2,0]);
    else if(b.at==="ground")p=[hf[0]+(b.gx||0)*d.k,GY-2.6];else if(b.at==="mid"){const h0=b.h==="B"?hb:hf;p=lerp(add(h0,[0,2.4]),[h0[0]+1,GY-2.6],.55)}else if(b.at==="abs")p=[o[0]+b.ox*d.k,GY+b.oy*d.k];
    if(b.at!=="abs"&&b.at!=="ground"&&b.at!=="mid")p=[p[0]+(b.ox||0)*d.k,p[1]+(b.oy||0)*d.k];return p};
  const drawBall=()=>{const p=ballAt();if(!p)return;cap(B,p,p,2.6,ballC,{lx:1});put(B,p[0],p[1],"#5a2a10");put(B,p[0]-1,p[1],"#5a2a10");put(B,p[0]+1,p[1],"#5a2a10");put(B,p[0],p[1]-1,"#5a2a10");put(B,p[0],p[1]+1,"#5a2a10")};
  const lx=1;
  if(P.v==="s"){
    const legDraw=(l,c,sh,sc)=>{const h=T(l.h),k=T(l.k),a=T(l.a);if(OF){const pc=c===skin?pants:pantsB;cap(B,k,a,d.sr+.45,pc,{lx});cap(B,add(a,[-.6,.7]),add(a,[2.6,.9]),1.15,sc,{lx});cap(B,h,k,d.tr+.4,pc,{lx});return}cap(B,k,a,d.sr,c,{lx});cap(B,add(a,[0,-1.3]),a,d.sr*.85,{b:sock});cap(B,add(a,[-.6,.7]),add(a,[2.6,.9]),1.15,sc,{lx});put(B,a[0]+3,a[1]+1.5,"#3a3a46");
      cap(B,lerp(h,k,.5),k,d.tr,c,{lx});cap(B,h,lerp(h,k,.62),d.tr+.7,sh,{lx});{const m=lerp(h,k,.66),ax2=[k[0]-h[0],k[1]-h[1]],L=Math.hypot(ax2[0],ax2[1])||1,pp=[-ax2[1]/L,ax2[0]/L];for(let t=-d.tr-.4;t<=d.tr+.4;t+=.5)put(B,m[0]+pp[0]*t,m[1]+pp[1]*t,trim)}};
    const armDraw=(a,c)=>{const s=Tu(a.s),e=Tu(a.e),h=Tu(a.h);cap(B,s,e,d.ar,c,{lx});cap(B,e,h,d.ar*.92,c,{lx});cap(B,h,h,d.ar+.35,c,{lx});if(OF)cap(B,s,lerp(s,e,.5),d.ar+.55,c===skin?jer:jerB,{lx})};
    armDraw(J.aB,skinB);legDraw(J.lB,skinB,jerB,shoeB);
    if(P.ball&&P.ball.layer==="back")drawBall();
    if(look.hair==="locs"){const hd=Tu(J.head);for(const [ox,oy,ex,ey] of [[-3,-2,-4.6,6],[-2,-3,-3.2,6.5],[-3.6,0,-5,5]])cap(B,[hd[0]+ox,hd[1]+oy],[hd[0]+ex,hd[1]+ey],.75,tri(hc),{lx})}
    const p=[Math.cos(P.lean*Math.PI/180),Math.sin(P.lean*Math.PI/180)],nb=Tu(J.nb),rt=T(J.root);
    const ax=(x,y)=>{const c=lerp(nb,rt,.5);return((x-c[0])*p[0]+(y-c[1])*p[1])/d.tw};
    poly(B,[add(nb,p,d.tw*.9),add(nb,p,-d.tw),add(rt,p,-d.bw),add(rt,p,d.bw)],jer,ax);
    cap(B,add(nb,[0,0]),add(nb,J.u,1.6),1.55,skin,{lx});put(B,nb[0]+p[0]*1.5,nb[1]+p[1]*1.5,trim);put(B,nb[0]+p[0]*2.5,nb[1]+p[1]*2.5,trim);
    cap(B,Tu(J.aF.s),Tu(J.aF.s),1.7,{b:trim});
    poly(B,[add(rt,p,d.bw+.9),add(rt,p,-d.bw-.9),add(add(rt,p,-d.bw-.9),[0,2.6]),add(add(rt,p,d.bw+.9),[0,2.6])],OF?pants:jer,ax);
    if(K.n){const c=lerp(nb,rt,.42);num(B,c[0]+p[0]*.4+.5,c[1]-2,look.no.slice(-1),K.n)}else if(OF&&OF.collar){put(B,nb[0]+p[0]*1.5,nb[1]+p[1]*1.5+1,trim);put(B,nb[0]+p[0]*2.5,nb[1]+p[1]*2.5+1,trim);put(B,nb[0]-p[0]*.5,nb[1]+1,trim)}
    legDraw(J.lF,skin,jer,shoe);
    /* head */
    const hd=Tu(J.head);
    if(look.hair==="afro")cap(B,[hd[0]-.9,hd[1]-1.5],[hd[0]-.9,hd[1]-1.5],5.5,tri(hc),{lx,only:(x,y)=>!((x-hd[0])>.2&&(y-hd[1])>-1.4)});
    cap(B,hd,hd,d.hr,skin,{lx,only:(x,y)=>!(look.hair==="afro"&&(Math.hypot(x-hd[0]+.9,y-hd[1]+1.5)<=5.5)&&!((x-hd[0])>.2&&(y-hd[1])>-1.4))});
    {const ink="#140f1c",brow=hair?hair.b:shade(TONES[look.tone],.55);put(B,hd[0]+d.hr,hd[1]+.4,skin.b);put(B,hd[0]+d.hr,hd[1]+1.2,skin.s);
     put(B,hd[0]+2.2,hd[1]-.3,ink);put(B,hd[0]+1.4,hd[1]-.3,lite(TONES[look.tone],.55));put(B,hd[0]+1.6,hd[1]-1.5,brow);put(B,hd[0]+2.6,hd[1]-1.5,brow);
     put(B,hd[0]+2.8,hd[1]+2.1,shade(TONES[look.tone],.45));put(B,hd[0]+3.4,hd[1]+2.1,shade(TONES[look.tone],.3));
     put(B,hd[0]-1.2,hd[1]+.1,skin.s);put(B,hd[0]-1.2,hd[1]+1.1,skin.s);put(B,hd[0]-.6,hd[1]+.6,shade(TONES[look.tone],.4));
     put(B,hd[0]+.4,hd[1]+3.2,skin.s);put(B,hd[0]+1.4,hd[1]+3.3,skin.s);if(look.beard&&hc){const bc=hc;if(look.beard===1||look.beard===3){put(B,hd[0]+2.8,hd[1]+1.6,bc);put(B,hd[0]+3.4,hd[1]+1.6,bc)}if(look.beard>=2){put(B,hd[0]+2.6,hd[1]+3,bc);put(B,hd[0]+1.8,hd[1]+3.4,bc)}if(look.beard===3){put(B,hd[0]+.8,hd[1]+3.4,bc);put(B,hd[0],hd[1]+2.8,bc);put(B,hd[0]-.6,hd[1]+2,bc)}}}
    if(hair&&look.hair!=="afro"){const th={short:-1.1,fade:-2,locs:-1.2,buzz:-2.6,hightop:-1.1,curly:-1.3,mohawk:-2.6}[look.hair]??-1.1;if(look.hair==="hightop")poly(B,[[hd[0]-3.4,hd[1]-6.6],[hd[0]+2.6,hd[1]-6.6],[hd[0]+3.2,hd[1]-2.2],[hd[0]-3.6,hd[1]-1.6]],hair,null);if(look.hair==="mohawk")cap(B,[hd[0]-2.6,hd[1]-3.6],[hd[0]+1.6,hd[1]-4.6],1.15,hair,{lx});if(look.hair==="curly")for(const [cx,cy] of[[-3,-2.6],[-1.4,-3.8],[.4,-4],[2,-3.4],[-3.6,-.8]])cap(B,[hd[0]+cx,hd[1]+cy],[hd[0]+cx,hd[1]+cy],1.05,hair,{lx});cap(B,hd,hd,d.hr,hair,{lx,only:(x,y)=>{const dx=x-hd[0],dy=y-hd[1];return dy<th+Math.max(0,-dx)*(look.hair==="fade"?.35:.6)}});
      if(look.hair==="fade")cap(B,hd,hd,d.hr,{b:mix(hc,TONES[look.tone],.55)},{lx,only:(x,y)=>{const dx=x-hd[0],dy=y-hd[1];return dx<-1&&dy>-2&&dy<1.5}})}
    if(look.band)cap(B,hd,hd,d.hr+.2,{b:trim},{lx,only:(x,y)=>{const dy=y-hd[1];return dy>-2.6&&dy<-1.4}});
    armDraw(J.aF,skin);if(look.sleeve&&!OF){const s0=Tu(J.aF.s),e0=Tu(J.aF.e);cap(B,lerp(s0,e0,.25),lerp(s0,e0,1.05),d.ar+.35,tri(look.sleeve),{lx})}
    if(!P.ball||P.ball.layer!=="back")drawBall();
  }else{
    const back=P.v==="b";
    const legDraw=(l,s)=>{const h=T(l.h),k=T(l.k),a=T(l.a);if(OF){cap(B,k,a,d.sr+.45,pants,{lx});cap(B,add(a,[-1.4,.8]),add(a,[1.4,.8]),1.2,shoe,{lx});cap(B,h,k,d.tr+.4,pants,{lx});return}cap(B,k,a,d.sr,skin,{lx});cap(B,add(a,[0,-1.3]),a,d.sr*.85,{b:sock});cap(B,add(a,[-1.4,.8]),add(a,[1.4,.8]),1.2,shoe,{lx});
      cap(B,lerp(h,k,.5),k,d.tr,skin,{lx});cap(B,h,lerp(h,k,.6),d.tr+.7,jer,{lx});cap(B,add(lerp(h,k,.15),[s*(d.tr+.3),0]),add(lerp(h,k,.55),[s*(d.tr+.3),0]),.45,{b:trim})};
    const armDraw=(a)=>{const s=Tu(a.s),e=Tu(a.e),h=Tu(a.h);cap(B,s,e,d.ar,skin,{lx});cap(B,e,h,d.ar*.92,skin,{lx});cap(B,h,h,d.ar+.35,skin,{lx});if(OF)cap(B,s,lerp(s,e,.5),d.ar+.55,jer,{lx})};
    legDraw(J.lL,-1);legDraw(J.lR,1);
    const nb=Tu(J.nb),rt=T(J.root);
    const ax=(x)=>((x-nb[0])/(d.sw+1))*.9;
    poly(B,[[nb[0]-d.sw-.6,nb[1]+.6],[nb[0]+d.sw+.6,nb[1]+.6],[rt[0]+d.hw+1.6,rt[1]],[rt[0]-d.hw-1.6,rt[1]]],jer,ax);
    poly(B,[[rt[0]-d.hw-2.2,rt[1]-.5],[rt[0]+d.hw+2.2,rt[1]-.5],[rt[0]+d.hw+2.6,rt[1]+3.2],[rt[0]-d.hw-2.6,rt[1]+3.2]],OF?pants:jer,ax);
    cap(B,add(nb,[0,-1.4]),nb,1.6,skin,{lx});
    if(!back){put(B,nb[0],nb[1]+1,trim);put(B,nb[0]-1,nb[1],trim);put(B,nb[0]+1,nb[1],trim)}
    if(K.n)num(B,nb[0]+.5,nb[1]+3,look.no,K.n);
    for(const s of[-1,1])cap(B,[nb[0]+s*d.sw,nb[1]+1.6],[nb[0]+s*d.sw,nb[1]+1.6],1.6,{b:trim});
    const hd=Tu(J.head);
    if(look.hair==="afro")cap(B,[hd[0],hd[1]-1.5],[hd[0],hd[1]-1.5],5.7,tri(hc),{lx});
    if(look.hair==="locs")for(const s of[-1,1])cap(B,[hd[0]+s*3.2,hd[1]-1],[hd[0]+s*3.8,hd[1]+5.5],.85,tri(hc),{lx});
    cap(B,hd,hd,d.hr,skin,{lx,only:(x,y)=>look.hair!=="afro"||(y-hd[1])>-1.6});
    if(back&&hair){cap(B,hd,hd,d.hr,hair,{lx,only:(x,y)=>(y-hd[1])<(look.hair==="buzz"?-.5:1.6)})}
    else if(!back){const ink="#140f1c",brow=hair?hair.b:shade(TONES[look.tone],.55),wh=lite(TONES[look.tone],.55);
      put(B,hd[0]-1.7,hd[1]-.2,ink);put(B,hd[0]+1.5,hd[1]-.2,ink);
      put(B,hd[0]-2.2,hd[1]-1.4,brow);put(B,hd[0]-1.3,hd[1]-1.4,brow);put(B,hd[0]+1.1,hd[1]-1.4,brow);put(B,hd[0]+2,hd[1]-1.4,brow);
      put(B,hd[0]-.1,hd[1]+1,skin.s);put(B,hd[0]-.6,hd[1]+2.4,shade(TONES[look.tone],.42));put(B,hd[0]+.4,hd[1]+2.4,shade(TONES[look.tone],.42));put(B,hd[0]+1.2,hd[1]+2.2,shade(TONES[look.tone],.3));
      put(B,hd[0]-d.hr-.6,hd[1]+.3,skin.s);put(B,hd[0]+d.hr+.2,hd[1]+.3,skin.s);if(look.beard&&hc){const bc=hc;if(look.beard===1||look.beard===3){put(B,hd[0]-.8,hd[1]+1.6,bc);put(B,hd[0]+.6,hd[1]+1.6,bc)}if(look.beard>=2){put(B,hd[0]-.1,hd[1]+3.2,bc);put(B,hd[0]+.5,hd[1]+3.2,bc)}if(look.beard===3){for(const x of[-2.6,-1.8,1.6,2.4])put(B,hd[0]+x,hd[1]+2.6,bc)}}
      if(hair&&look.hair!=="afro"){const th={short:-1.4,fade:-2.1,locs:-1.4,buzz:-2.7,hightop:-1.4,curly:-1.5,mohawk:-9}[look.hair]??-1.4;if(look.hair==="hightop")poly(B,[[hd[0]-3.4,hd[1]-6.8],[hd[0]+3.4,hd[1]-6.8],[hd[0]+3.6,hd[1]-2],[hd[0]-3.6,hd[1]-2]],hair,null);if(look.hair==="mohawk")cap(B,[hd[0],hd[1]-2.6],[hd[0],hd[1]-5],1.1,hair,{lx});if(look.hair==="curly")for(const cx of[-3,-1.5,0,1.5,3])cap(B,[hd[0]+cx,hd[1]-3.4-(Math.abs(cx)<2?.6:0)],[hd[0]+cx,hd[1]-3.4],1.05,hair,{lx});cap(B,hd,hd,d.hr,hair,{lx,only:(x,y)=>(y-hd[1])<th||(look.hair!=="buzz"&&look.hair!=="fade"&&Math.abs(x-hd[0])>3.3&&(y-hd[1])<.4)})}}
    if(look.band)cap(B,hd,hd,d.hr+.2,{b:trim},{lx,only:(x,y)=>{const dy=y-hd[1];return dy>-2.6&&dy<-1.4}});
    armDraw(J.aL);armDraw(J.aR);
    drawBall();
  }
  /* motion: a ball trail and limb smears, drawn after the outline so they read as blur, not as objects */
  if(P.ball&&P.ball.trail){const p=ballAt();if(p)P.ball.trail.forEach((t,i)=>{const q=[p[0]+t[0],p[1]+t[1]],n=Math.ceil(Math.hypot(t[0],t[1]));for(let j=1;j<=n;j++){const r=lerp(p,q,j/n);B.post.push([r[0],r[1],j/n<.5?"#f0a060":"#f7cba0"]);B.post.push([r[0],r[1]+1,"#f7cba0"])}})}
  if(P.smear&&P.v==="s"){const d0=d,arm=P.smear.arm==="B"?"B":"F";const cur=J["a"+arm].h,prev=(()=>{const e=add(J["a"+arm].s,V(P.smear.a),d0.UA);return add(e,V(P.smear.f),d0.FA)})();const c0=Tu(cur),c1=Tu(prev);
    for(let j=2;j<=5;j++){const t=j/7,mid=lerp(c0,c1,t),bend=Math.sin(t*Math.PI)*2.2;const nx=-(c1[1]-c0[1]),ny=c1[0]-c0[0],L=Math.hypot(nx,ny)||1;const q=[mid[0]+nx/L*bend,mid[1]+ny/L*bend];B.post.push([q[0],q[1],t<.5?lite(TONES[look.tone],.35):lite(TONES[look.tone],.6)])}}
  if(P.dust){const f=[o[0]+(P.dust==="b"?-3:0),GY];for(const [x,y] of[[-5,0],[-4,-1],[5,0],[4,-1],[-6,-1],[6,-1]])B.post.push([f[0]+x,f[1]+y,"#e8cfa6"])}
  outline(B);
  for(const [x,y,c] of B.post){const X=Math.round(x),Y=Math.round(y);if(X>=0&&Y>=0&&X<W&&Y<H&&!B.c[Y*W+X])B.c[Y*W+X]=c}
  if(P.flip){const c=new Array(W*H).fill(null),cx=o[0];for(let y=0;y<H;y++)for(let x=0;x<W;x++){const nx=Math.round(2*cx-x);if(nx>=0&&nx<W)c[y*W+nx]=B.c[y*W+x]}B.c=c}
  return{B,J,d}}

/* ---------------- animations ---------------- */
const S=(o)=>({v:"s",...o}),F=(o)=>({v:"f",...o}),BK=(o)=>({v:"b",...o});
const swap=p=>{const q={...p};[q.tF,q.tB]=[p.tB,p.tF];[q.sF,q.sB]=[p.sB,p.sF];[q.aF,q.aB]=[p.aB,p.aF];[q.fF,q.fB]=[p.fB,p.fF];return q};
const RA=S({lean:14,tF:42,sF:8,tB:-28,sB:-85,aF:-38,fF:25,aB:40,fB:115}),RB=S({lean:14,tF:18,sF:-25,tB:-8,sB:-60,aF:-15,fF:50,aB:22,fB:95,air:1.5}),RC=S({lean:14,tF:-15,sF:-35,tB:22,sB:-15,aF:12,fF:80,aB:-12,fB:45,air:.5});
const RUN=[RA,RB,RC,swap(RA),swap(RB),swap(RC)];
const DB=S({lean:12,tF:30,sF:-6,tB:-14,sB:-22,aF:22,fF:70,aB:45,fB:85});
const TT=S({lean:16,tF:36,sF:-10,tB:-6,sB:-28,aF:25,fF:115,aB:20,fB:120,ball:{at:"both"}});
const FS=F({}),CROUCH=S({lean:12,tF:32,sF:-10,tB:-10,sB:-24,aF:50,fF:80,aB:35,fB:70});
const A=[
 {k:"idle",n:"Idle",fps:3,uses:"Waiting on the card, free throws, the bench.",frames:[FS,F({bob:1,aL:12,aR:12})]},
 {k:"run",n:"Run",fps:11,uses:"Transition, cuts, getting back on defense.",frames:RUN},
 {k:"drive",n:"Drive",fps:11,uses:"Drive, attack the rim, the run-out.",frames:RUN.map((r,i)=>({...r,aF:24,fF:68,ball:{at:["F","mid","ground","mid","F","mid"][i],gx:3}}))},
 {k:"dribble",n:"Dribble",fps:8,uses:"Top of the key, sizing him up.",frames:[{...DB,fF:76,ball:{at:"F"}},{...DB,fF:64,ball:{at:"mid"}},{...DB,fF:52,ball:{at:"ground",gx:2}},{...DB,fF:64,ball:{at:"mid"}}]},
 {k:"cross",n:"Crossover",fps:10,uses:"Crossover. Fails into a picked-up dribble.",frames:[{...DB,fF:76,ball:{at:"F"}},{...DB,lean:20,fF:55,ball:{at:"abs",ox:7,oy:-8}},{...DB,lean:22,tF:38,sF:-10,aF:30,fF:40,ball:{at:"abs",ox:6,oy:-2.6}},S({lean:18,dx:1,tF:35,sF:-8,tB:-16,sB:-25,aF:-15,fF:30,aB:30,fB:60,ball:{at:"B",layer:"back"}}),S({lean:16,dx:2,tF:48,sF:5,tB:-22,sB:-40,aF:-25,fF:20,aB:22,fB:50,ball:{at:"mid",h:"B",layer:"back"}}),{...RA,dx:3,aB:25,fB:55,ball:{at:"B",layer:"back"}}]},
 {k:"spin",n:"Spin move",fps:9,uses:"Spin baseline out of the post, or off a drive.",frames:[{...DB,fF:76,ball:{at:"F"}},{...DB,lean:20,tF:40,sF:-10,aF:-10,fF:30,dx:1,ball:{at:"F"}},BK({tL:20,sL:0,tR:12,sR:-5,aL:20,fL:30,aR:35,fR:70,dx:2,ball:{at:"R"}}),{...DB,flip:1,lean:18,dx:3,fF:70,ball:{at:"F"}},F({tL:25,sL:5,tR:10,sR:0,aL:40,fL:80,aR:15,fR:20,dx:4,ball:{at:"L"}}),{...RA,dx:5,aF:24,fF:68,ball:{at:"F"}},{...RB,dx:6,aF:24,fF:68,ball:{at:"mid"}},{...RC,dx:7,aF:24,fF:68,ball:{at:"ground",gx:3}}]},
 {k:"pump",n:"Pump fake",fps:7,uses:"Pump fake. Get him in the air.",frames:[TT,TT,S({lean:4,tF:16,sF:2,tB:-4,sB:-10,aF:150,fF:175,aB:140,fB:178,air:1,ball:{at:"both",oy:-1}}),S({lean:4,tF:16,sF:2,tB:-4,sB:-10,aF:150,fF:175,aB:140,fB:178,air:1,ball:{at:"both",oy:-1}}),TT,TT]},
 {k:"shot",n:"Jump shot",fps:11,uses:"Pull-up, catch and shoot, step-back, fadeaway.",frames:[TT,S({lean:20,tF:48,sF:-14,tB:-2,sB:-40,aF:30,fF:120,aB:25,fB:125,ball:{at:"both"}}),S({lean:4,tF:12,sF:6,tB:-6,sB:-8,aF:120,fF:165,aB:110,fB:160,air:3,ball:{at:"both"}}),S({lean:0,tF:8,sF:4,tB:-8,sB:-12,aF:165,fF:178,aB:150,fB:175,air:7,ball:{at:"F",oy:-2.5}}),S({lean:0,tF:6,sF:4,tB:-8,sB:-12,aF:170,fF:118,aB:150,fB:175,air:8,ball:{at:"F",ox:3,oy:-7}}),S({lean:0,tF:6,sF:4,tB:-8,sB:-12,aF:168,fF:115,aB:140,fB:160,air:6,ball:{at:"F",ox:9,oy:-15}}),S({lean:2,tF:10,sF:0,tB:-8,sB:-14,aF:165,fF:115,aB:110,fB:130,air:3,ball:{at:"F",ox:15,oy:-21}}),S({lean:10,tF:30,sF:-8,tB:-10,sB:-22,aF:60,fF:90,aB:40,fB:80}),S({})]},
 {k:"layup",n:"Layup",fps:10,uses:"Layup, layup through the help, the run-out.",frames:[{...RA,aF:30,fF:115,aB:25,fB:120,ball:{at:"both"}},{...RC,aF:30,fF:115,aB:25,fB:120,ball:{at:"both"}},S({lean:8,tF:80,sF:-5,tB:-15,sB:-20,aF:70,fF:140,aB:60,fB:135,air:3,ball:{at:"both"}}),S({lean:4,tF:95,sF:0,tB:-8,sB:-15,aF:150,fF:170,aB:110,fB:150,air:9,ball:{at:"F",oy:-2.5}}),S({lean:2,tF:90,sF:5,tB:-6,sB:-12,aF:168,fF:178,aB:100,fB:140,air:11,ball:{at:"F",ox:1,oy:-5}}),S({lean:6,tF:60,sF:-5,tB:-6,sB:-10,aF:150,fF:150,aB:80,fB:110,air:7,ball:{at:"F",ox:4,oy:-9}}),S({lean:10,tF:35,sF:-10,tB:-5,sB:-15,aF:80,fF:100,aB:50,fB:80,air:2}),CROUCH]},
 {k:"dunk",n:"Dunk",fps:10,rim:true,uses:"Dunk, the lob, the run-out slam.",frames:[{...RA,aF:30,fF:115,aB:25,fB:120,ball:{at:"both"}},S({lean:22,tF:52,sF:-18,tB:46,sB:-24,aF:20,fF:110,aB:15,fB:115,ball:{at:"both"}}),S({lean:6,tF:20,sF:5,tB:-10,sB:-15,aF:160,fF:175,aB:150,fB:172,air:6,ball:{at:"both",oy:-1}}),S({lean:-4,tF:30,sF:-30,tB:5,sB:-40,aF:195,fF:215,aB:185,fB:210,air:14,ball:{at:"F",oy:-1}}),S({lean:10,tF:35,sF:-35,tB:5,sB:-45,aF:150,fF:125,aB:140,fB:100,air:18,ball:{at:"F",ox:1,oy:1},slam:1}),S({lean:4,tF:20,sF:-20,tB:-5,sB:-30,aF:172,fF:178,aB:120,fB:110,air:16,ball:{at:"rim",oy:7},hang:1}),S({lean:6,tF:25,sF:-10,tB:-5,sB:-20,aF:150,fF:160,aB:80,fB:100,air:9,ball:{at:"rim",oy:16}}),{...CROUCH,ball:{at:"rimfloor"}},S({ball:{at:"rimfloor"}})]},
 {k:"block",n:"Block",fps:10,uses:"Go for the block. Rotate and contest.",frames:[S({lean:14,tF:30,sF:-10,tB:-18,sB:-25,aF:70,fF:95,aB:55,fB:85}),S({lean:22,tF:50,sF:-20,tB:30,sB:-25,aF:40,fF:60,aB:30,fB:50}),S({lean:4,tF:15,sF:5,tB:-5,sB:-10,aF:150,fF:170,aB:140,fB:165,air:5}),S({lean:0,tF:20,sF:-10,tB:-5,sB:-20,aF:172,fF:180,aB:160,fB:178,air:11,ball:{at:"F",ox:3,oy:-5}}),S({lean:8,tF:25,sF:-15,tB:-5,sB:-20,aF:135,fF:105,aB:155,fB:170,air:11,ball:{at:"F",ox:7,oy:3}}),S({lean:8,tF:25,sF:-15,tB:-5,sB:-20,aF:110,fF:100,aB:120,fB:140,air:5,ball:{at:"F",ox:14,oy:10}}),S({lean:14,tF:30,sF:-10,tB:-18,sB:-25,aF:70,fF:95,aB:55,fB:85})]},
 {k:"slide",n:"Defensive slide",fps:8,uses:"Hands up, stay down. Staying in front.",frames:(()=>{const w={tL:26,sL:8,tR:26,sR:8,aL:72,fL:118,aR:72,fR:118},t={tL:10,sL:2,tR:10,sR:2,aL:72,fL:118,aR:72,fR:118};return[0,1,2,3,4,3,2,1].map((x,i)=>F({...(i%2?t:w),dx:x}))})()},
 {k:"cele",n:"Celebrate",fps:7,uses:"And-one, the buzzer-beater, a title.",frames:[FS,F({aL:100,fL:150,aR:100,fR:150}),F({aL:150,fL:175,aR:150,fR:175,air:4}),F({aL:160,fL:178,aR:160,fR:178,air:6}),F({aL:150,fL:175,aR:150,fR:175,air:2}),F({aL:100,fL:150,aR:100,fR:150})]}
];

/* motion pass: ball trails, arm smears, the dunk's load, and landings that hit the floor */
{const get=k=>A.find(x=>x.k===k),tr=(k,i,t)=>{const f=get(k).frames[i];get(k).frames[i]={...f,ball:{...f.ball,trail:t}}},mo=(k,i,o)=>{const f=get(k).frames[i];get(k).frames[i]={...f,...o}};
  tr("dribble",1,[[0,-3]]);tr("dribble",3,[[0,3]]);
  tr("cross",1,[[-2,-6]]);tr("cross",2,[[1,-5]]);tr("cross",3,[[3,5]]);mo("cross",3,{smear:{arm:"F",a:30,f:40}});
  mo("spin",1,{smear:{arm:"F",a:22,f:76}});mo("spin",3,{smear:{arm:"F",a:-10,f:30}});
  tr("shot",4,[[-3,5]]);tr("shot",5,[[-5,7]]);mo("shot",4,{smear:{arm:"F",a:165,f:178}});
  {const sh=get("shot");const impact=S({lean:14,tF:46,sF:-15,tB:-8,sB:-32,aF:55,fF:80,aB:35,fB:70,dust:"f"});sh.frames.splice(7,1,impact,S({lean:8,tF:24,sF:-6,tB:-8,sB:-18,aF:40,fF:60,aB:25,fB:50}))}
  tr("layup",4,[[-2,4]]);tr("layup",5,[[-3,4]]);
  {const dk=get("dunk");const load=S({lean:28,tF:64,sF:-28,tB:56,sB:-32,aF:-30,fF:40,aB:-36,fB:28,ball:{at:"both",ox:-2}});
    dk.frames.splice(2,0,load);const si=dk.frames.findIndex(f=>f.slam);dk.frames[si]={...dk.frames[si],smear:{arm:"F",a:195,f:215},ball:{...dk.frames[si].ball,trail:[[-2,-7]]}};
    const li=dk.frames.findIndex(f=>f.ball&&f.ball.at==="rimfloor");dk.frames[li]={...S({lean:16,tF:48,sF:-16,tB:-6,sB:-30,aF:60,fF:85,aB:40,fB:70}),ball:{at:"rimfloor"},dust:"f"}}
  mo("block",4,{smear:{arm:"F",a:172,f:180}});tr("block",4,[[-4,-6]]);tr("block",5,[[-6,-6]]);
  {const bl=get("block");bl.frames.splice(6,0,S({lean:18,tF:44,sF:-15,tB:-12,sB:-30,aF:60,fF:85,aB:45,fB:75,dust:"f"}))}
  mo("cele",3,{smear:{arm:"F",a:100,f:150}})}

/* ---------------- the rest of the card calls ---------------- */
const OPP=look=>({...look,ht:76,build:1,tone:1,hair:"fade",no:"4",kitC:{j:"#f3f1ec",t:KITS[look.kit][1].j==="#f3f1ec"?"#b8322a":KITS[look.kit][1].j,n:KITS[look.kit][1].j==="#f3f1ec"?"#b8322a":KITS[look.kit][1].j}});
const BIG=look=>({...look,ht:83,build:2,tone:4,hair:"buzz",no:"34"});
const MATE2=look=>({...look,ht:75,build:0,tone:2,hair:"short",no:"5"});
const dr=(r,o)=>({...r,aF:24,fF:68,...o});
{const J1=S({lean:20,tF:58,sF:14,tB:-12,sB:-32,aF:18,fF:72,aB:28,fB:112,ball:{at:"F",ox:-3,oy:-2}});
 A.push({k:"jab",n:"Jab step",fps:7,uses:"Jab step. Read him; a little space if he bites.",frames:[TT,J1,{...J1,dust:"f"},TT,{...J1,tF:50},TT]});}
{const P1=S({lean:-12,tF:20,sF:-5,tB:-35,sB:-15,aF:30,fF:60,aB:-70,fB:-50,ball:{at:"F",oy:1}}),P2={...P1,lean:-16,dx:-1,fF:45,ball:{at:"ground",gx:1}};
 A.push({k:"post",n:"Post moves",fps:7,uses:"Post up, back him down, drop step. Spin baseline uses the spin.",frames:[P1,P2,{...P1,dx:-1},{...P2,dx:-2},
  S({flip:1,dx:-3,lean:10,tF:-10,sF:-25,tB:55,sB:5,aF:40,fF:110,aB:30,fB:115,ball:{at:"both",trail:[[3,1]]},dust:"f"}),S({flip:1,dx:-4,lean:18,tF:45,sF:-15,tB:35,sB:-15,aF:30,fF:115,aB:25,fB:120,ball:{at:"both"}}),
  S({flip:1,dx:-4,lean:2,tF:15,sF:5,tB:-5,sB:-10,aF:165,fF:175,aB:150,fB:170,air:6,ball:{at:"F",oy:-3}}),{...CROUCH,flip:1,dx:-4,dust:"f"}]});}
A.push({k:"euro",n:"Euro step",fps:9,uses:"Euro step. Sidestep the help into the lane.",frames:[{...RA,aF:30,fF:115,aB:25,fB:120,ball:{at:"both"}},
  S({dx:2,lean:-4,tF:62,sF:12,tB:-28,sB:-45,aF:-10,fF:40,aB:20,fB:60,ball:{at:"B",layer:"back",trail:[[3,-2]]}}),S({dx:3,lean:6,tF:20,sF:-20,tB:10,sB:-50,aF:0,fF:50,aB:15,fB:60,air:1.5,ball:{at:"B",layer:"back"}}),
  S({dx:5,lean:20,tF:-20,sF:-35,tB:58,sB:10,aF:30,fF:110,aB:-10,fB:40,ball:{at:"F",trail:[[-4,0]]},smear:{arm:"F",a:0,f:50}}),S({dx:6,lean:8,tF:85,sF:-5,tB:-15,sB:-20,aF:100,fF:150,aB:60,fB:120,air:4,ball:{at:"F",oy:-2}}),
  S({dx:7,lean:2,tF:90,sF:5,tB:-6,sB:-12,aF:168,fF:178,aB:100,fB:140,air:10,ball:{at:"F",ox:1,oy:-5}}),S({dx:8,lean:6,tF:60,sF:-5,tB:-6,sB:-10,aF:150,fF:150,aB:80,fB:110,air:6,ball:{at:"F",ox:4,oy:-9,trail:[[-2,4]]}}),{...CROUCH,dx:9,dust:"f"}]});
A.push({k:"hook",n:"Hook shot",fps:8,uses:"Hook shot off the seal, or off a failed drop step.",frames:[S({lean:-4,tF:25,sF:-8,tB:-20,sB:-25,aF:30,fF:115,aB:25,fB:120,ball:{at:"both"}}),
  S({lean:-8,tF:45,sF:5,tB:-20,sB:-30,aF:60,fF:70,aB:80,fB:100,ball:{at:"F",oy:1}}),S({lean:-14,tF:50,sF:-30,tB:-10,sB:-20,aF:120,fF:150,aB:85,fB:95,air:3,ball:{at:"F"},smear:{arm:"F",a:60,f:70}}),
  S({lean:-18,tF:55,sF:-35,tB:-8,sB:-18,aF:170,fF:200,aB:85,fB:95,air:6,ball:{at:"F",ox:-1,oy:-3}}),S({lean:-14,tF:50,sF:-30,tB:-8,sB:-18,aF:172,fF:160,aB:80,fB:90,air:6,ball:{at:"F",ox:-4,oy:-11,trail:[[2,6]]}}),{...CROUCH,dust:"f"}]});
A.push({k:"float",n:"Floater",fps:9,uses:"Floater over the help. Soft and high.",frames:[{...RA,aF:30,fF:115,aB:25,fB:120,ball:{at:"both"}},{...RC,aF:40,fF:130,aB:30,fB:125,ball:{at:"both"}},
  S({lean:10,tF:72,sF:-8,tB:-20,sB:-25,aF:110,fF:150,aB:60,fB:110,air:3,ball:{at:"F",oy:-1}}),S({lean:6,tF:78,sF:-4,tB:-14,sB:-20,aF:145,fF:150,aB:70,fB:100,air:6,ball:{at:"F",ox:3,oy:-5,trail:[[-2,3]]}}),
  S({lean:6,tF:70,sF:-6,tB:-12,sB:-18,aF:140,fF:140,aB:60,fB:90,air:4,ball:{at:"F",ox:9,oy:-16,trail:[[-3,5]]}}),{...CROUCH,dust:"f"}]});
A.push({k:"lob",n:"Lob catch",fps:10,rim:true,uses:"Throw the lob. The big catches it at the rim and finishes.",frames:[{...RA},{...RC},S({lean:26,tF:62,sF:-26,tB:54,sB:-30,aF:-35,fF:30,aB:-40,fB:25}),
  S({lean:4,tF:20,sF:5,tB:-10,sB:-15,aF:160,fF:175,aB:150,fB:172,air:6,ball:{at:"abs",ox:-16,oy:-60,trail:[[-6,4]]}}),
  S({lean:-2,tF:30,sF:-30,tB:5,sB:-40,aF:185,fF:205,aB:180,fB:200,air:14,ball:{at:"F",oy:-1,trail:[[-6,3]]},smear:{arm:"F",a:160,f:175}}),
  S({lean:10,tF:35,sF:-35,tB:5,sB:-45,aF:150,fF:125,aB:140,fB:100,air:18,ball:{at:"F",ox:1,oy:1,trail:[[-2,-7]]},slam:1,smear:{arm:"F",a:195,f:215}}),
  S({lean:4,tF:20,sF:-20,tB:-5,sB:-30,aF:172,fF:178,aB:120,fB:110,air:16,ball:{at:"rim",oy:7}}),S({lean:6,tF:25,sF:-10,tB:-5,sB:-20,aF:150,fF:160,aB:80,fB:100,air:9,ball:{at:"rim",oy:16}}),
  {...S({lean:16,tF:48,sF:-16,tB:-6,sB:-30,aF:60,fF:85,aB:40,fB:70}),ball:{at:"rimfloor"},dust:"f"}]});
{const st=S({lean:16,tF:32,sF:-10,tB:-20,sB:-25,aF:65,fF:90,aB:50,fB:80});
 A.push({k:"steal",n:"Steal",fps:9,uses:"Gamble for the steal. Jump the passing lane.",partner:{look:OPP,frames:[{...DB,flip:1,dx:27,fF:76,ball:{at:"F"}},{...DB,flip:1,dx:27,fF:52,ball:{at:"ground",gx:2}},{...DB,flip:1,dx:27,fF:70,ball:{at:"F"}},{...DB,flip:1,dx:27,lean:4,aF:40,fF:40},{...DB,flip:1,dx:27,lean:0,aF:20,fF:30,aB:20,fB:30},S({flip:1,dx:27}),S({flip:1,dx:27}),S({flip:1,dx:27})]},
  frames:[st,{...st,dx:2},S({lean:28,dx:6,tF:58,sF:6,tB:-25,sB:-40,aF:85,fF:80,aB:30,fB:40,smear:{arm:"F",a:65,f:90}}),S({lean:28,dx:6,tF:58,sF:6,tB:-25,sB:-40,aF:80,fF:70,aB:30,fB:40,ball:{at:"abs",ox:15,oy:-9,trail:[[5,-3]]}}),
   S({lean:24,dx:3,tF:45,sF:-10,tB:-20,sB:-35,aF:40,fF:70,aB:20,fB:40,ball:{at:"F",oy:1}}),dr(RA,{flip:1,dx:1,ball:{at:"F"}}),dr(RB,{flip:1,dx:-1,ball:{at:"mid"}}),dr(RC,{flip:1,dx:-3,ball:{at:"ground",gx:3}})]});}
{const set=S({lean:2,tF:12,sF:0,tB:-10,sB:-6,aF:40,fF:150,aB:35,fB:155}),sit=S({sit:1,dx:-3,lean:-25,tF:85,sF:80,tB:80,sB:85,aF:-45,fF:-30,aB:-50,fB:-35});
 A.push({k:"charge",n:"Take the charge",fps:8,uses:"Take the charge. Set your feet and take the hit.",partner:{look:OPP,frames:[dr(RA,{flip:1,dx:30,ball:{at:"F"}}),dr(RB,{flip:1,dx:24,ball:{at:"mid"}}),dr(RC,{flip:1,dx:18,ball:{at:"F"}}),{...RA,flip:1,dx:13,aF:30,fF:115,aB:25,fB:120,ball:{at:"both"}},
   S({flip:1,dx:10,lean:25,tF:40,sF:-10,tB:-25,sB:-40,aF:60,fF:110,aB:50,fB:100,ball:{at:"both"}}),S({flip:1,dx:9,lean:12,tF:20,sF:-5,tB:-10,sB:-15,aF:20,fF:90,aB:15,fB:90,ball:{at:"both"}}),S({flip:1,dx:9,aF:20,fF:100,aB:15,fB:100,ball:{at:"both"}}),S({flip:1,dx:9,aF:20,fF:100,aB:15,fB:100,ball:{at:"both"}})]},
  frames:[set,set,set,S({lean:-6,tF:15,sF:0,tB:-12,sB:-8,aF:35,fF:150,aB:30,fB:150}),S({lean:-35,dx:-1,tF:40,sF:30,tB:20,sB:10,aF:-30,fF:-10,aB:-40,fB:-20,air:2}),{...sit,dust:"b"},sit,sit]});}
A.push({k:"cut",n:"Cut",fps:9,uses:"Cut to the rim off the ball. Call for it.",frames:[{...RB,lean:6,air:0},{...RC,lean:6},S({lean:-8,tF:55,sF:20,tB:-20,sB:-40,aF:-20,fF:20,aB:20,fB:50,dust:"f"}),{...RA,lean:20,dx:2,aF:150,fF:170},
  {...RB,lean:20,dx:4,aF:155,fF:172,aB:22,fB:95,ball:{at:"abs",ox:-8,oy:-44,trail:[[-6,2]]}},{...RC,dx:6,lean:14,aF:40,fF:120,aB:35,fB:120,ball:{at:"both",trail:[[-5,-3]]}},{...RA,dx:8,aF:30,fF:115,aB:25,fB:120,ball:{at:"both"}}]});
{const set=F({tL:22,sL:4,tR:22,sR:4,aL:20,fL:-70,aR:20,fR:-70});
 A.push({k:"screen",n:"Screen",fps:8,uses:"Set the screen, then roll to the rim. Hand-offs and off-ball screens too.",partner:{look:MATE2,frames:[{...DB,dx:-16,fF:76,ball:{at:"F"}},dr(RA,{dx:-10,ball:{at:"F"}}),dr(RB,{dx:-4,ball:{at:"mid"}}),dr(RC,{dx:2,ball:{at:"ground",gx:3}}),dr(RA,{dx:8,ball:{at:"F"}}),dr(RB,{dx:14,ball:{at:"mid"}}),dr(RC,{dx:20,ball:{at:"ground",gx:3}}),{...DB,dx:24,fF:76,ball:{at:"F"}}]},
  frames:[{...RC,lean:6,dx:-4},set,{...set,bob:1},set,set,{...set,dust:"f"},{...RA,dx:2},{...RB,dx:4,aF:150,fF:170}]});}
A.push({k:"handoff",n:"Hand-off",fps:8,uses:"Hand-off with your big. Come off it with space.",partner:{look:BIG,frames:[F({dx:4,aL:30,fL:120,aR:30,fR:120,ball:{at:"both"}}),F({dx:4,aL:30,fL:120,aR:30,fR:120,ball:{at:"both"}}),F({dx:4,aL:30,fL:120,aR:30,fR:120,ball:{at:"both"}}),F({dx:4,aL:30,fL:120,aR:40,fR:110,ball:{at:"both"}}),F({dx:4,aL:20,fL:60,aR:70,fR:85,ball:{at:"R"}}),F({dx:4,aL:15,fL:20,aR:30,fR:40}),F({dx:4}),F({dx:4})]},
  frames:[{...RA,dx:-18},{...RB,dx:-14},{...RC,dx:-10},{...RA,dx:-6,aF:60,fF:90},{...RB,dx:-2,aF:70,fF:80},dr(RC,{dx:2,ball:{at:"F",trail:[[-3,-3]]}}),dr(RA,{dx:6,ball:{at:"mid"}}),dr(RB,{dx:10,ball:{at:"ground",gx:3}})]});

const LUT={};for(const a of A)LUT[a.k]=a;
const CACHE=new Map();
function toCanvas(B){const c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d"),img=x.createImageData(W,H);for(let p=0;p<W*H;p++){const v=B.c[p];if(!v)continue;const q=hx(v);img.data[p*4]=q[0];img.data[p*4+1]=q[1];img.data[p*4+2]=q[2];img.data[p*4+3]=255}x.putImageData(img,0,0);return c}
function keyOf(look){return[look.tone,look.hair,look.hairC,look.ht,look.build,look.k||1,look.no,look.band||"",look.beard||0,look.sleeve||"",look.shoeC||"",look.kitC?look.kitC.j+look.kitC.t+look.kitC.n:look.kit,look.outfit?JSON.stringify(look.outfit):""].join("|")}
function frame(look,anim,i,opt){opt=opt||{};const a=LUT[anim]||LUT.idle,n=a.frames.length,fi=((i%n)+n)%n;const key=keyOf(look)+"#"+anim+"#"+fi+"#"+(opt.flip?1:0)+(opt.noBall?"n":"");let c=CACHE.get(key);if(c)return c;
  let f=a.frames[fi];if(opt.noBall&&f.ball)f={...f,ball:null};if(opt.flip)f={...f,flip:!f.flip};c=toCanvas(draw(look,f).B);if(CACHE.size>2400)CACHE.clear();CACHE.set(key,c);return c}
function pose(look,p){const key=keyOf(look)+"#P#"+JSON.stringify(p);let c=CACHE.get(key);if(c)return c;c=toCanvas(draw(look,p).B);if(CACHE.size>2400)CACHE.clear();CACHE.set(key,c);return c}
const count=k=>(LUT[k]||LUT.idle).frames.length;
/* the game's stored look (lookOf) mapped onto these bodies */
const STY=["short","afro","hightop","bald","locs","mohawk","curly","buzz"];
function fromGame(lk,ht,kit,no,extra){lk=lk||{};const h=ht||78;return{tone:clamp(lk.skin??2,0,5),hair:STY[lk.style??0]||"short",hairC:(typeof HAIR!=="undefined"&&HAIR[lk.hair??0])||"#1e1612",ht:h,build:lk.build?2:h<=75?0:1,no:no==null?"":String(no).slice(-2),
  band:lk.band?(typeof lk.band==="string"?lk.band:(kit&&kit.t)||"#f4f1ea"):false,beard:lk.beard||0,sleeve:lk.sleeve?((kit&&kit.t)||"#1d2030"):"",shoeC:typeof SHOEC!=="undefined"?SHOEC[lk.shoe??1]:"#f4f4f4",kitC:kit||{j:"#2b5fd9",t:"#ffffff",n:"#ffffff"},kit:0,...(extra||{})}}
return{frame,pose,count,fromGame,W,H,RX,GY,anims:Object.keys(LUT)};
})();
window.SPR=SPR;

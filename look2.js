/* ---------- look2.js: the showcase, the small avatars and the portraits use the original sprites (sprites.js).
   Loaded last so these definitions replace the older drawers. ---------- */
function drawShow(cv,o){if(typeof SPR==="undefined")return;const L=o.look||{},b=o.body||{ht:78,wt:205},m=(b.wt-(b.ht*2.85-22))/40;
  const nl=SPR.fromGame({...L,build:L.build||m>1?1:0},b.ht,{j:o.jersey||"#2f6fd6",t:o.trim||"#f4f1ea",n:o.trim||"#f4f1ea"},o.num,{k:1});
  const src=o.view==="back"?SPR.pose(nl,{v:"b"}):SPR.frame(nl,"idle",Math.floor((o.t||0)*2),{});
  const g=cv.getContext("2d");g.imageSmoothingEnabled=false;g.clearRect(0,0,cv.width,cv.height);
  const top=SPR.GY-Math.round(b.ht*.58)-8,h=SPR.GY+3-top,k=Math.max(1,Math.floor(Math.min(cv.height/h,cv.width/31))),w=Math.floor(cv.width/k);
  g.fillStyle="rgba(0,0,0,.28)";g.beginPath();g.ellipse(cv.width/2,cv.height-6,w*k*.22,5,0,0,Math.PI*2);g.fill();
  g.drawImage(src,SPR.RX-Math.floor(w/2),top,w,h,cv.width/2-Math.floor(w/2)*k,cv.height-h*k,w*k,h*k)}
function drawAv(c,look,jersey,trim,ht){const x=c.getContext("2d");x.imageSmoothingEnabled=false;x.clearRect(0,0,c.width,c.height);const m=Math.round(c.width/2);
  if(typeof SPR==="undefined")return;const nl=SPR.fromGame(look||{},ht||78,{j:jersey||"#2f6fd6",t:trim||"#f4f1ea",n:trim||"#f4f1ea"},"",{k:.7});
  hlEll(x,m,c.height-4,7,2,"rgba(0,0,0,.35)");x.drawImage(SPR.frame(nl,"idle",0,{}),m-SPR.RX,c.height-4-SPR.GY)}
function drawPortrait(c,look,jersey,trim,num){const x=c.getContext("2d");x.imageSmoothingEnabled=false;x.clearRect(0,0,c.width,c.height);if(typeof SPR==="undefined")return;
  const nl=SPR.fromGame(look||{},78,{j:jersey||"#2f6fd6",t:trim||"#f4f1ea",n:trim||"#f4f1ea"},num,{k:1}),src=SPR.frame(nl,"idle",0,{}),top=SPR.GY-Math.round(78*.58)-4;
  x.drawImage(src,SPR.RX-11,top,22,22,0,0,c.width,c.height)}

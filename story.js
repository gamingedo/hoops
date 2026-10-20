/* ---------- story.js: the System's voice. Dry, short, no plot. Every line in one place. See WRITING.md.
   A card is an array of strings: plain = narration, "NAME: text" = dialogue, *text = muted aside, ~text = the System (gold). ---------- */
const ST={};
const SP_=(...a)=>a;
/* job advancement */
ST.job1=()=>SP_(`~Level ten.`,`~Everything until now was the same for everybody. From here it is not.`,`~Pick what you are.`);
ST.job1Done=(P)=>SP_(`~${P.n}. Noted.`,`~There is a new line on your card. Once a quarter. Do not waste it.`);
ST.job2=(P)=>SP_(`~Level twenty. ${P.n} was the shape. This is the edge.`);
ST.job2Done=(s)=>SP_(`~${s.n}. Another line on the card.`);
ST.job3=()=>SP_(`~Level forty-five. Most players never see this number.`,`~Your passives are half again as strong.`);
ST.job3Done=()=>SP_(`~Master. The word is accurate.`);
ST.job4=()=>SP_(`~Level sixty-five.`,`~Everything you do is a little better now. That is the whole message.`);
ST.job4Done=()=>SP_(`~Legend. Keep going.`);

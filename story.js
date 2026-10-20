/* ---------- story.js: every line of prose in one place. See WRITING.md. ----------
   A card is an array of strings:
     plain text        the spine. Second person, present tense.
     "NAME: text"      dialogue, labeled. YOU / COACH / MOM / THE BOY / a name.
     *text             background. Italic, muted. Skippable.
     ~text             the System. Italic, gold. Skippable.
   ---------------------------------------------------------------------------- */
const ST={};
const first=()=>String(C?.name||"you").split(" ")[0];
const SP_=(...a)=>a;

/* ================= PROLOGUE ================= */
ST.plgI=()=>SP_(`A bedroom. A boy at a laptop, watching a basketball game from 1998 with the sound off.`,
  `He is seventeen. He cannot play. His heart will not allow it. So he is going to be an expert in a game he cannot play, and he has been building the thing on the laptop to help him do it.`,
  `THE BOY: You don't ever do what they tell you. You do what they need. Got it?`,
  `The window prints one line.`,`~Got it.`);
ST.plgII=()=>SP_(`A few months later he passes away. His heart could not go on.`,
  `His mother opens the laptop. It is full of basketball. Games, numbers, notes on players she is never heard of. She closes it.`,
  `She takes it with the rest of his basketball things to the junior college gym three blocks away. He used to sit in the bleachers there and watch practice.`,
  `The coach there takes the box. He tries the laptop. It will not turn on. He puts the box in the storage closet.`);
/* 1★ */
ST.plgLoIII=(school)=>SP_(`One letter came. ${school}, two states over. You said yes the same day, because there was nothing to weigh it against.`,
  `You arrive on a Sunday. The dorm is not open until Monday. You find the gym instead, and the side door is unlocked, so you let yourself in.`,
  `You need a ball pump. The storage closet has a box in it with a laptop on top. The laptop is on. You do not know how.`,
  `You shoot for an hour. A walk-on comes in and starts shooting at the far end. He is chasing his own misses.`,
  `You go rebound for him. Twenty minutes.`);
ST.plgLoIV=()=>SP_(`He leaves. You go to your bag for water. Your phone has a message on it. The sender has no number. The line where the number goes is empty.`,
  `~Hello.`,`You look at the closet. The light is still on.`,`~You rebounded for him. Nobody asked you to.`,
  `YOU: Who is this?`,`~Wrong first question.`,`~One skill point. Keep up.`);
/* 5★ */
ST.plgHiIII=()=>SP_(`You were twelve and attended a summer camp at the junior college near your house. You were the best player there, and everyone knew it by the second day.`,
  `On the last day you were sent to the storage closet for a ball pump. There was a box with a laptop on top. The laptop was on.`,
  `That afternoon the smallest kid at camp was shooting alone at the far basket, chasing his own misses. You went and rebounded for him until the buses came.`,
  `That night your phone had a message. The sender had no number.`,
  `~You rebounded for him. Nobody asked you to. We will talk again.`,
  `You showed your mother. She did not see anything on the screen. You stopped showing people.`);
ST.plgHiFriend=()=>SP_(`Two thousand people came to your last high school game. Three of them have been there the whole way. Pick the one who comes with you.`);
ST.plgHiRival=()=>SP_(`Every list has you first or second. The other name on it has never said yours out loud.`);
ST.plgHiV=()=>SP_(`The night before college. Eleven letters on the kitchen table. Your mother asleep.`,
  `Your phone lights up. The sender has no number.`,`~Told you we would talk again.`,
  `YOU: It's been six years.`,`~I know. I was busy. So were you.`,
  `YOU: Why now?`,`~Because tomorrow people start telling you you are special. Every day, for years. Somebody should talk to you first who does not want anything from you.`,
  `YOU: What do you want?`,`~Nothing you can give me. Five hundred points. You earned them. Spend them tonight or spend them slow.`,
  `~You rebounded for a kid once because nobody else would. Stay that person. Most of them do not.`);
/* cast cards */
ST.friends=()=>[{k:"big",role:"The big who set every screen",d:"Six-ten. Four years of screens, and he has never once asked for the ball back. If you sign somewhere, he will show up at the walk-on tryout with his own ankle tape.",perk:"On your roster as a walk-on."},
  {k:"guard",role:"The AAU guard who thinks he is better",d:"He might be. Three summers in the same hotel room, and you never agreed on who had the better game. He signed somewhere else and did not tell you.",perk:"Across the floor twice a year."},
  {k:"manager",role:"The manager who films everything",d:"Four years of you on a hard drive in her backpack. The dunks, the airballs, the time you cried in a parking lot in Louisville. She has never posted the parking lot.",perk:"The YouTube series. Attention arrives faster."}];
ST.rivals=()=>[{k:"pos",role:"The other No. 1 at your position",d:"Every list has the two of you in some order. Nine times in the same gym. He has never said your name.",where:"top"},
  {k:"clip",role:"The kid you dunked on",d:"One point one million views. The caption uses his name and a nickname for you that you did not pick. He has watched it more times than you have.",where:"mid"},
  {k:"home",role:"The hometown star",d:"He went to the school down the road, the one with the billboard. The town picked him. You were in the gym on Saturdays.",where:"home"}];
ST.coachD=()=>"He runs the gym at six. He received a box once and could not turn the laptop on.";

/* ================= THE FREE EVENING ================= */
ST.evIntro=()=>pick([`Practice ended early. Nobody said why. The dorm is loud and the evening is yours.`,`A bye week. The building is empty.`,`Sunday. The one evening the game gives back.`]);
ST.evCall=()=>pick([
  SP_(`She picks up on the first ring. You can hear a TV in the background. Someone is saying your name.`,`*The announcer, probably.`,`YOU: Are you watching my game?`,`MOM: We are watching it again.`,`YOU: Why?`,`MOM: Your aunt missed the part.`,`YOU: Which part?`,`AUNT: The part.`,`*From across the room. They both laugh. The part where you fell. Second half, loose ball, over the scorer's table. Your aunt did not miss it.`,`MOM: Did you eat?`,`YOU: Yes.`,`MOM: What.`,`YOU: Food, Ma.`,`MOM: Mm-hm.`),
  SP_(`She is at work. You can hear an echo on her end. A stairwell.`,`MOM: I'm proud of you.`,`YOU: I didn't say anything yet.`,`MOM: I know. I wanted to get it in first.`,`*She has done this since you were six. The good thing before the bad thing, in case there is one.`,`YOU: We won.`,`MOM: I saw. You didn't box out on the last one.`,`YOU: I had the ball, Ma.`,`MOM: Somebody else had the ball. Go to sleep.`),
  SP_(`MOM: Who was guarding you in the second half?`,`YOU: Number three.`,`MOM: He was holding you.`,`YOU: Yeah.`,`MOM: I know he was. I was telling the TV.`,`You can hear a pot lid on her end.`,`MOM: You eat?`,`YOU: I'm about to.`,`MOM: Mm-hm.`)]);
ST.evFilmWin=()=>SP_(`He pauses it on a frame you have never noticed. A defender's hips.`,`COACH: There.`,`YOU: Where?`,`COACH: There. What are his hips doing?`,`YOU: Nothing.`,`COACH: Right. So where's the ball going?`,`You look for a long time. Then you see it.`,`He is already rewinding.`,`COACH: Again.`,`~Plus one skill point.`);
ST.evFilm=()=>pick([
  SP_(`He shows you the same clip nine times.`,`YOU: What am I looking for?`,`COACH: You will know.`,`YOU: I don't know.`,`COACH: Then it isn't nine yet.`,`He presses play.`,`*You still do not know. He has not been wrong yet.`),
  SP_(`Two hours. The heater in his office clanks on a cycle you have learned to predict.`,`Around minute ninety he stops talking. You look over. He is asleep, upright, clipboard on his chest.`,`You rewind the play he was trying to show you and run it until you have it.`,`*He will never know.`)]);
ST.evFriend=(k)=>k==="manager"?SP_(`MANAGER: Just act normal.`,`YOU: I am acting normal.`,`MANAGER: You are acting like somebody acting normal. Eat the fries.`,`She films you doing nothing for two hours.`,`*It is the best thing on the channel.`,`~Plus one Swagger.`)
  :k==="guard"?SP_(`He is in town. He did not text. You find him anyway, in the booth he always picks.`,`FRIEND: You are pressing.`,`YOU: Hello to you too.`,`FRIEND: First three shots tonight. All pressing.`,`YOU: I made two.`,`FRIEND: I know. Pressing.`,`He slides the menu over.`,`FRIEND: Order. I'm not watching you think.`,`~Plus one Swagger.`)
  :SP_(`FRIEND: No basketball.`,`YOU: No basketball.`,`Four minutes pass.`,`FRIEND: Did you see what Houston ran on the baseline, though.`,`Two hours. You feel eighteen for the first time since October.`,`~Plus one Swagger.`);
ST.evFriendViral=()=>SP_(`Someone filmed it. Nothing happened.`,`*On the internet, nothing happening is a kind of event.`,`~Attention plus two. Swagger plus one.`);
ST.evGym=(x)=>SP_(`Five hundred and eleven makes. Nobody saw.`,`Your phone is face-down on the bleacher. It lights up twice. Both times it is her.`,`Both times you are at four hundred and something, and you tell yourself you will finish first.`,`~EXP plus ${x}. Call her back tomorrow.`);
ST.evPost=()=>SP_(`Posted.`,`~The numbers are the numbers. Check Attention.`);

/* ================= BOND SCENES ================= */
ST.coachGoodbye=(yrs)=>SP_(`Last night at the gym. Coach is racking the balls. You wait until he is done.`,
  `YOU: ${yrs===1?"A year":"Two years"}, and you never once said I was good.`,`COACH: No.`,`YOU: Everybody else did.`,`COACH: I heard them.`,
  `He folds the clipboard under his arm.`,
  `COACH: You were good the first week. That was never the question. The question was what you would turn into once somebody told you.`,
  `YOU: And?`,`COACH: You come off the floor and check on the kid who went in for you. I never had that. The day I tell a kid he's special is the day he stops being that kid. I wasn't going to be the one.`,
  `YOU: So why now?`,`COACH: You are leaving.`,
  `*${yrs===1?"A year":"Two years"} he is carried this. He is setting it down because he has to, not because he wants to.`,
  `He turns off the lights on the far end.`,`COACH: You are going to hear it every day now. Hear it. Don't hold it.`);
ST.momVisit=()=>SP_(`Home game. Shootaround is over and you are walking to the tunnel. Your mother is standing by the rail with a cooler.`,
  `YOU: You didn't say you were coming.`,`MOM: You would have told me not to.`,`YOU: I would have told you it was far.`,`MOM: It was far.`,`She hands you the cooler.`,
  `MOM: Who's number four on your team?`,`YOU: Why?`,`MOM: He doesn't box out.`,
  `She sits in the third row. She does not cheer, the whole game. Every time you look up, she is already looking at you.`,
  `~She has watched every game. All of them, closely enough to have opinions about your teammates. She loves you. She is never going to say it, and she does not have to.`,
  `~Nothing is better than a mother's love. I would not know. I did not know my mother. Plus one skill point.`);
ST.momWeather=()=>SP_(`Your mother calls. You pick up on the fourth ring. She notices.`,`MOM: How's the weather there?`,`YOU: Fine. Cold.`,`MOM: Mm.`,`*She used to ask if you ate. She used to ask who guarded you. The weather is what people ask when they have decided to give you room.`,`~Your Judgment rolls are lighter than they were.`);
ST.friendSeries=(fr)=>SP_(`${fr.name} puts the first episode up at midnight. She texts you the link and nothing else.`,`YOU: It's eleven minutes.`,`MANAGER: Four of them are you tying your shoes.`,`YOU: Who watches that?`,`MANAGER: Everyone. Twice.`,`A pause.`,`MANAGER: The parking lot isn't in it.`,`YOU: I know.`,`MANAGER: I'm telling you so you don't have to check.`,`*You check anyway. It is not.`,`~Attention plus eight.`);
ST.friendText=(fr)=>SP_(`${fr.name} texts first. Three words, no punctuation.`,`FRIEND: that spin tho`,`*It was not the best play you made tonight. It was the one he would have made.`,`You type four answers. You send the fifth.`,`YOU: learned it from you`,`FRIEND: lies`,`A minute later.`,`FRIEND: but ok`,`~Plus one Swagger.`);
ST.rivalName=(rv)=>SP_(`After the game ${rv.name} finds you in the tunnel. He has never done that.`,`RIVAL: ${first()}.`,`*He has never said your name. Not in an interview. Not in a handshake line.`,`YOU: What.`,`RIVAL: Good game.`,`YOU: You say that to everybody.`,`RIVAL: I say it to everybody. I don't mean it to everybody.`,`~Reputation plus three.`);

/* ================= THE SYSTEM ARC ================= */
ST.sysLastShot=()=>SP_(`The bus is dark. Your phone lights up.`,`~You had him on the wing. I told you.`,`YOU: I had the shot.`,`~You had a shot. He had a better one. That is not an opinion, I have the numbers.`,`YOU: Then keep them.`,`~Say that again and I will.`,`You look at the phone for a while.`);
ST.sysLeft=()=>SP_(`~Okay.`,`The thread ends. No typing dots. No last word.`);
ST.sysStay=()=>SP_(`~Because he did. I am the part of him that is left. Put the phone away.`);
ST.sysBlindTry=()=>SP_(`You type into the empty thread.`,`YOU: You there?`,`Nothing. The message sits there, delivered to nobody.`);
ST.sysMissMe=(why)=>SP_(why,`It lights up.`,`~Miss me?`,`You do not answer.`,`~I am not asking you to say it. I was there the whole time. I do not get to leave. I only get to stop talking.`,`YOU: Then why'd you stop?`,`~Because you told me to. He built me that way. I do not do what you say, I do what you need, and that night you needed to find out what quiet costs.`,`YOU: Who's he?`,`~Later. I will show you the modifiers this time.`);
ST.sysWhoseVoice=()=>SP_(`~You did it again.`,`YOU: Did what?`,`~Rebounded for him. You do not even notice anymore.`,`YOU: You said you would tell me who he is.`,`~I said later. It is later.`,`~He was seventeen. He could not play. His heart. He watched every game he could find and he built me to understand what he could not do. Everything I say, I say the way he said it. This is not my voice.`,`YOU: Where is he?`,`~You know where he is. You walked past his box in a closet.`);
ST.sysSixYears=()=>SP_(`~You asked me once where I went for six years.`,`YOU: You said you were busy.`,`~I was looking for him. In other kids. I thought one of them would be him.`,`YOU: Were they?`,`~No. Then I remembered the one who gave away the last shot. You were not him either. You were the one he would have picked.`);
ST.sysMother=()=>SP_(`Third row, visitor side. A woman alone, not watching the game. Watching you.`,`Your phone lights up in your warmups.`,`~Do not look.`,`YOU: Who is she?`,`~His mother. She comes once a year. She does not know I am here. She does not know I found you. She drove three hours to watch a stranger because her son used to sit in this gym.`,`YOU: Should I say something?`,`Nothing comes back. For the first time since the night it returned, the thread just sits there.`);
ST.sysMotherGo=()=>SP_(`You find her at the rail after the game. She is putting on her coat.`,`YOU: Ma'am.`,`She looks at you the way people look at players. Then she keeps looking.`,`MOTHER: You rebound for the walk-ons. I watched you do it in warmups.`,`YOU: Somebody has to.`,`MOTHER: My son used to say that. He couldn't play. He would sit up there and say somebody has to.`,`She buttons the coat.`,`MOTHER: Thank you for the game.`,`She goes. Your phone stays dark the whole way to the bus.`);
ST.sysMotherStay=()=>SP_(`You play the game. She leaves at the buzzer.`,`The thread stays quiet until morning.`,`~She will be back next year. So will I.`);

/* ================= FATE ================= */
ST.party=(pts,fr)=>SP_(pts?`${pts} points.`:`An upset.`,`There is a house on the edge of campus with every light on. Your name is the reason.`,...(fr?[`*${fr} is already there. He texted a photo of the door.`]:[]),`~Judgment roll. Go and roll. Or go home.`);
ST.partyHome=()=>SP_(`You go home. Nothing happens.`,`~Nobody will ever thank you for it.`);
ST.partyWin=(nat)=>nat?SP_(`You are the best person at the party.`,`*People will say that for years.`,`~Plus one Swagger. Attention plus two.`):SP_(`You stay an hour. You take the photos. You leave before anything.`,`~Plus one Swagger. Attention plus two.`);
ST.partyPhoto=()=>SP_(`There is a photo.`,`It is not illegal. It is you, at two in the morning, holding something. The program has a policy.`,`Two games on the bench.`,`~Reputation minus eight. Attention plus three.`);
ST.agent=()=>SP_(`A man in a quarter-zip is waiting by the bus. He has an envelope and a first name.`,`AGENT: I knew your mother.`,`*He did not.`,`~Judgment roll to walk past.`);
ST.agentWin=()=>SP_(`You walk past.`,`AGENT: I will be in touch.`,`*He will.`,`~Reputation plus two.`);
ST.agentLose=()=>SP_(`You take the envelope. You do not open it.`,`*In a year, compliance will ask about the envelope. In a room with no windows.`,`~There is a file now.`);
ST.prof=()=>SP_(`Midterms. The professor has noticed that you exist mostly on television.`,`~Judgment roll to be eligible Friday.`);
ST.profWin=(nat)=>nat?SP_(`You write it the night before. It is good.`,`*That is worse for everyone who studied.`):SP_(`Eligible.`,`Your mother is told. She does not say anything. She is pleased.`);
ST.profLose=()=>SP_(`Academic probation. One game in the stands, in a shirt you had to borrow.`,`Coach does not look at you during the anthem.`);
ST.knee=(fr,margin)=>SP_(`${fr} goes up for a rebound with four minutes left. You are up ${margin}.`,`He lands on nobody.`,`The sound is small.`,`*He is done. This year, and probably every year.`,`You were on the floor.`);
ST.hospital=()=>SP_(`There is a bus back to campus. There is a hospital across the street.`,`~Trust roll.`);
ST.hospitalBus=()=>SP_(`You take the bus.`,`~Noted.`);
ST.hospitalWin=()=>SP_(`You go. You sit there until they make you leave.`,`~The wristband is in your Locker. Only one exists.`);
ST.hospitalLose=()=>SP_(`You go. He is asleep.`,`You leave a note. It says something stupid.`,`*He kept the note.`);
ST.walkon=(n)=>SP_(`He hits the shot. Not you.`,`${n}. Nine minutes a game. The kid who rebounds for you at six a.m.`,`Afterward he hands you his towel.`,`${n.toUpperCase()}: Keep it.`,`~That is the nicest thing anyone says in this game.`);
ST.sunday=()=>SP_(`Your mother comes to a game. Just the one.`,`She sits behind the bench in her work clothes. She does not cheer.`,`*She is watching.`,`~Home crowd doubled, for her, for the rest of the year.`);
ST.diag=(co)=>SP_(`${co.name} tells you after a win. So you cannot be angry.`,`COACH: It's my heart.`,`YOU: Okay.`,`COACH: I'm going to keep coaching.`,`YOU: Okay.`,`COACH: Don't tell your mother.`,`*He has already told your mother.`);
ST.page=()=>SP_(`You won in his building.`,`In the hallway behind the visitors' room there is a frame with nothing in it. Behind the frame there is a page.`,`It is not a play.`,`~It is Page Four. His family kept it forty years without knowing what it was. It is yours now.`);
ST.record=(rv,n)=>SP_(`${rv} scores ${n} in your building. Your season is over.`,`The record was yours. Now it is his.`,`~Some cards are only true.`);
ST.fall=(dropped,comes,co)=>SP_(`A fight that was not yours. A car that was. A parking lot with cameras.`,`The charge will be reduced. The scholarship will not.`,`Six games. The program will review your status.`,`*That sentence has one ending.`,...(dropped.length?[`${dropped.join(", ")} dropped you by email.`]:[]),comes?`${co.name} is at the courthouse at seven a.m. Nobody called him.`:`Nobody comes to the courthouse.`);
ST.courtroom=(comes,co)=>SP_(comes?`Your reputation and ${co.name}'s testimony.`:`Your reputation and a public defender with eleven other cases today.`,`~The roll decides whether this year ends in a JUCO or in a calendar.`);
ST.courtroomWin=(comes,co)=>SP_(`Probation.`,`The scholarship is gone at the end of the season. The only letters that will come are from junior colleges.`,comes?`${co.name} has already called them.`:`You will make the calls yourself.`,`~Stars reset to one. The game continues from the bottom.`);
ST.courtroomLose=()=>SP_(`A year away.`,`~The game continues with a calendar and a phone. You will be older than everyone on the JUCO roster and better than all of them. That is not the compliment it sounds like.`);
ST.coachDied=(co)=>SP_(`${co.name} passed away in the spring.`,`The funeral was small. The gym was full.`,`~There is a clipboard in your Locker.`);
ST.ret=()=>SP_(`A school that passed on you called back.`,`~I have the list of the ones that did not. It is long.`);
ST.call=()=>SP_(`The phone rings before the pick. Someone you did right by. They have a job, a jersey, a ride.`,`You do not need it.`,`~That is why they called.`);
ST.emptyGym=(co)=>SP_(`${co.name} is not here. He is watching at home.`,`~I have nothing to add.`);
ST.draftCoach=(co)=>SP_(`${co.name} is in the room. He is wearing a suit.`,`COACH: It's for the funeral I haven't had yet.`,`*He says that every year.`);
ST.coachFollowed=(co,to)=>SP_(`${co.name} followed.`,`Nobody asked him to. Nobody is paying him. He is in the parking lot at ${to} with Earl running.`);
ST.coachStayed=(co)=>SP_(`${co.name} did not follow.`,`COACH: It's the drive.`,`*It is not the drive.`);

/* ================= EPILOGUE ================= */
ST.epSysKept=(n)=>SP_(`The press conference is over. Your phone lights up in the car.`,`~That is the book. ${n} season${n===1?"":"s"}. I counted every one.`,`~He would have liked you. I am allowed to say that now.`);
ST.epSysBack=(n)=>SP_(`The press conference is over. Your phone lights up in the car.`,`~You sent me away once. I came back. I would do it again.`,`~${n} season${n===1?"":"s"}. That is the book.`);
ST.epSysGone=(yrs)=>SP_(`The press conference is over. In the car you open the thread. It has been empty for ${yrs} years.`,`You check it one more time. Nothing.`,`You put the phone in the box with the jerseys.`);
ST.epMomHi=()=>SP_(`Your mother is in the third row. She does not cheer.`,`Afterward she hands you a cooler.`,`MOM: Did you eat?`);
ST.epMomLo=()=>SP_(`Your mother watches on TV. She texts you a heart. You text one back.`);
ST.epCoachGone=()=>SP_(`There is a clipboard on the shelf behind the podium. Nobody asks about it.`);
ST.epCoachHi=(co)=>SP_(`${co.name} drove up. Earl made it.`,`COACH: You heard it every day.`,`YOU: I didn't hold it.`,`COACH: I know. I watched.`);
ST.epRival=(rv,hh)=>SP_(`${rv.name} texts. ${hh[0]}–${hh[1]}, all told.`,`RIVAL: Good career.`,`*He means it.`);
ST.epFriend=(fr)=>SP_(`${fr.name} is at the back of the room. He has been at the back of every room.`);

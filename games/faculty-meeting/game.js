/* ═══════════════════════════════════════════════════════════
   SHOULD I ASK A QUESTION? — at the faculty meeting.
   Every scenario is assembled from the lists below, and in every
   one of them the correct answer is the same.
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── The writing. Edit freely: each list is independent. ── */

  const WHO = [
    'a tenured full professor',
    'an associate professor, tenured last spring',
    'an assistant professor, tenure review in 14 months',
    'a postdoc, invited “just to listen”',
    'the newest hire, three weeks in',
    'an emeritus who still attends',
    'the deputy head of department',
    'the PhD-student representative',
    'the chair of the previous working group',
    'a visiting professor, here for one week',
    'the head of department, chairing',
    'a lecturer on a temporary contract',
    'the research-support officer, invited for item 7',
    'a professor who has attended every meeting since 1994',
    'a PhD student who was told to “observe”',
    'the vice-dean, dropping in for ten minutes',
    'a postdoc on the job market this autumn',
    'the new director of studies',
    'someone who joined the wrong meeting by mistake',
    'the colleague who always has “just one comment”',
    'a professor who has not been seen since the pandemic',
    'a colleague whose laptop is on 4%',
    'a PhD student who will appear in the minutes by mistake',
    'the colleague who still prints the agenda',
    'a guest lecturer who was only passing through',
    'the safety officer, with a lanyard and a plan',
    'the head of the neighbouring department, on a diplomatic visit',
    'a professor joining from a train, in a tunnel',
    'the secretary, who knows everything and says nothing',
    'an external evaluator with a clipboard',
    'a lecturer with three exam scripts under one arm',
    'a postdoc whose contract ends in June',
    'a dean’s assistant, taking notes on the Dean’s behalf',
    'someone whose name nobody remembers, but who has been here for years',
    'an adjunct, here for one hour of unpaid goodwill',
    'the professor who is also chair of four other committees',
    'a colleague who has just returned from sabbatical and has views',
    'the IT person, who has been summoned for the projector',
    'the new head of the research school, on a listening tour',
    'a professor who has been “nearly finished” with the book for nine years',
    'the colleague who answers every email with “Noted.”'
  ];

  /* h, m  set the wall clock.  no  is what you read if you stay seated. */
  const WHEN = [
    { h: 9,  m: 5,  s: '09:05. Nobody has had coffee yet.',
      no: 'Coffee first, questions second. Questions never.' },
    { h: 10, m: 40, s: '10:40. The fika break has been announced.',
      no: 'The cinnamon buns are still warm. You are a hero to forty people.' },
    { h: 11, m: 52, s: '11:52. Lunch is in eight minutes.',
      no: 'Lunch starts on time. A stomach somewhere sends its thanks.' },
    { h: 13, m: 10, s: '13:10. Everyone is digesting.',
      no: 'The room stays calmly drowsy. Nobody will be woken up today.' },
    { h: 15, m: 30, s: '15:30. The projector fan is the loudest thing here.',
      no: 'The fan gets the last word. As is only right.' },
    { h: 16, m: 40, s: '16:40. It is a Friday.',
      no: 'You are home with the weekend still intact.' },
    { h: 17, m: 20, s: '17:20. The meeting was meant to end at 17:00.',
      no: 'The meeting ends in four minutes. Nobody will believe it.' },
    { h: 8,  m: 30, s: '08:30. The meeting was moved here “to suit everyone”.',
      no: 'Eight-thirty has been survived. It is not an hour for questions.' },
    { h: 9,  m: 50, s: '09:50. The first item started late and is still going.',
      no: 'The first item is allowed to finish. The day depends on it.' },
    { h: 11, m: 15, s: '11:15. The fire drill is scheduled for 11:30.',
      no: 'The fire drill gets the room on time. Good colleagues, all of them.' },
    { h: 12, m: 45, s: '12:45. The sandwiches have arrived, and they are in the room.',
      no: 'The sandwiches are eaten at their best. Nobody forgets that.' },
    { h: 14, m: 0,  s: '14:00. First item after lunch. Eyelids at half-mast.',
      no: 'The room stays at half-mast. You have just spared it a full wake-up.' },
    { h: 14, m: 55, s: '14:55. Fika is in five minutes.',
      no: 'Fika begins on time. Several people shake your hand without knowing why.' },
    { h: 15, m: 55, s: '15:55. The meeting officially ends at 16:00.',
      no: 'The meeting ends five minutes late instead of fifty. A triumph.' },
    { h: 16, m: 10, s: '16:10. The last bus leaves at 17:05.',
      no: 'You make the bus. Several colleagues make the bus. Everyone is happy.' },
    { h: 18, m: 5,  s: '18:05. The cleaners have arrived and are waiting by the door.',
      no: 'The cleaners nod at you. It is the highest honour the building offers.' },
    { h: 7,  m: 55, s: '07:55. Someone has scheduled this before the bus.',
      no: 'The bus comes at 08:03. You are on it, and not in the minutes.' },
    { h: 8,  m: 50, s: '08:50. The chair has started ten minutes early “to save time”.',
      no: 'Time is saved by not asking. The arithmetic is simple.' },
    { h: 9,  m: 15, s: '09:15. It is a Monday. Nothing has gone right yet.',
      no: 'Monday is allowed to keep its small mercies. You are one of them.' },
    { h: 9,  m: 30, s: '09:30. The coffee machine is out of order.',
      no: 'The room is unhappy enough without any help from you.' },
    { h: 10, m: 10, s: '10:10. Item 2 was given 30 minutes. It is now at 70.',
      no: 'Item 2 will end when it ends. Your silence is a rounding error.' },
    { h: 10, m: 25, s: '10:25. The previous meeting is still in the room.',
      no: 'The two meetings merge peacefully. Nobody notices. You help.' },
    { h: 10, m: 55, s: '10:55. Someone has opened a window, and the room has opinions.',
      no: 'The window is the only controversy today. Let it be.' },
    { h: 11, m: 35, s: '11:35. The pre-lunch slump has arrived on schedule.',
      no: 'The slump remains undisturbed. It will be there to greet you at 13:00.' },
    { h: 12, m: 5,  s: '12:05. The lunch queue is forming outside the door.',
      no: 'You are third in the queue. Third! A career high.' },
    { h: 12, m: 20, s: '12:20. A stomach rumbles in the silence after item 4.',
      no: 'The stomach has the floor and uses it well.' },
    { h: 13, m: 35, s: '13:35. The first slide this afternoon is also the last of the morning.',
      no: 'You accept the repeat. Repeats are what the department does best.' },
    { h: 13, m: 55, s: '13:55. Midsummer is in two days, and the room has already left.',
      no: 'Midsummer remains on schedule. The herring is waiting.' },
    { h: 14, m: 30, s: '14:30. The blinds are down and the room is gently warm.',
      no: 'The warm room stays asleep. You are the guardian of its dreams.' },
    { h: 15, m: 10, s: '15:10. The batteries in the microphone have given up.',
      no: 'The microphone dies a quiet death. So do all your questions.' },
    { h: 15, m: 45, s: '15:45. The day before a long weekend.',
      no: 'The weekend begins on time. You will be thanked at a distance.' },
    { h: 16, m: 25, s: '16:25. Half the room is standing already, in spirit.',
      no: 'The spirit is willing. The flesh is gathering its bag.' },
    { h: 16, m: 55, s: '16:55. The last meeting before the summer break.',
      no: 'The break begins. It is the most beautiful sentence in the language.' },
    { h: 17, m: 5,  s: '17:05. Daylight has quietly left the building.',
      no: 'You leave while there is still a little light in the car park.' },
    { h: 17, m: 45, s: '17:45. The cleaners have been, gone and come back.',
      no: 'The cleaners are impressed. Cleaners are not easily impressed.' }
  ];

  /* n  is the number of people in the room. */
  const ROOM = [
    { n: 6,  s: 'Six people round a table.' },
    { n: 3,  s: 'You, the chair, and a very bored minute-taker.' },
    { n: 15, s: 'Fifteen people, eleven of them answering email.' },
    { n: 22, s: 'A Zoom meeting: 22 attendees, 19 cameras off.' },
    { n: 40, s: 'Forty people in a lecture theatre built for 120.' },
    { n: 60, s: 'Sixty people, two of them asleep, one of them the Dean.' },
    { n: 90, s: 'A hybrid meeting with 90 people and an echo.' },
    { n: 2,  s: 'You and the head of department, in a room with a glass door.' },
    { n: 5,  s: 'Five people in a room booked for two.' },
    { n: 8,  s: 'Eight people, one sharing the wrong slide.' },
    { n: 12, s: 'Twelve people and a plate of dry biscuits.' },
    { n: 18, s: 'Eighteen on Zoom: six on mute, one eating, one asleep with the camera on.' },
    { n: 30, s: 'Thirty people, half of them standing at the back.' },
    { n: 50, s: 'Fifty people in a hybrid meeting. The microphone is in the other room.' },
    { n: 120, s: 'The whole faculty, 120 people, in the big lecture hall.' },
    { n: 3,  s: 'Three people in a room that smells of whiteboard marker.' },
    { n: 4,  s: 'Four people and a kettle that nobody trusts.' },
    { n: 7,  s: 'Seven people at a table where no two chairs match.' },
    { n: 9,  s: 'Nine people, three laptops, one extension cord.' },
    { n: 10, s: 'Ten people in a corner of the corridor, “just for ten minutes”.' },
    { n: 11, s: 'Eleven people and a plant that has seen it all.' },
    { n: 13, s: 'Thirteen people. Nobody wanted the chair by the door.' },
    { n: 14, s: 'Fourteen people, two standing for reasons nobody can recall.' },
    { n: 16, s: 'Sixteen people. The radiator has decided it is August.' },
    { n: 20, s: 'Twenty people and a window that will not open.' },
    { n: 25, s: 'Twenty-five people in a seminar room with eighteen chairs.' },
    { n: 27, s: 'Twenty-seven people on the stairs; the room was double-booked.' },
    { n: 35, s: 'Thirty-five people, a buffet, and a clicker that has died.' },
    { n: 45, s: 'Forty-five people on Teams, and one dog joining the discussion.' },
    { n: 55, s: 'Fifty-five on a video link; the person who can unmute is on leave.' },
    { n: 70, s: 'Seventy people in the auditorium; the back row is in another meeting.' },
    { n: 80, s: 'Eighty people and a microphone that only works upside down.' },
    { n: 100, s: 'A hundred people and a slide that is bigger than the screen.' },
    { n: 150, s: 'The whole faculty and guests, 150 people, in the hall with the bad acoustics.' }
  ];

  const TOPIC = [
    'the new parking allocation',
    'curriculum reform (again)',
    'the five-year strategic plan',
    'migration of the room-booking system',
    'next year’s budget',
    'the new coffee machine',
    'a revised template for course syllabi',
    'the working group on working groups',
    'the external evaluation report',
    'GDPR and the lecture recordings',
    'the faculty’s new slogan',
    'electronic signatures on travel claims',
    'the redesign of the intranet',
    'an update on the update',
    'the new travel-claims form (version 4)',
    'a motion to review the motion procedure',
    'the department’s 2030 sustainability goals',
    'the library’s subscription to a journal nobody reads',
    'moving the Christmas lunch to January',
    'a proposed new name for the corridor',
    'quality assurance of the quality assurance',
    'introduction of a new learning platform',
    'the opening hours of the printer room',
    'how to attract more students',
    'the annual report, which is last year’s with new dates',
    'a pilot project for pilot projects',
    'workplace survey results (response rate: 9%)',
    'the cleaning rota for the seminar room',
    'the new colour of the department’s slide template',
    'a mandatory course on mandatory courses',
    'the future of the common-room fridge',
    'the ten-year review of the five-year plan',
    'harmonising the harmonised guidelines',
    'the proposed merger of two committees that dislike each other',
    'a new logo, in three shades of blue',
    'the rules for who gets the window office',
    'a new cost centre for the old cost centre',
    'a report on the report on the reports',
    'the department’s presence on social media',
    'a new coffee corner on floor 4',
    'whether “Dear colleagues” should become “Dear all”',
    'a proposed ban on reply-all',
    'a talk on how to give shorter talks',
    'plans for the plans for next year’s plan',
    'the new key-card system, which does not yet open the key-card doors',
    'the lost-property box in the hallway',
    'a seminar series about the seminar series',
    'the recycling rules for pens',
    'a rebrand of the newsletter nobody reads',
    'a new template for templates',
    'a standard font for all internal documents (finally)',
    'scheduling the meeting about scheduling meetings',
    'an appeal to answer the survey nobody answered',
    'a student-satisfaction index that has been renamed',
    'updates to the updated guidelines on updates',
    'moving the Friday seminar to Thursday, and back',
    'a new policy on whiteboard-marker ownership',
    'the autumn’s opening ceremony, which outlasts the autumn',
    'how to attract more external funding to the corridor',
    'the future of the department’s one shared stapler',
    'a pilot of a mentoring scheme for mentors',
    'renaming the “Research Group” the “Research Cluster”',
    'the lunch-room microwave: a status update',
    'a seven-slide summary of a 300-page report',
    'a working group on reducing the number of working groups',
    'procedures for booking the room where procedures are discussed',
    'an anniversary party for a committee that is 25 years old',
    'a revised policy on policy revisions'
  ];

  /* What you were about to say. Works with any topic. */
  const QUESTION = [
    'Sorry, what does that abbreviation stand for?',
    'Could we take a step back and clarify the goal?',
    'Is this the final version of the proposal?',
    'Has anyone checked how this affects the PhD students?',
    'I just want to understand the rationale.',
    'Out of curiosity, what is the budget for this?',
    'Is that per year, or in total?',
    'Who decided this, and when?',
    'This may be a stupid question, but…',
    'Does this also apply to us?',
    'Would it be possible to see the slide again?',
    'Isn’t this what we decided last spring?',
    'What would the alternative have been?',
    'Could somebody please define “strategic”?',
    'Is there a document on this?',
    'Sorry, I missed the last ten minutes. Where are we?',
    'Wasn’t there a deadline for this already?',
    'Just a quick one, for my own understanding…',
    'Who will actually do the work?',
    'Are we allowed to say no to this?',
    'Could someone remind me what we agreed last time?',
    'Whose budget is this coming out of?',
    'Have we considered not doing this?',
    'What happens if we just do nothing?',
    'I may have misunderstood, but is this mandatory?',
    'Does anyone know who owns this?',
    'How is this different from the 2019 proposal?',
    'Is this a decision or a discussion?',
    'May I ask what the deadline is?',
    'What would “success” look like here?',
    'Is there a version without the acronyms?',
    'Will there be a form to fill in?',
    'Sorry, is it “curricula” or “curriculums”?',
    'Would a pilot be possible?',
    'Is this retroactive?',
    'Who will be the contact person?',
    'Do we have to vote on this today?',
    'Is the cake part of the agenda?',
    'Can I just check that I have understood the timeline?',
    'Who gave this its name?',
    'Could we have the numbers in a table instead?',
    'Does this include the part-time staff?',
    'Sorry, who is “we” in that sentence?',
    'Is there an English version of this slide?',
    'What happens to the old system?',
    'Is this the same as the thing we rejected in March?',
    'Could we hear from someone who has actually tried it?',
    'When is the next meeting about this meeting?',
    'Do I have to join the working group, or just the email list?',
    'Has anyone asked the legal side?',
    'Are we sure this is ours to decide?',
    'Is the deadline negotiable, or just strongly worded?',
    'Who owns the owner?',
    'Why is the word “synergy” on slide 9?',
    'Is the coffee machine in scope?',
    'Could we say “plan” instead of “roadmap”?',
    'Is this a new meeting, or the old one with a new name?',
    'Does anyone know where the old minutes are kept?',
    'Could someone say that in words?',
    'Is it too late to change the name?',
    'Does the budget include the lunch?',
    'Might there be an unintended consequence or two?',
    'What does “aligned” mean, here?',
    'Who is responsible if this goes well?',
    'Is it me, or does this slide contradict the last one?',
    'Could I just say something that is not a question?',
    'Where does the data come from?',
    'Do we have a plan B, or only a plan A with a longer name?',
    'Which of these slides do I actually have to read?',
    'Is “stakeholder” a person or a department?',
    'Could we hold this one outdoors?',
    'Is the plan for this written in the plan for the plan?',
    'Can I get a copy of that, or is it confidential?',
    'Who is going to tell the students?',
    'Is there a version with fewer bullets?'
  ];

  /* Extra pressure on the hand. Each one has its own reply for staying seated. */
  const CIRC = [
    { s: 'The chair has just said: “Any questions?”',
      no: '“Any questions?” is a figure of speech. Silence is the traditional reply.' },
    { s: 'The answer is on the next slide.',
      no: 'It was on the next slide. It is always on the next slide.' },
    { s: 'The answer is on slide 41 of 41.',
      no: 'You have stayed to the end of the deck, and so have all of the others.' },
    { s: 'You genuinely do not understand the item.',
      no: 'Nobody does. That is how it passed last time.' },
    { s: 'The speaker made a small mistake on the slide.',
      no: 'You send a friendly email. Nobody has ever lost a minute to an email.' },
    { s: 'The Dean is in the room.',
      no: 'The Dean has already remembered your name once. Do not make it a habit.' },
    { s: 'It is about your own course.',
      no: 'The corridor exists for exactly this, in exactly four minutes.' },
    { s: 'It would take ten seconds to answer.',
      no: 'Ten seconds to answer, plus thirty-five minutes of consequences.' },
    { s: 'Nobody else seems to know the answer either.',
      no: 'It will be settled by an email beginning “As discussed…”' },
    { s: 'Someone else has just asked what you were about to ask.',
      no: 'It is being answered. Savour the rare feeling of being redundant.' },
    { s: 'You are on the committee that decides this.',
      no: 'Then you will hear the answer in committee. At greater length.' },
    { s: 'It is a really good question.',
      no: 'Good questions are the most dangerous kind. They get follow-ups.' },
    { s: 'It has already been asked twice.',
      no: 'Third time lucky is not a thing at faculty meetings.' },
    { s: 'It is a yes/no question.',
      no: 'There are no yes/no questions here. Only invitations to make a statement.' },
    { s: 'You only want to “clarify one small thing”.',
      no: 'Small things clarified at faculty meetings have been known to take 25 minutes.' },
    { s: 'It is the last item on the agenda.',
      no: 'Last item, everyone’s coat is on. Bring cake next time instead.' },
    { s: 'Your question could save the department money.',
      no: 'A subcommittee will look into it. The savings arrive in 2031.' },
    { s: 'The speaker looks at you hopefully.',
      no: 'The speaker was looking at the clock. They are the only one who is.' },
    { s: 'You have been looking at the clock for ten minutes.',
      no: 'You and the clock have an understanding. It is mutual.' },
    { s: 'You have a train to catch at 16:15.',
      no: 'You catch the 16:15. Nobody ever asks what you meant to say.' },
    { s: 'The chair has already said “we are running a little late”.',
      no: '“A little late” is an optimistic phrase. Do not help it along.' },
    { s: 'You were asked to be “constructive”.',
      no: 'Silence is the most constructive thing in the room.' },
    { s: 'A colleague has just whispered “don’t”.',
      no: 'The whisper was well meant and correct.' },
    { s: 'The slide says “For discussion”.',
      no: '“For discussion” means “for decision, without discussion”.' },
    { s: 'You can see exactly how it will go wrong.',
      no: 'You can also see who will be asked to fix it. Silence has a lighter workload.' },
    { s: 'It concerns a form you filled in last month.',
      no: 'The form is in a system. The system is in a queue.' },
    { s: 'You are the only one who read the pre-reading.',
      no: 'Being the only one who read it is lonely. Being the only one who talks is lonelier.' },
    { s: 'Someone says “I am sure this is clear to everyone.”',
      no: 'It is clear to nobody, and everyone will pretend, in unison.' },
    { s: 'The speaker says “this will only take a moment”.',
      no: 'It will not. Do not make the moment longer.' },
    { s: 'Your question begins “To play devil’s advocate…”',
      no: 'The devil has plenty of advocates already. They are the ones still in the room.' },
    { s: 'The projector is showing the wrong item.',
      no: 'IT support is on its way. So is every comment on IT support.' },
    { s: 'It is about the minutes of the last meeting.',
      no: 'The minutes were approved in fourteen seconds, unread. Let them rest.' },
    { s: 'The Dean says “I would love to hear from the junior colleagues.”',
      no: 'The Dean wants one sentence. They will get four paragraphs. Do not be the reason.' },
    { s: 'You have a deadline tomorrow.',
      no: 'The deadline is a good reason to leave on time, and a poor reason to start a discussion.' },
    { s: 'You have just remembered a very good joke.',
      no: 'The joke would be funnier in the corridor. Everything is.' },
    { s: 'The chair has just said “brief questions, please”.',
      no: 'A brief question is a myth, like the paperless office.' },
    { s: 'The slide has a typo in the headline.',
      no: 'The typo has survived three revisions. It has tenure.' },
    { s: 'Someone has just said “going forward”.',
      no: 'Going forward, you will say nothing. A clear strategy.' },
    { s: 'It is a matter of principle.',
      no: 'Principles are best kept in the drawer next to the question.' },
    { s: 'You have been waiting politely for a pause.',
      no: 'The pause never comes. The meeting ends first.' },
    { s: 'The head of department is looking at everyone except you.',
      no: 'Their eyes slide off the table. Yours do too, in solidarity.' },
    { s: 'You have not been listening for the last 25 minutes.',
      no: 'Nobody can tell. Silence is the finest camouflage.' },
    { s: 'The speaker is a former PhD student of yours.',
      no: 'You are proud. Proud people stay seated and nod.' },
    { s: 'The agenda has a slot for “any other business”.',
      no: '“Any other business” is where meetings go to be born again.' },
    { s: 'The last meeting ended in a close vote.',
      no: 'Nobody wants a recount of anything. Let it rest.' },
    { s: 'You could write it in the chat instead.',
      no: 'The chat is read by nobody. A perfect place for it.' },
    { s: 'The cake has just arrived.',
      no: 'Cake takes priority over every question. You have made the right call.' },
    { s: 'Your question is mostly a complaint.',
      no: 'Complaints are best filed in a drawer marked “Later”, locked.' },
    { s: 'You have just realised you were never invited.',
      no: 'You sit still, as if you belong. You do, now.' },
    { s: 'The meeting is being recorded.',
      no: 'Nobody will watch the recording. But you would have been in it.' },
    { s: 'The speaker says “I know this is boring, but…”',
      no: 'It is boring, and you would be the one to prolong it.' },
    { s: 'A colleague in the corner is clearly about to say something.',
      no: 'They say it. It takes twelve minutes. You were right to wait.' },
    { s: 'Your question has parts (a), (b) and (c).',
      no: 'It would have had a part (d) by the time you finished.' },
    { s: 'You have a perfectly good question and a perfectly good lunch.',
      no: 'Lunch wins. Lunch always wins.' },
    { s: 'The person next to you has stopped breathing in a meaningful way.',
      no: 'That held breath saved you forty minutes.' },
    { s: 'You are already on three committees.',
      no: 'Your committee count stays at three. A beautiful number.' },
    { s: 'The speaker has just said “as you all know”.',
      no: 'You do not, but you all know how to nod. Nod.' },
    { s: 'You are very sure you are right.',
      no: 'Being right at a faculty meeting is a form of tenure. Hold on to it quietly.' },
    { s: 'The previous speaker was applauded.',
      no: 'Applause is rare here. Do not follow it with a question.' },
    { s: 'The minutes say this was already decided.',
      no: 'The minutes are the minutes. They are not reopened by questions, only by lawyers.' },
    { s: 'The microphone has just been handed to you “for convenience”.',
      no: 'You pass it on. Nobody has ever been punished for passing a microphone.' },
    { s: 'The department has just said “we are one big family”.',
      no: 'Families do not ask questions at dinner. They pass the potatoes.' },
    { s: 'You wrote the question down so as not to forget it.',
      no: 'Writing it down was the whole point. Now it is on paper, and quiet.' },
    { s: 'The previous question lasted eighteen minutes.',
      no: 'You can still hear its echo. You will not add to the echo.' }
  ];

  /* When you stay seated and nothing more specific fits. */
  const NO_GENERIC = [
    'Home in time for dinner.',
    'The meeting ends on time. Historic.',
    'A colleague nods at you across the table. Quiet respect.',
    'Nobody will ever know what you were going to ask. That is the point.',
    'The question can be rephrased in the corridor, and will be better there.',
    'Your question is now a draft email. It will never be sent. Perfect.',
    'You saved the room a discussion with no result.',
    'Somebody else asks it ten minutes later, in worse words. You feel a calm.',
    'The minutes will say: “There were no questions.” Frame it.',
    'You looked at the table with an expression of mild interest. A classic.',
    'The chair calls the next item. Fifty people exhale.',
    'You write the question on a post-it and put it in a drawer. It rests in peace.',
    'You gain a reputation as “not a problem”. Reputations compound.',
    'The question dissolves, as questions do after lunch.',
    'A colleague slides you a biscuit. This is how the system works.',
    'Your hand stays on the table, as designed.',
    'You and the room share a moment of mutual understanding. It lasts four seconds.',
    'The meeting ends at the time on the invitation. Someone checks the invitation.',
    'You note the question in your notebook. It is the last you will see of it.',
    'A quiet “thank you” appears in several people’s eyes.',
    'You write “Good meeting” in your notebook. Relatively speaking, it was.',
    'The silence is respectful, and also slightly hungry.',
    'A colleague gives you a slow, approving blink. You understand each other.',
    'You keep the question for your next evaluation. It will be your best material.',
    'The chair says “Thank you all”. For once, they mean it.',
    'The corridor fills with a happy low hum as the meeting ends.',
    'You make a small noise of agreement. It is exactly the right size.',
    'Your question lives on, quietly, in a shared document nobody opens.',
    'The projector turns itself off. A good omen.',
    'You meet the Dean’s eye, and neither of you regrets it.',
    'Nobody thanks you for the silence. That is how you know it worked.',
    'You save thirty minutes, enough to eat your sandwich while it is still a sandwich.',
    'The lights flicker, as if applauding.',
    'You leave the room as you entered it: unnoticed, unharmed.',
    'The silence sets an example for the next speaker, who ignores it.',
    'You nod gravely. The nod is the best invention of the century.',
    'Somebody coughs at the right moment. You feel understood.',
    'The question goes into the “maybe next year” folder, with all the others.',
    'You keep your hands folded, a symbol of peace and good time-keeping.',
    'The question is as good as asked, answered and forgotten, only faster.'
  ];

  /* When you ask. {m} is the overrun in minutes. */
  const YES = [
    'The answer is four words long. The discussion of the answer lasts fifteen minutes.',
    'Someone says “Good question.” That is not a compliment. It is a warning.',
    'You have been asked to form a working group on it.',
    'The meeting now ends {m} minutes late. People will remember.',
    '“Let’s take that offline.” Offline means you.',
    'A colleague sighs. A very quiet sigh, with an audible audience.',
    'Three follow-up questions follow. Two of them are about something else.',
    'You are now taking the minutes.',
    'The answer was on slide 14. The chair goes back to slide 14.',
    'The meeting overruns by {m} minutes. Lunch goes cold.',
    'Somebody replies “as I said in my email on the 3rd.” You have not read it.',
    'The Dean answers at length. You will not be asking again.',
    'A subcommittee is formed to answer the question. You are a member.',
    'The chair says “let’s park that”. It is parked in a car park you will never find.',
    'The answer begins “Historically…” and goes on for eleven minutes.',
    'You are thanked for your input. This is the polite end of your part in the discussion.',
    'A follow-up arrives from someone who was not listening.',
    'The meeting overruns by {m} minutes. A colleague quietly turns a watch towards you.',
    'The Dean notes your concern and asks you to write it up.',
    'Your name is added to the minutes, next to the question.',
    'The room discovers three new aspects of the problem. All of them yours.',
    'Your question has become item 8b on the agenda.',
    'Someone says “that is outside the scope.” You, apparently, are outside it too.',
    'A new working group is formed: “Questions Arising from the Question”.',
    'You are asked to “just draft something quickly”. It is now your something.',
    'The Dean says “Wonderful, could you lead on that?”',
    '“Excellent point.” Your name goes on a flip chart, and stays there.',
    'The discussion lasts {m} minutes. The answer is “we will see”.',
    'A colleague says “Can I build on that?” and builds a small town.',
    'You are named the department’s representative on a committee with no meetings yet.',
    '“That is a matter for the Strategy Group.” It meets in October. Of next year.',
    'The chair says “let’s circle back”. It will circle for six months.',
    'A hand goes up in the back row: a three-part question about parking.',
    'Three people turn towards you at once. It is the last time they will look so interested.',
    'The meeting overruns by {m} minutes, and your cinnamon bun is gone.',
    'An email arrives that evening: “Following up on your question…” It is long.',
    'You are asked to present the answer at the next meeting. As a slide. With a template.',
    '“Does anyone want to take that on?” Everybody looks at you.',
    'Someone adds a new item: “Further questions”. The room looks at you.',
    'You are told “we have a form for that”. The form has a form.',
    'A senior colleague says “If I may…” and speaks for nine minutes.',
    'The meeting overruns by {m} minutes. A record for the room, and not the kind to frame.',
    'Your question is added to the risk register, under “Staff”.',
    'The question is forwarded to a person who left in 2021.',
    '“Thank you for raising that.” It is now your job to raise it again, in writing.',
    'The chair says “that is above my pay grade”. It is, in fact, also above yours.',
    'A colleague says “and, while we are at it…” Your question has doubled.',
    'The answer is “it depends”. It depends for {m} minutes.'
  ];

  const HAND_UP = [
    'Your hand went up on its own. This has happened before. ',
    'The hand rose before the thought had finished. As it often does. ',
    'Your arm made the decision without consulting you. ',
    'Somewhere between thought and table, the hand went up. '
  ];

  /* ─── State ──────────────────────────────────────────────── */

  const TOTAL = 10;
  const MAX_LIVES = 3;

  const S = {
    running: false,
    score: 0,
    best: Number(localStorage.getItem('facultymeeting.best') || 0),
    streak: 0,
    lives: MAX_LIVES,
    done: 0,
    scenario: null,
    circBag: [],
    limit: 0,
    endsAt: 0,
    locked: true
  };

  const $ = (id) => document.getElementById(id);
  const elPaper  = $('paper'),   elMark   = $('mark'),    elWhy   = $('why');
  const elScore  = $('score'),   elStreak = $('streak'),  elBest  = $('best');
  const elLives  = $('lives'),   elFill   = $('hand-fill'), elHand = $('hand-icon');
  const elCount  = $('item-count');
  const elHour   = $('clock-hour'), elMin = $('clock-min');
  const btnNo    = $('pick-no'), btnAsk   = $('pick-ask');
  const overlay  = $('overlay');

  /* Phones: if the content is taller than the window, scale it down until the
     whole card and the buttons are visible. Only ever shrinks during a round,
     so the layout does not jump from card to card. */
  const stageEl = document.querySelector('.stage');
  let zoom = 1;
  function fit(reset) {
    if (reset) zoom = 1;
    stageEl.style.setProperty('--z', zoom);
    const cs = getComputedStyle(stageEl);
    const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    for (let i = 0; i < 5 && zoom > 0.5 && stageEl.scrollHeight > stageEl.clientHeight + 1; i++) {
      zoom = Math.max(0.5, zoom * (stageEl.clientHeight - pad) / (stageEl.scrollHeight - pad));
      stageEl.style.setProperty('--z', zoom.toFixed(3));
    }
  }
  window.addEventListener('resize', () => fit(true));

  function pick(a) { return a[(Math.random() * a.length) | 0]; }
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function mult()    { return Math.min(5, 1 + Math.floor(S.streak / 3)); }
  function timeFor() { return Math.max(16, 20 - S.done * 0.4); }

  /* ─── Rounds ─────────────────────────────────────────────── */

  function build() {
    const useCirc = Math.random() < Math.min(0.75, 0.3 + S.done * 0.03);
    let circ = null;
    if (useCirc) {
      if (!S.circBag.length) S.circBag = shuffle(CIRC.slice());
      circ = S.circBag.pop();
    }
    return {
      who: pick(WHO), when: pick(WHEN), room: pick(ROOM),
      topic: pick(TOPIC), q: pick(QUESTION), circ: circ
    };
  }

  function setClock(h, m) {
    elHour.setAttribute('transform', 'rotate(' + ((h % 12) * 30 + m * 0.5) + ' 50 50)');
    elMin.setAttribute('transform', 'rotate(' + (m * 6) + ' 50 50)');
  }

  function deal() {
    const sc = S.scenario = build();
    S.locked = false;

    // Restart the entrance animation on the same element.
    elPaper.className = 'paper';
    void elPaper.offsetWidth;

    $('f-who').textContent   = sc.who;
    $('f-when').textContent  = sc.when.s;
    $('f-room').textContent  = sc.room.s;
    $('f-topic').textContent = sc.topic;
    $('row-circ').hidden = !sc.circ;
    $('f-circ').textContent = sc.circ ? sc.circ.s : '';
    $('thought').textContent = '“' + sc.q + '”';
    setClock(sc.when.h, sc.when.m);

    elMark.textContent = '';
    elWhy.textContent = '';
    elWhy.className = 'why';
    elFill.style.width = '0%';
    elFill.classList.remove('is-high');
    elHand.style.left = '0%';
    elHand.classList.remove('is-up');
    elCount.textContent = 'Item ' + (S.done + 1) + ' of ' + TOTAL;
    btnNo.disabled = false;
    btnAsk.disabled = false;

    S.limit = timeFor();
    S.endsAt = Date.now() + S.limit * 1000;
    SFX.deal();
    render();
    fit();
  }

  function lock() {
    S.locked = true;
    btnNo.disabled = true;
    btnAsk.disabled = true;
  }

  function resolve(asked, timedOut) {
    if (!S.running || S.locked) return;
    lock();
    const sc = S.scenario;
    S.done++;

    if (!asked) {
      SFX.right();
      const pts = sc.room.n * 10 * mult();
      S.score += pts;
      S.streak++;
      const r = Math.random();
      const line = (sc.circ && r < 0.7) ? sc.circ.no
                 : (r < 0.5)            ? sc.when.no
                 :                        pick(NO_GENERIC);
      elPaper.classList.add('is-right');
      elMark.textContent = '✓';
      elWhy.className = 'why is-good';
      elWhy.textContent = 'Stayed seated. ' + line + '   +' + pts.toLocaleString();
    } else {
      SFX.wrong();
      S.streak = 0;
      S.lives--;
      const m = 8 + ((Math.random() * 28) | 0);
      elPaper.classList.add('is-wrong');
      elMark.textContent = timedOut ? '✋' : '✗';
      elFill.style.width = '100%';
      elFill.classList.add('is-high');
      elHand.style.left = '100%';
      elHand.classList.add('is-up');
      elWhy.className = 'why is-bad';
      elWhy.textContent = (timedOut ? pick(HAND_UP) : 'You asked. ') + pick(YES).replace('{m}', m);
    }

    render();
    fit();
    if (S.lives <= 0) { setTimeout(lose, 4200); return; }
    if (S.done >= TOTAL) { setTimeout(win, 3600); return; }
    setTimeout(deal, asked ? 5200 : 3800);
  }

  /* ─── Loop ───────────────────────────────────────────────── */

  let lastTick = 0;
  function tick() {
    if (!S.running || S.locked) return;
    const left = S.endsAt - Date.now();
    const used = Math.max(0, Math.min(1, 1 - left / (S.limit * 1000)));
    elFill.style.width = (used * 100) + '%';
    elHand.style.left = (used * 100) + '%';
    elFill.classList.toggle('is-high', used > 0.62);
    const whole = Math.ceil(left / 1000);
    if (left < 2000 && whole !== lastTick) { lastTick = whole; SFX.tick(); }
    if (left <= 0) resolve(true, true);
  }

  function render() {
    elScore.textContent = S.score.toLocaleString();
    elStreak.textContent = '×' + mult();
    elStreak.classList.toggle('is-hot', mult() >= 3);
    elBest.textContent = S.best.toLocaleString();
    [...elLives.querySelectorAll('i')].forEach((m, i) => {
      m.classList.toggle('is-gone', i >= S.lives);
    });
  }

  /* ─── Screens ────────────────────────────────────────────── */

  function show(html) { overlay.innerHTML = html; overlay.classList.add('is-open'); }

  /* The flowchart this game is based on. */
  function flowchart() {
    return (
      '<details class="flow"><summary>See the flowchart</summary><div class="flow-chart">' +
        '<div class="fc-box">Do you have a question?</div>' +
        '<div class="fc-arrow">yes</div>' +
        '<div class="fc-box">Could it be an email?</div>' +
        '<div class="fc-side">yes: send it. Then stop.</div>' +
        '<div class="fc-arrow">no</div>' +
        '<div class="fc-box">Would you be happy to stay 45 minutes longer for it?</div>' +
        '<div class="fc-side">“yes” means you are not being honest.</div>' +
        '<div class="fc-arrow">no</div>' +
        '<div class="fc-box is-end">DO NOT ASK</div>' +
      '</div></details>'
    );
  }

  function startScreen() {
    show(
      '<div class="card">' +
      '<div class="card-kicker">A faculty meeting</div>' +
      '<h1 class="card-title">Should I Ask <span>a Question?</span></h1>' +
      '<p class="card-body">Item by item you are given a situation, and a thought you would very ' +
      'much like to share. Decide whether to raise your hand.</p>' +
      '<ul class="card-rules">' +
        '<li>In every situation there is exactly one correct answer. Take your time. You have about twenty seconds, and a little less as the meeting drags on.</li>' +
        '<li>Your hand rises on its own. When the bar is full, you have asked.</li>' +
        '<li>Each time you stay seated you spare everyone in the room ten minutes. The score is person-minutes.</li>' +
        '<li>Three questions, and the room has had enough of you.</li>' +
        '<li>Keys: <b>←</b> or <b>N</b> to stay seated, <b>→</b> or <b>Y</b> to ask.</li>' +
      '</ul>' +
      '<button class="btn" id="start-btn">Call the meeting to order</button>' +
      '<a class="card-back" href="../index.html">← Back to the Common Room</a>' +
      '</div>'
    );
    $('start-btn').addEventListener('click', start);
  }

  function endScreen(kicker, title, body, sfx) {
    S.running = false;
    sfx();
    const isBest = S.score > S.best;
    if (isBest) { S.best = S.score; localStorage.setItem('facultymeeting.best', String(S.best)); }
    show(
      '<div class="card">' +
      '<div class="card-kicker">' + kicker + '</div>' +
      '<h1 class="card-title">' + title + '</h1>' +
      '<p class="card-body">' + body + '</p>' +
      '<div class="result">' +
        '<div><b>' + S.score.toLocaleString() + '</b><span>Person-min saved</span></div>' +
        '<div><b>' + S.best.toLocaleString() + '</b><span>Best</span></div>' +
      '</div>' +
      (isBest ? '<p class="card-body card-best">A new best.</p>' : '') +
      flowchart() +
      '<button class="btn" id="again-btn">Another meeting</button>' +
      '<a class="card-back" href="../index.html">← Back to the Common Room</a>' +
      '</div>'
    );
    $('again-btn').addEventListener('click', start);
    render();
  }

  function lose() {
    endScreen(
      'Out of patience',
      'You have been appointed<br><span>to the working group</span>',
      'You raised one hand too many. The first meeting is on Monday, at eight.',
      SFX.over
    );
  }

  function win() {
    endScreen(
      'Meeting adjourned',
      'Closed <span>four minutes early</span>',
      'Ten items and not a word from you. You will be asked to chair next year’s meeting. ' +
      'Nobody will say why.',
      SFX.win
    );
  }

  function start() {
    SFX.unlock();
    overlay.classList.remove('is-open');
    S.score = 0; S.streak = 0; S.lives = MAX_LIVES; S.done = 0;
    S.circBag = [];
    S.running = true;
    render();
    fit(true);
    deal();
  }

  /* ─── Wiring ─────────────────────────────────────────────── */

  btnNo.addEventListener('click',  () => resolve(false, false));
  btnAsk.addEventListener('click', () => resolve(true, false));

  document.addEventListener('keydown', (e) => {
    if (!S.running) return;
    const k = e.key.toLowerCase();
    if (k === 'n' || k === 'arrowleft')  { e.preventDefault(); resolve(false, false); }
    if (k === 'y' || k === 'arrowright') { e.preventDefault(); resolve(true, false); }
  });

  let hiddenAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (!S.running) return;
    if (document.hidden) hiddenAt = Date.now();
    else if (hiddenAt) { S.endsAt += Date.now() - hiddenAt; hiddenAt = 0; }
  });

  render();
  startScreen();
  setInterval(tick, 80);

})();

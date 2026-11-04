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
    'the colleague who answers every email with “Noted.”',
    'the person who chairs the committee that chairs this meeting',
    'a professor who has been on sabbatical, in spirit, since 2019',
    'the head of the teaching committee, who has a spreadsheet',
    'a colleague who has just been promoted and is being very humble about it',
    'the colleague who bakes, and is therefore never questioned',
    'a PhD student who has been told this will be “good for the CV”',
    'the department’s only expert on the room-booking system',
    'a professor who forwards every email with the single word “FYI”',
    'the colleague who has strong feelings about the font in the minutes',
    'a lecturer who has just discovered the “raise hand” button on Zoom',
    'the new administrator, on day two, with an enormous binder',
    'a professor whose office is behind a door marked “Do not disturb. Seriously.”',
    'the colleague who has been “meaning to look into that” since 2022',
    'a senior lecturer with a printed list of grievances',
    'someone from Finance, here to say “no” politely in advance',
    'a colleague who is also in the room next door, in a different meeting',
    'the person whose job nobody can quite describe, but who is always right',
    'the visiting scholar who was told the meeting was optional',
    'a professor who leaves early and returns with questions',
    'the senior colleague who says “I have a brief comment” and then does',
    'a lab manager with a lanyard full of keys',
    'the chair of the equality committee, who is already tired',
    'a postdoc who is the only person taking notes',
    'the colleague who calls every meeting “a bit of a talking shop”',
    'the colleague who is, as always, “just playing devil’s advocate”',
    'a professor who is livestreaming a different meeting on mute',
    'the library representative, with a pointed silence',
    'a man from IT who has been told to “just fix it”',
    'a professor who is an optimist about timetables',
    'the colleague whose email signature is longer than their emails',
    'the secretary of a committee that has not met since 2018',
    'a researcher who joined to “see how the sausage is made”',
    'a teaching assistant who has not been told what the meeting is about',
    'the person who always says “this is not really my area”, then talks',
    'a former head of department, now merely a presence',
    'the professor who was promised this would take fifteen minutes',
    'the colleague who has a PowerPoint for any occasion',
    'the PhD student who is the only one still smiling',
    'the dean’s representative, who is not allowed to answer anything',
    'a researcher on a grant that ends in three weeks'
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
      no: 'The cleaners are impressed. Cleaners are not easily impressed.' },
    { h: 7,  m: 40, s: '07:40. The first meeting of the day, and a train strike is rumoured.',
      no: 'The strike never arrives. Neither does your question.' },
    { h: 8,  m: 15, s: '08:15. The head of department has brought a motivational quote.',
      no: 'The quote hangs in the air unquestioned. A rare mercy.' },
    { h: 8,  m: 45, s: '08:45. The room still smells of the previous meeting’s coffee.',
      no: 'The smell fades. So does any wish to speak.' },
    { h: 9,  m: 40, s: '09:40. Ten minutes behind, and the chair is already apologising.',
      no: 'The apologising is the only item running on time. Let it.' },
    { h: 10, m: 0,  s: '10:00. The meeting begins with a long minute of silence about the agenda.',
      no: 'The silence is on the record. You contributed to it. Proudly.' },
    { h: 10, m: 15, s: '10:15. The slides have just been emailed, five minutes ago.',
      no: 'Nobody has read them. You are in excellent company.' },
    { h: 10, m: 50, s: '10:50. The kettle is boiling, quietly, next door.',
      no: 'The kettle wins. Kettles usually do.' },
    { h: 11, m: 5,  s: '11:05. Someone has spilled coffee on the agenda.',
      no: 'The coffee decides the order of items. A fairer system than most.' },
    { h: 11, m: 25, s: '11:25. Item 5 of 14, and the room is quietly counting.',
      no: 'Nine to go. Your silence saves you eight minutes at least.' },
    { h: 11, m: 45, s: '11:45. The lunch menu is on a tray outside the door.',
      no: 'The menu is the real agenda. You have read it. You are ready.' },
    { h: 12, m: 30, s: '12:30. The sandwiches are at risk of going dry.',
      no: 'The sandwiches survive. Several hearts are with you.' },
    { h: 13, m: 0,  s: '13:00. The meeting has been moved to after lunch, “just for 45 minutes”.',
      no: 'Forty-five minutes become forty-five minutes. A rare thing.' },
    { h: 13, m: 20, s: '13:20. The bright afternoon sun is now directly on the screen.',
      no: 'You cannot see the screen, so you cannot ask about it. Fate is kind.' },
    { h: 14, m: 15, s: '14:15. The head of department has said “just a few announcements”.',
      no: '“A few” remains a few. A small miracle you made possible.' },
    { h: 14, m: 40, s: '14:40. The radiators have been turned up to “sauna”.',
      no: 'You are too warm to formulate a question. Thank the radiators.' },
    { h: 15, m: 0,  s: '15:00. Item 9 is the budget, and it is, of course, still item 3.',
      no: 'The budget remains in its cage. Let it sleep.' },
    { h: 15, m: 20, s: '15:20. A student is waiting by the door for the lecturer.',
      no: 'The lecturer slips out. The meeting takes it as a good sign.' },
    { h: 16, m: 0,  s: '16:00. The meeting was meant to be over. It is item 11.',
      no: 'Your silence trims item 11 by seven minutes. A generous gift.' },
    { h: 16, m: 35, s: '16:35. The light outside is already going.',
      no: 'You step into the dusk with a clear conscience.' },
    { h: 16, m: 50, s: '16:50. The last bus leaves in fifteen minutes.',
      no: 'Several people sprint for the bus. You are proud of every one.' },
    { h: 17, m: 10, s: '17:10. Someone has switched off the main lights.',
      no: 'The meeting adjourns in the dim. Few questions survive darkness.' },
    { h: 17, m: 30, s: '17:30. The chair says “one more thing”. It is the fourth.',
      no: 'The fourth “one more thing” stays one thing. You did not add a fifth.' },
    { h: 18, m: 30, s: '18:30. The building has gone quiet, and so has the room.',
      no: 'The quiet is complete. You are its guardian.' },
    { h: 12, m: 55, s: '12:55. Half the room has left for lunch “just to check the queue”.',
      no: 'The queue is checked. The meeting is a little quieter, thanks to you.' },
    { h: 9,  m: 0,  s: '09:00. On the dot. Everyone is suspicious.',
      no: 'The start was on time and the end will be too. Mind how you use that.' },
    { h: 14, m: 5,  s: '14:05. A lecturer has just walked in with a cup of tea.',
      no: 'The tea is respected, and so is your silence.' },
    { h: 15, m: 35, s: '15:35. Somebody’s phone has just rung, and it is the chair’s.',
      no: 'The chair takes the call. You take the opportunity. To stay quiet.' },
    { h: 10, m: 35, s: '10:35. Someone has already said “as per my last email”.',
      no: 'Nobody remembers the last email. Do not remind them.' },
    { h: 13, m: 45, s: '13:45. The agenda has been updated, in a way that is not visible.',
      no: 'The updates remain invisible. So, comfortably, do you.' }
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
    'a revised policy on policy revisions',
    'the proposed new template for the template committee',
    'a pilot scheme to pilot the pilot scheme',
    'the strategy for the strategy',
    'the use of “learnings” in official documents',
    'an apology for the earlier apology',
    'the annual rotation of the whiteboard pens',
    'the new rules for lending out the department’s laser pointer',
    'a workshop on how to run better workshops',
    'the pros and cons of a four-day week in the corridor',
    'the budget for next year’s budget meeting',
    'the introduction of a rule for the length of rules',
    'the ranking of the department’s rankings',
    'a plan to measure the measuring of impact',
    'the new rules for the use of the word “synergy”',
    'the department’s official position on the Oxford comma',
    'plans for the department’s 50th anniversary, which was in 2017',
    'the opening hours of the opening hours committee',
    'the departmental hat, which has been designed',
    'the question of who keeps the master key',
    'the revised mandate for the revised mandate',
    'Appendix C of the report on the review of the review',
    'a motion to move the motion to the next meeting',
    'quality indicators for the indicators of quality',
    'a vote on a vote on a vote',
    'the department’s mascot, if any',
    'an introduction to the new introduction process',
    'the colour of the lanyards',
    'the faculty’s ambitious new vision for next Tuesday',
    'how to word an email about wording emails',
    'the new rule that all rules must be in a rulebook',
    'an interim report on the final report',
    'the standing item “Any Other Business”, which is never any other business',
    'the future of the future-of-work working group',
    'the colour of the new door handles',
    'a policy on the use of policies',
    'the proposed hat-tip to the previous hat-tip',
    'a sustainability plan for the sustainability plan',
    'the introduction of a feedback form for feedback forms',
    'the possible cancelling of the cancelled seminar',
    'the extension of the extension of the deadline'
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
    'Is there a version with fewer bullets?',
    'Does this apply to the part of the department that is on the other floor?',
    'Is it fair to say that we have not decided yet?',
    'Could we hear the objection to the objection?',
    'Is the agenda also a decision?',
    'Is this on the strategic plan, or a separate plan?',
    'When you say “soon”, do you mean this year?',
    'How many of us have read the 60-page appendix?',
    'Is this the version that the Dean has seen?',
    'Would the proposal change if we ignored it?',
    'Are we saying the old rule is wrong, or merely old?',
    'Is the form online, or only in my inbox?',
    'Does “all staff” include the staff?',
    'Do I have to attend the follow-up to the follow-up?',
    'Would it be possible to circulate the slides after?',
    'Is this a pilot, or the real thing in disguise?',
    'Who exactly is the “key stakeholder”?',
    'Is the deadline the one in the email, or the one in the calendar?',
    'Does “shortly” have a number?',
    'Are the minutes from last time anywhere?',
    'Is there a version for people who were not here?',
    'Is it possible that this is a solution in search of a problem?',
    'Can we agree on what we are agreeing to?',
    'Why does this need a working group?',
    'Is there funding, or only enthusiasm?',
    'Could we have a vote on whether to have a vote?',
    'Does the new system talk to the old system?',
    'Does the evaluation evaluate itself?',
    'Do you mean the 2022 version or the 2023 version?',
    'Is that “we” the department or the faculty?',
    'Has the legal side seen the version that mentions the legal side?',
    'Could “urgent” be in a different colour?',
    'So, to be clear, the answer is “maybe”?',
    'Who is the Dean’s Dean?',
    'May I ask what happened to the thing we had before?',
    'Are we the pilot for ourselves?',
    'What will we stop doing, to do this?',
    'Whose idea was the acronym?',
    'Is it me, or has the scope changed since the last slide?',
    'Does this require a new form, or only a new button?',
    'What is the baseline we are improving on?',
    'Why is item 4 before item 3?',
    'Could we see a draft that has been drafted by humans?',
    'Is this table to be read from the bottom?',
    'Is the aim to reduce the time spent on meetings, or to move it?',
    'Can anyone remind me what “KPI” stood for in our department?',
    'Has the right person been told, or only the person who was told?',
    'Could we put the cost per person on the slide?',
    'What’s our plan if the plan doesn’t work?',
    'So who is the owner of the follow-up?',
    'Is there a version of the plan with fewer boxes and arrows?'
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
      no: 'You can still hear its echo. You will not add to the echo.' },
    { s: 'You have just been told “let’s take questions at the end”.',
      no: 'The end has no questions left. It has only coats.' },
    { s: 'The previous speaker went over by twenty minutes.',
      no: 'The room has no appetite for more. You can read it in the shoulders.' },
    { s: 'The chair has said “let’s be brief” four times.',
      no: 'Being brief is the only way to be at peace. Practise on yourself.' },
    { s: 'You can see the head of department’s eye twitching.',
      no: 'The twitch calms. You have the thanks of a very tired person.' },
    { s: 'Somebody’s dog has just joined the discussion.',
      no: 'The dog gets the floor. It makes a better case than you would.' },
    { s: 'Your question is about the budget, which has just been approved.',
      no: 'Approved budgets are like sleeping tigers. Tiptoe.' },
    { s: 'The meeting is being livestreamed to 400 people.',
      no: 'Four hundred people are spared. Several of them send a silent thanks.' },
    { s: 'The previous question was answered with “we will come back to that”.',
      no: 'They will not come back. Neither will you, to that question.' },
    { s: 'A colleague has just glanced at you, then pointedly at the exit.',
      no: 'You follow the glance in spirit and keep your seat. An honest compromise.' },
    { s: 'You are one vote away from a majority on a different question.',
      no: 'You stay seated, and so does the majority.' },
    { s: 'You can hear a chair being pushed back, softly, near the door.',
      no: 'The room is going. Be one of the ones that goes with it.' },
    { s: 'It is your own proposal being discussed.',
      no: 'Your proposal is being discussed beautifully, without you. Let it.' },
    { s: 'You have just noticed that the question was answered in the pre-reading.',
      no: 'You have noticed in time. Congratulations on a modest, private victory.' },
    { s: 'It would be a question about the question.',
      no: 'There is no such thing as a question about a question. It is a meeting.' },
    { s: 'You have been staring at the same slide for twelve minutes.',
      no: 'The slide has become a friend. Do not ruin it by talking.' },
    { s: 'The speaker is a visiting professor.',
      no: 'Visitors should leave with a good impression. You are the impression.' },
    { s: 'You are 80% sure you are right.',
      no: 'Twenty per cent of you is correct to stay seated.' },
    { s: 'You are 100% sure you are right.',
      no: 'Being 100% sure is the surest sign that you should wait for the corridor.' },
    { s: 'A senior colleague has just said “I was about to ask that.”',
      no: 'You and the senior colleague share a rare, silent understanding.' },
    { s: 'The microphone is on the other side of the room.',
      no: 'Nobody will walk to you. Nobody will walk to anybody. It is peace.' },
    { s: 'The chair is looking at the clock.',
      no: 'You look at the clock too. You and the chair are suddenly very close.' },
    { s: 'You have just been called “our critical friend”.',
      no: 'The friend stays quiet. Friends do not make friends sit longer.' },
    { s: 'It is the fourth item that mentions “stakeholders”.',
      no: 'The stakeholders remain a mystery. They are safer that way.' },
    { s: 'The hash tag on the slide is longer than the item.',
      no: 'Some things should not be asked about. Hash tags are one of them.' },
    { s: 'The room has just agreed on something, by mistake.',
      no: 'The mistake stands. Do not tempt the room to correct it.' },
    { s: 'The agenda was updated ten minutes ago.',
      no: 'Nobody has the updated agenda. Nobody has the old one either. Peace.' },
    { s: 'You can see a path to a better solution.',
      no: 'The path will still be there at the end of the corridor. It always is.' },
    { s: 'You have sent a similar question by email, twice.',
      no: 'The email will be answered. Eventually. Never in person.' },
    { s: 'You are holding a coffee, and you have just remembered it is cold.',
      no: 'The coffee is cold, and so is the room. Hold it. Hold on.' },
    { s: 'The Dean has just said “this is a safe space”.',
      no: 'Safe spaces at faculty meetings are a lovely idea. Do not test it.' },
    { s: 'There is a new member of staff in the room.',
      no: 'The new colleague is watching you for cues. Give them a calm one.' },
    { s: 'It is a follow-up to a question from last term.',
      no: 'Last term’s question is dead, and has had a nice funeral.' },
    { s: 'The speaker has just said “I will not take up much of your time”.',
      no: 'They will. The kindest response is to avoid doubling it.' },
    { s: 'You are the only person whose camera is on.',
      no: 'The little green light is a spotlight. Dim it by saying nothing.' },
    { s: 'The previous speaker was interrupted by a fire alarm test.',
      no: 'The alarm has said all that needs to be said.' },
    { s: 'You have a small, bright, devastating point.',
      no: 'Small, bright, devastating points are best kept for the autumn.' },
    { s: 'It is a question about what is on the agenda for the next meeting.',
      no: 'The next meeting will be here soon enough, and with all its friends.' },
    { s: 'It is about the same thing as last time, which had no effect.',
      no: 'The thing is now a tradition. Traditions are protected, not questioned.' },
    { s: 'The microphone feedback has just stopped, mid-whine.',
      no: 'Silence is a precious thing. You will be sensible and keep it.' },
    { s: 'The speaker has just apologised for the slide.',
      no: 'An apology deserves a nod, not a question.' },
    { s: 'You can hear the person next to you thinking about lunch.',
      no: 'A loud stomach agrees with you. Two against one.' },
    { s: 'Someone has said “as you may remember…”',
      no: 'You do not remember, and neither does anyone else. Perfect.' },
    { s: 'A colleague has just shared a screen of their desktop by mistake.',
      no: 'Nobody will talk about the desktop. You will not be the first.' },
    { s: 'Your thought was actually quite kind.',
      no: 'Kindness is sometimes best expressed by being quiet and passing the biscuits.' },
    { s: 'The question is about holiday allowances.',
      no: 'Holiday allowances are a matter for after the meeting, and after you.' },
    { s: 'The room has just lowered its voice for something delicate.',
      no: 'The delicate thing is left delicate. You have a way with tact.' },
    { s: 'You can hear a toddler on someone else’s Zoom.',
      no: 'The toddler wins the room. You are outclassed. Happily.' },
    { s: 'There is a quiz at the end of the meeting.',
      no: 'There is no quiz. The question never was one.' },
    { s: 'The agenda is a PDF with 63 pages.',
      no: 'Sixty-three pages deserve a long look in silence.' },
    { s: 'The chair has said “this is not a hill to die on”.',
      no: 'You pick a different hill. Or a valley. Or the bus stop.' }
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
    'The question is as good as asked, answered and forgotten, only faster.',
    'You and the room agree to disagree about nothing at all.',
    'The chair makes a note: “No further questions.” It is the nicest sentence of the day.',
    'The silence rolls on, gently, like a bus that is on time.',
    'A colleague whispers “thank you” on the way out. They deny it later.',
    'You save the room four minutes, which is precisely enough for a biscuit.',
    'The meeting ends and you remember how good it feels to be a bystander.',
    'The question evaporates, and with it a small, impatient part of the future.',
    'You tick off item 7 in your head. Quietly. In ink.',
    'You are the sort of person people want in meetings. Quietly valued.',
    'Everything that could be said is not said. It is a style.',
    'A colleague catches your eye and mouths “wise”.',
    'The chair seems less tired than usual, which you can take credit for.',
    'Your pen hovers, then rests. A fine decision.',
    'The meeting finishes before the next fire alarm test. A first.',
    'You do not ask, and your day improves in several unrelated ways.',
    'A little warm feeling settles in your chest. It is called “tact”.',
    'The room carries on at the speed of a very slow river. You approve.',
    'You do not ask, and somebody’s lunch survives the meeting.',
    'You raise an eyebrow at yourself, and sit still.',
    'Later, nobody will remember who did not speak. That is the whole idea.',
    'You compose the perfect question and send it nowhere. Elegant.',
    'You save the question for a rainy day, which in this country comes quickly.',
    'The meeting remains a pleasant mystery to all participants.',
    'Item 8 is reached with an hour to spare. Nobody understands why.',
    'A collective, silent, grateful breath fills the room.',
    'Your restraint is noted by nobody and appreciated by everybody.',
    'You are one of the people who keep the department moving, by not moving.',
    'The minutes are short, and for once nobody is cross.',
    'The scheduler cries a single tear of joy.',
    'You leave with your question intact and your reputation too.',
    'The rest of the afternoon belongs to you, unbothered.',
    'The silence has the texture of a well-run department.',
    'You lean back. The room leans back with you.',
    'You save the question and also the afternoon.',
    'The pen in your pocket goes unclicked. That counts.',
    'The meeting ends before the cake goes dry. Two wins.',
    'You are the fourth person today who said nothing, and the best.',
    'The next speaker thanks “the audience” and means you.',
    'You have taken the long view. It is a very short meeting from there.',
    'A small bell rings somewhere. It is the sound of nothing being asked.',
    'You nod slowly, at nothing in particular. It looks like wisdom.',
    'The questions you did not ask line up in the corridor and look at you fondly.',
    'You have not stood out. In academia this is a form of life insurance.',
    'You feel like a fine wine: patient, quiet, and not yet opened.',
    'The room never knew what it had been spared. You did.',
    'Your question will appear in your next performance review as “collegial restraint”.',
    'A small, well-fed cat of satisfaction curls up in your chest.',
    'Everyone leaves on time. Several of them check their watches in disbelief.',
    'Even the projector seems happier now.',
    'It is raining outside, and you are not stuck in here. Good call.'
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
    'The answer is “it depends”. It depends for {m} minutes.',
    'Someone says “Let’s form a working group.” Everyone looks at you.',
    'You are told “that’s a great question for the Dean”. The Dean is on leave.',
    'The question becomes the new item 3. It runs for {m} minutes.',
    'The chair says “Can we capture that as an action?” The action is yours.',
    'A colleague replies, at length, to a different question you did not ask.',
    'The answer is “It’s complicated.” It takes {m} minutes.',
    'Three people begin to answer at once. Nobody finishes.',
    'You are asked to send round “a short note”. It is not short.',
    'Someone says “Let’s revisit that in the autumn.” You will be revisited too.',
    'A colleague says “Perhaps we should hear from the PhD students.” They look at you.',
    'The room looks at you, then at the clock, then at you.',
    'The meeting runs {m} minutes over, and the sandwiches have curled.',
    'The chair says “I’ll take that as a comment.” It is now a comment.',
    'The question is answered by a slide that has not yet been made.',
    'A colleague sighs the deep sigh of someone with a train to catch.',
    'You hear “I take your point.” This is the sound of a point being buried.',
    'Your question is added to a list. The list has no recipient.',
    'Someone says “We’ve been over this.” They have. You have not.',
    'The discussion that follows is, technically, about something else.',
    'The chair says “Let’s put a pin in that.” The pin falls out in the corridor.',
    'You have just offered to “look into it”. You are now looking into it.',
    'A colleague says “I’d like to add to that” and adds for nine minutes.',
    'You are asked to “prepare a one-pager”. It is now a four-pager.',
    'The answer is a sub-clause, in a sub-clause, in a sub-clause.',
    'The Dean says “I’m glad you asked that.” The Dean is not glad.',
    'The meeting overruns by {m} minutes, and the cake is now crumbs.',
    'Everyone agrees it is a good question. Nobody answers it.',
    'The question is passed to a committee which has just been renamed.',
    'You receive a polite nod from the chair, which means: never again.',
    'Your colleague replies “Great question” in the voice of a closing door.',
    'The chair says “Thanks for that.” It is the sound of a lid going on.',
    'Another person says “just to add to that” and introduces an unrelated grievance.',
    'The meeting overruns by {m} minutes. Somebody’s bus is leaving without them.',
    'A deputy deputy head clears their throat. This will take {m} minutes.',
    'The chair says, gravely, “Let’s not go down that road.” The room has already gone.',
    'The answer comes in a bulleted list. It has fourteen bullets.',
    'Everyone is quiet in the way that means “why did you do this?”',
    'You are told “that’s above my pay grade”. It is above everyone’s.',
    'A colleague leans in and whispers “Oh no.”',
    'The question triggers a debate about the previous question.',
    'You are told “We’ll follow up with you.” You will not be followed up.',
    'The meeting now ends {m} minutes late. The cleaners have been briefed on you.',
    'A new item “Matters arising from the question” is added at the top.',
    'The room discovers that nobody is the owner of anything. It takes {m} minutes.',
    'Somebody says “I think we’ve all learned something here.” You have learned what not to do.',
    'The chair says “Would you like to pick that up as a project?” It is a trap.',
    'Everybody now has a strong opinion. All of them are about you.',
    'The meeting is now officially longer than the previous meeting’s apology.',
    'You are invited to “share your thoughts in writing”. This is a threat.'
  ];

  const HAND_UP = [
    'Your hand went up on its own. This has happened before. ',
    'The hand rose before the thought had finished. As it often does. ',
    'Your arm made the decision without consulting you. ',
    'Somewhere between thought and table, the hand went up. ',
    'The hand was up before the thought had ever been approved. ',
    'You did not raise the hand. The hand raised itself. ',
    'Your arm, a loyal servant of old habits, went up. ',
    'An old reflex struck, and the hand answered. ',
    'The hand went up like a flag at a very small, very bad parade. ',
    'You felt the arm lifting. You watched. You could not intervene. ',
    'Your hand rose, as if lifted by a small, enthusiastic balloon. ',
    'The brain said “wait”. The hand did not receive the message. '
  ];


  /* ── Combinatorial lists: each one multiplies a handful of parts. ── */

  /* Tacked onto a person now and then. */
  const WHO_TAIL = [
    ', mid-sandwich',
    ', visibly composing an email',
    ', who has not yet spoken',
    ', still wearing the visitor badge',
    ', who is “just here to listen”',
    ', holding a very full cup of coffee',
    ', who arrived late and wants it known',
    ', who has an appointment at four',
    ', who has just muted and unmuted twice',
    ', whose laptop is clearly updating',
    ', who has brought a printed copy of everything',
    ', who has a cold and a point of view',
    ', who has just whispered “hmm”',
    ', sitting very close to the exit',
    ', who has been nodding for ten minutes',
    ', who has forgotten the pre-reading',
    ', with a suspicious smile',
    ', who is wearing the face of someone about to say “just one thing”',
    ', who has a small, ominous pile of paper',
    ', who has opened the window and now regrets it',
    ', who is quietly writing a better agenda',
    ', who looks at you, then at the exit',
    ', on a video call from a car park',
    ', who is eating a banana with great dignity',
    ', who has already left in spirit',
    ', who has put the pen down meaningfully',
    ', who is clearly about to disagree',
    ', who has just checked the time for the third time',
    ', who is wearing sunglasses indoors, for reasons',
    ', who has brought a laptop, a tablet and a phone'
  ];

  /* An optional weekday in front of the clock. */
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  /* Rooms are built as: <number> people <where>. <what is wrong>. */
  const SIZES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 15, 16, 18, 20, 22, 24, 25, 28, 30,
                 32, 36, 40, 45, 50, 60, 64, 75, 80, 90, 100, 120, 140, 150];
  const WHERE = {
    small: [
      'around a table that is slightly too small',
      'in a glass-walled room that everyone can see into',
      'in the corner of the corridor, standing',
      'in the head of department’s office',
      'in a room booked for two',
      'in a room with a ping-pong table in it',
      'in a room with one window and no plan',
      'in the printer room, for the privacy',
      'in a cupboard that is called a “huddle room”',
      'in the kitchenette, round the one chair'
    ],
    medium: [
      'in the seminar room',
      'in the common room',
      'in the old library reading room',
      'in the only room with a working projector',
      'in a room named after a donor',
      'in a room with a ceiling that drips',
      'in the basement room with no windows',
      'in the room next to the lab, with a faint smell of solvent',
      'in a classroom with desks bolted to the floor',
      'in the canteen, between two lunches',
      'in the side room of the lecture hall',
      'in a room on the fourth floor with a sticky door',
      'in the room where the sofa lives',
      'in the room with the grandfather clock that is wrong'
    ],
    large: [
      'in the big lecture hall',
      'in the aula',
      'in the atrium, with one microphone',
      'on a video link',
      'in a hybrid meeting',
      'in the auditorium, rows A to Q',
      'in a hall built for another faculty',
      'in the sports hall, for lack of a better room',
      'in the foyer, standing, for a fire-safety reason',
      'on a video link with the camera pointing at the ceiling'
    ]
  };
  const ROOM_TROUBLE = [
    'Someone is eating audibly.',
    'A phone plays a ringtone from 2009.',
    'The agenda is in a format nobody can open.',
    'Nobody knows who booked it.',
    'The clock is ten minutes slow.',
    'There is a faint smell of fika.',
    'Somebody’s dog is also present.',
    'Two people are discussing parking in a whisper.',
    'Someone asks “Can everyone see my screen?”',
    'The Dean has joined, silently.',
    'Everyone is pretending to have read the pre-reading.',
    'The loudest sound is a keyboard.',
    'The heating has opinions.',
    'The microphone squeals every ninety seconds.',
    'A door will not stay shut.',
    'There is an echo that repeats the chair.',
    'There is a plant, and it looks well-informed.',
    'The air has been used before.',
    'The biscuit plate is now just crumbs.',
    'The last meeting’s notes are still up.',
    'The coffee has run out.',
    'A colleague is livestreaming their lunch.',
    'The lights are on a timer that nobody controls.',
    'Somebody keeps yawning in a pattern.',
    'Someone’s alarm goes off, and they let it.'
  ];

  /* An agenda item can also be built as <form> + <thing>. */
  const TOPIC_FORM = [
    'an update on #',
    'a review of #',
    'a working group on #',
    'a motion to revisit #',
    'the future of #',
    'a survey about #',
    'a pilot project for #',
    'the cost of #',
    'a draft policy on #',
    'a proposal to rename #',
    'who owns #',
    'a risk assessment of #',
    'a timeline for replacing #',
    'a taskforce for #',
    'a report on #',
    'next steps for #',
    'an evaluation of #',
    'new guidelines for #',
    'a workshop on #',
    'a vote on #',
    'a feasibility study of #',
    'a request for feedback on #',
    'an appeal about #',
    'a delegation of #'
  ];
  const TOPIC_THING = [
    'the printer room', 'the coffee machine', 'the Christmas lunch', 'the seminar-room whiteboards',
    'the department’s logo', 'the key-card system', 'the staff kitchen', 'the shared calendar',
    'the lecture-recording system', 'the faculty’s newsletter', 'the PhD handbook',
    'the guest-lecturer policy', 'the room-booking system', 'the teaching-load model',
    'the annual appraisal form', 'the cleaning rota', 'the department’s website',
    'the third-floor corridor', 'the staff retreat', 'the travel-claims process',
    'the lunch-room microwave', 'the visitor badges', 'the department’s Twitter account',
    'the thesis-defence procedure', 'the course-evaluation survey', 'the shared drive',
    'the master key', 'the hybrid-meeting setup', 'the annual report',
    'the seminar-series speaker list', 'the faculty’s strategic goals',
    'the open-door policy (the door is now open)', 'the staff Christmas party',
    'the departmental reading group', 'the new office chairs', 'the vending machine',
    'the minutes of the minutes', 'the language policy', 'the library budget',
    'the alumni newsletter', 'the exam-room rota', 'the supervisor-training course',
    'the printer credits', 'the department’s “wellness hour”', 'the stairwell',
    'the compulsory online training', 'the dress code, if any', 'the parking spaces',
    'the coat rack by the door', 'the new signage on level 2',
    'the departmental songbook', 'the way we say “Good morning”',
    'the rooms we call “the quiet rooms”', 'the bike shed', 'the university’s ranking',
    'the new Wi-Fi password', 'the stationery cupboard', 'the ethics-approval process',
    'the allocation of teaching assistants', 'the weekly all-staff email'
  ];

  /* A question can also be built as <opener> + <core>. */
  const Q_OPEN = [
    'Sorry, but ',
    'This may be a stupid question, but ',
    'Just so I understand: ',
    'Not to be difficult, but ',
    'Quick question: ',
    'Forgive me, but ',
    'I might be missing something, but ',
    'Out of pure curiosity: ',
    'Just to clarify: ',
    'If I may: ',
    'Sorry to be that person, but ',
    'As a newcomer: ',
    'As someone who read the pre-reading: ',
    'Not wishing to derail this, but ',
    'I hesitate to ask, but ',
    'For my own understanding: '
  ];
  const Q_CORE = [
    'who decided this?', 'is there a budget for this?', 'does this need a vote?',
    'how many people have to sign off?', 'is this the final version?',
    'did anybody ask the students?', 'what does that acronym mean?',
    'when is the deadline?', 'who is going to do the work?',
    'is that an instruction or a suggestion?', 'what happens if we say no?',
    'does this replace the old process or sit on top of it?',
    'are we allowed to disagree?', 'will there be a form?',
    'has this been tried before?', 'is this part of the strategic plan?',
    'who will be in the working group?', 'which committee owns this?',
    'is it legal?', 'does it apply retroactively?',
    'what does “soon” mean here?', 'is this a pilot?',
    'have the unions seen it?', 'how will we know it worked?',
    'what is the plan if it fails?', 'what is the rationale?',
    'is the deadline firm?', 'is the date in the invitation correct?',
    'who is the contact person?', 'does anybody have the link?',
    'was there a consultation?', 'who gets to say “no”?',
    'is the audience the whole faculty?', 'does it include the labs?',
    'which version is the latest?', 'is that in the minutes?',
    'what do we mean by “harmonise”?', 'did anyone read the report?',
    'where did the 14% come from?', 'will there be training?',
    'who maintains it afterwards?', 'what is the exit strategy?',
    'does this include the people on leave?', 'was this in the agenda?',
    'who funds the follow-up?', 'do we have to reply by email?',
    'is it necessary for everyone to attend?', 'is this a one-off?',
    'is there a quick version of this?', 'is it possible to opt out?',
    'what are the risks?', 'what would the Dean say?',
    'is this definitely the right room for this discussion?',
    'what does the footnote on page 3 mean?', 'is this the same as last year?',
    'does the budget cover the coffee?', 'should I take notes?',
    'is there an FAQ?', 'could someone summarise the last thirty minutes?',
    'is it OK if I leave at four?', 'would a diagram help?'
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

  /* Draw from a shuffled bag, so nothing comes round twice until everything else
     has, in this list or any other. The bags survive from one meeting to the next. */
  const bags = new Map();
  function draw(list) {
    let b = bags.get(list);
    if (!b || !b.length) { b = shuffle(list.slice()); bags.set(list, b); }
    return b.pop();
  }
  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
                'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen',
                'eighteen', 'nineteen'];
  const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  function words(n) {
    if (n < 20) return ONES[n];
    if (n < 100) return TENS[(n / 10) | 0] + (n % 10 ? '-' + ONES[n % 10] : '');
    return String(n);
  }
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

  /* Half of everything is taken straight from its list, half is put together
     from parts, so the same list can say a great many different things. */
  function makeWho() {
    const w = draw(WHO);
    if (Math.random() < 0.4) {
      for (let i = 0; i < 6; i++) {
        const t = draw(WHO_TAIL);
        if (w.length + t.length <= 78) return w + t;
      }
    }
    return w;
  }
  function makeWhen() {
    const w = draw(WHEN);
    if (Math.random() < 0.5 && w.s.length <= 62 && !/Monday|Friday|weekend|Midsummer/i.test(w.s)) {
      return { h: w.h, m: w.m, no: w.no, s: draw(DAYS) + ' ' + w.s };
    }
    return w;
  }
  function makeRoom() {
    if (Math.random() < 0.5) return draw(ROOM);
    for (let i = 0; i < 8; i++) {
      const n = draw(SIZES);
      const where = draw(n <= 8 ? WHERE.small : n <= 30 ? WHERE.medium : WHERE.large);
      const s = cap(words(n)) + ' people ' + where + '. ' + draw(ROOM_TROUBLE);
      if (s.length <= 84) return { n: n, s: s };
    }
    return draw(ROOM);
  }
  function makeTopic() {
    if (Math.random() < 0.5) return draw(TOPIC);
    return draw(TOPIC_FORM).replace('#', draw(TOPIC_THING));
  }
  function makeQuestion() {
    if (Math.random() < 0.5) return draw(QUESTION);
    for (let i = 0; i < 6; i++) {
      const q = draw(Q_OPEN) + draw(Q_CORE);
      if (q.length <= 74) return q;
    }
    return draw(QUESTION);
  }

  function build() {
    const useCirc = Math.random() < Math.min(0.75, 0.3 + S.done * 0.03);
    return {
      who: makeWho(), when: makeWhen(), room: makeRoom(),
      topic: makeTopic(), q: makeQuestion(), circ: useCirc ? draw(CIRC) : null
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
                 :                        draw(NO_GENERIC);
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
      elWhy.textContent = (timedOut ? draw(HAND_UP) : 'You asked. ') + draw(YES).replace('{m}', m);
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

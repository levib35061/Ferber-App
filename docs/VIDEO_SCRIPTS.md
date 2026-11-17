# YouTube video scripts

Three evergreen videos, 2 to 4 minutes each, for regular YouTube (not Shorts).
Made by a parent who built Check In. The numbers match the app's chart
(`FERBER_DEFAULT_CHART`) and the site (ferbertimer.com).

## How to record the voiceover (ElevenLabs)

- **One audio file per video.** Copy that video's "Paste into ElevenLabs" block
  below as-is and generate it in one go. Name the files `video1.mp3`,
  `video2.mp3`, `video3.mp3`.
- The `<break time="1.2s" />` tags between lines add a short pause. I use those
  pauses to line the pictures up with the voice, so leave them in. (They work
  with ElevenLabs' standard voices. If your chosen model reads them out loud or
  ignores them, delete them and put each line on its own paragraph instead.)
- Use the **same voice for all three videos**: calm, warm, unhurried.
- Check that "Ferber" sounds like **FUR-ber**. If it doesn't, spell it
  "Ferr-ber" in the pasted text.
- If one sentence comes out wrong, regenerate the whole file. That's simpler
  than patching.
- The tables are the full script with notes of what's on screen; the
  *[bracketed]* parts are for me.

---

## Video 1 — The Ferber method chart, explained night by night

**Title:** Ferber Method Chart Explained: How Long to Wait Each Night

**Length:** about 3 minutes

| # | Voiceover | On screen |
|---|---|---|
| 01 | If you're about to try the Ferber method, the hardest question at bedtime is simple: how long do I wait before I go in? | *[Title card: "The Ferber chart, night by night"]* |
| 02 | I'm a parent. I built a sleep-training timer after doing this with our own baby, and this chart is the thing I wished someone had walked me through. | *[Moon icon, "Made by a parent"]* |
| 03 | Here's the idea in one sentence. You put your baby down awake, you leave, and if they cry, you wait a set number of minutes before a short check-in. The waits get a little longer each time, and each night. | *[Three icons: bed, door, clock]* |
| 04 | This is the chart most families use. Each row is one night. Each number is how many minutes to wait before a check-in. | *[Full chart appears]* |
| 05 | Night one. Wait three minutes before the first check-in. Then five minutes. Then ten minutes, and keep repeating ten until they're asleep. | *[Row 1 highlights: 3, 5, 10]* |
| 06 | Night two moves up. Five minutes, then ten, then twelve. | *[Row 2: 5, 10, 12]* |
| 07 | Night three. Ten, then twelve, then fifteen. | *[Row 3: 10, 12, 15]* |
| 08 | And it keeps building, a little each night, until night seven: twenty, twenty-five, then thirty. After night seven, you just keep using that last row. | *[Rows 4 to 7 fill in]* |
| 09 | Two rules make the chart work. First, only count while your baby is actually crying. If the crying stops, the wait stops. If it starts again, start that same wait over. | *[“Only count crying” with a pause icon]* |
| 10 | Second, check-ins are short. One or two minutes. A pat, a few calm words, and then you leave, even if they're still crying. | *[“1 to 2 minutes”, hand-on-crib icon]* |
| 11 | That part surprised me. You're not going in to stop the crying. You're going in to reassure them that you're close, and then you step out. | *[Quote style: "Reassure, not stop the crying"]* |
| 12 | What should you expect? Night one is often the longest. Nights two and three are often harder before they get easier. That's normal, and it's the point where a lot of parents give up. | *[Simple bar chart rising at night 2, then falling]* |
| 13 | In one survey of more than six hundred parents, crying averaged about forty minutes on the first night, and about nine minutes a week later. | *[Two bars: ~43 min → ~9 min, "one survey of 652 parents"]* |
| 14 | And the numbers are a guide, not a rule. If shorter waits feel right for your family, use them. What matters most is that the waits grow slowly and you stay consistent. | *[“Consistency beats perfect numbers”]* |
| 15 | I put a free printable version of this chart on ferbertimer.com, with space to write down each night. It's one page, and it lives on our fridge. | *[Printable chart page, ferbertimer.com]* |
| 16 | And if you'd rather not do the math at two in the morning, my app, Check In, times every wait and alerts you on your lock screen when it's time to go in. | *[App countdown screen, App Store badge]* |
| 17 | Good luck tonight. You've got this. | *[End card: ferbertimer.com, "Check In: Baby Sleep Timer"]* |

**Paste into ElevenLabs:**

```
If you're about to try the Ferber method, the hardest question at bedtime is simple: how long do I wait before I go in?
<break time="1.2s" />
I'm a parent. I built a sleep-training timer after doing this with our own baby, and this chart is the thing I wished someone had walked me through.
<break time="1.2s" />
Here's the idea in one sentence. You put your baby down awake, you leave, and if they cry, you wait a set number of minutes before a short check-in. The waits get a little longer each time, and each night.
<break time="1.2s" />
This is the chart most families use. Each row is one night. Each number is how many minutes to wait before a check-in.
<break time="1.2s" />
Night one. Wait three minutes before the first check-in. Then five minutes. Then ten minutes, and keep repeating ten until they're asleep.
<break time="1.2s" />
Night two moves up. Five minutes, then ten, then twelve.
<break time="1.2s" />
Night three. Ten, then twelve, then fifteen.
<break time="1.2s" />
And it keeps building, a little each night, until night seven: twenty, twenty-five, then thirty. After night seven, you just keep using that last row.
<break time="1.2s" />
Two rules make the chart work. First, only count while your baby is actually crying. If the crying stops, the wait stops. If it starts again, start that same wait over.
<break time="1.2s" />
Second, check-ins are short. One or two minutes. A pat, a few calm words, and then you leave, even if they're still crying.
<break time="1.2s" />
That part surprised me. You're not going in to stop the crying. You're going in to reassure them that you're close, and then you step out.
<break time="1.2s" />
What should you expect? Night one is often the longest. Nights two and three are often harder before they get easier. That's normal, and it's the point where a lot of parents give up.
<break time="1.2s" />
In one survey of more than six hundred parents, crying averaged about forty minutes on the first night, and about nine minutes a week later.
<break time="1.2s" />
And the numbers are a guide, not a rule. If shorter waits feel right for your family, use them. What matters most is that the waits grow slowly and you stay consistent.
<break time="1.2s" />
I put a free printable version of this chart on ferbertimer.com, with space to write down each night. It's one page, and it lives on our fridge.
<break time="1.2s" />
And if you'd rather not do the math at two in the morning, my app, Check In, times every wait and alerts you on your lock screen when it's time to go in.
<break time="1.2s" />
Good luck tonight. You've got this.
```

**Description:**

```
How long do you wait before each check-in with the Ferber method? Here's the chart most families use, night by night, plus the two rules that make it work.

Free printable chart: https://ferbertimer.com/chart.html
Free web timer: https://ferbertimer.com/timer.html
Check In: Baby Sleep Timer (iPhone): [App Store link]

0:00 The question at bedtime
0:25 How the method works
0:40 The chart, night by night
1:30 Only count crying
1:45 What a check-in looks like
2:05 What to expect
2:40 Free chart and timer

Made by a parent who built Check In after sleep training our own baby. Sleep training is meant for healthy babies around 6 months and older; check with your pediatrician before you start.
```

**Tags:** ferber method, ferber chart, ferber method chart, sleep training, graduated check ins, cry it out, baby sleep, sleep training chart

---

## Video 2 — What to do when your baby wakes at 2am during Ferber

**Title:** Ferber Method Night Wakings: What to Do at 2am

**Length:** about 2½ minutes

| # | Voiceover | On screen |
|---|---|---|
| 01 | It's two in the morning. Bedtime went okay, and now your baby is crying again. What do you do? | *[Dim night scene, clock at 2:00]* |
| 02 | I'm a parent who sleep trained our baby with the Ferber method, and this was the moment that tested us most. Here's the plan we followed. | *[“Made by a parent”]* |
| 03 | The short answer: treat a night waking just like bedtime, using the same night's chart. | *[“Same plan as bedtime”]* |
| 04 | That means you start again from the first wait for that night. Not where you left off at bedtime. The first wait. | *[Chart row highlights its first number]* |
| 05 | So on night two, a two a.m. waking starts at five minutes. Then ten. Then twelve, repeating until they're asleep. | *[Night 2 row: 5, 10, 12]* |
| 06 | Before you start the timer, give it a moment. Lots of babies stir, fuss briefly, and settle on their own. Only start counting once it's real crying. | *[“Wait for real crying”]* |
| 07 | The check-ins are the same as bedtime. One or two minutes, low light, calm voice, a pat. Then out, even if they're still crying. | *[Check-in icon, "1 to 2 minutes"]* |
| 08 | The hardest part at two a.m. is doubt. Are they hungry? Is something wrong? | *[Question marks fade in]* |
| 09 | If your pediatrician has said your baby still needs a night feed, feed them. Then put them back down awake, and if they cry, the waits start again from the first one. | *[“Feed if needed, then back down awake”]* |
| 10 | If they seem sick or something feels off, go in and comfort them. You can pick the plan back up when they're well. | *[“Sick? Comfort first.”]* |
| 11 | Otherwise, the most helpful thing you can do is decide this in daylight. Agree with your partner on the plan, and on whose turn it is tonight, before bedtime. | *[Two phones, "Who's on duty tonight?"]* |
| 12 | And remember, crying after a check-in doesn't mean it isn't working. You went in to reassure, not to make it stop. | *[“Crying after a check-in is normal”]* |
| 13 | Most families see night wakings ease within the first week. Some nights in the middle are harder. That's normal too. | *[Bars easing over a week]* |
| 14 | At two a.m., nobody wants to do math. There's a free web timer on ferbertimer.com, and my app, Check In, restarts the waits for a night waking automatically and alerts you on your lock screen. | *[Web timer, then app's "Woke up" screen]* |
| 15 | Hang in there. The nights do get shorter. | *[End card: ferbertimer.com, "Check In: Baby Sleep Timer"]* |

**Paste into ElevenLabs:**

```
It's two in the morning. Bedtime went okay, and now your baby is crying again. What do you do?
<break time="1.2s" />
I'm a parent who sleep trained our baby with the Ferber method, and this was the moment that tested us most. Here's the plan we followed.
<break time="1.2s" />
The short answer: treat a night waking just like bedtime, using the same night's chart.
<break time="1.2s" />
That means you start again from the first wait for that night. Not where you left off at bedtime. The first wait.
<break time="1.2s" />
So on night two, a two a.m. waking starts at five minutes. Then ten. Then twelve, repeating until they're asleep.
<break time="1.2s" />
Before you start the timer, give it a moment. Lots of babies stir, fuss briefly, and settle on their own. Only start counting once it's real crying.
<break time="1.2s" />
The check-ins are the same as bedtime. One or two minutes, low light, calm voice, a pat. Then out, even if they're still crying.
<break time="1.2s" />
The hardest part at two a.m. is doubt. Are they hungry? Is something wrong?
<break time="1.2s" />
If your pediatrician has said your baby still needs a night feed, feed them. Then put them back down awake, and if they cry, the waits start again from the first one.
<break time="1.2s" />
If they seem sick or something feels off, go in and comfort them. You can pick the plan back up when they're well.
<break time="1.2s" />
Otherwise, the most helpful thing you can do is decide this in daylight. Agree with your partner on the plan, and on whose turn it is tonight, before bedtime.
<break time="1.2s" />
And remember, crying after a check-in doesn't mean it isn't working. You went in to reassure, not to make it stop.
<break time="1.2s" />
Most families see night wakings ease within the first week. Some nights in the middle are harder. That's normal too.
<break time="1.2s" />
At two a.m., nobody wants to do math. There's a free web timer on ferbertimer.com, and my app, Check In, restarts the waits for a night waking automatically and alerts you on your lock screen.
<break time="1.2s" />
Hang in there. The nights do get shorter.
```

**Description:**

```
Your baby wakes at 2am during Ferber sleep training. Here's what to do: start again from the first wait for that night, keep check-ins short, and decide the plan in daylight.

Free web timer: https://ferbertimer.com/timer.html
Free printable chart: https://ferbertimer.com/chart.html
Check In: Baby Sleep Timer (iPhone): [App Store link]

Made by a parent who built Check In after sleep training our own baby. Check with your pediatrician about night feeds before you start.
```

**Tags:** ferber method night waking, ferber method, sleep training night wakings, baby waking at night, sleep training, graduated check ins

---

## Video 3 — How I time Ferber check-ins on my iPhone (record after launch)

**Title:** The Ferber Method Timer App I Built for 2am (Check In)

**Length:** about 2 minutes

**Screen recordings to send me (iPhone screen recording, development or App Store build):**
1. Tapping **Down for the night**, then **Crying**, with the countdown running (10 seconds)
2. A check-in coming due and the peach "Time to check in" screen
3. The lock-screen alert (lock the phone during a short wait)
4. **Going in** → **Back out** → the next, longer wait starting
5. Two phones side by side, or the duty bar showing **You're on duty tonight**
6. The Today screen in the morning, scrolling slowly
7. The Progress chart

| # | Voiceover | On screen |
|---|---|---|
| 01 | When we sleep trained our baby with the Ferber method, I kept losing track of time at two in the morning. So I built the timer I wanted. | *[App icon, "Made by a parent"]* |
| 02 | It's called Check In. Here's a night with it. | *[Title card]* |
| 03 | You put your baby down and tap Down for the night. Nothing starts yet, because a lot of babies settle without crying. | *[Recording 1, start]* |
| 04 | If they cry, tap Crying. Now it counts down to your first check-in, using the Ferber chart for tonight. | *[Recording 1, countdown]* |
| 05 | The screen stays dark and dim, with big buttons you can hit half-asleep. | *[Close-up of the night screen]* |
| 06 | When it's time, it alerts you, even with your phone locked, with a soft sound or just a vibration. | *[Recordings 2 and 3]* |
| 07 | Tap Going in, then Back out when you leave. The next wait starts, a little longer. | *[Recording 4]* |
| 08 | If they stop crying, the timer pauses. If they wake at two a.m., it starts again from the first wait, just like the method says. | *[“Stopped crying” and "Woke up" buttons]* |
| 09 | It works on both of your phones. Pick who's on duty tonight, and only that phone gets the alerts. | *[Recording 5]* |
| 10 | In the morning, you get a short summary of the night, and a chart of crying time, so you can see it working. | *[Recordings 6 and 7]* |
| 11 | It's free for your first two nights, then four ninety-nine once. One purchase covers both parents. No subscription, no ads, no tracking. | *[Price card]* |
| 12 | It's called Check In: Baby Sleep Timer, on the App Store. I hope it makes your nights a little easier. | *[End card: App Store badge, ferbertimer.com]* |

**Paste into ElevenLabs:**

```
When we sleep trained our baby with the Ferber method, I kept losing track of time at two in the morning. So I built the timer I wanted.
<break time="1.2s" />
It's called Check In. Here's a night with it.
<break time="1.2s" />
You put your baby down and tap Down for the night. Nothing starts yet, because a lot of babies settle without crying.
<break time="1.2s" />
If they cry, tap Crying. Now it counts down to your first check-in, using the Ferber chart for tonight.
<break time="1.2s" />
The screen stays dark and dim, with big buttons you can hit half-asleep.
<break time="1.2s" />
When it's time, it alerts you, even with your phone locked, with a soft sound or just a vibration.
<break time="1.2s" />
Tap Going in, then Back out when you leave. The next wait starts, a little longer.
<break time="1.2s" />
If they stop crying, the timer pauses. If they wake at two a.m., it starts again from the first wait, just like the method says.
<break time="1.2s" />
It works on both of your phones. Pick who's on duty tonight, and only that phone gets the alerts.
<break time="1.2s" />
In the morning, you get a short summary of the night, and a chart of crying time, so you can see it working.
<break time="1.2s" />
It's free for your first two nights, then four ninety-nine once. One purchase covers both parents. No subscription, no ads, no tracking.
<break time="1.2s" />
It's called Check In: Baby Sleep Timer, on the App Store. I hope it makes your nights a little easier.
```

**Description:**

```
Check In is an iPhone timer for the Ferber method of sleep training. It counts down to each check-in using the Ferber chart, alerts you with the phone locked, and logs every night so you can see crying time drop.

Download on the App Store: [App Store link]
Free printable chart: https://ferbertimer.com/chart.html

Free for your first 2 nights, then $4.99 once. One purchase covers both parents. No subscription, no ads, no tracking.

Made by a parent who built it while sleep training our own baby.
```

**Tags:** ferber method app, ferber timer, sleep training app, sleep training timer, ferber method, baby sleep app

---

## After uploading

- Add each video to the matching page on ferbertimer.com (I'll embed them).
- Pin a comment with the chart link.
- In YouTube Studio, set the audience to "No, it's not made for kids" (it's for parents).

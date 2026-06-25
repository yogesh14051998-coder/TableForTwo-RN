# Table for Two — Client Expectations

> **Source:** Recovered from your Claude Code session `985e2fd0` ("Build Table for 2 iOS dating app"),
> message you typed on **2026-06-10 20:25** — a transcribed conversation between you and the client
> (your friend who wants the app), where he explained his vision as a story.
> Companion spec: `C:\Users\yoges\Downloads\Table_for_2_Expanded_Investor_Deck.pdf`
> (markdown copy: `C:\Users\yoges\Desktop\Projects\TableForTwo\Table_for_2_Expanded_Investor_Deck.md`).
>
> _Part 1 is a cleaned, structured distillation. Part 2 is the original verbatim text, unchanged._

---

## Part 1 — Structured expectations

### Why this app exists (the client's backstory)
- The client is a friend who got **divorced after 25 years** and has been developing this concept for **~8 years**.
- He ran an experiment: created **28 fake profiles** — 4 personas (beautiful women, "ugly" women, good-looking guys, "ugly" guys, **none of them actually him**) across **7 dating apps** — to measure responses.
- Findings:
  - Women (attractive **or** not) received **hundreds** of messages.
  - Good-looking men received **2–3** messages; less attractive men received **none**.
  - ~**60% of the men** on these apps were **already married**.
- Conclusion: mainstream apps are broken. **No Tinder / Match / Bumble. No swipe-right / swipe-left.**

### Core philosophy
- A **very focused, serious, intent-driven** dating experience.
- **AI decides the matches** (he calls the algorithm the "logarithm") — the user does **not** swipe.
- Built-in friction (payments, time limits) to filter for people who are genuinely serious.

### The user flow
1. **Register + background check** — user pays **$50** for a background check.
   - Word it as "background **cleared**" rather than pass/fail (avoid implying a guarantee / liability).
2. **Build a detailed profile** — about you (income, job, 9–5 vs. other, hobbies, how you dress, photos)
   **and** who you're looking for (type of person, income, where they work, job type, travel habits, etc.).
3. **Geo / location matching** — by **zip code** (e.g., Miami 33311).
   - Honor each person's travel willingness (e.g., "10 miles") with tolerance: **±2 miles / ±20%**, fed into the matching algorithm.
4. **AI matching** — AI surfaces matches that fit the stated criteria (e.g., professional, 9–5, earns **>$200k**).
   - User receives a small set of **pictures** (e.g., 3). No swiping — the AI selects.
5. **Time-boxed chat** — once a chat starts, there's a **30-minute** window (this is a variable — could be 24h or 2 weeks, TBD).
   - Instant notification; forces momentum. If you're not available / don't log in, you **miss out** (same philosophy as missing chances on Tinder/Bumble after days of inactivity).
6. **Commit with a $50 hold** — when you choose a match (e.g., "Lana"), **$50 is authorized/held on both parties' credit cards**.
   - Guarantees seriousness: if she doesn't show for the date, she loses the $50.
7. **Reveal the date** — only after committing do you get the **venue name**.
   - Venue need not be a restaurant — it can be a **partner activity** (golf, jet skiing, games, etc.).

### Partners & revenue model
- **7 partners** total (listed in the deck); they provide **discounts**.
- Named: **Lyft** (rides), **Group 1** (activities, e.g., jet skiing), plus flowers, etc.
- Concierge upsells around a date:
  - Offer a **Lyft ride** from the user's home to the venue.
  - Offer to **send flowers** — the Lyft driver picks them up en route.
- **Money flow:** Table for Two **charges the customer**, **pays the partner** (e.g., pays Lyft), and **keeps ~10%**.

### The in-date "split or full" mechanic
- About **45 minutes** into the dinner, send **exactly one** message:
  **"Do you want to pay for the full dinner, or split it half and half?"**
  - **Split** = the date didn't work out.
  - **Full** = the date worked out.
- Keep it to a **single message** — the phone must **not** become the focal point of the date.
- If the user forgets / doesn't respond, it **defaults** (to split).

### Open variables (decide later)
- Chat window length: 30 min vs. 24 hours vs. 2 weeks.
- Exact distance tolerances and matching weights.
- Final partner list and discount terms.

### Guiding instruction to the build
> Align the app's behavior with everything above. Build it in the background, but **get it live**.

---

## Part 2 — Original verbatim (as you typed it)

> Unedited transcription of the client conversation. Some words are rough (voice-to-text),
> e.g. "logarithm" = algorithm. Preserved exactly for fidelity.

Now these the following is a conversation between me and the guy who wants this app. The expectations from him should align with whatever he says. he might give examples in beween. so take that and check if the current app behaves like that f not modify it accordingly.

2 table for two I I am still I I'm still in working on It's almost done 8 No, I'm not saying you've done anything. I don't. I don't care if you've done anything. Did you read? Did you read it? Yep. OK.Is that you read through your reader? Yep. OK.Now this is.Can I see the next one that I want you to work on?This is very important to me, not to her. This is a friend of mine, OK?OK.This has been let me tell you a story.This has been in the making for eight years, OK, after he got divorced after 25 years, he didn't know what he was going to do. So So what he did?His income took four folders. Mm-hmm. OK.OK. And he created.Full profiles, OK.On seven different dating apps, OK, so you had 28 profiles. OK, what was beautiful women? What was ugly women?Almost beautiful guys, one was ugly guys, and none of them were him.And he was seeing how many messages are coming back. OK. And it doesn't matter whether you're a beautiful woman or a ugly woman, you were getting hundreds of messages. When you're a good looking guy, you were getting two or three messages. When you're ugly looking guy, you're getting no messages. Yeah.But 60% of those men were men were all married, OK?Right. So he created. He doesn't want people to be like.Tinder, he doesn't want you to be like.Match he doesn't want swipe right, swipe left.You want some very focused website app, OK, right?I'm going to miami only by zipcode. I am going to be in this zipcode. Or, let's say, before we even go there.So let's do your background check. You register, you're in a background check. No, you pay $50.00 for the background check. No, that's it.OK.you pay $50 and you pass the background check?The actually there is no passing in. No, we just have to.Put background clear.Or we have to word it somehow where people know that he's not gonna clear background something. Then You fill out your profile of them about you Who am I? How much do I earn? What do I do, you know?What do I like doing?Of him you know how do I dress some pictures with.Who am I looking for?Type of person, how much they earn, where they work, what they do.What type of job they have 9:00 to 5:00, you know, whatever they fly, they travel, all that comes in OK.OK, then comes the date. OK, OK.And hear me out very carefully because there's a lot of complex here, OK?I'm going to Miami 33311 Lollipop. I'm going to Lollipop.No, don't mention the restaurant. Don't mention anything.When?A lady sets up a profile. She says I'm only willing. This is me. Mm-hmm. This is what I'm looking for. I'm only willing to travel 10 miles from my house.OK, so 10 you have to give it ±2 miles, 20% and everything ±20%. OK.That falls within the logarithm OK and a few other details. Key critical details hold within longer. He gets a picture of him.It's gonna swipe right, swipe left, the AI decides.From the logarithm OK, I want to professional.I want somebody who works 9 to 5 earns over 200,000 OK.That's what I.Oh, got it. So that's done now.Let's say I get three of three pictures and she's willing to work, travel 10 miles and goes out 10 miles often.Somebody say I'm going to travel 50 miles. OK, Just depends on every software level, right?So then they come in, they get a picture.He has 30 minutes only to chat once the chat starts. OK.This is not indefinite. This is about instant notification. OK.Yes. 30 minutes chat.Yeah, that's it.Because you can sit down and chat all day on Instagram. Patience, right?You choose out of 34521 so you do I go on a date with but you're you're probably but it's telling the man or the woman.I since I'm busy six days a week and I only have a Tuesday off, I can only talk on I can only log into that app on a Tuesday to be serious. No, because if you have 30 minutes to chat, you gotta get the the chat going to get the date going started. Well, if you're not, if you're not available, you're not available. OK, you must say you don't have 30 minutes. Let's say you're on Tinder and you don't Bumble. You don't log in for seven days. You missed out, right?It doesn't matter. It's the same philosophy that applies. You don't log in for seven days, you missed out.I just think 30 minutes is 2 weeks, maybe 24 hours, maybe 24. We will look, those are all variables we can decide later, right? But but once you choose.You go on that. So then if I say if I choose Lana. Mm-hmm.$50 goes authorized, got my credit card, $50 on her credit card. OK, now I know she's serious. Yeah.Because if if you don't give it credit cards like you have, I I'll last minute, I don't have a dress, I'm not going.But she knows she better get ready for that date because if she doesn't go, she loses $50.Right. Got it.Then you give up the name of the restaurant and you give up whatever. Now it doesn't have to be a restaurant because we have partners. There could be game, a gameplay, golf things or something.It could be part. There are partners. Lyft is a partner.We will be able to get into their API.There is a Group 1 is a partner, so you can go jet skiing, you can go anything that they have on their their they'll be a partner.And they'll give you discounts, OK.I have seven partners. I'll give you those. I think they're listed in the thing. OK, OK.Then.We go in the day. OK, let's say it's a dinner date.Let's say it's a dinner date. We're having dinner.Aboriginal loss last 1/2 hour.45 minutes into the dinner I get a message on my phone.Do you want to pay for the full dinner or do you want to split it half and half?So that means if you spit it off and up, the date didn't workout, right? If you want to go for, if you want to pay for the full debit, that means the date worked out OK, But you don't want the phone to become the focal point of the dinner. Yeah, OK, one message. That's it. And let's say that the the man forgets the message is having such a great time. But if he forgets, the message defaults,. OK, so then defaults. OK.But the point here is.The other partners, first of all, let's say you decide on a date. Mm-hmm. Go. Let's go send you a message. OK, You're going on a date. Yeah. Would you like to get a, a lift from your house to the to the location? OK, the man gets the we're picking up your lady.OK. Would you like to send her flowers? The Lyft drive over pick up flowers. OK, we will charge. Table for two, we'll charge.The CRO, the flowers, MMM. They will charge the lady for the lift. OK, Everything will come to table for two and we will pay lift. We will pay 1800 pounds.So we keep 10%. OK, That's how it works. OK, got it. Yeah. And there's other partners. I want you to go through it, go through the whole thing and let's start developing this property.OK, but let's get this live.Let's build that in the background and let's go from there.OK, let's go to.

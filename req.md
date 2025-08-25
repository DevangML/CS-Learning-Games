Add basic google auth to store all progress and data for the user (no profile, direct google oauth) and store the data in local sqlite db the data for that user logged in in the project. Make it deployable easily so that when I share the link with someone logic, storage of levels persistent for his session, all the querying works as expected for him., If the user has mysql installed on the system (which is basic pre requisite then ask on first time opening (if not exists on system) a form to fill all data in .env we are using and on one button click create the database, password, user, etc. 

High-leverage rules you can implement

Daily streak with shield

Increment if today == last_login + 1.

If gap = 1–2 days and user has a streak shield, don’t break the streak.

Earn one shield per 7 clean days. Cap at 1.

3 daily missions, time-gated

At first login of the day, sample 3 items from backlog by spaced-repetition priority.

Lock them at midnight local time. Unfinished expire. Reduces binge, increases cadence.

XP → Level curve

XP per correct = base 10 × difficulty (1–3).

Level formula: level = floor(0.1 * sqrt(total_xp)) + 1.

Small celebration on level up. Purely cosmetic.

Variable rewards that teach

20% chance per completed mission to drop one of:

“Insight card” (micro-fact or mnemonic saved to review deck)

Bonus recall quiz (double XP if correct)

Streak shield fragment (collect 2 to form a shield)

No loot boxes. Rewards must reinforce memory.

Spaced repetition over backlog

Use SM-2-lite: schedule next review using quality 0–5.

Prioritize items with due_at <= now for daily mission sampler.

Session cap and rollover

Full XP for first 25 minutes.

After that, 50% XP until 40 minutes, then 0% XP.

Shows “You’re done for today. Come back tomorrow.” Prevents burnout.

Weekly quest

Fixed window Mon–Sun: “Finish 12 missions this week.”

On success, grant 1 shield or 200 XP. No carryover.

Recovery rule

If streak breaks, let user run a one-time “comeback quest” within 48 hours: finish 5 missions to restore half the lost streak (rounded down). Only once per 30 days.

Reflection pin

End of day prompt: 1-line takeaway. Store and show in a weekly recap screen. Minimal effort, high identity binding.

Fail-fast hints

If two wrong in a row on same item, auto-reveal hint, give 5 XP for reading, then re-ask later in session.
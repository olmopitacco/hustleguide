// ─── Shared email HTML builder ────────────────────────────────────────────────

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hustleguide.vercel.app'

function layout(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>HustleGuide</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;">

        <!-- Header -->
        <tr>
          <td style="background:#070d1a;padding:28px 40px;border-radius:12px 12px 0 0;text-align:center;">
            <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">
              Hustle<span style="color:#34d399;">Guide</span>
            </span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:40px 40px 32px;border-radius:0 0 12px 12px;">
            ${body}
            <!-- Footer -->
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 24px;"/>
            <p style="font-size:12px;color:#9ca3af;margin:0;line-height:1.6;">
              You're receiving this because you signed up for HustleGuide.<br/>
              <a href="${APP_URL}/unsubscribe" style="color:#9ca3af;">Unsubscribe</a> &nbsp;·&nbsp;
              <a href="${APP_URL}/privacy" style="color:#9ca3af;">Privacy Policy</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function cta(text: string, href: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
    <tr><td align="center">
      <a href="${href}" style="display:inline-block;background:#10b981;color:#ffffff;font-weight:700;font-size:15px;text-decoration:none;padding:14px 32px;border-radius:10px;">
        ${text}
      </a>
    </td></tr>
  </table>`
}

// ─── EMAIL 1: Welcome ──────────────────────────────────────────────────────────

export function welcomeEmail(name: string): { subject: string; html: string } {
  const firstName = name?.split(' ')[0] ?? 'there'
  return {
    subject: "Your income path is waiting — let's find it",
    html: layout(`
      <h1 style="font-size:26px;font-weight:900;color:#111827;margin:0 0 8px;">
        Hey ${firstName} 👋
      </h1>
      <p style="font-size:16px;color:#374151;line-height:1.7;margin:0 0 16px;">
        Welcome to HustleGuide. You just made the first move toward building real income online — and you did it without buying a course, joining a Discord, or watching a 4-hour YouTube tutorial.
      </p>
      <p style="font-size:16px;color:#374151;line-height:1.7;margin:0 0 24px;">
        <strong>You're 2 minutes away from knowing exactly what to focus on.</strong> Take the quiz and get your personalized week-by-week roadmap — built around your actual situation.
      </p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px 24px;margin:0 0 24px;">
        <p style="margin:0;font-size:14px;color:#166534;font-weight:600;">What happens next:</p>
        <ol style="margin:8px 0 0;padding-left:20px;font-size:14px;color:#166534;line-height:1.8;">
          <li>Answer 8 honest questions (takes 2 minutes)</li>
          <li>Get matched to your top 3 income paths</li>
          <li>Get a week-by-week plan built just for you</li>
        </ol>
      </div>
      ${cta('Take the Quiz Now →', `${APP_URL}/onboarding`)}
      <p style="font-size:13px;color:#9ca3af;text-align:center;margin:0;">
        Takes 2 minutes. No credit card ever needed.
      </p>
    `),
  }
}

// ─── EMAIL 2: Guide Ready ──────────────────────────────────────────────────────

export function guideReadyEmail(
  name: string,
  pathName: string,
  criteria: string[],
  firstTask: { task_name: string; steps: string[] },
  guideId: string
): { subject: string; html: string } {
  const firstName = name?.split(' ')[0] ?? 'there'
  const criteriaItems = criteria.slice(0, 3).map(c =>
    `<li style="margin-bottom:8px;color:#374151;">${c}</li>`
  ).join('')
  const firstStep = firstTask.steps?.[0] ?? 'Get started with your first task.'

  return {
    subject: `Your Week 1 plan is ready, ${firstName}`,
    html: layout(`
      <h1 style="font-size:26px;font-weight:900;color:#111827;margin:0 0 8px;">
        Your roadmap is ready.
      </h1>
      <p style="font-size:16px;color:#374151;line-height:1.7;margin:0 0 20px;">
        Your personalized plan for <strong>${pathName}</strong> has been built. Week 1 is waiting for you right now.
      </p>

      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:20px 24px;margin:0 0 20px;">
        <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">
          Week 1 — What you'll accomplish
        </p>
        <ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.8;">
          ${criteriaItems}
        </ul>
      </div>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px 24px;margin:0 0 24px;">
        <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#166534;text-transform:uppercase;letter-spacing:0.5px;">
          Your first task this week
        </p>
        <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#111827;">${firstTask.task_name}</p>
        <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">${firstStep}</p>
      </div>

      ${cta('Start Week 1 →', `${APP_URL}/guide?id=${guideId}`)}

      <p style="font-size:14px;color:#6b7280;text-align:center;line-height:1.7;margin:0;">
        Everyone who's ever built income online started exactly where you are right now.
      </p>
    `),
  }
}

// ─── EMAIL 3: Weekly Nudge ─────────────────────────────────────────────────────

export function weeklyNudgeEmail(
  name: string,
  pathName: string,
  weekNumber: number,
  theme: string,
  criteria: string[],
  hoursEstimate: string,
  guideId: string,
  lastWeekTasksCompleted?: number,
  inactiveForDays?: number
): { subject: string; html: string } {
  const firstName = name?.split(' ')[0] ?? 'there'
  const criteriaItems = criteria.map(c =>
    `<li style="margin-bottom:8px;color:#374151;">${c}</li>`
  ).join('')

  let bottomNote = ''
  if (inactiveForDays && inactiveForDays >= 7) {
    bottomNote = `<div style="background:#fefce8;border:1px solid #fde68a;border-radius:10px;padding:16px 20px;margin:20px 0 0;">
      <p style="margin:0;font-size:14px;color:#92400e;">
        It's been a while — even 30 minutes this week moves you forward.
      </p>
    </div>`
  } else if (lastWeekTasksCompleted) {
    bottomNote = `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px 20px;margin:20px 0 0;">
      <p style="margin:0;font-size:14px;color:#166534;">
        Last week you completed ${lastWeekTasksCompleted} tasks. Keep that momentum going.
      </p>
    </div>`
  }

  return {
    subject: `Your ${pathName} tasks for this week`,
    html: layout(`
      <h1 style="font-size:26px;font-weight:900;color:#111827;margin:0 0 8px;">
        Week ${weekNumber}: ${theme}
      </h1>
      <p style="font-size:16px;color:#374151;line-height:1.7;margin:0 0 20px;">
        Hey ${firstName}, here's what's on your plate this week:
      </p>

      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:20px 24px;margin:0 0 20px;">
        <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">
          This week's goals
        </p>
        <ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.8;">
          ${criteriaItems}
        </ul>
      </div>

      <div style="display:inline-block;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:10px 16px;margin:0 0 24px;">
        <span style="font-size:13px;color:#166534;font-weight:600;">⏱ Estimated time: ${hoursEstimate}</span>
      </div>

      ${cta('Open My Guide →', `${APP_URL}/guide?id=${guideId}`)}

      ${bottomNote}
    `),
  }
}

// ─── EMAIL 4: Re-engagement ────────────────────────────────────────────────────

export function reengagementEmail(
  name: string,
  pathName: string,
  daysSinceStart: number,
  weekNumber: number,
  lastCompletedTask: string,
  nextTask: string,
  guideId: string
): { subject: string; html: string } {
  const firstName = name?.split(' ')[0] ?? 'there'

  return {
    subject: `You were so close, ${firstName}`,
    html: layout(`
      <h1 style="font-size:26px;font-weight:900;color:#111827;margin:0 0 8px;">
        You started something real.
      </h1>
      <p style="font-size:16px;color:#374151;line-height:1.7;margin:0 0 20px;">
        You started your <strong>${pathName}</strong> journey ${daysSinceStart} days ago. You're on Week ${weekNumber} — most people who reach this point go on to see real results.
      </p>

      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:20px 24px;margin:0 0 20px;">
        <div style="margin-bottom:16px;">
          <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Last completed</p>
          <p style="margin:0;font-size:14px;color:#6b7280;text-decoration:line-through;">${lastCompletedTask}</p>
        </div>
        <div>
          <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#10b981;text-transform:uppercase;letter-spacing:0.5px;">Up next — waiting for you</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#111827;">${nextTask}</p>
        </div>
      </div>

      ${cta('Pick Up Where You Left Off →', `${APP_URL}/guide?id=${guideId}`)}

      <p style="font-size:14px;color:#6b7280;text-align:center;line-height:1.7;margin:0;">
        It only takes one session to get your momentum back.
      </p>
    `),
  }
}

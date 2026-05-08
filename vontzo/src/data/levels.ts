export interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: string;
}

export interface Question {
  id: string;
  prompt: string;
  answers: Answer[];
}

export interface Level {
  id: number;
  name: string;
  topic: string;
  questions: Question[];
}

const q_l1: Question[] = [
  {
    id: "l1_q1",
    prompt: "You're calling a prospect cold. They answer and immediately say \"I only have 30 seconds.\" What do you say?",
    answers: [
      { id: "a", text: "Perfect, I only need 20. [Name], I help sales teams like yours cut ramp time by 40% — sound worth 10 more minutes?", isCorrect: true, feedback: "Great! Embracing their time constraint shows respect and builds instant credibility." },
      { id: "b", text: "Okay, I'll be quick. I'm calling about our software platform that has many features...", isCorrect: false, feedback: "Too generic. Don't waste their 30 seconds listing features instead of value." },
      { id: "c", text: "I understand, I'll call back at a better time.", isCorrect: false, feedback: "Too passive! You had them on the line, don't give up without a hook." },
      { id: "d", text: "No problem, just wanted to introduce myself and our company.", isCorrect: false, feedback: "A pure introduction offers no value. Always lead with how you can help them." }
    ]
  },
  {
    id: "l1_q2",
    prompt: "A gatekeeper asks \"What's this regarding?\" How do you respond?",
    answers: [
      { id: "a", text: "It's a personal matter.", isCorrect: false, feedback: "Never lie to a gatekeeper. It destroys trust." },
      { id: "b", text: "I'm calling to sell them software.", isCorrect: false, feedback: "Too blunt. This guarantees you'll get blocked." },
      { id: "c", text: "I have a quick question about [their role] — can you put me through?", isCorrect: true, feedback: "Perfect. It's honest, specific, and doesn't trigger the 'salesperson' alarm." },
      { id: "d", text: "I'm not sure, I was given this number.", isCorrect: false, feedback: "Makes you sound unprepared and unprofessional." }
    ]
  },
  {
    id: "l1_q3",
    prompt: "You get voicemail. What's your move?",
    answers: [
      { id: "a", text: "Leave a detailed 3-minute message explaining all features.", isCorrect: false, feedback: "No one listens to 3-minute voicemails. Keep it short." },
      { id: "b", text: "Hang up and try again later.", isCorrect: false, feedback: "Missed opportunity to build familiarity." },
      { id: "c", text: "Leave a 15-second message with a specific hook and callback number, referencing a result you got for a similar company.", isCorrect: true, feedback: "Spot on. Short, value-driven, and clear next steps." },
      { id: "d", text: "Send an email instead and don't leave a voicemail.", isCorrect: false, feedback: "Use multiple channels. A voicemail plus an email works best." }
    ]
  },
  {
    id: "l1_q4",
    prompt: "The prospect says \"I've never heard of your company.\" You say:",
    answers: [
      { id: "a", text: "We're actually quite well-known in the industry...", isCorrect: false, feedback: "Don't get defensive. Pivot to the value you provide." },
      { id: "b", text: "That's okay, most people haven't. That's exactly why I'm calling — [Company] helped [similar client] achieve X. Could we get 15 minutes?", isCorrect: true, feedback: "Excellent! Acknowledge, normalize, and pivot straight to proof and value." },
      { id: "c", text: "We've been around for 10 years.", isCorrect: false, feedback: "Company age doesn't solve their problems." },
      { id: "d", text: "Let me send you our company brochure.", isCorrect: false, feedback: "A brochure is just homework for the prospect." }
    ]
  },
  {
    id: "l1_q5",
    prompt: "Best opener for a cold email subject line:",
    answers: [
      { id: "a", text: "Introducing VONTZO Sales Platform", isCorrect: false, feedback: "Too salesy. People ignore 'introducing' emails." },
      { id: "b", text: "Following up", isCorrect: false, feedback: "Only use this if you are actually following up. Otherwise, it's deceptive." },
      { id: "c", text: "Quick question about [their team's specific goal]", isCorrect: true, feedback: "Perfect. It's relevant to them and invites curiosity." },
      { id: "d", text: "Partnership Opportunity", isCorrect: false, feedback: "Often perceived as spammy or vague." }
    ]
  }
];

const q_l2: Question[] = [
  {
    id: "l2_q1",
    prompt: "What's the goal of a discovery call?",
    answers: [
      { id: "a", text: "Pitch your product as fast as possible", isCorrect: false, feedback: "Pitching without knowing their needs is a recipe for rejection." },
      { id: "b", text: "Understand the prospect's pain, goals, and current situation so you can tailor your pitch", isCorrect: true, feedback: "Exactly. Diagnosis before prescription." },
      { id: "c", text: "Get them to sign a contract", isCorrect: false, feedback: "Too early for a contract. You need to qualify them first." },
      { id: "d", text: "Tell them your pricing", isCorrect: false, feedback: "Pricing without established value seems expensive." }
    ]
  },
  {
    id: "l2_q2",
    prompt: "Which is the best discovery question?",
    answers: [
      { id: "a", text: "Would you like to buy our product?", isCorrect: false, feedback: "Closed-ended and premature." },
      { id: "b", text: "What does success look like for you in the next 6 months — and what's currently getting in the way?", isCorrect: true, feedback: "Great open-ended question that uncovers goals and pain points." },
      { id: "c", text: "Have you heard of our company?", isCorrect: false, feedback: "Doesn't help you understand their needs." },
      { id: "d", text: "Do you have budget for this?", isCorrect: false, feedback: "Important later, but too blunt for early discovery." }
    ]
  },
  {
    id: "l2_q3",
    prompt: "A prospect says \"We're not sure what we need yet.\" Your response?",
    answers: [
      { id: "a", text: "Let me just send you a proposal.", isCorrect: false, feedback: "A proposal for what? You don't know their needs yet." },
      { id: "b", text: "Perfect — that's exactly why discovery exists. Tell me about your current process and where it breaks down.", isCorrect: true, feedback: "Excellent. Frame discovery as a helpful diagnostic tool for them." },
      { id: "c", text: "Come back when you know what you want.", isCorrect: false, feedback: "You're losing an opportunity to help shape their buying criteria." },
      { id: "d", text: "We have a one-size-fits-all solution.", isCorrect: false, feedback: "No one believes in a true one-size-fits-all." }
    ]
  },
  {
    id: "l2_q4",
    prompt: "What does SPIN stand for in SPIN Selling?",
    answers: [
      { id: "a", text: "Sales, Pitch, Insight, Numbers", isCorrect: false, feedback: "Incorrect. Try focusing on the types of questions." },
      { id: "b", text: "Situation, Problem, Implication, Need-Payoff", isCorrect: true, feedback: "Right! A proven framework for uncovering deep needs." },
      { id: "c", text: "Speed, Price, Innovation, Network", isCorrect: false, feedback: "Incorrect. SPIN is about questioning strategy." },
      { id: "d", text: "Strategy, Planning, Integration, Navigation", isCorrect: false, feedback: "Incorrect." }
    ]
  },
  {
    id: "l2_q5",
    prompt: "You ask \"How are you currently handling X?\" The prospect gives a long answer. You should:",
    answers: [
      { id: "a", text: "Interrupt and pitch your solution", isCorrect: false, feedback: "Never interrupt. You'll miss valuable context." },
      { id: "b", text: "Take notes, let them finish, then reflect back what you heard and ask a clarifying follow-up", isCorrect: true, feedback: "Active listening builds trust and clarifies understanding." },
      { id: "c", text: "Change the subject", isCorrect: false, feedback: "Shows you weren't listening to their long answer." },
      { id: "d", text: "Ask about budget immediately", isCorrect: false, feedback: "Too jarring of a transition." }
    ]
  }
];

const q_l3: Question[] = [
  {
    id: "l3_q1",
    prompt: "A great elevator pitch lasts how long?",
    answers: [
      { id: "a", text: "5 minutes — give full detail", isCorrect: false, feedback: "Way too long for an elevator pitch." },
      { id: "b", text: "20-30 seconds — crisp, outcome-focused", isCorrect: true, feedback: "Exactly. Just enough to spark interest and get a meeting." },
      { id: "c", text: "1 hour — you need time to explain", isCorrect: false, feedback: "That's a full presentation, not a pitch." },
      { id: "d", text: "As long as they'll listen", isCorrect: false, feedback: "Respect their time. Keep it brief." }
    ]
  },
  {
    id: "l3_q2",
    prompt: "Which pitch structure is most effective?",
    answers: [
      { id: "a", text: "Feature → Feature → Feature", isCorrect: false, feedback: "Features tell, benefits sell. Don't just list features." },
      { id: "b", text: "We help [target] achieve [outcome] by [mechanism]. We did this for [client] who got [result].", isCorrect: true, feedback: "Perfect structure: audience, value, differentiation, and proof." },
      { id: "c", text: "Price → Discount → Urgency", isCorrect: false, feedback: "Sounds desperate and transactional." },
      { id: "d", text: "History → Awards → Team", isCorrect: false, feedback: "They care about what you can do for them, not your history." }
    ]
  },
  {
    id: "l3_q3",
    prompt: "The prospect seems disengaged mid-pitch. What do you do?",
    answers: [
      { id: "a", text: "Keep going faster", isCorrect: false, feedback: "Talking faster just makes them tune out faster." },
      { id: "b", text: "Stop and ask \"Does this resonate with what you're facing?\"", isCorrect: true, feedback: "Great! Check-ins re-engage the prospect and ensure relevance." },
      { id: "c", text: "Lower your price immediately", isCorrect: false, feedback: "Price isn't the issue if they don't see value yet." },
      { id: "d", text: "Skip to the contract", isCorrect: false, feedback: "They aren't even engaged with the pitch." }
    ]
  },
  {
    id: "l3_q4",
    prompt: "A great hook addresses:",
    answers: [
      { id: "a", text: "Your company's founding story", isCorrect: false, feedback: "Make it about them, not you." },
      { id: "b", text: "The prospect's pain in their own words, with a result proof point", isCorrect: true, feedback: "Yes. Relevance and proof capture attention immediately." },
      { id: "c", text: "Your product roadmap", isCorrect: false, feedback: "Too theoretical for a hook." },
      { id: "d", text: "Your competitors' weaknesses", isCorrect: false, feedback: "Focus on your strengths, not bashing others." }
    ]
  },
  {
    id: "l3_q5",
    prompt: "You only have one sentence to hook a busy CEO. Which works best?",
    answers: [
      { id: "a", text: "We're a leading provider of enterprise solutions.", isCorrect: false, feedback: "Generic jargon. Means nothing to a CEO." },
      { id: "b", text: "Our platform has 200+ integrations.", isCorrect: false, feedback: "A feature, not a business outcome." },
      { id: "c", text: "We helped a company like yours reduce customer churn by 30% in 90 days — want to know how?", isCorrect: true, feedback: "Strong! Specific, relevant outcome with a clear invitation to engage." },
      { id: "d", text: "I'd love to schedule a product demo.", isCorrect: false, feedback: "You haven't given them a reason to want a demo." }
    ]
  }
];

const q_l4: Question[] = [
  {
    id: "l4_q1",
    prompt: "\"Our tool has AI-powered analytics.\" How do you translate this to a benefit?",
    answers: [
      { id: "a", text: "It's very advanced technology.", isCorrect: false, feedback: "Still just describing the feature." },
      { id: "b", text: "It means your team can stop guessing and see exactly which deals are at risk before they fall apart.", isCorrect: true, feedback: "Excellent. You connected the feature directly to a valuable outcome." },
      { id: "c", text: "AI is the future.", isCorrect: false, feedback: "A buzzword statement, not a benefit." },
      { id: "d", text: "It analyzes data automatically.", isCorrect: false, feedback: "Close, but doesn't explain WHY that matters to their business." }
    ]
  },
  {
    id: "l4_q2",
    prompt: "The classic benefit framework is:",
    answers: [
      { id: "a", text: "What it is → What it costs", isCorrect: false, feedback: "Missing the 'why it matters' part." },
      { id: "b", text: "Feature → Advantage → Benefit (FAB)", isCorrect: true, feedback: "Correct! The FAB framework is a classic for a reason." },
      { id: "c", text: "Feature → Feature → Price", isCorrect: false, feedback: "Don't stack features without explaining value." },
      { id: "d", text: "Pitch → Close → Follow-up", isCorrect: false, feedback: "That's a sales process, not a benefit framework." }
    ]
  },
  {
    id: "l4_q3",
    prompt: "Prospect says \"So what?\" after you describe a feature. This means:",
    answers: [
      { id: "a", text: "They're not interested", isCorrect: false, feedback: "They might be, they just don't see the connection yet." },
      { id: "b", text: "You haven't connected the feature to their specific pain yet", isCorrect: true, feedback: "Exactly. 'So what?' is the ultimate test of a benefit." },
      { id: "c", text: "They want a lower price", isCorrect: false, feedback: "They just don't understand the value yet." },
      { id: "d", text: "They need more technical detail", isCorrect: false, feedback: "Usually, they need LESS technical detail and MORE business impact." }
    ]
  },
  {
    id: "l4_q4",
    prompt: "\"We integrate with Salesforce\" becomes:",
    answers: [
      { id: "a", text: "We work with your CRM.", isCorrect: false, feedback: "Still just stating a fact." },
      { id: "b", text: "Your team won't have to change anything — all activity logs in Salesforce automatically, so your manager's reports are always accurate.", isCorrect: true, feedback: "Perfect translation from a technical feature to a workflow benefit." },
      { id: "c", text: "Salesforce is popular.", isCorrect: false, feedback: "Irrelevant to their specific situation." },
      { id: "d", text: "Integration is one of our key features.", isCorrect: false, feedback: "Doesn't explain why integration is helpful." }
    ]
  },
  {
    id: "l4_q5",
    prompt: "Which statement is benefit-focused?",
    answers: [
      { id: "a", text: "We offer 24/7 support.", isCorrect: false, feedback: "This is a feature." },
      { id: "b", text: "24/7 support means if a deal is closing at midnight, we're there — you never lose a deal to a technical issue.", isCorrect: true, feedback: "Yes! It paints a picture of exactly how the feature saves the day." },
      { id: "c", text: "Our SLA is 99.9%.", isCorrect: false, feedback: "A metric, but what does it mean for their business?" },
      { id: "d", text: "We have a dedicated success team.", isCorrect: false, feedback: "Still just a feature." }
    ]
  }
];

const q_l5: Question[] = [
  {
    id: "l5_q1",
    prompt: "A prospect repeatedly checks their phone during your pitch. You should:",
    answers: [
      { id: "a", text: "Keep presenting", isCorrect: false, feedback: "They aren't listening anyway." },
      { id: "b", text: "Stop and say \"Is now still a good time — or should we reschedule?\"", isCorrect: true, feedback: "Respects their time and yours, and often snaps them back to attention." },
      { id: "c", text: "Speed up your pitch", isCorrect: false, feedback: "Rushing doesn't rebuild engagement." },
      { id: "d", text: "Ignore it", isCorrect: false, feedback: "Ignoring a disengaged prospect is a waste of a meeting." }
    ]
  },
  {
    id: "l5_q2",
    prompt: "BANT stands for:",
    answers: [
      { id: "a", text: "Budget, Authority, Need, Timeline", isCorrect: true, feedback: "Correct! A standard qualification framework." },
      { id: "b", text: "Brand, Acquisition, Nurture, Target", isCorrect: false, feedback: "Incorrect marketing terms." },
      { id: "c", text: "Buyer, Account, Network, Territory", isCorrect: false, feedback: "Incorrect sales terms." },
      { id: "d", text: "Benchmark, Analysis, Negotiation, Transfer", isCorrect: false, feedback: "Incorrect." }
    ]
  },
  {
    id: "l5_q3",
    prompt: "A prospect keeps asking about payment plans. This signals:",
    answers: [
      { id: "a", text: "They're not interested", isCorrect: false, feedback: "If they weren't interested, they wouldn't ask about paying." },
      { id: "b", text: "They want to buy but have budget constraints — address ROI and explore flexible options", isCorrect: true, feedback: "Great read! It's a buying signal wrapped in a constraint." },
      { id: "c", text: "They're comparing competitors", isCorrect: false, feedback: "Maybe, but it specifically signals a budget hurdle." },
      { id: "d", text: "They need more features", isCorrect: false, feedback: "Features won't solve a cash flow problem." }
    ]
  },
  {
    id: "l5_q4",
    prompt: "You notice the prospect nods and leans in when you mention \"reducing manual work.\" You should:",
    answers: [
      { id: "a", text: "Move on to the next topic", isCorrect: false, feedback: "You just found a hot button! Don't move on." },
      { id: "b", text: "Double down — ask \"Is manual work a big pain point for your team right now?\"", isCorrect: true, feedback: "Exactly. Validate the body language and dig deeper into the pain." },
      { id: "c", text: "Skip to pricing", isCorrect: false, feedback: "Too early. Build the value first." },
      { id: "d", text: "End the call", isCorrect: false, feedback: "You're just getting to the good part." }
    ]
  },
  {
    id: "l5_q5",
    prompt: "The prospect says \"This is interesting, let me share it with the team.\" This is a:",
    answers: [
      { id: "a", text: "Hard no", isCorrect: false, feedback: "Not necessarily a no, but often a stall." },
      { id: "b", text: "Positive buying signal — ask who else is involved and set a concrete next step", isCorrect: true, feedback: "Right. Don't let them leave without uncovering the decision committee." },
      { id: "c", text: "Stall tactic — push back hard", isCorrect: false, feedback: "Pushing back hard creates unnecessary friction." },
      { id: "d", text: "Sign to lower the price", isCorrect: false, feedback: "Price isn't the issue here, consensus is." }
    ]
  }
];

const q_l6: Question[] = [
  {
    id: "l6_q1",
    prompt: "Prospect: \"It's too expensive.\" Best first response?",
    answers: [
      { id: "a", text: "We can lower the price.", isCorrect: false, feedback: "Never fold immediately. You destroy your value." },
      { id: "b", text: "Compared to what? — explore the reference point before responding", isCorrect: true, feedback: "Perfect. You need context to understand their objection." },
      { id: "c", text: "Our price is very fair.", isCorrect: false, feedback: "Arguing rarely changes a prospect's mind." },
      { id: "d", text: "Everyone says that at first.", isCorrect: false, feedback: "Dismissive and slightly condescending." }
    ]
  },
  {
    id: "l6_q2",
    prompt: "ROI reframe for a $1,000/month tool that saves 5 hours/week per rep:",
    answers: [
      { id: "a", text: "Think of it as an investment.", isCorrect: false, feedback: "Too vague. Show them the math." },
      { id: "b", text: "At $50/hour fully-loaded, that's $1,000/week saved — you're ROI-positive day one.", isCorrect: true, feedback: "Excellent. Hard numbers make the value undeniable." },
      { id: "c", text: "It pays for itself.", isCorrect: false, feedback: "A cliché. Prove HOW it pays for itself." },
      { id: "d", text: "Other companies pay more.", isCorrect: false, feedback: "Irrelevant to their specific budget." }
    ]
  },
  {
    id: "l6_q3",
    prompt: "Prospect: \"We don't have budget this quarter.\" You say:",
    answers: [
      { id: "a", text: "Can you get emergency budget?", isCorrect: false, feedback: "Usually out of their control." },
      { id: "b", text: "Let's talk about next quarter. What would need to be true for this to be in Q3 budget?", isCorrect: true, feedback: "Great pivot. Map out the timeline instead of losing the deal." },
      { id: "c", text: "Then I can't help you.", isCorrect: false, feedback: "Don't burn the bridge." },
      { id: "d", text: "We can do a payment plan.", isCorrect: false, feedback: "Might work later, but explore the timeline first." }
    ]
  },
  {
    id: "l6_q4",
    prompt: "The best way to handle a price objection is:",
    answers: [
      { id: "a", text: "Immediately discount", isCorrect: false, feedback: "Discounting too fast devalues your product." },
      { id: "b", text: "Acknowledge, quantify the cost of the problem, then re-anchor value before discussing price", isCorrect: true, feedback: "Exactly. Make the cost of inaction higher than the price of the software." },
      { id: "c", text: "Ignore it and close", isCorrect: false, feedback: "Ignoring objections guarantees a 'no'." },
      { id: "d", text: "Blame your pricing team", isCorrect: false, feedback: "Makes you look powerless and unprofessional." }
    ]
  },
  {
    id: "l6_q5",
    prompt: "Prospect: \"Your competitor is cheaper.\" You say:",
    answers: [
      { id: "a", text: "We're worth the price.", isCorrect: false, feedback: "Too defensive. Prove it." },
      { id: "b", text: "Interesting — what specifically are they offering? Let's compare apples to apples.", isCorrect: true, feedback: "Smart approach. Often the cheaper option is missing key features." },
      { id: "c", text: "They're not as good.", isCorrect: false, feedback: "Bashing competitors makes you look insecure." },
      { id: "d", text: "We can match their price.", isCorrect: false, feedback: "Don't race to the bottom on price." }
    ]
  }
];

const allPool = [...q_l1, ...q_l2, ...q_l3, ...q_l4, ...q_l5, ...q_l6];

function getShuffledPool(count: number, seed: number): Question[] {
  const shuffled = [...allPool].sort((a, b) => {
    const hashA = (a.prompt.length * seed) % 100;
    const hashB = (b.prompt.length * seed) % 100;
    return hashA - hashB;
  });
  return shuffled.slice(0, count);
}

export const LEVELS: Level[] = [
  { id: 1, name: "Cold Opener", topic: "Opening with confidence", questions: q_l1 },
  { id: 2, name: "Needs Discovery", topic: "Asking the right questions", questions: q_l2 },
  { id: 3, name: "The Hook", topic: "Delivering a compelling pitch", questions: q_l3 },
  { id: 4, name: "Feature to Benefit", topic: "Translating features to value", questions: q_l4 },
  { id: 5, name: "Reading the Room", topic: "Qualifying buyer intent", questions: q_l5 },
  { id: 6, name: "Objection: Price", topic: "Handling price objections", questions: q_l6 },
  { id: 7, name: "Objection: Timing", topic: "Handling timing pushback", questions: getShuffledPool(5, 7) },
  { id: 8, name: "Objection: Competitor", topic: "Differentiating from competition", questions: getShuffledPool(5, 8) },
  { id: 9, name: "The Follow-Up", topic: "Post-meeting momentum", questions: getShuffledPool(5, 9) },
  { id: 10, name: "Trust Builder", topic: "Building authentic rapport", questions: getShuffledPool(5, 10) },
  { id: 11, name: "The Demo", topic: "Running a compelling demo", questions: getShuffledPool(5, 11) },
  { id: 12, name: "The Close", topic: "Asking for the commitment", questions: getShuffledPool(5, 12) },
  { id: 13, name: "Negotiation", topic: "Win-win deal crafting", questions: getShuffledPool(5, 13) },
  { id: 14, name: "Referral Play", topic: "Turning customers into advocates", questions: getShuffledPool(5, 14) },
  { id: 15, name: "Elite Closer", topic: "Mastering the full cycle", questions: getShuffledPool(5, 15) },
];

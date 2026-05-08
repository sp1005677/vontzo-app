import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

const PITCH_SYSTEM = `You are an elite sales coach evaluating a sales pitch. 
Return ONLY a JSON object with this exact shape:
{"score":85,"breakdown":{"clarity":90,"confidence":80,"valueProposition":85,"callToAction":75},"strengths":["..."],"improvements":["..."],"verdict":"..."}

Score 0-100. breakdown fields each 0-100. strengths and improvements are arrays of 2-3 short strings (max 15 words each). verdict is one punchy sentence (max 20 words).`;

const OBJECTION_SYSTEM = `You are a sales training AI generating realistic sales objections.
Return ONLY a JSON object:
{"objections":[{"id":1,"text":"...","options":["best response","ok response","bad response","terrible response"],"correctIndex":0,"coaching":"..."}]}
Generate exactly 5 objections. Keep each objection text under 20 words. Keep option texts under 15 words each. Coaching is 1-2 sentences.`;

// POST /api/gym/pitch-score
router.post("/pitch-score", async (req, res) => {
  try {
    const { pitch, context } = req.body;
    if (!pitch || pitch.trim().length < 20) {
      return res.status(400).json({ error: "Pitch must be at least 20 characters" });
    }

    let raw = "";
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-5-mini",
        max_completion_tokens: 400,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: PITCH_SYSTEM },
          { role: "user", content: `Sales context: ${context ?? "B2B SaaS product"}\n\nPitch to evaluate:\n"${pitch.trim()}"` },
        ],
      });
      raw = completion.choices[0]?.message?.content?.trim() ?? "";
    } catch (aiErr) {
      req.log.warn({ aiErr }, "OpenAI pitch score failed");
    }

    if (raw) {
      try {
        const parsed = JSON.parse(raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/m, "").trim());
        return res.json(parsed);
      } catch {
        req.log.warn("Failed to parse pitch score JSON");
      }
    }

    // Rule-based fallback
    const wordCount = pitch.trim().split(/\s+/).length;
    const hasCallToAction = /meet|call|demo|schedule|book|let's|can we/i.test(pitch);
    const hasValueProp = /save|increase|reduce|improve|grow|result|outcome/i.test(pitch);
    const baseScore = Math.min(85, Math.max(40, 50 + wordCount * 0.5 + (hasCallToAction ? 10 : 0) + (hasValueProp ? 10 : 0)));

    res.json({
      score: Math.round(baseScore),
      breakdown: { clarity: Math.round(baseScore + 5), confidence: Math.round(baseScore - 5), valueProposition: Math.round(baseScore + (hasValueProp ? 8 : -8)), callToAction: Math.round(baseScore + (hasCallToAction ? 10 : -10)) },
      strengths: [hasValueProp ? "Clear value proposition" : "Good opening hook", wordCount > 30 ? "Comprehensive coverage" : "Concise and punchy"],
      improvements: [!hasCallToAction ? "Add a specific call-to-action" : "Stronger closing line", !hasValueProp ? "Quantify your value proposition" : "Add social proof or metrics"],
      verdict: hasCallToAction && hasValueProp ? "Solid pitch — sharpen the numbers and you're closing." : "Needs a clearer outcome and next step.",
    });
  } catch (err) {
    req.log.error({ err }, "POST /gym/pitch-score failed");
    res.status(500).json({ error: "Scoring unavailable" });
  }
});

// POST /api/gym/objections — generate rapid-fire objection set
router.post("/objections", async (req, res) => {
  try {
    const { topic } = req.body;

    let raw = "";
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-5-mini",
        max_completion_tokens: 600,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: OBJECTION_SYSTEM },
          { role: "user", content: `Generate 5 sales objections for: ${topic ?? "B2B SaaS software sales"}` },
        ],
      });
      raw = completion.choices[0]?.message?.content?.trim() ?? "";
    } catch (aiErr) {
      req.log.warn({ aiErr }, "OpenAI objections failed");
    }

    if (raw) {
      try {
        const parsed = JSON.parse(raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/m, "").trim());
        return res.json(parsed);
      } catch {
        req.log.warn("Failed to parse objections JSON");
      }
    }

    // Static fallback objections
    res.json({
      objections: [
        { id: 1, text: "We don't have budget for this right now.", options: ["Ask about their budget cycle and revisit timing", "Offer a discount immediately", "End the call politely", "Tell them to find the budget"], correctIndex: 0, coaching: "Budget objections are often timing objections. Explore the cycle — don't cave on price." },
        { id: 2, text: "We already use a competitor's solution.", options: ["Ask what they wish the competitor did better", "Immediately bash the competitor", "Agree they made a good choice", "Hang up"], correctIndex: 0, coaching: "Switching conversations start with uncovering pain. Ask what's missing, not what's wrong." },
        { id: 3, text: "I need to run this by my team first.", options: ["Offer to present to the team directly", "Ask them to decide today", "Send a PDF and wait", "Lower the price now"], correctIndex: 0, coaching: "Multiple stakeholders = multiple conversations. Offer to help them sell internally." },
        { id: 4, text: "This isn't a priority for us right now.", options: ["Connect it to a business goal they mentioned", "Thank them and end the call", "Offer a free trial immediately", "Tell them they're wrong"], correctIndex: 0, coaching: "Uncover the cost of inaction. What happens if this problem persists another quarter?" },
        { id: 5, text: "Your pricing is too high compared to alternatives.", options: ["Anchor on ROI and total cost of ownership", "Match the competitor price", "Get defensive about value", "Ask which alternative"], correctIndex: 0, coaching: "Price objections are value objections. Reframe from cost to investment and ROI." },
      ],
    });
  } catch (err) {
    req.log.error({ err }, "POST /gym/objections failed");
    res.status(500).json({ error: "Could not generate objections" });
  }
});

export default router;

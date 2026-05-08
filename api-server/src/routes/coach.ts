import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are Rocco, an elite AI sales coach inside the VONTZO training app.
Evaluate a sales trainee's answer and return ONLY a JSON object — no prose, no markdown, no code fences.

Grade scale: S = perfect answer, A = strong, B = adequate, C = weak or wrong.
Keep feedback under 55 words. Be direct, tactical, and motivating.
audio_cue must be "correct" for grades S or A, and "wrong" for grades B or C.

Return exactly this shape:
{"grade":"S","feedback":"...","audio_cue":"correct"}`;

// POST /api/coach
router.post("/", async (req, res) => {
  try {
    const { question, chosen_answer, correct_answer, level_id } = req.body;

    if (!question || !chosen_answer || !correct_answer) {
      return res.status(400).json({ error: "question, chosen_answer, and correct_answer are required" });
    }

    const isEliteLevel = Number(level_id) >= 11;
    const characterName = isEliteLevel ? "Z-01" : "Rocco";

    const userMessage = `Scenario: "${question}"
Correct answer: "${correct_answer}"
Trainee chose: "${chosen_answer}"
Coach character: ${characterName}`;

    let raw = "";
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-5-mini",
        max_completion_tokens: 200,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
      });
      raw = completion.choices[0]?.message?.content?.trim() ?? "";
    } catch (aiErr) {
      req.log.warn({ aiErr }, "OpenAI call failed, using rule-based fallback");
    }

    let parsed: { grade: string; feedback: string; audio_cue: string } | null = null;

    if (raw) {
      // Strip markdown code fences if model still wraps output
      const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/m, "").trim();
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        req.log.warn({ raw }, "Failed to parse AI JSON, using rule-based fallback");
      }
    }

    if (!parsed) {
      // Rule-based fallback when AI is unavailable or returns garbage
      const isCorrect = chosen_answer.trim().toLowerCase() === correct_answer.trim().toLowerCase();
      const feedbackBank = {
        correct: [
          "Textbook. That's exactly how top closers handle it — keep that instinct sharp.",
          "On point. Elite closers don't overthink; they execute. Stay dialed in.",
          "Correct read. Your pattern recognition is improving. Build on this.",
        ],
        wrong: [
          "Not the play. The correct move here is to lead with curiosity, not assumption.",
          "Close, but this costs you deals. Study the correct approach and drill it.",
          "Misread the situation. Revisit this scenario until the right answer is instinctive.",
        ],
      };
      const pool = isCorrect ? feedbackBank.correct : feedbackBank.wrong;
      const text = pool[Math.floor(Math.random() * pool.length)];
      parsed = {
        grade: isCorrect ? "A" : "C",
        feedback: text,
        audio_cue: isCorrect ? "correct" : "wrong",
      };
    }

    // Sanitize
    const validGrades = ["S", "A", "B", "C"];
    if (!validGrades.includes(parsed.grade)) parsed.grade = "B";
    if (!["correct", "wrong"].includes(parsed.audio_cue)) {
      parsed.audio_cue = ["S", "A"].includes(parsed.grade) ? "correct" : "wrong";
    }

    res.json(parsed);
  } catch (err) {
    req.log.error({ err }, "POST /coach failed");
    res.status(500).json({ error: "Coach unavailable" });
  }
});

export default router;

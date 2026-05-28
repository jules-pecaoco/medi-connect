import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";

interface AIRecommendation {
  specialties: string[];
  reasoning: string;
}

function isRecommendation(value: unknown): value is AIRecommendation {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<AIRecommendation>;
  return (
    Array.isArray(candidate.specialties) &&
    candidate.specialties.length > 0 &&
    candidate.specialties.every(
      (specialty) => typeof specialty === "string" && specialty.trim().length > 0
    ) &&
    typeof candidate.reasoning === "string" &&
    candidate.reasoning.trim().length > 0
  );
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "PATIENT") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { symptoms } = await req.json();
    if (!symptoms || typeof symptoms !== "string" || symptoms.trim().length < 10) {
      return NextResponse.json(
        { error: "Please enter a more detailed symptom description (at least 10 characters)." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI recommendation engine is not configured." },
        { status: 500 }
      );
    }

    const model = process.env.GEMINI_MODEL ?? "gemini-3.5-flash";
    const prompt = `You are a medical triage assistant.
A patient describes their symptoms below.
Return JSON only. Recommend doctor specialties, not diagnoses or treatments.

Example output:
{
  "specialties": ["Cardiology"],
  "reasoning": "Patient reports chest pain radiating to the left arm."
}

Symptoms:
${symptoms}`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                specialties: {
                  type: "ARRAY",
                  items: { type: "STRING" },
                },
                reasoning: { type: "STRING" },
              },
              required: ["specialties", "reasoning"],
            },
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      console.error("Gemini API Error:", {
        status: geminiResponse.status,
        statusText: geminiResponse.statusText,
        body: await geminiResponse.text(),
      });

      return NextResponse.json(
        { error: "AI recommendation service is temporarily unavailable. Please try again shortly." },
        { status: 502 }
      );
    }

    const data = await geminiResponse.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (typeof text !== "string") {
      console.error("Gemini API returned an unexpected response shape:", data);
      return NextResponse.json(
        { error: "AI engine returned an unexpected response. Please try describing your symptoms again." },
        { status: 502 }
      );
    }

    const result: unknown = JSON.parse(text);
    if (!isRecommendation(result)) {
      console.error("Gemini API returned invalid recommendation JSON:", result);
      return NextResponse.json(
        { error: "AI engine failed to structure recommendations. Please try describing your symptoms again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, recommendation: result });
  } catch (error) {
    console.error("Recommendation API Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred with the AI engine." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Use POST with a JSON body containing a symptoms field." },
    { status: 405 }
  );
}

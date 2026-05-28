import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/auth";

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
      return NextResponse.json({ error: "AI recommendation engine is not configured." }, { status: 500 });
    }

    // Initialize Gemini AI using GoogleGenerativeAI
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `You are a medical triage assistant.
A patient describes their symptoms below.
Return JSON only — no markdown, no explanation, no backticks.

Example output:
{
  "specialties": ["Cardiology"],
  "reasoning": "Patient reports chest pain radiating to the left arm."
}

Symptoms:
${symptoms}`;

    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
    });

    const text = response.response?.text ? response.response.text() : "";
    
    // Clean up potential markdown code block formatting
    const cleanedText = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    try {
      const result = JSON.parse(cleanedText);
      return NextResponse.json({ success: true, recommendation: result });
    } catch (parseError) {
      console.error("JSON parse error from Gemini text:", text, parseError);
      return NextResponse.json({ 
        error: "AI engine failed to structure recommendations. Please try describing your symptoms again." 
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Gemini AI API Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred with the AI engine." }, { status: 500 });
  }
}

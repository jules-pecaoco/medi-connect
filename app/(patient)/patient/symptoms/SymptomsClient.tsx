"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Brain, 
  Sparkles, 
  ChevronRight, 
  Search, 
  AlertCircle,
  Stethoscope,
  Activity,
  HeartHandshake
} from "lucide-react";

interface AIRecommendation {
  specialties: string[];
  reasoning: string;
}

export default function SymptomsClient() {
  const [symptoms, setSymptoms] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim() || symptoms.trim().length < 10) {
      setError("Please describe your symptoms in at least 10 characters.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecommendation(null);

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process symptoms.");
      }

      setRecommendation(data.recommendation);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header Back Button */}
      <header className="mb-8">
        <Link
          href="/patient/dashboard"
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-teal-600 border border-slate-200 dark:border-slate-800 hover:border-teal-500/20 rounded-xl transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Workspace
        </Link>
      </header>

      {/* Main Container */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Left Triage Area (3 cols) */}
        <div className="md:col-span-3 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">AI Symptom Triage</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Describe what you are feeling to discover matching clinical specializations.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Describe Your Symptoms
                </label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. I have a throbbing headache on the right side of my head for 2 days, accompanied by slight nausea and light sensitivity..."
                  rows={6}
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-sm input-glow transition resize-none leading-relaxed"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl border border-red-500/10 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs animate-fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !symptoms.trim()}
                className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-teal-600/10 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Activity className="h-4 w-4 animate-spin" />
                    Analyzing Symptoms...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Get AI Recommendations
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Info & Results Column (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* Static Disclaimer Card */}
          <div className="glass-card rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800/80 shadow-md bg-amber-500/5">
            <div className="flex items-start gap-3 text-xs">
              <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200">Clinical Disclaimer</h4>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                  This tool uses generative AI to analyze symptoms and suggest potential specialties. It does not provide medical diagnoses or treatment recommendations. Always seek immediate emergency services in case of severe or life-threatening symptoms.
                </p>
              </div>
            </div>
          </div>

          {/* AI Recommendation Output Card */}
          {recommendation && (
            <div className="glass-card rounded-2xl p-6 border border-teal-500/20 shadow-md bg-teal-500/[0.02] animate-fade-in space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800/40">
                <Stethoscope className="h-5 w-5 text-teal-600" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  AI Referral Recommendation
                </h3>
              </div>

              <div>
                <h4 className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2">
                  Suggested Specializations
                </h4>
                <div className="flex flex-wrap gap-2">
                  {recommendation.specialties.map((specialty, idx) => (
                    <Link
                      key={idx}
                      href={`/patient/doctors?specialization=${encodeURIComponent(specialty)}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-teal-500/20 bg-teal-500/10 text-teal-600 dark:text-teal-400 hover:bg-teal-600 hover:text-white transition cursor-pointer"
                    >
                      {specialty}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <h4 className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
                  AI Assessment Reasoning
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {recommendation.reasoning}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
                <HeartHandshake className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Ready to Book?</p>
                  <p className="mt-0.5">
                    Click any suggested specialization tag above to directly search and consult with matching verified doctors.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="clinical-card space-y-4 p-6 animate-fade-in">
              <div className="flex items-center gap-2 text-sm font-bold text-teal-800">
                <Activity className="h-4 w-4 animate-spin" />
                Reading symptom pattern
              </div>
              <div className="h-3 w-4/5 animate-pulse rounded-full bg-sage-200" />
              <div className="h-3 w-3/5 animate-pulse rounded-full bg-sage-200" />
              <div className="flex gap-2 pt-2">
                <span className="h-8 w-24 animate-pulse rounded-full bg-teal-100" />
                <span className="h-8 w-20 animate-pulse rounded-full bg-teal-100" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

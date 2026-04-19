function hasUrgentTimelineSignal(timeline) {
  const positiveUrgencyPattern =
    /\burgent\b|\basap\b|\bimmediately\b|\b1\s*week\b|\b2\s*weeks?\b/;
  const negativeUrgencyPattern = /\bnot urgent\b|\bno rush\b|\bflexible timeline\b/;

  return positiveUrgencyPattern.test(timeline) && !negativeUrgencyPattern.test(timeline);
}

export function buildQualificationRecommendation(answers) {
  const [scope = "", goal = "", scale = "", integrations = "", timeline = "", budget = ""] =
    answers.map((answer) => answer.toLowerCase());
  const hasUrgentTimeline = hasUrgentTimelineSignal(timeline);

  const tier =
    budget.includes("15") || scale.includes("enterprise") || scope.includes("platform")
      ? "Platform Build"
      : budget.includes("5k") || integrations.includes("api")
        ? "Growth Project"
        : "Quick Win / Starter Scope";

  const recommendedModel =
    hasUrgentTimeline
      ? "Fast support sprint"
      : goal.includes("automation")
        ? "Focused automation sprint"
        : tier === "Platform Build"
          ? "Product build sprint"
          : "Scoped delivery sprint";

  const eta =
    hasUrgentTimeline
      ? "1-3 weeks"
      : tier === "Platform Build"
        ? "6-12 weeks"
        : tier === "Growth Project"
          ? "3-6 weeks"
          : "1-3 weeks";

  return {
    tier,
    recommendedModel,
    eta,
  };
}

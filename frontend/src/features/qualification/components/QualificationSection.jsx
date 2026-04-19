import { useCallback, useState } from "react";
import { qualificationRequestSchema } from "@automivex/shared/schemas";
import { useQualificationMutation } from "@/features/qualification/hooks/useQualificationMutation";
import { trackEvent } from "@/lib/analytics";
import { toApiErrorResponse } from "@/shared/api/httpClient";
import { Section } from "@/shared/ui/Section";

export default function QualificationSection({ qualificationQuestions = [] }) {
  const qualificationMutation = useQualificationMutation();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(() => qualificationQuestions.map(() => ""));
  const [message, setMessage] = useState("");
  const totalSteps = qualificationQuestions.length;
  const currentAnswer = answers[step] || "";
  const recommendation = qualificationMutation.data || null;
  const status = qualificationMutation.isPending
    ? "loading"
    : qualificationMutation.isError
      ? "error"
      : qualificationMutation.isSuccess
        ? "success"
        : "idle";
  const canContinue = currentAnswer.trim().length > 0;

  const updateCurrentAnswer = useCallback(
    (value) => {
      const nextAnswers = [...answers];
      nextAnswers[step] = value;
      setAnswers(nextAnswers);
      setMessage("");
    },
    [answers, step]
  );

  const submitForRecommendation = useCallback(async () => {
    const parsed = qualificationRequestSchema.safeParse({ answers });

    if (!parsed.success) {
      setMessage("Please answer every question before generating a recommendation.");
      return;
    }

    try {
      const result = await qualificationMutation.mutateAsync(parsed.data.answers);
      trackEvent("qualification_completed", { tier: result.tier });
      setMessage("");
    } catch (error) {
      const errorResponse = toApiErrorResponse(error);
      setMessage(
        errorResponse.error || "Could not generate recommendation. Please try again."
      );
    }
  }, [answers, qualificationMutation]);

  const handleNext = useCallback(() => {
    if (!canContinue) {
      setMessage("Please add an answer before continuing.");
      return;
    }

    if (step === totalSteps - 1) {
      void submitForRecommendation();
      return;
    }

    setMessage("");
    setStep((currentStep) => currentStep + 1);
  }, [canContinue, step, submitForRecommendation, totalSteps]);

  const handleRestart = useCallback(() => {
    qualificationMutation.reset();
    setAnswers(qualificationQuestions.map(() => ""));
    setMessage("");
    setStep(0);
  }, [qualificationMutation]);

  return (
    <Section
      id="assistant"
      eyebrow="Project Fit Check"
      title="Tell us what you need. We’ll recommend the right starting point."
    >
      <p className="section-intro">
        Six short questions. Usually under two minutes. We’ll suggest the best fit for
        your budget, delivery style, and timeline.
      </p>

      <div className="assistant-box">
        {!recommendation ? (
          <>
            <div className="assistant-head">
              <h3>{`Question ${step + 1} of ${totalSteps}`}</h3>
              <p>{qualificationQuestions[step]}</p>
            </div>

            <p className="muted-note">
              Fast, practical, and designed to help you avoid over-scoping too early.
            </p>

            <label className="field">
              <span>Project details</span>
              <textarea
                rows="4"
                value={currentAnswer}
                placeholder="Add a short, plain-English answer..."
                onChange={(event) => updateCurrentAnswer(event.target.value)}
              />
            </label>

            <div className="step-actions">
              <button
                className="btn ghost"
                type="button"
                disabled={step === 0 || status === "loading"}
                onClick={() => setStep((currentStep) => currentStep - 1)}
              >
                Back
              </button>
              <button
                className="btn"
                type="button"
                disabled={status === "loading"}
                onClick={handleNext}
              >
                {step === totalSteps - 1
                  ? status === "loading"
                    ? "Reviewing your answers..."
                    : "Get recommendation"
                  : "Next question"}
              </button>
            </div>

            {message ? (
              <p className={status === "error" ? "error-text" : "success-text"}>
                {message}
              </p>
            ) : null}
          </>
        ) : (
          <div className="assistant-result">
            <h3>Recommended starting point</h3>
            <p className="muted-note">
              This is a fast first-pass recommendation. We confirm exact scope,
              pricing, and timeline in discovery.
            </p>
            <p>
              <strong>Recommended path:</strong> {recommendation.tier}
            </p>
            <p>
              <strong>Likely timeline:</strong> {recommendation.eta}
            </p>
            <p>
              <strong>Delivery model:</strong> {recommendation.recommendedModel}
            </p>
            <div className="step-actions">
              <a href="#book-call" className="btn">
                Open project brief
              </a>
              <button className="btn ghost" type="button" onClick={handleRestart}>
                Start again
              </button>
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}

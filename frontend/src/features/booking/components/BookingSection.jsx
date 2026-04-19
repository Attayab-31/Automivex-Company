import { useMemo, useState } from "react";
import { leadRequestSchema } from "@automivex/shared/schemas";
import { useLeadSubmission } from "@/features/booking/hooks/useLeadSubmission";
import { trackEvent } from "@/lib/analytics";
import { frontendEnv } from "@/lib/env";
import { toApiErrorResponse } from "@/shared/api/httpClient";
import { Section } from "@/shared/ui/Section";

function isHighIntentService(serviceName) {
  const normalizedService = serviceName.trim().toLowerCase();
  return (
    normalizedService.includes("saas") ||
    normalizedService.includes("computer vision") ||
    normalizedService.includes("ai features")
  );
}

export default function BookingSection({ projectTypeOptions = [], budgetOptions = [] }) {
  const leadSubmission = useLeadSubmission();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    service: "",
    budget: "",
    name: "",
    email: "",
    details: "",
  });
  const [message, setMessage] = useState("");
  const [referenceId, setReferenceId] = useState("");

  const highIntent = useMemo(() => {
    return form.budget === "$15k+" || isHighIntentService(form.service);
  }, [form.budget, form.service]);

  const updateField = (field) => (event) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: event.target.value,
    }));
    setMessage("");
    setReferenceId("");
  };

  const handleLeadSubmit = async (event) => {
    event.preventDefault();

    const parsed = leadRequestSchema.safeParse({
      name: form.name,
      email: form.email,
      service: form.service,
      budget: form.budget,
      details: form.details,
    });

    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message || "Please complete the form.");
      setReferenceId("");
      return;
    }

    try {
      const response = await leadSubmission.mutateAsync(parsed.data);
      setMessage(response.message);
      setReferenceId(response.referenceId || "");
      trackEvent("lead_submitted_backend", {
        budget: form.budget,
        service: form.service,
      });
    } catch (error) {
      const errorResponse = toApiErrorResponse(error);
      setMessage(errorResponse.error || "Submission failed. Please try again.");
      setReferenceId("");
    }
  };

  return (
    <Section
      id="book-call"
      eyebrow="Get A Scoped Plan"
      title="Tell us what you need and we’ll recommend the best next step"
    >
      <p className="section-intro">
        Small fix or larger build, start with the same flow. We’ll review the scope,
        confirm the best next step, and reply quickly.
      </p>

      <div className="booking-funnel">
        <div className="step-indicator" aria-label="Booking steps">
          <span className={step >= 1 ? "active" : ""}>1</span>
          <span className={step >= 2 ? "active" : ""}>2</span>
          <span className={step >= 3 ? "active" : ""}>3</span>
        </div>

        {step === 1 ? (
          <div className="funnel-card">
            <h3>1. Pick the closest service</h3>
            <label className="field">
              <span>Project type</span>
              <select value={form.service} onChange={updateField("service")}>
                <option value="">Select project type</option>
                {projectTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <button
              className="btn"
              type="button"
              disabled={!form.service}
              onClick={() => setStep(2)}
            >
              Next step
            </button>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="funnel-card">
            <h3>2. Choose your budget range</h3>
            <label className="field">
              <span>Budget range</span>
              <select value={form.budget} onChange={updateField("budget")}>
                <option value="">Select budget</option>
                {budgetOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <div className="step-actions">
              <button className="btn ghost" type="button" onClick={() => setStep(1)}>
                Back
              </button>
              <button
                className="btn"
                type="button"
                disabled={!form.budget}
                onClick={() => setStep(3)}
              >
                Continue
              </button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="funnel-card">
            <h3>3. Book a call or send the brief</h3>
            <p>
              {highIntent
                ? "Best next step: a scoped discovery call to review architecture, priorities, and rollout."
                : "Best next step: a short discovery call or written brief so we can confirm scope and the fastest path forward."}
            </p>

            <a
              href={frontendEnv.calendlyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              onClick={() =>
                trackEvent("cta_click", {
                  cta: "booking_funnel_open_calendly",
                  budget: form.budget,
                  service: form.service,
                })
              }
            >
              Book discovery call
            </a>

            <form className="lead-capture" onSubmit={(event) => void handleLeadSubmit(event)}>
              <h4>Prefer email? Send the brief</h4>

              <label className="field">
                <span>Name</span>
                <input
                  name="name"
                  value={form.name}
                  onChange={updateField("name")}
                  placeholder="Your name"
                  autoComplete="name"
                  disabled={leadSubmission.isPending}
                  required
                />
              </label>

              <label className="field">
                <span>Work email</span>
                <input
                  name="email"
                  value={form.email}
                  onChange={updateField("email")}
                  placeholder="Work email"
                  type="email"
                  autoComplete="email"
                  disabled={leadSubmission.isPending}
                  required
                />
              </label>

              <label className="field">
                <span>What do you need built?</span>
                <textarea
                  name="details"
                  value={form.details}
                  onChange={updateField("details")}
                  rows="4"
                  placeholder="Share the goal, main requirements, existing tools, and timeline."
                  disabled={leadSubmission.isPending}
                  required
                />
              </label>

              <button className="btn" type="submit" disabled={leadSubmission.isPending}>
                {leadSubmission.isPending ? "Sending..." : "Send project brief"}
              </button>

              <p className="muted-note">
                We’ll review the brief, reply within 1 business day, and tell you the
                best next step.
              </p>

              <div className="form-status" aria-live="polite" aria-atomic="true">
                {message ? (
                  <p
                    className={leadSubmission.isSuccess ? "success-text" : "error-text"}
                    role={leadSubmission.isSuccess ? "status" : "alert"}
                  >
                    {message}
                  </p>
                ) : null}

                {leadSubmission.isSuccess && referenceId ? (
                  <p className="muted-note" role="status">{`Reference ID: ${referenceId}`}</p>
                ) : null}
              </div>
            </form>
          </div>
        ) : null}
      </div>
    </Section>
  );
}

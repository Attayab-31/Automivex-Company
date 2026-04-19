import FormField from "../FormField.jsx";
import { adminEditorStyles as styles } from "@/shared/ui/adminEditorStyles";

export default function ServicesEditor({ services = [], onChange }) {
  const handleServiceChange = (index, field, value) => {
    const updated = [...services];
    if (field === "basePrice") {
      updated[index][field] = parseInt(value, 10) || 0;
    } else {
      updated[index][field] = value;
    }
    onChange(updated);
  };

  const handleDeliverableChange = (serviceIndex, itemIndex, value) => {
    const updated = [...services];
    updated[serviceIndex].deliverables[itemIndex] = value;
    onChange(updated);
  };

  const handleDeliverableAdd = (serviceIndex) => {
    const updated = [...services];
    if (!updated[serviceIndex].deliverables) {
      updated[serviceIndex].deliverables = [];
    }
    updated[serviceIndex].deliverables.push("");
    onChange(updated);
  };

  const handleDeliverableRemove = (serviceIndex, itemIndex) => {
    const updated = [...services];
    updated[serviceIndex].deliverables.splice(itemIndex, 1);
    onChange(updated);
  };

  const handleAddService = () => {
    const newService = {
      key: `service-${Date.now()}`,
      iconKey: "automation",
      name: "New Service",
      summary: "",
      bestFor: "",
      pain: "",
      outcomes: "",
      deliverables: [],
      engagementModel: "",
      timeline: "",
      range: "$0",
      nextStep: "",
      basePrice: 0,
      availability: "active",
      governance: {
        owner: "",
        lastReviewedAt: new Date().toISOString(),
        reviewCycle: "",
        evidenceSummary: "",
      },
    };
    onChange([...services, newService]);
  };

  const handleRemoveService = (index) => {
    const updated = services.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Services</h2>
        <button onClick={handleAddService} style={styles.addButton}>
          + Add Service
        </button>
      </div>

      {services && services.length === 0 ? (
        <p style={styles.emptyState}>No services. Click "Add Service" to get started.</p>
      ) : (
        services.map((service, serviceIndex) => (
          <div key={service.key} style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardIndex}>Service {serviceIndex + 1}</h3>
              <button
                onClick={() => handleRemoveService(serviceIndex)}
                style={styles.removeButton}
              >
                Remove
              </button>
            </div>

            <FormField
              label="Service Key (slug)"
              value={service.key || ""}
              onChange={(value) => handleServiceChange(serviceIndex, "key", value)}
              placeholder="e.g., 'quick-wins' (lowercase, hyphens only)"
            />

            <FormField
              label="Icon Key"
              value={service.iconKey || ""}
              onChange={(value) => handleServiceChange(serviceIndex, "iconKey", value)}
              placeholder="e.g., 'automation' or 'ai'"
            />

            <FormField
              label="Service Name"
              value={service.name || ""}
              onChange={(value) => handleServiceChange(serviceIndex, "name", value)}
              placeholder="e.g., 'Quick Fixes & Support'"
            />

            <FormField
              label="Summary"
              value={service.summary || ""}
              onChange={(value) => handleServiceChange(serviceIndex, "summary", value)}
              placeholder="Brief description of the service"
              type="textarea"
              rows={2}
            />

            <FormField
              label="Best For (Ideal Customer)"
              value={service.bestFor || ""}
              onChange={(value) => handleServiceChange(serviceIndex, "bestFor", value)}
              placeholder="Who benefits most from this service"
              type="textarea"
              rows={2}
            />

            <FormField
              label="Pain Point (What Problem)"
              value={service.pain || ""}
              onChange={(value) => handleServiceChange(serviceIndex, "pain", value)}
              placeholder="What problem does it solve"
              type="textarea"
              rows={2}
            />

            <FormField
              label="Outcomes (What Results)"
              value={service.outcomes || ""}
              onChange={(value) => handleServiceChange(serviceIndex, "outcomes", value)}
              placeholder="What does the customer get"
              type="textarea"
              rows={2}
            />

            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h4 style={styles.sectionTitle}>Deliverables</h4>
                <button
                  onClick={() => handleDeliverableAdd(serviceIndex)}
                  style={styles.smallButton}
                >
                  + Add Item
                </button>
              </div>
              {(service.deliverables || []).map((deliverable, itemIndex) => (
                <div key={itemIndex} style={styles.deliverableItem}>
                  <FormField
                    label={`Deliverable ${itemIndex + 1}`}
                    value={deliverable || ""}
                    onChange={(value) => handleDeliverableChange(serviceIndex, itemIndex, value)}
                    placeholder="e.g., 'Bug fixes and UX tidy-ups'"
                  />
                  <button
                    onClick={() => handleDeliverableRemove(serviceIndex, itemIndex)}
                    style={styles.removeItemButton}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <FormField
              label="Engagement Model"
              value={service.engagementModel || ""}
              onChange={(value) => handleServiceChange(serviceIndex, "engagementModel", value)}
              placeholder="e.g., 'Fast-turnaround support sprint'"
            />

            <FormField
              label="Typical Timeline"
              value={service.timeline || ""}
              onChange={(value) => handleServiceChange(serviceIndex, "timeline", value)}
              placeholder="e.g., '2-10 days'"
            />

            <FormField
              label="Price Range"
              value={service.range || ""}
              onChange={(value) => handleServiceChange(serviceIndex, "range", value)}
              placeholder="e.g., '$300 - $2.5k'"
            />

            <FormField
              label="Base Price (USD)"
              value={service.basePrice?.toString() || ""}
              onChange={(value) => handleServiceChange(serviceIndex, "basePrice", value)}
              placeholder="e.g., '300'"
              type="number"
            />

            <FormField
              label="Next Step Description"
              value={service.nextStep || ""}
              onChange={(value) => handleServiceChange(serviceIndex, "nextStep", value)}
              placeholder="What should the customer do next"
              type="textarea"
              rows={2}
            />

            <FormField
              label="Availability"
              value={service.availability || "active"}
              onChange={(value) => handleServiceChange(serviceIndex, "availability", value)}
              placeholder="active | limited | waitlist"
            />
          </div>
        ))
      )}

      <div style={styles.infoBox}>
        <strong>Services</strong>
        <p>Define the services offered with complete details for homepage display.</p>
      </div>
    </div>
  );
}

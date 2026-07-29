export const servicePageDefinitions = {
    "quick-wins": {
        name: "Quick Fixes & Support",
        summary:
            "Fast support for urgent bugs, Shopify issues, small integrations, and product improvements that need to ship quickly.",
        bestFor: "Founders and operators who need fast, low-friction help for urgent issues.",
        pain:
            "You have a bug, a missed integration, or a time-sensitive release blocker that is slowing your team down.",
        outcomes:
            "Resolve blockers quickly, stabilize delivery, and keep momentum without waiting on a long agency engagement.",
        engagementModel: "Short, focused sprint with clear scope and rapid implementation.",
        timeline: "2 to 10 working days depending on complexity.",
        range: "$2,500 to $12,000 depending on scope and urgency.",
        deliverables: [
            "A documented implementation plan",
            "Bug fixes or integrations delivered in a short sprint",
            "Deployment support and follow-up QA",
        ],
        nextStep: "Need a fast fix or support sprint?",
        seo: {
            title: "Quick Fixes & Support | Automivex",
            description:
                "Fast 2-10 day support sprints for bug fixes, integrations, and small improvements.",
            keywords: "quick fixes, support, bug fixes, small integrations, website fixes",
        },
    },
    ai: {
        name: "AI Features & Automation",
        summary:
            "Practical AI assistants, recommendations, document processing, and forecasting for teams that want measurable automation.",
        bestFor: "Teams that want AI capabilities embedded into real workflows rather than unused prototypes.",
        pain:
            "Manual tasks are piling up, knowledge is scattered, and your team needs a smarter workflow without a major rebuild.",
        outcomes:
            "Reduce repetitive work, improve response quality, and make better decisions with structured automation.",
        engagementModel: "Discovery-led implementation with phased rollout and measurable success criteria.",
        timeline: "3 to 8 weeks depending on model complexity and integrations.",
        range: "$8,000 to $40,000 depending on scope.",
        deliverables: [
            "Workflow analysis and AI opportunity mapping",
            "Prototype or production-ready assistant",
            "Integration into your current stack and deployment support",
        ],
        nextStep: "Ready to make AI practical in your operations?",
        seo: {
            title: "AI Features & Automation | Automivex",
            description:
                "Practical AI assistants, recommendations, document processing, and forecasting for your business.",
            keywords: "AI development, machine learning, AI features, artificial intelligence, automation",
        },
    },
    cv: {
        name: "Computer Vision & OCR",
        summary:
            "Vision systems for OCR, inspection, detection, and document processing that reduce manual effort and improve accuracy.",
        bestFor: "Operations teams that need to process images, scans, or documents at scale.",
        pain:
            "Your team is still manually reviewing invoices, documents, images, or production output.",
        outcomes:
            "Automate document handling, improve inspection consistency, and reduce manual review time.",
        engagementModel: "Hands-on engagement with data preparation and implementation support.",
        timeline: "4 to 10 weeks depending on data and model needs.",
        range: "$10,000 to $60,000 depending on pipeline complexity.",
        deliverables: [
            "Vision pipeline design",
            "OCR or detection model setup",
            "Testing, deployment guidance, and monitoring plan",
        ],
        nextStep: "Need a better way to process visual data?",
        seo: {
            title: "Computer Vision & OCR | Automivex",
            description:
                "Vision systems for OCR, inspection, detection, and document workflows. Process images automatically.",
            keywords: "computer vision, OCR, image processing, document automation, vision AI",
        },
    },
    automation: {
        name: "Workflow Automation",
        summary:
            "Automate repetitive approvals, reporting, handoffs, and manual admin processes across your tools.",
        bestFor: "Teams with repetitive internal processes that could be handled by workflow automation.",
        pain:
            "Manual handoffs and approval steps create delays, errors, and unnecessary operational friction.",
        outcomes:
            "Increase reliability, reduce response times, and make internal operations more scalable.",
        engagementModel: "Workflow audit and phased implementation focused on quick wins first.",
        timeline: "2 to 6 weeks depending on process complexity.",
        range: "$4,000 to $20,000 depending on integrations.",
        deliverables: [
            "Process map and automation plan",
            "Workflow implementation and integrations",
            "Monitoring and handoff support",
        ],
        nextStep: "Want to remove repetitive work from your team?",
        seo: {
            title: "Workflow Automation Services | Automivex",
            description:
                "Automate repetitive tasks across your tools. Eliminate manual data entry and approval workflows.",
            keywords: "workflow automation, business automation, RPA, process automation, efficiency",
        },
    },
    shopify: {
        name: "Shopify Development & Support",
        summary:
            "Store improvements, app integrations, conversion fixes, and ongoing technical support for Shopify teams.",
        bestFor: "Shopify merchants and teams that need reliable support and growth-focused improvements.",
        pain:
            "Shopify issues, slow storefront changes, or new integrations are holding back growth and revenue.",
        outcomes:
            "Ship faster, improve storefront reliability, and create a better buyer experience.",
        engagementModel: "Flexible support or project-based delivery depending on the need.",
        timeline: "1 to 4 weeks for support work or 2 to 8 weeks for projects.",
        range: "$3,000 to $25,000 depending on scope.",
        deliverables: [
            "Storefront fixes or enhancements",
            "App or theme integration work",
            "Ongoing support and implementation guidance",
        ],
        nextStep: "Need Shopify support or a store improvement sprint?",
        seo: {
            title: "Shopify Development & Support | Automivex",
            description:
                "Shopify store fixes, conversion improvements, integrations, and ongoing technical support.",
            keywords: "Shopify development, store optimization, Shopify customization, e-commerce",
        },
    },
    saas: {
        name: "SaaS Product Development",
        summary:
            "End-to-end SaaS development from MVP to scale, including internal tools, client portals, and full-stack product delivery.",
        bestFor: "Founders and product teams building software products that need reliable technical delivery.",
        pain:
            "You need to move from idea to launch quickly without compromising on quality, architecture, or scalability.",
        outcomes:
            "Ship a stronger MVP, shorten the path to validation, and build a foundation that can grow.",
        engagementModel: "Product-focused delivery with clear milestones and technical implementation support.",
        timeline: "4 to 12 weeks depending on scope and product maturity.",
        range: "$12,000 to $80,000 depending on complexity.",
        deliverables: [
            "Product planning and technical architecture",
            "MVP or feature development",
            "Launch support and iterative improvement",
        ],
        nextStep: "Ready to build or refine your software product?",
        seo: {
            title: "SaaS Product Development | Automivex",
            description:
                "Full-stack SaaS development from MVP to scale. Build, launch, and grow your software product.",
            keywords: "SaaS development, product development, MVP, full-stack development, software startup",
        },
    },
};

export function getServicePageContent(serviceKey, publishedContent = null) {
    const fallbackDefinition = servicePageDefinitions[serviceKey];

    if (!fallbackDefinition) {
        return null;
    }

    const publishedService = publishedContent?.services?.find((service) => service.key === serviceKey);

    const service = {
        ...fallbackDefinition,
        ...(publishedService || {}),
        deliverables: publishedService?.deliverables?.length
            ? publishedService.deliverables
            : fallbackDefinition.deliverables,
        nextStep: publishedService?.nextStep || fallbackDefinition.nextStep,
        seo: {
            ...fallbackDefinition.seo,
            ...(publishedService?.seo || {}),
        },
    };

    return {
        service,
        seo: {
            title: service.seo.title || fallbackDefinition.seo.title,
            description: service.seo.description || fallbackDefinition.seo.description,
            keywords: service.seo.keywords || fallbackDefinition.seo.keywords,
            pathname: `/services/${serviceKey}`,
        },
    };
}

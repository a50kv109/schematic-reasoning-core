# Schematic Reasoning Core v0.3.0

This release provides an extensible agent skill and a deterministic geometry core for structured diagram interpretation.

## Included

- Versioned module and vision-provider contracts, provenance-aware observations, coordinate frames, and independent structural/domain validation.
- A square-paper Origami adapter with manual and provider-assisted workflows, plus deterministic tests and portable examples.
- A host-agent observation bridge. It accepts observations already produced by the host and does not call a model or external vision API.
- GitHub Actions CI for Node.js 20 and 22 and a verified portable ZIP with a SHA-256 sidecar.

## Limits

The project does not provide autonomous image recognition, perspective correction, or physical measurement validation. TASK 08 used image analysis in one agent session and compared against a same-session, non-independent reference; the reported pixel errors are exploratory only. Four dashed creases were outside the scored set. The source scan and local benchmark are excluded because redistribution rights were not verified.

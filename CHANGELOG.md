# Changelog

## [0.3.0] - 2026-10-27

- Added a versioned, model-agnostic provider contract and host-agent observation bridge.
- Added common visual-observation normalization, provenance and uncertainty retention, and localization metrics.
- Added independent Origami checks for two orthogonal midpoint folds.
- Added deterministic mock contract tests and CI-ready package verification.
- Documented that the host-agent bridge consumes observations already produced by the host; it does not call a vision model/API.
- Recorded TASK 08 as an exploratory, same-session self-comparison. No independent localization-accuracy or physical-measurement claim is made.

## [0.2.0]

- Added provider registry, normalized observation IR, mock-assisted Origami pipeline, and provider authoring guidance.

## [0.1.0]

- Initial manual Origami geometry core, explicit coordinate frames, provenance, and independent invariant checks.

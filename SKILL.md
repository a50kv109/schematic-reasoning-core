---
name: schematic-reasoning-core
description: Build and validate editable geometry from schematic images using optional host-supplied visual observations, manual annotations, explicit coordinate frames, provenance, and independent domain checks. No autonomous model or external vision API provider is bundled.
---

# Schematic Reasoning Core

Use this skill when an agent needs to turn a supported schematic into a typed geometric model with traceable provenance and independent checks. This v0.3.0 package is an agent workflow plus a Node.js library, not a universal CV system.

## Workflow

1. Inspect the source and task. Preserve original bytes separately, record media type, dimensions, source ID and SHA-256 where available. Do not call an image synthetic unless it was constructed for a fixture.
2. Choose a registered adapter by its manifest and inspect its declared capabilities/limitations. If no adapter supports the domain, report that boundary rather than forcing the input into Origami.
3. Validate input and explicitly declare coordinate frames, units, calibration transform and transform provenance. Do not infer physical scale from a mathematically consistent homography.
4. Distinguish object provenance: `algorithm`, `human`, `analytic`, `derived`, or `imported`. Record confidence only when it has a defensible meaning; use null/uncertain otherwise.
5. For assisted analysis, register only providers actually supplied by the host through the versioned provider contract. Discover availability from the integration, never from a model label. Use one provider by default; comparison requires an explicit request. Normalize observations and preserve approximate/exact-tool/human/qualitative quality. Qualitative text remains text and never becomes coordinates implicitly.
6. Run the adapter's detection/annotation operation. Origami manual mode accepts four ordered square corners and zero or supported fold segments, including two orthogonal opposite-side midpoint folds. Provider-assisted geometry is a proposal; request human confirmation when observations are qualitative, incomplete, ambiguous or configuration is unclear. Automatic mode remains unsupported in the bundled implementation; never substitute ideal coordinates for detection.
7. Build a versioned result model, then run base validation and domain-specific independent checks. Keep structural validity and geometric consistency separate from image-localization accuracy and physical measurement accuracy. Do not silently repair failed geometry.
8. Save source identity, frames, transforms, objects, relations, constraints, provenance and validation report. Report separately what was image-derived, human-entered, analytically constructed, or actually tested on pixels.

## Calling the Origami module

See [module development](docs/MODULE_DEVELOPMENT.md), [provider author guide](docs/PROVIDER_AUTHORING.md), and [the example](examples/origami-double-diagonal.manual.json). `core/provider-pipeline.js` defines the provider-assisted path. TASK 08 exercised a host-agent bridge after Codex inspected a local image; this is not an autonomous model/API integration. Run `npm test`; mock tests prove contract plumbing only, while TASK 08 records a narrowly scoped real host-agent visual run with a same-session non-blinded reference; see docs/VISION_WORKFLOW_STATUS.md.

## Boundaries

The only domain adapter is simple square-paper Origami. Line/contour detection, arrow interpretation, fold sequence recovery, image rectification, CAD semantics, and music notation are not implemented. Real-image pixel accuracy is unverified. Read [capabilities](docs/CAPABILITIES.md) and [limitations](docs/LIMITATIONS.md) before claiming support.

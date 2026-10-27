# Capabilities

## v0.3.0 working

- Explicitly register a compatible module object and reject incompatible manifests/API versions.
- Represent points, segments, polylines, coordinate frames, projective transforms, relations and constraints in a versioned common result format.
- Preserve per-object provenance, optional confidence, validation state and model-level uncertainty/limitations.
- Origami manual/assisted path: square outline, four vertices, no fold, one opposite-corner diagonal, one opposite-side midpoint fold, or two diagonals.
- Derive center and intersections; validate square closure/convexity, equal side lengths, right angles, diagonal endpoints/intersection/center and midpoint fold endpoints.
- Versioned provider contract and host-agent observation bridge; captured observations preserve source/frame and approximate quality. The bridge is not a callable vision model.
- Two orthogonal opposite-side midpoint folds are a supported Origami configuration with independent checks.
- Serialize/restore result JSON and rerun validation.

## Explicitly unsupported

- Autonomous model/API image contour/line/circle/fold detection. Host-agent visual inspection is a separate assisted workflow.
- Training, OCR, arrows, fold order, multi-layer origami or semantic paper state.
- Automatic calibration, perspective rectification and image renderer/overlay UI.
- Music notation and engineering drawing adapters.

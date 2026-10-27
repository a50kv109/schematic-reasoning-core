# Origami adapter v0.2.0

## Supported domain

Simple diagrams of one square sheet with straight fold segments: no folds, one diagonal, one fold between midpoints of opposite sides, two diagonals, or two orthogonal folds between opposite-side midpoints. Inputs are manual annotations expressed in one declared coordinate frame.

## Lifecycle

- `manifest.json` declares API v1.0.0, accepted metadata/annotation inputs, object types, capabilities and limitations.
- `detection.js` validates annotation input and emits human-provenance detections. For `automatic`, it returns `UNSUPPORTED` with zero detections.
- `adapter.js` converts accepted detections into the common result model and derives the square center and fold intersections.
- `constraints.js` independently checks square geometry, annotation frame consistency, outline/corner consistency, supported crease patterns, and center/intersection relations.

The module does not read image pixels, calibrate coordinates, repair invalid points, or infer crease semantics. The host must record the source asset and map coordinates explicitly before calling it. See `tests/origami.test.js` and root `tests/` for analytic and integration tests.

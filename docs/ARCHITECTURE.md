# Architecture

## Processing boundary

`immutable source -> declared frames/transforms -> optional capability provider -> normalized observations -> domain adapter -> common result model -> independent base/domain validation`

Input handling belongs to the host: acquire bytes, retain an immutable original, calculate its digest, and define frames. A module may expose detection; it cannot make its output authoritative. Geometric reasoning creates typed objects and relations. Independent validation checks structural and domain invariants. Rendering is outside this package. TASK 08 used the host agent's native image-inspection workflow through an explicit response bridge, not an autonomous model endpoint.

## Core API

- `core/types.js`: API/result versions, provenance kinds, object constructors and result constructor.
- `core/geometry.js`: finite points, vector operations, distance/angle, parallel/perpendicular checks, segment intersections and polygon area.
- `core/coordinate-frames.js`: frame validation, 3×3 projective maps/inverses, direct and reverse frame lookup, and transform metadata validation.
- `core/relations.js`: shared relation vocabulary and relation constructor.
- `core/provenance.js`: provenance validation and uncertainty/status vocabulary.
- `core/validation.js`: generic result-model structure checks and structured check records.
- `core/module-registry.js`: API-version and manifest validation, object-interface checking, and explicit registration. It does not load/evaluate code named by a manifest.
- `core/provider-registry.js`, `observations.js`, and `provider-pipeline.js`: optional, separately versioned provider capability discovery, observation validation, and routing. The core remains usable without a provider.
- `modules/origami/detection.js`: validates manual annotations and explicitly refuses automatic mode; `adapter.js` builds the domain result; `constraints.js` independently validates it.

## Adapter lifecycle

Each module exports a static manifest and five methods: `describeCapabilities()`, `validateInput(input)`, `detect(input, options)`, `buildModel(detections, context)`, and `validateModel(model, context)`. Register the imported module object explicitly. Registration rejects missing manifest fields, API mismatch, duplicate IDs, or missing functions. The manifest is descriptive metadata and is never executable.

## Coordinate and trust model

Each geometric object names `frameId`. Homographies are row-major 3×3 matrices acting on column homogeneous points `[x,y,1]ᵀ`, with division by the third coordinate. Transformations declare `fromFrameId`, `toFrameId`, matrix, source and calibration status. Distances are meaningful only within one declared frame/unit. A passing geometric check does not validate the source-image annotation or physical dimensions. Provenance labels human/algorithmic/analytic/derived/imported objects; validators report results but never move geometry.

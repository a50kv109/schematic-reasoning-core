# Module development

## Manifest and API

Implement a module object with an imported static `manifest.json` conforming to `contracts/module-contract.schema.json` and methods `describeCapabilities`, `validateInput`, `detect`, `buildModel`, `validateModel`. `apiVersion` must exactly match `CORE_API_VERSION` in `core/types.js`. Add a major API version for breaking changes; do not make the registry execute JavaScript or load arbitrary manifest-supplied code.

## Input shape

The Origami adapter accepts:

```js
{
  mode: 'manual' | 'assisted' | 'automatic',
  source: { sourceId, kind, sha256?, mediaType?, uri? },
  coordinateFrames: [{ id, kind, units, width?, height? }],
  transformations: [{ id, fromFrameId, toFrameId, kind, matrix, source, calibrationStatus, inverseMatrix? }],
  annotations: {
    configuration: 'square' | 'single-diagonal' | 'midpoint-fold' | 'double-diagonal' | 'orthogonal-midpoint-folds',
    frameId, paperCorners: [{x,y}], foldLines: [{id,a:{x,y},b:{x,y}}],
    annotator?, method?, confidence?, uncertainty?
  }
}
```

In manual mode, coordinates must already be in `annotations.frameId`. The caller performs any explicit frame mapping and must preserve the original source independently. `detect()` returns `ANNOTATIONS_ACCEPTED` and marks these objects as human-provided; it is not pixel detection. Automatic mode returns `UNSUPPORTED` and no detections.

## Result and validation

The result follows `contracts/geometry-model.schema.json`: version, source identity, frames/transforms, typed objects, relations, constraints, provenance, validation report, uncertainties and limitations. Domain-specific extension data is under `domainData.origami`. The adapter emits an analytic center and pairwise fold intersections as derived objects. Origami checks use independent calculations in `constraints.js`, not the builder's segment-intersection helper.

New adapters should add contract tests, positive fixtures, negative controls, provenance checks and serialization tests. Synthetic fixture results must not be counted as real-image accuracy. Add an experiment protocol and evidence to Engineering Insight Lab before proposing status changes.

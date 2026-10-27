# Reuse map

The code in this repository is self-contained. Its frame transforms and geometry helpers are independently implemented project code; there are no runtime imports from Audiveris, Geometry Desk, or other research repositories.

| Core mechanism | Use in this project | Boundary |
|---|---|---|
| Finite coordinate and homography operations | `core/geometry.js`, `core/coordinate-frames.js` | Explicit frames and transform metadata are required; no automatic calibration is performed. |
| Separate provider and domain contracts | `core/provider-registry.js`, `modules/origami/adapter.js` | The provider supplies observations; only the domain module knows Origami rules. |
| Provenance and uncertainty | Normalized observations and result-model objects | Confidence is carried through but is not calibrated. |
| Independent geometric checks | `modules/origami/constraints.js` | Checks submitted geometry; it cannot establish correspondence to source pixels. |

No code was copied from Audiveris or REA. No research repository is a runtime dependency. See `docs/ARCHITECTURE.md` and `docs/LIMITATIONS.md` for implementation scope.

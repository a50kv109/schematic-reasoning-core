# Historical v0.1 implementation and verification protocol

## Question

Can a small common geometry API register an Origami adapter that accepts clearly attributed manual annotations, produces a versioned geometry result, and independently detects selected errors without claiming pixel recognition?

## Baseline reused

Before implementation, inspected Geometry Desk coordinate/model/validator code, the Origami TASK 04 checker and measurements, and the Engineering Insight Lab registry/evidence files. `docs/REUSE_MAP.md` records the mechanisms actually reused or adapted and the missing plugin/result/provenance contracts. No external source code was copied; the existing Geometry Desk prototype is project code and only required mathematical operations were adapted into a separate package.

## Inputs and cases

- Exact synthetic unit-square coordinate fixtures for no fold, one diagonal, midpoint fold and two diagonals.
- Deliberately malformed coordinates: displaced vertex, displaced diagonal endpoint, mismatched outline, mixed frame, invalid/missing input and incompatible plugin API.
- A local scan from the previous origami experiment (PDF-rendered page 10, PNG 614×945, SHA-256 `24d3709fd4d78f63388f6300645234d2042fb849ab02384786bc5ef031c8cf78`). Its prior manually and analytically specified geometry is transformed into document coordinates for the adapter integration test. The image and embedded prior project remain outside the portable package because rights are unverified.

## Predeclared limits

Automatic detection is considered supported only if the implementation consumes image pixels and emits attributed detections. The package contains no such algorithm, so the required outcome is `UNSUPPORTED` and an empty detection set. Geometry PASS on synthetic or manually supplied points is not a real-image alignment result. Pixel alignment would require independent crease/corner labels and explicit residual metrics; those data are not available.

## Success gates

1. A compatible module registers; missing or mismatched API manifests fail.
2. Manual adapter models validate in each supported ideal configuration.
3. Negative controls produce FAIL reports without mutating/repairing geometry.
4. Human/derived provenance, source reference, frames, units, transforms and validation records survive JSON round-trip.
5. The local scan bytes hash to the prior digest and the adapter accepts only the prior manual model. Pixel alignment remains separately unverified.
6. Skill validation, test suite, manifest/hash and extracted ZIP validation pass.

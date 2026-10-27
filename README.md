# Schematic Reasoning Core v0.3.0

Extensible agent skill and geometry validation core for interpreting visual diagrams, with provenance-aware observations, coordinate frames, and domain adapters.

This is an agent skill plus a small, deterministic JavaScript library. It is useful when an agent can inspect a diagram but the result must be represented as editable geometry with explicit source identity, coordinate frames, provenance, uncertainty, and domain checks. It is **not** an automatic drawing-recognition or CAD system.

## Architecture

The project separates three layers:

- **Vision provider:** supplies candidate observations and declares the capabilities actually available in its host. Provider API v1.0.0 is defined in `core/provider-registry.js`.
- **Domain module:** maps generic observations into domain objects. `modules/origami/` understands a small set of square-paper crease patterns and does not depend on a vision vendor.
- **Geometry core:** stores frame-tagged geometry and provenance, and runs structural and domain validation independently of the provider.

The host-agent bridge in `providers/host-agent-bridge.js` accepts observations the host has already produced. It does not call a model, hidden API, or external endpoint. Availability of model vision in an agent session does not imply a callable API from Node.js.

## Quick start

Requires Node.js 20 or later. There are no third-party runtime dependencies.

```sh
npm test
node examples/create-manual-example.mjs
npm run package
```

The manual example uses synthetic coordinates. It demonstrates the data model and analytic checks, not image recognition or image alignment. See `docs/PROVIDER_AUTHORING.md` to register a provider object supplied by a host agent or integration.

For Codex, install the skill directory as `~/.codex/skills/schematic-reasoning-core/` or use the standard skill-management workflow. Other agent platforms can call the JavaScript API, but their skill discovery and vision handoff require platform-specific setup and have not been tested here.

## v0.3.0 evidence and limits

The tested software path includes provider registration and discovery, observation normalization, explicit source/frame checks, the mock-assisted Origami pipeline, manual mode without a provider, and independent geometry checks. CI runs these deterministic tests without secrets or access to model APIs.

TASK 08 also exercised Codex's agent-native image viewing on a real scanned diagram. The captured coordinates entered the host-agent bridge and the geometry passed structural and Origami consistency checks. A comparison to a same-session, non-blinded reference produced exploratory self-comparison numbers (mean endpoint error 1.155 px; median 1 px; maximum 1.414 px). Those numbers do **not** establish localization accuracy: the vision estimate and reference were produced by the same agent session. Four dashed creases were outside the scored target set. The source image is not included because redistribution rights were not verified. Details and limitations are summarized in [`docs/VISION_WORKFLOW_STATUS.md`](docs/VISION_WORKFLOW_STATUS.md).

A geometric `PASS` means only that the supplied geometry satisfies the configured structural and Origami checks. It does not prove that the points follow image pixels or establish real-world dimensions. Physical measurement accuracy is unverified. There is no autonomous vision API integration, generalized line or contour detector, perspective correction, semantic CAD model, or advanced constraint solver.

## Repository layout

- `core/` — coordinate transforms, geometry, provenance, provider contract, normalized observations, and validation.
- `providers/` — host-agent observation bridge.
- `modules/origami/` — Origami domain adapter and independent checks.
- `contracts/` — JSON Schemas for modules, results, and observations.
- `examples/` — portable manual example and deterministic mock provider.
- `tests/` — deterministic tests and negative controls.
- `docs/` — architecture, provider authoring, limitations, and experiment status.
- `.github/workflows/ci.yml` — Node.js 20/22 test and package verification.

## Portable ZIP

`npm run package` creates `outputs/packages/schematic-reasoning-core-v0.3.0.zip` and a SHA-256 sidecar. The archive excludes local outputs, the TASK 08 raw benchmark, local-only scan tests, and all raster/PDF source media. Check it with:

```sh
unzip -t outputs/packages/schematic-reasoning-core-v0.3.0.zip
(cd outputs/packages && sha256sum -c schematic-reasoning-core-v0.3.0.zip.sha256)
```

## License

MIT. See [`LICENSE`](LICENSE).

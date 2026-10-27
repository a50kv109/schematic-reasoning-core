# Limitations and evidence boundaries

- The Origami adapter consumes coordinates; it is not a raster detector. The bundled host-agent bridge accepts observations already produced by a host and does not call a model/API.
- Automated tests use deterministic synthetic fixtures and mock providers. They validate contracts and selected geometry cases, not vision accuracy.
- One Codex agent visual workflow was exercised on a scanned diagram. The same agent session generated its manual reference; localization accuracy is therefore unverified. See `VISION_WORKFLOW_STATUS.md`.
- The tested page was a printed diagram scan, not a photograph. Perspective correction, camera distortion and physical scale are untested.
- Source-image redistribution rights were not established. The source image and local benchmark data are excluded from the repository and portable ZIP.
- Homography functions operate on a declared direct transform or its inverse; arbitrary multi-hop frame graphs are not solved.
- There is no covariance propagation, robust fitting, lens/paper distortion model, calibrated scale uncertainty, automated symbol recognition, CAD semantics, or advanced constraint solver.
- Tolerances are caller-configurable and have not been calibrated against independent annotators or a physical reference set.
- Codex is the only host-agent environment exercised. Other agent runtime integrations have not been tested.

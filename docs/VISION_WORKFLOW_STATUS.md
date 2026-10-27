# Vision workflow status in v0.3.0

The host-agent workflow has one real but narrowly scoped exercise: a Codex session inspected a scanned printed Origami diagram and supplied approximate corner and crease coordinates. Those observations passed through the provider bridge, Origami adapter, and independent geometric validator.

The bridge consumes observations already produced by the host. It does not call a model or external API. No autonomous vision integration is included, and other model/agent platforms have not been tested.

The exploratory comparison used a manually recorded reference from the same Codex session, without blinding. Its reported 1.155 px mean endpoint error (median 1 px, max 1.414 px) is a self-comparison, not independent accuracy evidence. Four dashed crease lines were omitted from the target set. Image-localization accuracy remains **unverified**; physical measurement accuracy is **insufficiently evidenced**. The tested source was a printed diagram scan, not a photograph of a physical drawing.

The original scan and its raw response/benchmark files are intentionally excluded from this public repository and release archive. A future accuracy experiment needs a rights-cleared source and independent blind annotations, including every crease in scope.

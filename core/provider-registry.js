export const PROVIDER_API_VERSION = '1.0.0';
const CAPABILITIES = ['imageInput','regionAnalysis','approximateLocalization','structuredOutput','multipleImageComparison','toolInvocation','explicitUncertainty','exactToolCoordinates','humanAnnotation'];
export function registerProvider(registry, provider) {
  const m=provider?.manifest;
  if(!m || typeof m.providerId!=='string' || m.apiVersion!==PROVIDER_API_VERSION) throw new Error(`Provider manifest must declare providerId and API ${PROVIDER_API_VERSION}.`);
  for(const method of ['describeCapabilities','isAvailable','analyzeImage','normalizeResponse','reportLimitations']) if(typeof provider[method]!=='function') throw new Error(`Provider ${m.providerId} is missing ${method}().`);
  if(registry.has(m.providerId)) throw new Error(`Provider already registered: ${m.providerId}`);
  registry.set(m.providerId,provider); return provider;
}
export function discoverProviders(registry, context={}) { return [...registry.values()].map(p=>({providerId:p.manifest.providerId,capabilities:p.describeCapabilities(),available:Boolean(p.isAvailable(context)),limitations:p.reportLimitations()})); }
export function validateCapabilities(c={}) { const out={}; for(const k of CAPABILITIES) out[k]=c[k]===true; return out; }

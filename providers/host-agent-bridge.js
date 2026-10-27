import {PROVIDER_API_VERSION} from '../core/provider-registry.js';

// The host agent must inspect the image and supply this captured response.
// This bridge is deliberately not an autonomous model/API caller.
export function createHostAgentBridge(response){
  const supplied=Array.isArray(response?.observations);
  return {
    manifest:{providerId:'codex.host-agent-image-observation',name:'Codex host-agent image observation bridge',version:'0.1.0',apiVersion:PROVIDER_API_VERSION,providerType:'host-agent-bridge'},
    describeCapabilities(){return {imageInput:true,approximateLocalization:true,structuredOutput:true,explicitUncertainty:true};},
    isAvailable(){return supplied;},
    async analyzeImage(){if(!supplied)throw new Error('No captured host-agent visual response supplied.');return structuredClone(response.observations);},
    normalizeResponse(value){
      if(!Array.isArray(value))throw new Error('Host-agent response must contain an observations array.');
      const corners=value.filter(o=>o.objectType==='paper-corner'&&o.geometry&&Number.isFinite(o.geometry.x)&&Number.isFinite(o.geometry.y));
      if(!corners.length)return value;
      const byId=new Map(corners.map(o=>[o.observationId,o]));
      const ordered=['vision-corner-tl','vision-corner-tr','vision-corner-br','vision-corner-bl'].map(id=>byId.get(id));
      if(ordered.some(o=>!o))throw new Error('Four named paper-corner observations are required for boundary grouping.');
      const boundary={observationId:'vision-paper-boundary',objectType:'paper-boundary',geometry:{points:ordered.map(o=>o.geometry)},coordinateFrameId:ordered[0].coordinateFrameId,sourceId:ordered[0].sourceId,quality:'approximate',confidence:Math.min(...ordered.map(o=>o.confidence??0)),uncertainty:'Grouped from four host-agent approximate corner estimates.'};
      return [boundary,...value.filter(o=>o.objectType!=='paper-corner')];
    },
    reportLimitations(){return ['Requires the host agent to inspect image pixels and provide structured coordinates; this adapter does not call a vision model or external API.','Coordinates are approximate visual estimates, not calibrated measurements.'];}
  };
}

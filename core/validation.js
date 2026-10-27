import {validateFrame,validateTransformMetadata} from './coordinate-frames.js';
import {validateProvenance} from './provenance.js';
import {polygonSignedArea} from './geometry.js';

export function check(name,condition,measured,tolerance,basis,uncertainty=null){return {name,condition,measured,tolerance,status:condition?'PASS':'FAIL',basis,uncertainty};}
export function validateBaseModel(model){
  const errors=[];if(model?.schemaVersion!=='schematic-reasoning-result/1')errors.push('Unsupported result schemaVersion.');
  if(!model?.source||typeof model.source.sourceId!=='string')errors.push('source.sourceId is required.');
  if(model?.source?.sha256!==undefined&&model.source.sha256!==null&&!/^[a-fA-F0-9]{64}$/.test(model.source.sha256))errors.push('source.sha256 must be 64 hexadecimal characters or null.');
  if(!Array.isArray(model?.coordinateFrames)||!model.coordinateFrames.length)errors.push('At least one coordinate frame is required.');
  const frames=model?.coordinateFrames||[],ids=new Set();for(const f of frames){try{validateFrame(f);}catch(e){errors.push(e.message);}if(ids.has(f.id))errors.push(`Duplicate frame ${f.id}.`);ids.add(f.id);}
  for(const t of model?.transformations||[])try{validateTransformMetadata(t,frames);}catch(e){errors.push(e.message);}
  const finiteTree=v=>{if(typeof v==='number')return Number.isFinite(v);if(Array.isArray(v))return v.every(finiteTree);if(v&&typeof v==='object')return Object.values(v).every(finiteTree);return true;};
  const objectIds=new Set();for(const o of model?.objects||[]){if(typeof o.id!=='string'||objectIds.has(o.id))errors.push(`Missing or duplicate object ID ${o.id}.`);objectIds.add(o.id);if(!ids.has(o.frameId))errors.push(`Object ${o.id} uses missing frame ${o.frameId}.`);if(typeof o.type!=='string')errors.push(`Object ${o.id} has no type.`);if(!finiteTree(o.geometry))errors.push(`Object ${o.id} has non-finite geometry.`);try{validateProvenance(o.provenance);}catch(e){errors.push(`Object ${o.id}: ${e.message}`);}}
  const relationTypes=new Set(['intersects','parallel','perpendicular','connected','symmetric-to','belongs-to']);
  for(const r of model?.relations||[]){if(!relationTypes.has(r.type))errors.push(`Relation ${r.id} has unsupported type ${r.type}.`);if(!objectIds.has(r.fromId)||!objectIds.has(r.toId))errors.push(`Relation ${r.id} refers to a missing object.`);}
  for(const c of model?.constraints||[]){if(!Array.isArray(c.objectIds)||!c.objectIds.every(id=>objectIds.has(id)))errors.push(`Constraint ${c.id} refers to a missing object.`);if(!(Number.isFinite(c.tolerance)&&c.tolerance>=0))errors.push(`Constraint ${c.id} has invalid tolerance.`);}
  if(model?.domainData?.origami?.outline?.length>=3){try{if(Math.abs(polygonSignedArea(model.domainData.origami.outline))<1e-12)errors.push('Origami outline has zero area.');}catch(e){errors.push(e.message);}}
  return {valid:errors.length===0,errors};
}

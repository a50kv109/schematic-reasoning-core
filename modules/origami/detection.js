import {makeProvenance} from '../../core/types.js';

const CONFIGS=new Set(['square','single-diagonal','midpoint-fold','double-diagonal','orthogonal-midpoint-folds']);
const finitePoint=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
export function validateOrigamiInput(input){
  const errors=[];
  if(!input?.source||typeof input.source.sourceId!=='string')errors.push('Input source.sourceId is required.');
  if(!Array.isArray(input?.coordinateFrames)||!input.coordinateFrames.length)errors.push('At least one coordinate frame is required.');
  if(!['manual','assisted','automatic'].includes(input?.mode))errors.push('Input mode must be manual, assisted, or automatic.');
  if(input?.mode==='manual'||input?.mode==='assisted'){
    const a=input.annotations;if(!a)errors.push('Manual/assisted mode requires annotations.');
    if(!CONFIGS.has(a?.configuration))errors.push('Unsupported origami configuration.');
    if(typeof a?.frameId!=='string'||!input.coordinateFrames?.some(f=>f.id===a.frameId))errors.push('Annotation frame is missing from coordinateFrames.');
    if(!Array.isArray(a?.paperCorners)||a.paperCorners.length!==4||!a.paperCorners.every(finitePoint))errors.push('Exactly four finite paperCorners are required.');
    if(!Array.isArray(a?.foldLines)||!a.foldLines.every(l=>finitePoint(l.a)&&finitePoint(l.b)))errors.push('foldLines must contain finite endpoint pairs.');
    if(a?.paperCorners?.some(p=>p.frameId&&p.frameId!==a.frameId)||a?.foldLines?.some(l=>l.frameId&&l.frameId!==a.frameId))errors.push('All annotations must use annotations.frameId.');
  }
  return {valid:errors.length===0,errors};
}
export function detectOrigami(input,options={}){
  const mode=options.mode??input?.mode;
  if(mode==='automatic')return {status:'UNSUPPORTED',detections:[],method:'none',provenance:makeProvenance('algorithm',{method:'no detector available',confidence:null,validationStatus:'UNVERIFIED'}),limitations:['Automatic contour and fold-line detection is not implemented. Supply human annotations.']};
  const validation=validateOrigamiInput({...input,mode});if(!validation.valid)return {status:'INVALID_INPUT',detections:[],errors:validation.errors};
  const annotation=input.annotations;
  const provenance=annotation.provenance??makeProvenance('human',{actor:annotation.annotator??'unspecified human annotator',method:annotation.method??'manual point/line annotation',confidence:annotation.confidence??null,validationStatus:'UNVERIFIED'});
  const detections=[{id:'paper-outline',type:'polyline',domainType:'paper-outline',frameId:annotation.frameId,geometry:{points:annotation.paperCorners.map(p=>({x:p.x,y:p.y}))},provenance}];
  annotation.paperCorners.forEach((p,i)=>detections.push({id:`vertex-${i+1}`,type:'point',domainType:'paper-vertex',frameId:annotation.frameId,geometry:{x:p.x,y:p.y},label:p.label??`V${i+1}`,provenance:annotation.paperCornerProvenance?.[i]??provenance}));
  annotation.foldLines.forEach((line,i)=>detections.push({id:line.id??`fold-${i+1}`,type:'segment',domainType:'fold-line',frameId:annotation.frameId,geometry:{a:{x:line.a.x,y:line.a.y},b:{x:line.b.x,y:line.b.y}},label:line.label??`Fold ${i+1}`,provenance:line.provenance??provenance}));
  return {status:'ANNOTATIONS_ACCEPTED',method:'manual-input',detections,provenance,configuration:annotation.configuration,uncertainty:annotation.uncertainty??null};
}

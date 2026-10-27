import manifest from './manifest.json' with {type:'json'};
import {makeResult,makeProvenance} from '../../core/types.js';
import {segmentIntersection} from '../../core/geometry.js';
import {makeRelation} from '../../core/relations.js';
import {validateBaseModel,check} from '../../core/validation.js';
import {validateOrigamiModel} from './constraints.js';
import {detectOrigami,validateOrigamiInput} from './detection.js';
export const origamiModule={
  manifest,
  describeCapabilities(){return {...manifest,automaticDetection:{supported:false,status:'UNSUPPORTED',reason:'No autonomous image-based contour or crease detector is bundled.'}};},
  validateInput:validateOrigamiInput,
  detect:detectOrigami,
  interpretObservations(observations,{input,request={}}={}){
    const boundary=observations.find(o=>o.objectType==='paper-boundary'&&o.geometry?.points?.length===4);
    const folds=observations.filter(o=>o.objectType==='crease-line'&&o.geometry?.a&&o.geometry?.b);
    const qualitative=observations.filter(o=>o.quality==='qualitative'||o.requiresConfirmation);
    if(!boundary||qualitative.length)return {status:'NEEDS_CONFIRMATION',reason:'A four-point boundary and coordinate-bearing fold lines are required; qualitative descriptions cannot be converted into coordinates.'};
    const frameId=boundary.coordinateFrameId;
    if(folds.some(o=>o.coordinateFrameId!==frameId))return {status:'NEEDS_CONFIRMATION',reason:'Boundary and fold observations use different coordinate frames.'};
    const n=folds.length;
    if(n>0&&!request.configuration)return {status:'NEEDS_CONFIRMATION',reason:'Crease count does not uniquely identify its geometric configuration; confirm it explicitly.'};
    const configuration=request.configuration??'square';
    if(!configuration||configuration==='midpoint-fold'&&n!==1||configuration==='single-diagonal'&&n!==1||['double-diagonal','orthogonal-midpoint-folds'].includes(configuration)&&n!==2||configuration==='square'&&n!==0)return {status:'NEEDS_CONFIRMATION',reason:'Fold count does not match the confirmed Origami configuration.'};
    const providerId=observations[0]?.providerId??'unknown';
    const provenance=makeProvenance('algorithm',{providerId,method:'normalized provider visual observation',confidence:null,validationStatus:'UNVERIFIED'});
    const featureProvenance=o=>makeProvenance('algorithm',{providerId:o.providerId,method:'provider-localized candidate geometry',coordinateQuality:o.quality,confidence:o.confidence,uncertainty:o.uncertainty,evidence:structuredClone(o.evidence),validationStatus:'UNVERIFIED'});
    const assistedInput={...input,mode:'assisted',annotations:{configuration,frameId,provenance,paperCornerProvenance:boundary.geometry.points.map(()=>featureProvenance(boundary)),paperCorners:boundary.geometry.points.map(p=>({...p})),foldLines:folds.map((o,i)=>({id:o.observationId??`fold-${i+1}`,a:o.geometry.a,b:o.geometry.b,frameId,provenance:featureProvenance(o)})),uncertainty:'Provider-localized geometry is a proposal; image localization accuracy is unverified.'}};
    const check=validateOrigamiInput(assistedInput);
    return check.valid?{status:'READY',input:assistedInput}:{status:'NEEDS_CONFIRMATION',reason:check.errors.join(' ')};
  },
  buildModel(detectionResult,context={}){
    if(detectionResult.status!=='ANNOTATIONS_ACCEPTED')throw new Error(`Cannot build model from detection status ${detectionResult.status}.`);
    const input=context.input;if(!input)throw new Error('buildModel requires context.input.');
    const objects=structuredClone(detectionResult.detections),relations=[],uncertainties=[];
    const corners=objects.filter(o=>o.domainType==='paper-vertex'),folds=objects.filter(o=>o.domainType==='fold-line');
    const c=corners.map(o=>o.geometry),center={x:c.reduce((s,p)=>s+p.x,0)/4,y:c.reduce((s,p)=>s+p.y,0)/4};
    objects.push({id:'paper-center',type:'point',domainType:'paper-center',frameId:input.annotations.frameId,geometry:center,provenance:makeProvenance('derived',{method:'arithmetic mean of four manually supplied corners',confidence:null,validationStatus:'UNVERIFIED',parents:corners.map(o=>o.id)})});
    let next=1;
    for(let i=0;i<folds.length;i++)for(let j=i+1;j<folds.length;j++){
      const x=folds[i].geometry,y=folds[j].geometry,p=segmentIntersection(x.a,x.b,y.a,y.b);
      if(p){const id=`fold-intersection-${next++}`;objects.push({id,type:'point',domainType:'fold-intersection',frameId:folds[i].frameId,geometry:{x:p.x,y:p.y},provenance:makeProvenance('derived',{method:'segment intersection',confidence:null,validationStatus:'UNVERIFIED',parents:[folds[i].id,folds[j].id]})});relations.push(makeRelation(`relation-${id}`,'intersects',folds[i].id,folds[j].id,{atObjectId:id,frameId:folds[i].frameId}));}
    }
    if(detectionResult.uncertainty)uncertainties.push(detectionResult.uncertainty);
    const units=input.coordinateFrames.find(f=>f.id===input.annotations.frameId)?.units??'unknown';
    const constraints=[{id:'square-equal-sides',type:'equal-side-lengths',objectIds:corners.map(o=>o.id),expected:'all four sides equal',tolerance:context.tolerance??1e-6,unit:units},{id:'square-right-angles',type:'right-angles',objectIds:corners.map(o=>o.id),expected:'four interior angles are 90 degrees',tolerance:context.angularTolerance??1e-6,unit:'degree'}];
    if(detectionResult.configuration==='single-diagonal'||detectionResult.configuration==='double-diagonal')constraints.push({id:'diagonal-center',type:'diagonal-intersection-or-midpoint-at-center',objectIds:[...folds.map(o=>o.id),'paper-center'],expected:'opposite-corner diagonal(s) pass through center',tolerance:context.tolerance??1e-6,unit:units});
    if(detectionResult.configuration==='midpoint-fold')constraints.push({id:'opposite-side-midpoints',type:'fold-joins-opposite-side-midpoints',objectIds:[...folds.map(o=>o.id),...corners.map(o=>o.id)],expected:'fold endpoints are midpoints of opposite sides',tolerance:context.tolerance??1e-6,unit:units});
    if(detectionResult.configuration==='orthogonal-midpoint-folds')constraints.push({id:'orthogonal-midpoint-folds',type:'two-perpendicular-folds-join-opposite-side-midpoints',objectIds:[...folds.map(o=>o.id),...corners.map(o=>o.id)],expected:'both distinct pairs of opposite-side midpoints are joined by perpendicular folds',tolerance:context.tolerance??1e-6,unit:units});
    const model=makeResult({source:input.source,coordinateFrames:input.coordinateFrames,transformations:input.transformations??[],objects,relations,constraints,provenance:[detectionResult.provenance],uncertainties,limitations:[...manifest.limitations],domainData:{origami:{configuration:detectionResult.configuration,cornerIds:corners.map(o=>o.id),outlineId:'paper-outline',foldIds:folds.map(o=>o.id),centerId:'paper-center'}}});
    model.validationReport=this.validateModel(model,context);
    return model;
  },
  validateModel(model,context={}){
    const base=validateBaseModel(model),domain=validateOrigamiModel(model,{tolerance:context.tolerance??1e-6,angularTolerance:context.angularTolerance??1e-6});
    const checks=[...base.errors.map((error,i)=>check(`base-model-${i+1}`,false,error,null,'Core result-model structural validation.')),...domain.checks];
    return {schemaVersion:'schematic-reasoning-validation/1',status:base.valid&&domain.status==='PASS'?'PASS':'FAIL',checks,errors:[...base.errors,...domain.errors],uncertainties:model.uncertainties??[],limitations:domain.limitations};
  }
};

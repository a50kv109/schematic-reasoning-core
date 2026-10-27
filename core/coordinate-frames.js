import {point} from './geometry.js';

export function validateFrame(frame){
  if(!frame||typeof frame.id!=='string'||!frame.id||typeof frame.units!=='string'||!frame.units)throw new Error('Frame requires id and units.');
  if(frame.width!==undefined&&(!(Number.isFinite(frame.width)&&frame.width>0)))throw new Error(`Frame ${frame.id} width must be positive and finite.`);
  if(frame.height!==undefined&&(!(Number.isFinite(frame.height)&&frame.height>0)))throw new Error(`Frame ${frame.id} height must be positive and finite.`);
  return true;
}
export function applyHomography(matrix,p){
  if(!Array.isArray(matrix)||matrix.length!==9||!matrix.every(Number.isFinite))throw new Error('Homography must contain nine finite values.');
  const d=matrix[6]*p.x+matrix[7]*p.y+matrix[8];if(!Number.isFinite(d)||Math.abs(d)<1e-12)throw new Error('Coordinate maps to a projective pole.');
  return point((matrix[0]*p.x+matrix[1]*p.y+matrix[2])/d,(matrix[3]*p.x+matrix[4]*p.y+matrix[5])/d);
}
export function invertHomography(h){
  if(!Array.isArray(h)||h.length!==9||!h.every(Number.isFinite))throw new Error('Homography must contain nine finite values.');
  const [a,b,c,d,e,f,g,k,i]=h,cof=[e*i-f*k,c*k-b*i,b*f-c*e,f*g-d*i,a*i-c*g,c*d-a*f,d*k-e*g,b*g-a*k,a*e-b*d];
  const det=a*cof[0]+b*cof[3]+c*cof[6];if(!Number.isFinite(det)||Math.abs(det)<1e-12)throw new Error('Homography is singular.');return cof.map(v=>v/det);
}
function inverseOf(t){if(t.inverseMatrix)return t.inverseMatrix;return invertHomography(t.matrix);}
export function mapPoint(pointValue,fromFrameId,toFrameId,transformations){
  if(fromFrameId===toFrameId)return point(pointValue.x,pointValue.y);
  const direct=transformations.find(t=>t.fromFrameId===fromFrameId&&t.toFrameId===toFrameId);
  if(direct)return applyHomography(direct.matrix,pointValue);
  const reverse=transformations.find(t=>t.fromFrameId===toFrameId&&t.toFrameId===fromFrameId);
  if(reverse)return applyHomography(inverseOf(reverse),pointValue);
  throw new Error(`No direct transform path from ${fromFrameId} to ${toFrameId}.`);
}
export function validateTransformMetadata(t,frames){
  if(!t||typeof t.id!=='string'||!Array.isArray(t.matrix)||t.matrix.length!==9||!t.matrix.every(Number.isFinite))throw new Error('Transform needs an id and nine finite matrix values.');
  if(t.inverseMatrix!==undefined&&(!Array.isArray(t.inverseMatrix)||t.inverseMatrix.length!==9||!t.inverseMatrix.every(Number.isFinite)))throw new Error('Transform inverseMatrix, when supplied, must contain nine finite values.');
  for(const id of [t.fromFrameId,t.toFrameId])if(!frames.some(f=>f.id===id))throw new Error(`Transform references unknown frame ${id}.`);
  if(typeof t.source!=='string'||typeof t.calibrationStatus!=='string')throw new Error('Transform source and calibration status are required.');
  return true;
}

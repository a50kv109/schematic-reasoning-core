const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const mid=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
const dot=(a,b)=>a.x*b.x+a.y*b.y;
const vector=(a,b)=>({x:b.x-a.x,y:b.y-a.y});
const cross=(a,b)=>a.x*b.y-a.y*b.x;
function report(name,actual,expected,tolerance,basis){const error=typeof actual==='number'?Math.abs(actual-expected):actual;return {name,condition:`${name} within tolerance`,measured:actual,tolerance,status:Number.isFinite(error)&&error<=tolerance?'PASS':'FAIL',basis,uncertainty:null};}
function lineIntersection(a,b,c,d){
  const r=vector(a,b),s=vector(c,d),den=cross(r,s);if(Math.abs(den)<1e-14)return null;
  const q={x:c.x-a.x,y:c.y-a.y},t=cross(q,s)/den,u=cross(q,r)/den;
  if(t<0||t>1||u<0||u>1)return null;return {x:a.x+t*r.x,y:a.y+t*r.y};
}
function nearestEndpointPairError(line,a,b){return Math.min(distance(line.geometry.a,a)+distance(line.geometry.b,b),distance(line.geometry.a,b)+distance(line.geometry.b,a))/2;}
export function validateOrigamiModel(model,{tolerance=1e-6,angularTolerance=tolerance}={}){
  const checks=[],errors=[],limitation=['Validation checks the submitted geometry, not whether it follows visible source-image pixels.'];
  const add=(c)=>{checks.push(c);if(c.status==='FAIL')errors.push(`${c.name}: measured ${JSON.stringify(c.measured)} exceeds tolerance ${c.tolerance}.`);};
  const meta=model?.domainData?.origami;if(!meta){return {status:'FAIL',checks:[{name:'origami-domain-data',condition:'Origami domain data present',measured:false,tolerance:null,status:'FAIL',basis:'Module-specific validator requires origami configuration and object references.',uncertainty:null}],errors:['Origami domain data is missing.'],limitations:limitation};}
  const objects=model.objects??[],byId=new Map(objects.map(o=>[o.id,o])),corners=(meta.cornerIds??[]).map(id=>byId.get(id)),folds=(meta.foldIds??[]).map(id=>byId.get(id));
  const points=corners.map(o=>o?.geometry),centerObject=byId.get(meta.centerId),center=centerObject?.geometry;
  if(corners.length!==4||corners.some(o=>o?.domainType!=='paper-vertex'||!Number.isFinite(o.geometry?.x)||!Number.isFinite(o.geometry?.y))){add({name:'four-finite-paper-corners',condition:'Exactly four finite paper vertices exist',measured:corners.filter(Boolean).length,tolerance:0,status:'FAIL',basis:'Origami square contract.',uncertainty:null});return {status:'FAIL',checks,errors:['Four valid paper corners are required.'],limitations:limitation};}
  add({name:'four-finite-paper-corners',condition:'Exactly four finite paper vertices exist',measured:corners.length,tolerance:0,status:'PASS',basis:'Origami square contract.',uncertainty:null});
  const outline=byId.get(meta.outlineId),sameFrame=[...corners,...folds,centerObject].filter(Boolean).every(o=>o.frameId===corners[0].frameId);
  add({name:'origami-objects-share-coordinate-frame',condition:'Outline, corners, folds and center use one declared coordinate frame',measured:sameFrame,tolerance:0,status:sameFrame?'PASS':'FAIL',basis:'Coordinates from unlike frames cannot be compared without an explicit transform.',uncertainty:null});
  const outlinePoints=outline?.geometry?.points;
  const outlineError=outline?.domainType==='paper-outline'&&Array.isArray(outlinePoints)&&outlinePoints.length===4?Math.max(...outlinePoints.map((p,i)=>distance(p,points[i]))):Infinity;
  add(report('outline-matches-corner-vertices',outlineError,0,tolerance,'Polyline vertices are compared to the ordered paper-corner objects.'));
  const sides=points.map((p,i)=>distance(p,points[(i+1)%4])),mean=sides.reduce((a,b)=>a+b,0)/4;
  for(let i=0;i<4;i++)add(report(`square-side-${i+1}-equality`,Math.abs(sides[i]-mean),0,tolerance,`Side ${i+1} differs from the mean of four sides; unit: ${model.coordinateFrames.find(f=>f.id===corners[i].frameId)?.units??'unknown'}.`));
  const turns=points.map((p,i)=>{const prev=points[(i+3)%4],next=points[(i+1)%4];const u=vector(p,prev),v=vector(p,next);return Math.abs(dot(u,v))/(Math.hypot(u.x,u.y)*Math.hypot(v.x,v.y));});
  turns.forEach((cos,i)=>add(report(`right-angle-at-corner-${i+1}`,cos,0,Math.max(angularTolerance,1e-8),'Normalized adjacent-edge dot product; zero denotes perpendicular.')));
  let sign=0,convex=true;for(let i=0;i<4;i++){const a=vector(points[i],points[(i+1)%4]),b=vector(points[(i+1)%4],points[(i+2)%4]),z=cross(a,b);if(Math.abs(z)<=tolerance||sign&&Math.sign(z)!==sign)convex=false;sign=Math.sign(z);}
  add({name:'closed-convex-outline',condition:'Four boundary edges form a non-degenerate convex loop',measured:convex,tolerance:0,status:convex?'PASS':'FAIL',basis:'Successive edge cross products have consistent nonzero sign.',uncertainty:null});
  const [a,b,c,d]=points;const expectedDiagonals=[[a,c],[b,d]],foldGeoms=folds.map(f=>f.geometry).filter(g=>g&&Number.isFinite(g.a?.x)&&Number.isFinite(g.a?.y)&&Number.isFinite(g.b?.x)&&Number.isFinite(g.b?.y));
  const pairError=(line,pair)=>nearestEndpointPairError(line,pair[0],pair[1]);
  const config=meta.configuration;
  if(config==='square')add({name:'no-fold-lines',condition:'Square-only configuration has no crease lines',measured:folds.length,tolerance:0,status:folds.length===0?'PASS':'FAIL',basis:'Declared Origami configuration.',uncertainty:null});
  if(config==='single-diagonal'){
    const err=foldGeoms.length===1?Math.min(...expectedDiagonals.map(p=>pairError(folds[0],p))):Infinity;
    add(report('one-opposite-corner-diagonal',err,0,tolerance,'Line endpoints must coincide with one pair of opposite square vertices.'));
  }
  if(config==='midpoint-fold'){
    const mids=[[mid(a,b),mid(c,d)],[mid(b,c),mid(d,a)]];
    const err=foldGeoms.length===1?Math.min(...mids.map(p=>pairError(folds[0],p))):Infinity;
    add(report('fold-joins-opposite-side-midpoints',err,0,tolerance,'Independent side-midpoint calculation from cyclic boundary vertices.'));
  }
  if(config==='double-diagonal'){
    const errors=foldGeoms.length===2?expectedDiagonals.map(p=>folds.map(f=>pairError(f,p))):[[Infinity,Infinity],[Infinity,Infinity]];
    const err=foldGeoms.length===2?Math.min(errors[0][0]+errors[1][1],errors[0][1]+errors[1][0]):Infinity;
    add(report('two-opposite-corner-diagonals',err,0,tolerance,'Each diagonal endpoint pair matches a different opposite-corner pair.'));
    const intersection=foldGeoms.length===2?lineIntersection(foldGeoms[0].a,foldGeoms[0].b,foldGeoms[1].a,foldGeoms[1].b):null;
    add(report('diagonal-intersection-at-center',intersection?distance(intersection,center):Infinity,0,tolerance,'Intersection independently computed from line equations and compared with the four-corner centroid.'));
    const half1=distance(foldGeoms[0].a,foldGeoms[0].b)/2,half2=distance(foldGeoms[1].a,foldGeoms[1].b)/2;
    add(report('diagonals-have-equal-length',Math.abs(half1-half2),0,tolerance,'Half-length difference of diagonals; square diagonals have equal length.'));
  }
  if(config==='orthogonal-midpoint-folds'){
    const mids=[[mid(a,b),mid(c,d)],[mid(b,c),mid(d,a)]];
    const error=(line,pair)=>nearestEndpointPairError(line,pair[0],pair[1]);
    const assignment=foldGeoms.length===2?Math.min(error(folds[0],mids[0])+error(folds[1],mids[1]),error(folds[0],mids[1])+error(folds[1],mids[0])):Infinity;
    add(report('two-opposite-side-midpoint-folds',assignment,0,tolerance,'Two crease segments must join the two distinct pairs of opposite side midpoints.'));
    const dotNorm=foldGeoms.length===2?Math.abs(dot(vector(foldGeoms[0].a,foldGeoms[0].b),vector(foldGeoms[1].a,foldGeoms[1].b)))/(distance(foldGeoms[0].a,foldGeoms[0].b)*distance(foldGeoms[1].a,foldGeoms[1].b)):Infinity;
    add(report('midpoint-folds-are-perpendicular',dotNorm,0,angularTolerance,'Normalized direction-vector dot product; zero denotes perpendicular.'));
    const intersections=foldGeoms.length===2?lineIntersection(foldGeoms[0].a,foldGeoms[0].b,foldGeoms[1].a,foldGeoms[1].b):null;
    add(report('midpoint-fold-intersection-at-center',intersections?distance(intersections,center):Infinity,0,tolerance,'Segment intersection independently computed and compared with the paper center.'));
  }
  if(config==='single-diagonal'){
    const q=foldGeoms[0],expectedMid=q?mid(q.a,q.b):null;add(report('single-diagonal-crosses-center',center&&expectedMid?distance(center,expectedMid):Infinity,0,tolerance,'Diagonal midpoint compared with centroid of four corners.'));
  }
  if(config==='midpoint-fold'){
    const q=foldGeoms[0],actual=q?mid(q.a,q.b):null,expected={x:(a.x+b.x+c.x+d.x)/4,y:(a.y+b.y+c.y+d.y)/4};
    add(report('midpoint-fold-crosses-center',actual?distance(actual,expected):Infinity,0,tolerance,'Fold-segment midpoint compared with the four-corner centroid.'));
  }
  if(!['square','single-diagonal','midpoint-fold','double-diagonal','orthogonal-midpoint-folds'].includes(config))add({name:'supported-configuration',condition:'Declared configuration is supported',measured:config,tolerance:null,status:'FAIL',basis:'Origami module supported-configuration registry.',uncertainty:null});
  if(!center||!Number.isFinite(center.x)||!Number.isFinite(center.y))add({name:'finite-square-center',condition:'Derived square center is finite',measured:center??null,tolerance:null,status:'FAIL',basis:'Center object must be present and finite.',uncertainty:null});
  return {status:checks.every(c=>c.status==='PASS')?'PASS':'FAIL',checks,errors,limitations:limitation};
}

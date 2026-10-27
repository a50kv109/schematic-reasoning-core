const finite=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
export function point(x,y){if(!Number.isFinite(x)||!Number.isFinite(y))throw new Error('Point coordinates must be finite.');return {x,y};}
export function distance(a,b){return Math.hypot(b.x-a.x,b.y-a.y);}
export function vector(a,b){return {x:b.x-a.x,y:b.y-a.y};}
export function dot(a,b){return a.x*b.x+a.y*b.y;}
export function cross(a,b){return a.x*b.y-a.y*b.x;}
export function angleDegrees(a,b){const den=Math.hypot(a.x,a.y)*Math.hypot(b.x,b.y);if(den===0)throw new Error('Angle is undefined for a zero-length vector.');return Math.acos(Math.max(-1,Math.min(1,dot(a,b)/den)))*180/Math.PI;}
export function areParallel(a,b,tolerance=1e-8){const den=Math.hypot(a.x,a.y)*Math.hypot(b.x,b.y);return den>0&&Math.abs(cross(a,b))<=tolerance*den;}
export function arePerpendicular(a,b,tolerance=1e-8){const den=Math.hypot(a.x,a.y)*Math.hypot(b.x,b.y);return den>0&&Math.abs(dot(a,b))<=tolerance*den;}
export function segmentIntersection(a,b,c,d,tolerance=1e-10){
  if(![a,b,c,d].every(finite))throw new Error('Segment coordinates must be finite.');
  const r=vector(a,b),s=vector(c,d),den=cross(r,s),q={x:c.x-a.x,y:c.y-a.y};
  if(Math.abs(den)<=tolerance*Math.max(1,Math.hypot(r.x,r.y)*Math.hypot(s.x,s.y)))return null;
  const t=cross(q,s)/den,u=cross(q,r)/den;
  if(t< -tolerance||t>1+tolerance||u< -tolerance||u>1+tolerance)return null;
  return {x:a.x+t*r.x,y:a.y+t*r.y,t,u};
}
export function polygonSignedArea(points){if(!Array.isArray(points)||points.length<3||!points.every(finite))throw new Error('A polygon needs at least three finite points.');let s=0;for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];s+=a.x*b.y-b.x*a.y;}return s/2;}

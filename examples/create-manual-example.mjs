import {writeFile} from 'node:fs/promises';
import {origamiModule} from '../modules/origami/adapter.js';
const corners=[{id:'A',x:0,y:0},{id:'B',x:1,y:0},{id:'C',x:1,y:1},{id:'D',x:0,y:1}];
const input={mode:'manual',source:{sourceId:'example-square-double-diagonal',kind:'synthetic-coordinate-fixture',sha256:null,mediaType:null,uri:null},coordinateFrames:[{id:'sheet',kind:'ideal-document',units:'normalized',width:1,height:1}],transformations:[],annotations:{configuration:'double-diagonal',frameId:'sheet',annotator:'example human annotation',method:'manually supplied analytic fixture coordinates',paperCorners:corners,foldLines:[{id:'fold-AC',a:corners[0],b:corners[2]},{id:'fold-BD',a:corners[1],b:corners[3]}],uncertainty:{kind:'fixture-coordinate-uncertainty',value:0,unit:'normalized',description:'Exact analytical fixture; no source pixels or physical sheet measured.'}}};
const detections=origamiModule.detect(input),model=origamiModule.buildModel(detections,{input});
await writeFile(new URL('./origami-double-diagonal.manual.json',import.meta.url),JSON.stringify(model,null,2)+'\n');
console.log(`Wrote manual synthetic example; geometry validation ${model.validationReport.status}.`);

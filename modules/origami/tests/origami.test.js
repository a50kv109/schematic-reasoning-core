import test from 'node:test';
import assert from 'node:assert/strict';
import {origamiModule} from '../adapter.js';

const corners=[{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:0,y:1}];
const input={mode:'manual',source:{sourceId:'fixture',kind:'synthetic-coordinate-fixture',sha256:null},coordinateFrames:[{id:'sheet',units:'normalized',width:1,height:1}],annotations:{configuration:'double-diagonal',frameId:'sheet',annotator:'test',paperCorners:corners,foldLines:[{id:'a',a:corners[0],b:corners[2]},{id:'b',a:corners[1],b:corners[3]}]}};
test('Origami adapter implements and satisfies the shared module contract',()=>{assert.equal(origamiModule.manifest.moduleId,'origami');const detections=origamiModule.detect(input);const model=origamiModule.buildModel(detections,{input});assert.equal(origamiModule.validateModel(model).status,'PASS');});

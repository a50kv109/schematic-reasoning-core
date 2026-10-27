import {CORE_API_VERSION} from './types.js';
const REQUIRED_MANIFEST=['moduleId','name','version','apiVersion','domain','description','supportedInputs','supportedObjectTypes','capabilities','limitations','validationMethods'];
const REQUIRED_METHODS=['describeCapabilities','validateInput','detect','buildModel','validateModel'];
export function validateModuleManifest(manifest){
  const errors=[];for(const k of REQUIRED_MANIFEST)if(!(k in (manifest||{})))errors.push(`Manifest missing ${k}.`);
  for(const k of ['supportedInputs','supportedObjectTypes','capabilities','limitations','validationMethods'])if(!Array.isArray(manifest?.[k]))errors.push(`Manifest ${k} must be an array.`);
  if(manifest?.moduleId!==undefined&&!/^[a-z][a-z0-9-]*$/.test(manifest.moduleId))errors.push('Manifest moduleId must be lowercase slug.');
  if(manifest?.version!==undefined&&!/^\d+\.\d+\.\d+$/.test(manifest.version))errors.push('Manifest version must be semantic x.y.z.');
  if(manifest?.apiVersion!==CORE_API_VERSION)errors.push(`Incompatible module API ${manifest?.apiVersion}; core requires ${CORE_API_VERSION}.`);
  return {valid:errors.length===0,errors};
}
export function createModuleRegistry(){
  const modules=new Map();
  return {
    register(module){
      const check=validateModuleManifest(module?.manifest);if(!check.valid)throw new Error(check.errors.join(' '));
      const missing=REQUIRED_METHODS.filter(k=>typeof module[k]!=='function');if(missing.length)throw new Error(`Module is missing methods: ${missing.join(', ')}.`);
      if(modules.has(module.manifest.moduleId))throw new Error(`Module already registered: ${module.manifest.moduleId}.`);
      modules.set(module.manifest.moduleId,module);return module.manifest.moduleId;
    },
    get(moduleId,apiVersion=CORE_API_VERSION){const m=modules.get(moduleId);if(!m)throw new Error(`Module not registered: ${moduleId}.`);if(m.manifest.apiVersion!==apiVersion)throw new Error(`Module ${moduleId} API mismatch.`);return m;},
    list(){return [...modules.values()].map(m=>m.manifest);}
  };
}

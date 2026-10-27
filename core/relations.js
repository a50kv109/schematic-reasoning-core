export const RELATION_TYPES=Object.freeze(['intersects','parallel','perpendicular','connected','symmetric-to','belongs-to']);
export function makeRelation(id,type,fromId,toId,details={}){if(!RELATION_TYPES.includes(type))throw new Error(`Unsupported relation type ${type}.`);return {id,type,fromId,toId,...details};}

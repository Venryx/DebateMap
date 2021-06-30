import {CachedTransform, emptyArray_forLoading, ToNumber, CE, ObjectCE} from "web-vcore/nm/js-vextensions.js";
import {GetDoc, GetDocs, StoreAccessor} from "web-vcore/nm/mobx-graphlink.js";
import {Map, MapType} from "./maps/@Map.js";

export const GetMaps = StoreAccessor(s=>(orderByEdits = false): Map[]=>{
	/* const mapsMap = GetData({ collection: true }, 'maps');
	return CachedTransform('GetMaps', [], mapsMap, () => (mapsMap ? mapsMap.VValues(true) : [])); */
	/*const mapsMap = GetDocs({}, a=>a.maps);
	if (!mapsMap) return emptyArray_forLoading;
	let result = ObjectCE(mapsMap).VValues();*/
	let result = GetDocs({}, a=>a.maps);
	if (orderByEdits) result = CE(result).OrderByDescending(a=>ToNumber(a && a.edits, 0));
	return result;
});
export const GetMaps_Private = StoreAccessor(s=>(orderByEdits = false)=>{
	return GetMaps(orderByEdits).filter(a=>a && a.type == MapType.private);
});
export const GetMaps_Public = StoreAccessor(s=>(orderByEdits = false)=>{
	return GetMaps(orderByEdits).filter(a=>a && a.type == MapType.public);
});

/* export function GetMapsOfType(type: MapType): Map[] {
	const mapsMap = GetData({ collection: true }, 'maps');
	return CachedTransform('GetMaps', [type], mapsMap, () => (mapsMap ? mapsMap.VValues(true).filter(a => a && a.type == type) : []));
} */
export const GetMap = StoreAccessor(s=>(id: string)=>{
	return GetDoc({}, a=>a.maps.get(id));
});
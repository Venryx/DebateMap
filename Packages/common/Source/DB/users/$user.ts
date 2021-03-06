import {Assert, IsString} from "web-vcore/nm/js-vextensions.js";
import {CreateAccessor} from "web-vcore/nm/mobx-graphlink.js";
import {AccessLevel} from "../nodes/@MapNode.js";
import {GetUser} from "../users.js";
import {PermissionGroupSet} from "./@User.js";

// permissions
// ==========

/*export const GetUserJoinDate = CreateAccessor(c=>(userID: string): number=>{
	return GetUser(userID)?.joinDate;
});*/
const defaultPermissions = {basic: true, verified: true, mod: false, admin: false} as PermissionGroupSet; // temp
export const GetUserPermissionGroups = CreateAccessor(c=>(userID: string|n): PermissionGroupSet=>{
	//if (userID == null) return null;
	if (userID == null) return defaultPermissions;
	return GetUser(userID)?.permissionGroups ?? defaultPermissions;
});
export function GetUserAccessLevel(userID: string) {
	const groups = GetUserPermissionGroups(userID);
	if (groups == null) return AccessLevel.basic;

	if (groups.admin) return AccessLevel.admin;
	if (groups.mod) return AccessLevel.mod;
	if (groups.verified) return AccessLevel.verified;
	// if (groups.basic) return AccessLevel.basic;
	Assert(false);
}

export const CanGetBasicPermissions = CreateAccessor(c=>(userIDOrPermissions: string | PermissionGroupSet | n)=>{
	// if (true) return HasModPermissions(userIDOrPermissions); // temp; will be removed once GAD is over

	const permissions = IsString(userIDOrPermissions) ? GetUserPermissionGroups(userIDOrPermissions) : userIDOrPermissions;
	return permissions == null || permissions.basic; // if anon/not-logged-in, assume user can get basic permissions once logged in
});
export const HasBasicPermissions = CreateAccessor(c=>(userIDOrPermissions: string | PermissionGroupSet | n)=>{
	// if (true) return HasModPermissions(userIDOrPermissions); // temp; will be removed once GAD is over

	const permissions = IsString(userIDOrPermissions) ? GetUserPermissionGroups(userIDOrPermissions) : userIDOrPermissions;
	return permissions ? permissions.basic : false;
});
export const HasModPermissions = CreateAccessor(c=>(userIDOrPermissions: string | PermissionGroupSet | n)=>{
	const permissions = IsString(userIDOrPermissions) ? GetUserPermissionGroups(userIDOrPermissions) : userIDOrPermissions;
	return permissions ? permissions.mod : false;
});
export const HasAdminPermissions = CreateAccessor(c=>(userIDOrPermissions: string | PermissionGroupSet | n)=>{
	const permissions = IsString(userIDOrPermissions) ? GetUserPermissionGroups(userIDOrPermissions) : userIDOrPermissions;
	return permissions ? permissions.admin : false;
});
/** If user is the creator, also requires that they (still) have basic permissions. */
//export const IsUserCreatorOrMod = CreateAccessor(c=>(userID: string, entity: Term | Image | Map | MapNode | MapNodePhrasing | Timeline /* | Post | Thread */)=>{
export const IsUserCreatorOrMod = CreateAccessor(c=>(userID: string|n, entity: {creator?: string}|n)=>{
	return (entity?.creator === userID && HasBasicPermissions(userID)) || HasModPermissions(userID);
});

/*export const CanSubmitRevisions = CreateAccessor(c=>(userID: string, nodeID: string): boolean=>{
	// mods and admins can always edit
	if (HasModPermissions(userID) || HasAdminPermissions(userID)) {
		return true;
	}

	/*let user = GetUser(userID);
	if (user == null) return false;*#/
	const node = GetNodeL2(nodeID);
	if (node == null) return false;
	const revision = node.current;

	// probably temp
	const editPerm = revision.permission_edit ?? {type: PermissionInfoType.anyone};

	if (editPerm.type == PermissionInfoType.anyone) {
		return CanGetBasicPermissions(userID);
	}
	if (editPerm.type == PermissionInfoType.creator) {
		return revision.creator == userID;
	}
	if (editPerm.type == PermissionInfoType.mapEditors) {
		if (revision.creator == userID) return true; // node-creator can always edit
		const map = GetMap(node.ownerMapID);
		return map?.editors?.includes(userID) ?? false;
	}
	Assert(false, "Invalid permission-info-type.");
});*/

/*export const CanContributeToNode = CreateAccessor(c=>(userID: string, nodeID: string): boolean=>{
	// mods and admins can always contribute
	if (HasModPermissions(userID) || HasAdminPermissions(userID)) {
		return true;
	}

	/*let user = GetUser(userID);
	if (user == null) return false;*#/
	const node = GetNodeL2(nodeID);
	if (node == null) return false;
	const revision = node.current;

	// probably temp
	const contributePerm = revision.permission_contribute ?? {type: PermissionInfoType.anyone};

	if (contributePerm.type == PermissionInfoType.anyone) {
		return CanGetBasicPermissions(userID);
	}
	if (contributePerm.type == PermissionInfoType.creator) {
		return revision.creator == userID;
	}
	if (contributePerm.type == PermissionInfoType.mapEditors) {
		if (revision.creator == userID) return true; // node-creator can always contribute
		const map = GetMap(node.ownerMapID);
		return map?.editors?.includes(userID) ?? false;
	}
	Assert(false, "Invalid permission-info-type.");
});*/
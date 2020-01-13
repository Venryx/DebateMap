import {AssertV, Command, MergeDBUpdates} from "mobx-firelink";
import {HasAdminPermissions} from "Store/firebase/users/$user";
import {AssertValidate} from "vwebapp-framework";
import {SubtreeExportData_Old} from "UI/@Shared/Maps/MapNode/NodeUI_Menu/MI_ExportSubtree";
import {FromJSON, GetTreeNodesInObjTree, Clone, CE} from "js-vextensions";
import {MapNode} from "Store/firebase/nodes/@MapNode";
import {MapNodeRevision} from "Store/firebase/nodes/@MapNodeRevision";
import {AsNodeL1} from "Store/firebase/nodes/$node";
import {AddChildNode} from "./AddChildNode";

// for export from old site (see commented code in MI_ExportSubtree.tsx)
export class ImportSubtree_Old extends Command<{mapID?: string, parentNodeID: string, subtreeJSON: string}> {
	rootSubtreeData: SubtreeExportData_Old;

	subs = [] as Command<any, any>[];
	Validate() {
		AssertV(HasAdminPermissions(this.userInfo.id), "Only admins can run the import-subtree command.");
		AssertValidate({
			properties: {
				mapID: {type: "string"},
				parentNodeID: {type: "string"},
				subtreeJSON: {type: "string"},
			},
			required: ["subtreeJSON"],
		}, this.payload, "Payload invalid");

		const {subtreeJSON, parentNodeID} = this.payload;
		this.rootSubtreeData = FromJSON(subtreeJSON);
		this.subs = []; // clear each run, since validate gets called more than once
		this.ProcessSubtree(this.rootSubtreeData, parentNodeID);
	}

	ProcessSubtree(subtreeData: SubtreeExportData_Old, parentID: string) {
		const {mapID} = this.payload;

		const node = AsNodeL1(WithoutHelpers(subtreeData).Excluding("childrenData" as any, "finalPolarity", "currentRevision", "parents", "children"));
		const revision = WithoutHelpers(subtreeData.current).Excluding("node") as MapNodeRevision;

		const addNodeCommand = new AddChildNode({mapID, parentID, node, revision}).MarkAsSubcommand(this);
		addNodeCommand.Validate();
		this.subs.push(addNodeCommand);

		for (const pair of CE(subtreeData.childrenData).Pairs()) {
			this.ProcessSubtree(pair.value, addNodeCommand.sub_addNode.nodeID);
		}
	}

	GetDBUpdates() {
		let updates = {};
		for (const sub of this.subs) {
			updates = MergeDBUpdates(updates, sub.GetDBUpdates());
		}
		return updates;
	}
}

const helperProps = ["_key", "_id"];
/** Note: this mutates the original object. */
export function RemoveHelpers(data) {
	var treeNodes = GetTreeNodesInObjTree(data, true);
	for (const treeNode of treeNodes) {
		if (helperProps.Contains(treeNode.prop)) { delete treeNode.obj[treeNode.prop]; }
	}
	return data;
}
export function WithoutHelpers(data) {
	return RemoveHelpers(Clone(data));
}
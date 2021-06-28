import {MapEdit} from "../CommandMacros";
import {Assert, E, CE} from "web-vcore/nm/js-vextensions";
import {GetAsync, Command, AssertV, dbp} from "web-vcore/nm/mobx-graphlink";
import {UserEdit} from "../CommandMacros";
import {LinkNode_HighLevel} from "./LinkNode_HighLevel";
import {ClaimForm, Polarity, MapNode} from "../Store/db/nodes/@MapNode";
import {GetNode} from "../Store/db/nodes";
import {MapNodeType} from "../Store/db/nodes/@MapNodeType";
import {GetNodeChildLinks} from "../Store/db/nodeChildLinks";

@MapEdit
@UserEdit
export class LinkNode extends Command<{mapID: string, parentID: string, childID: string, childForm?: ClaimForm, childPolarity?: Polarity}, {}> {
	child_oldData: MapNode;
	parent_oldData: MapNode;
	/* async Prepare(parent_oldChildrenOrder_override?: number[]) {
		let {parentID, childID, childForm} = this.payload;
		this.parent_oldChildrenOrder = parent_oldChildrenOrder_override || await GetDataAsync(`nodes/${parentID}/.childrenOrder`) as number[];
	} */
	Validate() {
		const {parentID, childID} = this.payload;
		AssertV(parentID != childID, "Parent-id and child-id cannot be the same!");

		this.child_oldData = GetNode(childID);
		AssertV(this.child_oldData || this.parentCommand != null, "Child does not exist!");
		this.parent_oldData =
			(this.parentCommand instanceof LinkNode_HighLevel && this == this.parentCommand.sub_linkToNewParent ? this.parentCommand.sub_addArgumentWrapper?.payload.node : null)
			//?? (this.parentCommand instanceof ImportSubtree_Old ? "" as any : null) // hack; use empty-string to count as non-null for this chain, but count as false for if-statements (ye...)
			?? GetNode(parentID);
		AssertV(this.parent_oldData || this.parentCommand != null, "Parent does not exist!");

		const parentChildren = GetNodeChildLinks(this.parent_oldData.id);
		if (this.parent_oldData) {
			AssertV(!parentChildren.Any(a=>a.child == childID), `Node #${childID} is already a child of node #${parentID}.`);
		}

		/*if (this.child_oldData?.ownerMapID != null) {
			AssertV(this.parent_oldData?.ownerMapID == this.child_oldData.ownerMapID, `Cannot paste private node #${childID} into a map not matching its owner map (${this.child_oldData.ownerMapID}).`);
			/*const newMap = GetMap(this.parent_oldData.ownerMapID);
			AssertV(newMap, 'newMap not yet loaded.');
			if (newMap.requireMapEditorsCanEdit)*#/
		}*/
	}

	GetDBUpdates() {
		const {parentID, childID, childForm, childPolarity} = this.payload;

		const updates = {};
		// add parent as parent-of-child
		updates[dbp`nodes/${childID}/.parents/.${parentID}`] = {_: true};
		// add child as child-of-parent
		updates[dbp`nodes/${parentID}/.children/.${childID}`] = E(
			{_: true},
			childForm && {form: childForm},
			childPolarity && {polarity: childPolarity},
		);
		/*if (this.parent_oldData?.childrenOrder) {
			updates[dbp`nodes/${parentID}/.childrenOrder`] = this.parent_oldData.childrenOrder.concat([childID]);
		}*/
		return updates;
	}
}
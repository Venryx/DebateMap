import {Assert, E} from "web-vcore/nm/js-vextensions";
import {MergeDBUpdates, GetAsync, Command, AssertV, GenerateUUID} from "web-vcore/nm/mobx-graphlink";
import {AssertValidate} from "web-vcore/nm/mobx-graphlink";
import {MapEdit, UserEdit} from "../CommandMacros";
import {AddNode} from "./AddNode";
import {MapNode, Polarity} from "../Store/db/nodes/@MapNode";
import {MapNodeRevision} from "../Store/db/nodes/@MapNodeRevision";
import {MapNodeType} from "../Store/db/nodes/@MapNodeType";
import {GetNode} from "../Store/db/nodes";
import {AddArgumentAndClaim} from "../Commands";
import {NodeChildLink} from "../Store/db/nodeChildLinks/@NodeChildLink";

type Payload = {mapID: string, parentID: string, node: MapNode, revision: MapNodeRevision, link?: Partial<NodeChildLink>, asMapRoot?: boolean};

@MapEdit
@UserEdit
export class AddChildNode extends Command<Payload, {nodeID: string, revisionID: string}> {
	sub_addNode: AddNode;
	parent_oldData: MapNode;
	Validate() {
		AssertValidate({
			properties: {
				mapID: {type: "string"}, parentID: {type: ["null", "string"]}, node: {$ref: "MapNode_Partial"}, revision: {$ref: "MapNodeRevision_Partial"}, link: {$ref: "ChildEntry"}, asMapRoot: {type: "boolean"},
			},
			required: ["mapID", "parentID", "node", "revision"],
		}, this.payload, "Payload invalid");

		const {mapID, parentID, node, revision, link, asMapRoot} = this.payload;

		this.sub_addNode = this.sub_addNode ?? new AddNode({mapID, node, revision}).MarkAsSubcommand(this);
		this.sub_addNode.Validate();

		this.payload.link = link ?? E(node.type == MapNodeType.argument && {polarity: Polarity.supporting});
		if (node.type == MapNodeType.argument) {
			AssertV(this.payload.link.polarity != null, "An argument node must have its polarity specified in its parent-link.")
		}

		const isAddClaimSub = this.parentCommand instanceof AddArgumentAndClaim && this.parentCommand.sub_addClaim == this;
		if (!asMapRoot && !isAddClaimSub) {
			// this.parent_oldChildrenOrder = await GetDataAsync('nodes', parentID, '.childrenOrder') as number[];
			this.parent_oldData = GetNode(parentID);
		}

		this.returnData = {
			nodeID: this.sub_addNode.nodeID,
			revisionID: this.sub_addNode.sub_addRevision.revisionID,
		};
	}

	GetDBUpdates() {
		const {parentID, link, asMapRoot} = this.payload;
		const updates = this.sub_addNode.GetDBUpdates();

		const newUpdates = {};
		// add as child of parent
		if (!asMapRoot) {
			/*newUpdates[`nodes/${parentID}/.children/.${this.sub_addNode.nodeID}`] = link;
			// if parent node is using manual children-ordering, update that array
			if (this.parent_oldData?.childrenOrder) {
				newUpdates[`nodes/${parentID}/.childrenOrder`] = (this.parent_oldData.childrenOrder || []).concat([this.sub_addNode.nodeID]);
			}*/
			const link_final = new NodeChildLink({
				...link,
				id: GenerateUUID(),
				parent: parentID,
				child: this.sub_addNode.nodeID,
				slot: 0, // todo
			});
		}

		return MergeDBUpdates(updates, newUpdates);
	}
}
import {Clone, E, DelIfFalsy} from "js-vextensions";
import {Column, Pre, RowLR, Select, Text, Row, TextInput, CheckBox, Button} from "react-vcomponents";
import {BaseComponentPlus} from "react-vextensions";
import {BoxController, ShowMessageBox} from "react-vmessagebox";
import {AddNodeTag} from "Server/Commands/AddNodeTag";
import {MapNodeTag, TagComp_names, GetTagCompClassByTag, CalculateTagCompKey, GetTagCompClassByDisplayName, TagComp_classes, TagComp, TagComp_Class, TagComp_MirrorChildrenFromXToY, TagComp_MutuallyExclusiveGroup, CalculateNodeIDsForTagComp} from "Store/firebase/nodeTags/@MapNodeTag";
import {IDAndCreationInfoUI} from "UI/@Shared/CommonPropUIs/IDAndCreationInfoUI";
import {ES} from "Utils/UI/GlobalStyles";
import {GetUser} from "../../../Store/firebase/users";
import {Validate, InfoButton, observer_simple} from "vwebapp-framework";
import {observer} from "mobx-react";

type Props = {baseData: MapNodeTag, forNew: boolean, enabled?: boolean, style?, onChange?: (newData: MapNodeTag)=>void};
type State = {newData: MapNodeTag};
export type TagDetailsUI_SharedProps = Props & State & {compClass: TagComp_Class, splitAt, Change};

export class TagDetailsUI extends BaseComponentPlus({} as Props, {} as State) {
	ComponentWillMountOrReceiveProps(props, forMount) {
		if (forMount || props.baseData != this.props.baseData) { // if base-data changed
			this.SetState({newData: Clone(props.baseData)});
			/*this.SetState({newData: Clone(props.baseData)}, ()=> {
				if (forMount) this.OnChange(); // call onChange once, so parent-ui has access to the newData value (without needing ref)
			});*/
		}
	}
	OnChange() {
		const {onChange} = this.props;
		const newData = this.GetNewData();
		if (onChange) onChange(newData);
		this.SetState({newData});
	}

	render() {
		const {baseData, forNew, enabled, style} = this.props;
		const {newData} = this.state;
		const compClass = GetTagCompClassByTag(newData);

		const Change = (..._)=>this.OnChange();

		const splitAt = 70;
		let sharedProps = E(this.props, this.state, {compClass, splitAt, Change});
		return (
			<Column style={style}>
				{!forNew &&
					<IDAndCreationInfoUI id={baseData._key} creatorID={newData.creator} createdAt={newData.createdAt}/>}
				<RowLR mt={5} mb={5} splitAt={splitAt} style={{width: "100%"}}>
					<Pre>Type: </Pre>
					<Select options={TagComp_classes.map(a=>({name: a.displayName, value: a}))} enabled={enabled} style={ES({flex: 1})} value={compClass} onChange={(newCompClass: TagComp_Class)=> {
						delete newData[compClass.key];
						newData[newCompClass.key] = new newCompClass();
						Change();
					}}/>
					<InfoButton ml={5} text={compClass.description}/>
				</RowLR>
				{compClass == TagComp_MirrorChildrenFromXToY &&
					<MirrorChildrenFromXToY_UI {...sharedProps}/>}
				{compClass == TagComp_MutuallyExclusiveGroup &&
					<MutuallyExclusiveGroup_UI {...sharedProps}/>}
			</Column>
		);
	}
	/*GetValidationError() {
		return GetErrorMessagesUnderElement(GetDOM(this))[0];
	}*/

	GetNewData() {
		const {newData} = this.state;
		return Clone(newData) as MapNodeTag;
	}
}

class MirrorChildrenFromXToY_UI extends BaseComponentPlus({} as TagDetailsUI_SharedProps, {}) {
	render() {
		let {newData, enabled, splitAt, Change} = this.props;
		let comp = newData.mirrorChildrenFromXToY;
		return (
			<>
				<NodeSlotRow {...this.props} comp={comp} nodeKey="nodeX" label="Node X" mt={0}/>
				<NodeSlotRow {...this.props} comp={comp} nodeKey="nodeY" label="Node Y"/>
				<CheckBox mt={5} text="Mirror X's supporting arguments" checked={comp.mirrorSupporting} enabled={enabled} onChange={val=>Change(comp.mirrorSupporting = val)}/>
				<CheckBox mt={5} text="Mirror X's opposing arguments" checked={comp.mirrorOpposing} enabled={enabled} onChange={val=>Change(comp.mirrorOpposing = val)}/>
				<CheckBox mt={5} text="Reverse argument polarities" checked={comp.reversePolarities} enabled={enabled} onChange={val=>Change(comp.reversePolarities = val)}/>
				<CheckBox mt={5} text="Disable Y direct children" checked={comp.disableDirectChildren} enabled={enabled} onChange={val=>Change(comp.disableDirectChildren = val)}/>
			</>
		);
	}
}

class MutuallyExclusiveGroup_UI extends BaseComponentPlus({} as TagDetailsUI_SharedProps, {}) {
	render() {
		let {newData, enabled, splitAt, Change} = this.props;
		let comp = newData.mutuallyExclusiveGroup;
		return (
			<>
				<Row>
					<Text>Nodes in group:</Text>
					<Button ml={5} p="3px 7px" text="+" enabled={enabled} onClick={()=>{
						comp.nodes.push("");
						Change();
					}}/>
				</Row>
				{comp.nodes.map((nodeID, index)=> {
					return <NodeInArrayRow key={index} {...this.props} comp={comp} nodeArrayKey="nodes" nodeEntry={nodeID} nodeEntryIndex={index}/>;
				})}
				<Row center mt={5}>
					<CheckBox text="Mirror X pros as Y cons" checked={comp.mirrorXProsAsYCons} enabled={enabled} onChange={val=>Change(comp.mirrorXProsAsYCons = val)}/>
					<InfoButton ml={5} text="Makes-so each node's pro-args are mirrored as con-args of the others."/>
				</Row>
			</>
		);
	}
}

class NodeSlotRow extends BaseComponentPlus({mt: 5} as TagDetailsUI_SharedProps & {comp: TagComp, nodeKey: string, label: string, mt?: number | string}, {}) {
	render() {
		let {newData, enabled, compClass, splitAt, Change, comp, nodeKey, label, mt} = this.props;
		return (
			<RowLR mt={mt} splitAt={splitAt} style={{width: "100%"}}>
				<Text>{label}:</Text>
				<TextInput value={comp[nodeKey]} enabled={enabled} style={{flex: 1}} onChange={val=> {
					comp.VSet(nodeKey, DelIfFalsy(val));
					newData.nodes = CalculateNodeIDsForTagComp(comp, compClass);
					Change();
				}}/>
			</RowLR>
		);
	}
}

class NodeInArrayRow extends BaseComponentPlus({} as TagDetailsUI_SharedProps & {comp: TagComp, nodeArrayKey: string, nodeEntry: string, nodeEntryIndex: number}, {}) {
	render() {
		let {newData, enabled, compClass, splitAt, Change, comp, nodeArrayKey, nodeEntry, nodeEntryIndex} = this.props;
		return (
			<RowLR mt={5} splitAt={30} style={{width: "100%"}}>
				<Text>#{nodeEntryIndex + 1}:</Text>
				<TextInput value={nodeEntry} enabled={enabled} style={{flex: 1, borderRadius: "5px 0 0 5px"}} onChange={val=> {
					comp[nodeArrayKey][nodeEntryIndex] = val;
					newData.nodes = CalculateNodeIDsForTagComp(comp, compClass);
					Change();
				}}/>
				<Button text="X" enabled={enabled} style={{padding: "3px 5px", borderRadius: "0 5px 5px 0"}} onClick={()=>{
					comp[nodeArrayKey].RemoveAt(nodeEntryIndex);
					Change();
				}}/>
			</RowLR>
		);
	}
}

export function ShowAddTagDialog(initialData: Partial<MapNodeTag>, postAdd?: (id: string)=>void) {
	let newTag = new MapNodeTag(initialData);
	const getCommand = ()=>new AddNodeTag({tag: newTag});

	const boxController: BoxController = ShowMessageBox({
		title: "Add tag", cancelButton: true,
		message: observer_simple(()=>{
			const tempCommand = getCommand();
			boxController.options.okButtonProps = {
				enabled: tempCommand.Validate_Safe() == null,
				title: tempCommand.validateError,
			};

			return (
				<Column style={{padding: "10px 0", width: 500}}>
					<TagDetailsUI baseData={newTag} forNew={true}
						onChange={val=>{
							newTag = val;
							boxController.UpdateUI();
						}}/>
				</Column>
			);
		}),
		onOK: async()=>{
			const id = await getCommand().Run();
			if (postAdd) postAdd(id);
		},
	});
}
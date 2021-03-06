// import {GetErrorMessagesUnderElement, Clone, CloneWithPrototypes} from "web-vcore/nm/js-vextensions.js";
// import Moment from "web-vcore/nm/moment";
// import {Column, Pre, RowLR, TextInput, Text} from "web-vcore/nm/react-vcomponents.js";
// import {BaseComponent, GetDOM, BaseComponentPlus} from "web-vcore/nm/react-vextensions.js";
// import {Layer} from "dm_common";
// import {IDAndCreationInfoUI} from "../CommonPropUIs/IDAndCreationInfoUI.js";

// type Props = {baseData: Layer, forNew: boolean, enabled?: boolean, style?, onChange?: (newData: Layer, ui: LayerDetailsUI)=>void};
// export class LayerDetailsUI extends BaseComponentPlus({enabled: true} as Props, {newData: null as Layer}) {
// 	ComponentWillMountOrReceiveProps(props, forMount) {
// 		if (forMount || props.baseData != this.props.baseData) { // if base-data changed
// 			this.SetState({newData: CloneWithPrototypes(props.baseData)});
// 		}
// 	}

// 	render() {
// 		const {baseData, forNew, enabled, style, onChange} = this.props;
// 		const {newData} = this.state;
// 		const Change = (..._)=>{
// 			if (onChange) onChange(this.GetNewData(), this);
// 			this.Update();
// 		};

// 		const splitAt = 170;
// 		const width = 600;
// 		return (
// 			<Column style={style}>
// 				{!forNew &&
// 					<IDAndCreationInfoUI id={baseData.id} creatorID={newData.creator} createdAt={newData.createdAt}/>}
// 				<RowLR mt={5} splitAt={splitAt} style={{width}}>
// 					<Text>Name: </Text>
// 					<TextInput required enabled={enabled} style={{width: "100%"}}
// 						value={newData.name} onChange={val=>Change(newData.name = val)}/>
// 				</RowLR>
// 			</Column>
// 		);
// 	}
// 	GetValidationError() {
// 		return GetErrorMessagesUnderElement(GetDOM(this))[0];
// 	}

// 	GetNewData() {
// 		const {newData} = this.state;
// 		return CloneWithPrototypes(newData) as Layer;
// 	}
// }
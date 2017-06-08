import {TransformRatingForContext} from "../../../../Store/firebase/nodeRatings";
import {Assert} from "../../../../Frame/General/Assert";
import {BaseComponent, Pre, RenderSource, Div, FindDOM, GetErrorMessagesUnderElement} from "../../../../Frame/UI/ReactGlobals";
import {Term, TermType, Term_nameFormat, Term_disambiguationFormat} from "../../../../Store/firebase/terms/@Term";
import Column from "../../../../Frame/ReactComponents/Column";
import Row from "../../../../Frame/ReactComponents/Row";
import TextInput from "../../../../Frame/ReactComponents/TextInput";
import * as Moment from "moment";
import {GetUser, User} from "../../../../Store/firebase/users";
import {Connect} from "../../../../Frame/Database/FirebaseConnect";
import {GetEntries} from "../../../../Frame/General/Enums";
import Select from "../../../../Frame/ReactComponents/Select";
import {RowLR} from "../../../../Frame/ReactComponents/Row";
import CheckBox from "../../../../Frame/ReactComponents/CheckBox";
import ScrollView from "react-vscrollview";
import Button from "../../../../Frame/ReactComponents/Button";
import TermComponent from "../../../../Store/firebase/termComponents/@TermComponent";
import {GetNiceNameForTermType} from "../../../../UI/Content/TermsUI";
import {GetTermVariantNumber} from "../../../../Store/firebase/terms";
import InfoButton from "../../../../Frame/ReactComponents/InfoButton";
import {Equation} from "../../../../Store/firebase/nodes/@Equation";
import {TextArea_AutoSize} from "../../../../Frame/ReactComponents/TextArea";

type Props = {baseData: Equation, creating: boolean, editing?: boolean, style?, onChange?: (newData: Equation)=>void};
	//& Partial<{creator: User, variantNumber: number}>;
/*@Connect((state, {baseData, creating}: Props)=>({
	creator: !creating && GetUser(baseData.creator),
	variantNumber: !creating && GetTermVariantNumber(baseData),
}))*/
export default class EquationEditorUI extends BaseComponent<Props, {newData: Equation}> {
	ComponentWillMountOrReceiveProps(props, forMount) {
		if (forMount || props.baseData != this.props.baseData) // if base-data changed
			this.SetState({newData: Clone(props.baseData)});
	}
	
	render() {
		let {creating, editing, style, onChange} = this.props;
		let {newData} = this.state;
		let Change = _=> {
			if (onChange)
				onChange(this.GetNewData());
			this.Update();
		};

		let splitAt = 100; //, width = 600;
		return (
			<div> {/* needed so GetInnerComp() work */}
			<Column style={style}>
				<RowLR mt={5} splitAt={splitAt}>
					<Pre>LaTeX: </Pre>
					<CheckBox enabled={creating || editing} style={{width: "100%"}}
						checked={newData.latex} onChange={val=>Change(val ? newData.latex = true : delete newData.latex)}/>
				</RowLR>
				<RowLR mt={5} splitAt={splitAt}>
					<Pre>Text: </Pre>
					{!newData.latex
						? <TextInput required enabled={creating || editing} style={{width: "100%"}}
							value={newData.text} onChange={val=>Change(newData.text = val)}/>
						: <TextArea_AutoSize required enabled={creating || editing} style={{width: "100%"}}
							value={newData.text} onChange={val=>Change(newData.text = val)}/>}
				</RowLR>
				<Row mt={5} style={{display: "flex", alignItems: "center"}}>
					<Pre>Step in series: </Pre>
					<CheckBox enabled={editing} checked={newData.isStep}
						//onChange={val=>Change(val ? newLinkData.isStep = true : delete newLinkData.isStep)}/>
						onChange={val=>Change(newData.isStep = val || null)}/>
				</Row>
				{newData.isStep &&
					<RowLR mt={5} splitAt={splitAt}>
						<Pre>Explanation: </Pre>
						<TextInput enabled={creating || editing} style={{width: "100%"}}
							value={newData.explanation} onChange={val=>Change(newData.explanation = val)}/>
					</RowLR>}
			</Column>
			</div>
		);
	}
	GetValidationError() {
		return GetErrorMessagesUnderElement(FindDOM(this))[0];
	}

	GetNewData() {
		let {newData} = this.state;
		let result = Clone(newData) as Equation;
		if (!result.isStep) {
			delete result.explanation;
		}
		return result;
	}
}
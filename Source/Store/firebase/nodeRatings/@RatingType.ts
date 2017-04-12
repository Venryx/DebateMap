import {MapNode, MetaThesis_IfType} from "../nodes/@MapNode";
import {Range} from "../../../Frame/General/Globals";
import {MapNodeType} from "../nodes/@MapNodeType";

//export type RatingType = "significance" | "neutrality" | "probability" | "intensity" | "adjustment" | "strength";
export type RatingType = "significance" | "neutrality" | "probability" | "evidence" | "adjustment" | "strength";
export class RatingType_Info {
	static for = {
		significance: new RatingType_Info({
			displayText: "Significance",
			description: ()=>"How significant/important is this subject? (0: not worth any time discussing; 100: vital to discuss)",
			options: ()=>Range(0, 100),
			ticks: ()=>Range(0, 100, 5),
		}),
		neutrality: new RatingType_Info({
			displayText: "Neutrality",
			description: ()=>"How neutral/impartial is the phrasing of this question? (0: as biased as they come; 100: no bias)",
			options: ()=>Range(0, 100),
			ticks: ()=>Range(0, 100, 5),
		}),
		probability: new RatingType_Info({
			displayText: "Probability",
			description: ()=>"What probability does this statement, as presented, have of being true?",
			//options: [1, 2, 4, 6, 8].concat(Range(10, 90, 5)).concat([92, 94, 96, 98, 99]),
			//options: [1].concat(Range(2, 98, 2)).concat([99]),
			/*options: Range(1, 99),
			ticks: [1].concat(Range(5, 95, 5)).concat([99]),*/
			options: ()=>Range(0, 100),
			ticks: ()=>Range(0, 100, 5),
		}),
		/*intensity: new RatingType_Info({
			displayText: "Intensity",
			//description: ()=>"What intensity should this statement be strengthened/weakened to, to reach its ideal state? (making substantial claims while maintaining accuracy)",
			//description: ()=>"To what intensity is this statement true? (100 = your estimate of the average opinion)",
			description: ()=>"To what intensity is the basic idea true? (100: your estimate of the average opinion)",
			/*options: [1, 2, 4, 6, 8].concat(Range(10, 200, 5)),
			ticks: [1].concat(Range(20, 200, 20)),*#/
			options: ()=>Range(0, 200),
			ticks: ()=>Range(0, 200, 10),
		}),*/
		evidence: new RatingType_Info({
			displayText: "Evidence",
			description: ()=>"To what level should the average opinion on this statement be shifted to match the evidence?",
			options: ()=>Range(0, 200),
			ticks: ()=>Range(0, 200, 10),
		}),
		// todo
		/*substantiation: {
			description: "How much would the parent thesis be substantiated, IF all the (non-meta) theses of this argument were true?",
			options: Range(0, 100),
			ticks: Range(0, 100, 5),
		},*/
		adjustment: new RatingType_Info({
			displayText: "Adjustment",
			description: (node, parentNode)=> {
				let support = parentNode.type == MapNodeType.SupportingArgument;
				return `Suppose that the parent thesis were just introduced (a blank slate with no specific research), and that its base probability were 50%.`
					+ (
						node.metaThesis.ifType == MetaThesis_IfType.All ? ` Suppose also that this argument's premises were all true.` :
						node.metaThesis.ifType == MetaThesis_IfType.AnyTwo ? ` Suppose also that at least two of this argument's premises were true.` :
						` Suppose also that at least one of this argument's premises were true.`
					)
					+ ` If that were the case, to what level would this argument ${support ? "raise" : "lower"} the parent thesis' probability?`;
			},
			options: (node, parentNode)=> {
				return parentNode.type == MapNodeType.SupportingArgument ? Range(50, 100) : Range(0, 50);
			},
			ticks: (node, parentNode)=> {
				return parentNode.type == MapNodeType.SupportingArgument ? Range(50, 100, 5) : Range(0, 50, 5);
			},
		}),
		strength: {
			displayText: "Strength",
			description: ()=>"Argument strength is calculated based on the probabilities of its premises, and the probability/adjustment of its meta-thesis.",
			options: ()=>Range(0, 100),
			ticks: ()=>Range(0, 100, 5),
		},
	} as {[key: string]: RatingType_Info};

	private constructor(info: Partial<RatingType_Info>) {
		this.Extend(info);
	}

	displayText: string;
	description: ((node: MapNode, parentNode: MapNode)=>string);
	options: ((node: MapNode, parentNode: MapNode)=>number[]);
	ticks: ((node: MapNode, parentNode: MapNode)=>number[]);; // for x-axis labels
}
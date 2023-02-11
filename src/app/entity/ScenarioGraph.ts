import { Node } from './Node';
import { CtrlNode } from './CtrlNode';
import { Line } from './Line';

export class ScenarioGraph {
	title: string;	//文件名
	intNodeList: Node[];	//节点列表
	ctrlNodeList: CtrlNode[];	//节点列表
	lineList: Line[];	//边列表
}
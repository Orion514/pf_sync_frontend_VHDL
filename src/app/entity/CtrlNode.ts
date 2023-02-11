import { Node } from './Node';

export class CtrlNode extends Node {
	node_fromList: Node[];	
	node_toList: Node[];
	node_text: string;	//�ж�
	node_consition1: string;	//��֧����
	node_consition2: string;
	node_clone: string;
	delay_type: string;
}
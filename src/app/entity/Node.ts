import { Phenomenon } from './Phenomenon';

export class Node {
	node_no: number;	//�ڵ���
	node_type: string;	//�ڵ�����
	node_x: number;		//λ����Ϣ
	node_y: number;
	node_fromList: Node[];	
	node_toList: Node[];
	pre_condition: Phenomenon;
	post_condition: Phenomenon;
}
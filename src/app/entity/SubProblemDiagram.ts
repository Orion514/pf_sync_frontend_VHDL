import { Machine } from './Machine';
import { ProblemDomain } from './ProblemDomain';
import { Requirement } from './Requirement';
import { Interface } from './Interface';
import { Constraint } from './Constraint';
import { Reference } from './Reference';

export class SubProblemDiagram{
	title: string;	//文件名
	machine: Machine;	//机器
	problemDomainList: ProblemDomain[];	//领域列表
	requirement: Requirement;	//需求
	interfaceList: Interface[];	//交互列表
	constraintList: Constraint[];	//约束列表
	referenceList: Reference[];	//引用列表
}
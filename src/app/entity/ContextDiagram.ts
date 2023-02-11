import { Machine } from './Machine'
import { ProblemDomain } from './ProblemDomain'
import { Interface } from './Interface'

export class ContextDiagram {
	title: string
	machine: Machine
	problemDomainList: ProblemDomain[]
	interfaceList: Interface[]
}
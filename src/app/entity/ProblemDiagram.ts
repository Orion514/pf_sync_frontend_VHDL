import { ContextDiagram } from './ContextDiagram'
import { Requirement } from './Requirement'
import { Constraint } from './Constraint'
import { Reference } from './Reference'

export class ProblemDiagram {
	title: string
	contextDiagram: ContextDiagram
	requirementList: Requirement[]
	constraintList: Constraint[]
	referenceList: Reference[]
}
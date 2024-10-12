import { useMemo, useState } from 'react'
import { Module, ModuleTypeNames, moduleTypes } from '../core/module'
import { Position } from '../core/position'
import {
	getBuildingMinSize,
	ScaffoldingModule,
} from '../core/modules/scaffolding'
import { clamp } from '../core/util'

export enum ConstructionMode {
	idle,
	placing,
	expanding,
}

export const useBuildMode = () => {
	const [constructionMode, setConstructionMode] = useState<ConstructionMode>(
		ConstructionMode.idle
	)
	const [constructionStart, setConstructionStart] = useState<Position>({
		x: 0,
		y: 0,
	})
	const [constructionEnd, setConstructionEnd] = useState<Position>({
		x: 0,
		y: 0,
	})
	const [targetType, setTargetType] = useState<ModuleTypeNames>('generator')

	const constructionModule = useMemo((): Module & ScaffoldingModule => {
		const start = constructionStart ?? { x: 0, y: 0 }
		const minSize = getBuildingMinSize(moduleTypes[targetType])
		return {
			id: 'building',
			type: 'scaffolding' as const,
			targetType,
			connectionNodes: [],
			upgrades: [],
			...start,
			width: clamp(minSize)(4)(
				(constructionEnd?.x ?? start.x) - start.x + 1
			),
			height: clamp(minSize)(4)(
				(constructionEnd?.y ?? start.y) - start.y + 1
			),
			progress: 0,
		}
	}, [constructionStart, constructionEnd, targetType])

	return {
		constructionStart,
		setConstructionStart,
		constructionEnd,
		setConstructionEnd,
		targetType,
		setTargetType,
		constructionModule,
		constructionMode,
		setConstructionMode,
	}
}

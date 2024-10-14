import { Identifier } from './main'

export type Connection = Identifier & {
	fromUpgradeId: string
	toUpgradeId: string
}

export const connection = (
	fromUpgradeId: string,
	toUpgradeId: string
): Connection => ({
	id: crypto.randomUUID(),
	fromUpgradeId,
	toUpgradeId,
})

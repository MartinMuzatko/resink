import { Identifier } from './main'

export type Connection = Identifier & {
	fromUpgradeId: string
	toUpgradeId: string
}

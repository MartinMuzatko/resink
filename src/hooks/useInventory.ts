import { useState } from 'react'
import { Resource } from '../core/resource'

/**
 * Right now, this only stores unlimited stack of a unique resource.
 * The current data structure foresees slots,
 * but right now we add extra checks to merge incoming and current inv
 */
export const useInventory = () => {
	const [inventory, setInventory] = useState<Resource[]>([])
	const addToInventory = (resources: Resource[]): Resource[] => {
		const slots = resources.map((resource) => ({
			resource,
			slotIndex: inventory.findIndex(
				(spot) => spot.type.name == resource.type.name
			),
		}))
		let newInventory: Resource[] = []
		setInventory((inventory) => {
			newInventory = [
				// add to existing slots
				...inventory.map((slot, index) => {
					const toAdd = slots.find(
						({ slotIndex }) => slotIndex == index
					)
					if (!toAdd) return slot
					return {
						...slot,
						current: Math.max(
							0,
							slot.current + toAdd.resource.current
						),
					}
				}),
				// create new slots for resources not in inventory
				...slots
					.filter(
						(slot) => !~slot.slotIndex && slot.resource.current > 0
					)
					.map(({ resource }) => resource),
			].filter((slot) => slot.current)
			return newInventory
		})
		// remainder - what was not able to be used
		return slots.map((slot) => {
			const newSlot = newInventory.find(
				(s) => s.type.name == slot.resource.type.name
			) ?? { current: 0 }
			const oldSlot = inventory.find(
				(s) => s.type.name == slot.resource.type.name
			) ?? { current: 0 }
			return {
				type: slot.resource.type,
				current:
					newSlot?.current - oldSlot?.current - slot.resource.current,
			}
		})
	}

	return { inventory, setInventory, addToInventory }
}

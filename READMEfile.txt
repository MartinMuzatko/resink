Buildings:
	Extractor Node: extracts from existing resources
	X Generator Node: Generates out of nothing
	X Converter (Factory) Node: Based on Recipe converts 1...x input resources to 1...x output resources or (one of 1...x) to (fixed res)
	X Storage Node: Can store larger amounts of resources
	X Split Node: Split Resources of one type
	Combine Node: Combine resources of one type
	Market: A Converter in disguise. Converts items to money or vice versa.
		Buy: Allows to buy items and goods for money - fluctuates in price
		Sell: Allows to sell items and goods for money - fluctuates in price
		It should be a separate node based on the Converter but with fluctuating price!
	X Research Node: Unlocks Recipes and effects (not items or goods, but globally available recipes)
	Build Node: Hub for drones to transport for building
	Space Node: Slowly generates more space to build on - needs energy?
	Teleport Node: Using Energy, teleports (airplanes?) resources from A to B

Different Grids:
	Building Grid
	Upgrade Grid (Of individual Buildings)

Upgrade Grid
	Rules:
		Upgrade Modules are not simulated but computed - meaning they only change the absolute values of their modules properties (speed, capacity)
		Items have to travel through upgrades using
			Lanes (moves items in direction) (every lane reduces from speed, but allows more modifiers to apply)
			Tanks (temporarily stores, improves buffers and capacities)
		This implies that machines can be broken (not working, paused) or functioning (working)
		Upgrades have area of effects on fields nearby (affecting other lanes and modules)
		ConnectionNodes are pre-built - they span the entire left and right side for 1 column
		e.g.
		i1
			o
		i2
		gets turned into
		i1       o
		i1X     Xo
		i1       o
		i2       o
		i2X      o
		i2       o

	General
		Beacons
	ConnectionNodes
		Buffer - hold more
		Inflate/Deflate - can accept bigger items
	Factory
		Speed - faster
		Recipe
			Do changed recipes change the layout of the machine?
				maybe only defines how many inputs have to be connected.
			Productivity (produces n more item every x items)
			Refining (Can refine more advanced materials)
	Storage
		Capacity
			Inflate/Deflate - takes longer to process but can store more items
				Speed
				Amount per process
			Pressure Tanks - Total Amount storable



Progression:
	Learn how to move
	Learn how to extract resources
		(Manually?)
	Learn how to build machines (and how to build connecters - wires)
	Learn how to connect machines
	Learn how to refine resources
	Learn how to upgrade machines


Building Mode:
	X Scaffolding (beliebig groß?)
	X Dann mit Materialien versorgen um zu bauen
	Blueprints

Transportation Methods:
	X Wires: Needs to connect everything - max distance
		X Wire Types: Hanging, ZigZag
	Streets: Requires vehicles that need to collect and distribute and refuel
	Beacon: Has a radius where everything is provided (can be combined with teleport) (e.g. energy)
	Collector: Has a radius from where everything is collected (e.g. sewer waste)

Transportation Limitations:
	Transportation needs some kind of energy or multiples (fuel, labor, energy) to transport
	Longer distances need more of that energy
	Wires, Beacons etc can only transport one resource.
	Every transport method should come with its own overhead and limitations

Resource Types: (Not like Copper and Iron but more like: how they transport)
	Meter: labor and energy can't be produced and then shipped and re-used. If they are available, it works at a % speed
	Goods: Can be transported and stored and re-used

Transportation needs labor (human, car, robots)

Progression Campsites:
	Research - a skilltree in the shape of nodes
	Market - To buy and sell goods - maybe even upgrades
	Services - More or less a market but with better reecipes using money as additional input
	Residents Registration Office - New human workforce to steadily come?
		Do I really want the entire provide humans with goods microgame?
	Space - Initially, limited space can be unlocked using research (build on lava, water) or bought (existing land with facilities on top)



Open questions:
	We know how to create resources (needed to fill buildings) - how to get buildings?
		Do end resources get dropped into an inventory?
		There are no global (we have x water or n metal) inventories. Resources are always local just as Dyson Sphere Program
		That means I have to have inventories.
		Player inventory (global) and local inventories
			Causes new problem: I could cheat and just move resource A to B without needing to pay the energy cost
				Maybe only transport Goods (Batteries, Humans) and not converted Goods (Energy, Labor)
	Packing and unpacking: We have the resource (energy, labor) and the item (battery, car)
		The car doesn't get lost when it unloads its resources (also not robots, humans, etc)
		so we need an unpacking mechanism that converts cars with goods.
		That adds a new difficulty: Cars can have inventories too!
	If Wires is an item that I can place.. Do I need to produce long and short wires?? Are they upgradeable?
		Is there something like global upgrades? (Similar to DSP?)
	Can I attach one connection Node only to one other connection node or multiple? (multiple means: round robin balancing, what happens with items in wire?)


Recipes:
	Recipes define the technology tree without needing to change recipes (build only once but upgrade distribution)
	e.g. different resources to create energy

Oil -> Fuel
Fuel -> Energy

To improve production -
	you can expand space (process more resources)
		expand space by buying permits
	improve technology (more production in less space)
		Better facilities (faster processing)


External influences:
	scarcity (How to generate resources if they are drained?)
	marke


Workforce Person -> Driver
Driver + Car -> ?

### Grid System:

1. **2D Grid Structure:**

    - The game is set within a 2D grid, where each cell represents a space for placing Modules.

2. **Limited Grid Space:**
    - Players have a finite amount of space on the grid, adding a strategic layer to placement and optimization.

### Base Modules:

1. **Module:**

    - Represents a fundamental building block within the game's architecture, serving as a generic entity for Modules and structures.

2. **Connector Module:**

    - Provides connection points for linking different Modules and structures. Handles both input and output of resources, including power.

3. **Storage Module:**

    - Acts as a storage unit for materials, items, or energy. Can be scaled up or specialized for different purposes.

4. **Processing Module:**

    - Handles the functions of processing raw materials into refined Modules and assembling Modules into finished products.

5. **Control Module:**

    - Manages the overall operation of a system, handling coordination, automation, and communication between different Modules.

6. **Communication Module:**

    - Facilitates communication between Modules, Modules, and structures.

7. **Resource Module:**

    - Represents raw materials or resources that can be extracted or utilized. Acts as a common base for resource-related activities.

8. **Upgradability Module:**
    - Allows for the integration of upgrades and modifications to enhance the performance of the Module.

### Resource Flow:

1. **Connection Lines (Wires):**

    - Represents the flow of resources between connected Modules using virtual wires on the grid.

2. **Visual Capacity Indicators:**

    - Uses visual cues like line thickness, color gradients, or icons to represent the quantity or capacity of resources flowing through connection wires.

3. **Capacity Constraints:**

    - Introduces visual indicators or animations to highlight potential bottlenecks or constraints in resource flow.

4. **Resource Container Icons:**

    - Places small resource container icons along connection wires to visually represent the quantity of resources.

5. **Module Status Indicators:**
    - Displays status icons on connected Modules to indicate their ability to receive or process resources.

### Module Interaction:

1. **Nesting and Modularity:**

    - Allows Modules to be nested within each other, creating more complex structures. Modularity enables customization and upgrades.

2. **Upgradable Modules:**

    - Modules, including Modules and connection wires, can be upgraded to enhance their functionality, efficiency, or capacity.

3. **Visual Feedback:**

    - Provides visual feedback through animations, color changes, and icons to convey the state and performance of Modules.

4. **Strategic Challenges:**

    - Introduces challenges and objectives that encourage players to optimize resource flow, placement, and upgrades within the limited grid space.

5. **Resource Optimization:**
    - Encourages players to strategically plan and optimize the utilization of resources and Modules for efficient gameplay.

### Marketplace

The marketplace is just a grid with a

1. **Selling area:**
    - takes resources and converts them to money
1. **Buying area:**
    - takes money and converts them to resources

### Building Components

Building components need to have a cost.

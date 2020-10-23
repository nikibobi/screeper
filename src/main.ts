import { ErrorMapper } from "utils/ErrorMapper";

enum Roles {
  miner = "Miner"
}

interface CreepBlueprint {
  body: BodyPartConstant[];
  role: Roles;
  /**
   * Maximum number of units of this type
   */
  max: number;
}

const blueprints: { [key: string]: CreepBlueprint } = {
  [Roles.miner]: { body: [MOVE, WORK, CARRY], role: Roles.miner, max: 10 }
};

const trySpawn = (spawn: StructureSpawn) => ({ body, role, max }: CreepBlueprint) => {
  const name = `${spawn.name} ${role} ${Game.time % 10000}`;
  const memory = { memory: { role, spawnId: spawn.id } };
  const canSpawn = spawn.spawnCreep(body, name, { ...memory, dryRun: true }) === OK;
  const shouldSpawn = _(Game.creeps).filter({ memory: { role } }).size() < max;
  if (canSpawn && shouldSpawn) {
    spawn.spawnCreep(body, name, memory);
  }
};

const trySpawnOrigin = trySpawn(Game.spawns.Origin);

const visualizePathStyle: PolyStyle = { stroke: "#ffff00", fill: "#ff0000" };

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`);

  trySpawnOrigin(blueprints[Roles.miner]);

  for (const creepId in Game.creeps) {
    const creep = Game.creeps[creepId];
    if (creep.memory.role === Roles.miner) {
      if (creep.store.getFreeCapacity() > 0) {
        const source = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
        if (source && creep.harvest(source) === ERR_NOT_IN_RANGE) {
          creep.moveTo(source, { visualizePathStyle });
        }
      } else {
        const spawn = Game.getObjectById(creep.memory.spawnId);
        if (spawn && creep.transfer(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(spawn, { visualizePathStyle });
        }
      }
    }
  }

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
});

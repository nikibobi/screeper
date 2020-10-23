import { ErrorMapper } from "utils/ErrorMapper";

enum Roles {
  miner = "Miner"
}

enum States {
  harvest = "Harvest",
  transfer = "Transfer"
}

interface CreepBlueprint {
  body: BodyPartConstant[];
  role: Roles;
}

const blueprints: { [key: string]: CreepBlueprint } = {
  [Roles.miner]: { body: [MOVE, WORK, CARRY], role: Roles.miner }
};

const emoji: { [key: string]: string } = {
  [States.harvest]: "🌾",
  [States.transfer]: "💸"
};

Creep.prototype.switchState = function (state: States) {
  this.memory.state = state;
  this.say(emoji[state]);
};

const trySpawn = (spawn: StructureSpawn) => ({ body, role }: CreepBlueprint) => {
  const name = `${spawn.name} ${role} ${Game.time % 10000}`;
  const memory = { memory: { role, spawnId: spawn.id, birthTick: Game.time, state: States.harvest } };
  const canSpawn = spawn.spawnCreep(body, name, { ...memory, dryRun: true }) === OK;
  const creepsCount = _(Game.creeps).filter({ memory: { role } }).size();
  const sourcesCount = spawn.room.find(FIND_SOURCES_ACTIVE).length;
  const shouldSpawn = creepsCount < 4 * sourcesCount;
  if (canSpawn && shouldSpawn) {
    spawn.spawnCreep(body, name, memory);
  }
};

const trySpawnOrigin = trySpawn(Game.spawns.Origin);

const visualizePathStyle: PolyStyle = { stroke: "#ffff00", strokeWidth: 0.05, lineStyle: "solid" };

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`);

  trySpawnOrigin(blueprints[Roles.miner]);

  for (const creepId in Game.creeps) {
    const creep = Game.creeps[creepId];
    switch (creep.memory.role) {
      case Roles.miner:
        switch (creep.memory.state) {
          case States.harvest:
            if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
              const source = creep.room
                .find(FIND_SOURCES_ACTIVE)
                .find((s, i, sources) => creep.memory.birthTick % sources.length === i);
              if (source && creep.harvest(source) === ERR_NOT_IN_RANGE) {
                creep.moveTo(source, { visualizePathStyle });
              }
            } else {
              creep.switchState(States.transfer);
            }
            break;
          case States.transfer:
            if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
              const spawn = Game.getObjectById(creep.memory.spawnId);
              const controller = creep.room.controller;
              if (spawn && spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                if (creep.transfer(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                  creep.moveTo(spawn, { visualizePathStyle });
                }
              } else if (controller && creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
                creep.moveTo(controller, { visualizePathStyle });
              }
            } else {
              creep.switchState(States.harvest);
            }
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  }

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
});

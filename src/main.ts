import { Roles, States } from 'utils/enums';
import { CreepBlueprint } from 'utils/interfaces';
import { ErrorMapper } from 'utils/ErrorMapper';
import { roleFactory } from 'factories/role';

const blueprints: { [key: string]: CreepBlueprint } = {
  [Roles.miner]: { body: [MOVE, WORK, CARRY], role: Roles.miner },
  [Roles.builder]: { body: [MOVE, WORK, CARRY], role: Roles.builder },
};

const emoji: { [key: string]: string } = {
  [States.harvest]: '🌾',
  [States.transfer]: '💸',
  [States.build]: '🏗️',
};

Creep.prototype.switchState = function (state: States) {
  this.memory.state = state;
  this.say(emoji[state]);
};

const shouldSpawnRole: { [key: string]: (spawn: StructureSpawn) => boolean } = {
  [Roles.miner]: spawn => {
    const creepsCount = _(Game.creeps)
      .filter({ memory: { role: Roles.miner } })
      .size();
    const sourcesCount = spawn.room.find(FIND_SOURCES_ACTIVE).length;
    return creepsCount < 4 * sourcesCount;
  },
  [Roles.builder]: spawn => {
    const creepsCount = _(Game.creeps)
      .filter({ memory: { role: Roles.builder } })
      .size();
    const sitesCount = spawn.room.find(FIND_MY_CONSTRUCTION_SITES).length;
    return sitesCount > 0 && creepsCount < 4;
  },
};

const creepSpawnPriority = [Roles.miner, Roles.builder];

StructureSpawn.prototype.trySpawn = function ({ body, role }: CreepBlueprint) {
  const name = `${this.name} ${role} ${Game.time % 10000}`;
  const memory = { memory: { role, spawnId: this.id, birthTick: Game.time } };
  const canSpawn = this.spawnCreep(body, name, { ...memory, dryRun: true }) === OK;
  const shouldSpawn = shouldSpawnRole[role](this);
  if (canSpawn && shouldSpawn) {
    this.spawnCreep(body, name, memory);
  }
};

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`);

  for (const spawnId in Game.spawns) {
    const spawn = Game.spawns[spawnId];
    for (const role of creepSpawnPriority) {
      spawn.trySpawn(blueprints[role]);
    }
  }

  for (const creepId in Game.creeps) {
    const creep = Game.creeps[creepId];
    const role = roleFactory(creep);
    role.loop();
  }

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
});

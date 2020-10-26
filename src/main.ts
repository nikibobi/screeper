import { Roles, States } from 'utils/enums';
import { CreepBlueprint } from 'utils/interfaces';
import { ErrorMapper } from 'utils/ErrorMapper';
import { roleFactory } from 'factories/role';

const blueprints: { [key: string]: CreepBlueprint } = {
  [Roles.miner]: { body: [MOVE, WORK, CARRY], role: Roles.miner },
};

const emoji: { [key: string]: string } = {
  [States.harvest]: '🌾',
  [States.transfer]: '💸',
};

Creep.prototype.switchState = function (state: States) {
  this.memory.state = state;
  this.say(emoji[state]);
};

StructureSpawn.prototype.trySpawn = function ({ body, role }: CreepBlueprint) {
  const name = `${this.name} ${role} ${Game.time % 10000}`;
  const memory = { memory: { role, spawnId: this.id, birthTick: Game.time, state: States.harvest } };
  const canSpawn = this.spawnCreep(body, name, { ...memory, dryRun: true }) === OK;
  const creepsCount = _(Game.creeps).filter({ memory: { role } }).size();
  const sourcesCount = this.room.find(FIND_SOURCES_ACTIVE).length;
  const shouldSpawn = creepsCount < 4 * sourcesCount;
  if (canSpawn && shouldSpawn) {
    this.spawnCreep(body, name, memory);
  }
};

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`);

  Game.spawns.Origin.trySpawn(blueprints[Roles.miner]);

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

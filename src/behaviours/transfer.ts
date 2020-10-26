import Behavior from 'behavior';
import { States } from 'utils/enums';
import { yellowStyle as visualizePathStyle } from 'utils/polystyles';

export default class TransferBehavior extends Behavior {
  public loop(): void {
    const { creep } = this;
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
  }
}

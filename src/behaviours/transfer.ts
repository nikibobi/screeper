import Behavior from 'behavior';
import { States } from 'utils/enums';
import { yellowStyle as visualizePathStyle } from 'utils/polystyles';

export default class TransferBehavior extends Behavior {
  public loop(): void {
    const { creep } = this;
    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
      const spawn = Game.getObjectById(creep.memory.spawnId);
      const controller = creep.room.controller;
      const sites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
      const hasSite = sites && sites.length > 0 && sites.some(s => s.progress < s.progressTotal);
      const extensions = creep.room.find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_EXTENSION },
      }) as StructureExtension[];
      const hasExtension =
        extensions && extensions.length > 0 && extensions.some(e => e.store.getFreeCapacity(RESOURCE_ENERGY) > 0);

      if (hasSite) {
        const site = sites.sort((a, b) => b.progress - a.progress)[0];
        if (creep.build(site) === ERR_NOT_IN_RANGE) {
          creep.moveTo(site, { visualizePathStyle });
        }
      } else if (hasExtension) {
        const extension = extensions
          .filter(e => e.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
          .sort((a, b) => a.store.getFreeCapacity(RESOURCE_ENERGY) - b.store.getFreeCapacity(RESOURCE_ENERGY))[0];

        if (creep.transfer(extension, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(extension, { visualizePathStyle });
        }
      } else if (spawn && spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
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

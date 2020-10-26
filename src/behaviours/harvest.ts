import Behavior from 'behavior';
import { States } from 'utils/enums';
import { yellowStyle as visualizePathStyle } from 'utils/polystyles';

export default class HarvestBehavior extends Behavior {
  public loop(): void {
    const { creep } = this;
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
  }
}

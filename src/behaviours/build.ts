import Behavior from 'behavior';
import { yellowStyle as visualizePathStyle } from 'utils/polystyles';

export default class BuildBehavior extends Behavior {
  public loop(): void {
    const { creep } = this;
    const site = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
    if (site && creep.build(site) === ERR_NOT_IN_RANGE) {
      creep.moveTo(site, { visualizePathStyle });
    }
  }
}

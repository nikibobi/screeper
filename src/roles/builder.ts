import CreepRole from 'role';
import { States } from 'utils/enums';

export default class BuilderRole extends CreepRole {
  public constructor(creep: Creep) {
    super(creep);
    this.creep.switchState(States.harvest);
  }

  public loop(): void {
    if (this.isState(States.harvest) && this.creep.store.getFreeCapacity(RESOURCE_ENERGY) <= 0) {
      this.creep.switchState(States.build);
      return;
    }

    if (this.isState(States.build) && this.creep.store.getUsedCapacity(RESOURCE_ENERGY) <= 0) {
      this.creep.switchState(States.harvest);
      return;
    }

    super.loop();
  }
}

import Behavior from 'behavior';
import { Loopable } from 'utils/interfaces';
import { behaviorFactory } from 'factories/behaviour';

export default abstract class CreepRole implements Loopable {
  public constructor(protected creep: Creep) {}

  public loop(): void {
    const behavior: Behavior = behaviorFactory(this.creep);
    behavior.loop();
  }
}

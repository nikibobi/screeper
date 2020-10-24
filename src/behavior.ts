import { Loopable } from 'utils/interfaces';

export default abstract class Behavior implements Loopable {
  public constructor(protected creep: Creep) {}

  abstract loop(): void;
}

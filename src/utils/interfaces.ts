import { Roles } from './enums';

export interface CreepBlueprint {
  body: BodyPartConstant[];
  role: Roles;
}

export interface Loopable {
  loop(): void;
}

import BuilderRole from 'roles/builder';
import CreepRole from '../role';
import MinerRole from '../roles/miner';
import { Roles } from '../utils/enums';

const rolesMap: { [role: string]: new (creep: Creep) => CreepRole } = {
  [Roles.miner]: MinerRole,
  [Roles.builder]: BuilderRole,
};

export function roleFactory(creep: Creep): CreepRole {
  const { role } = creep.memory;

  if (!(role in rolesMap)) {
    throw new Error(`unknown role "${role}"`);
  }

  const T = rolesMap[role as Roles];

  return new T(creep);
}

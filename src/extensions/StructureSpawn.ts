import { CreepBlueprint } from 'utils/interfaces';

declare global {
  interface StructureSpawn {
    trySpawn(blueprint: CreepBlueprint): void;
  }
}

export {};

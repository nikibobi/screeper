// example declaration file - remove these and add your own custom typings

type States = "Harvest" | "Transfer";

// memory extension samples
interface CreepMemory {
  role: string;
  spawnId: Id<StructureSpawn>;
  birthTick: number;
  state: States;
}

interface Memory {
  uuid: number;
  log: any;
}

// `global` extension samples
declare namespace NodeJS {
  interface Global {
    log: any;
  }
}

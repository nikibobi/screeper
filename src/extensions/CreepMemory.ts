declare global {
  interface CreepMemory {
    role: string;
    spawnId: Id<StructureSpawn>;
    birthTick: number;
    state?: string;
  }
}

export {};

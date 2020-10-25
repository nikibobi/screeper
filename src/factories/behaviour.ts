import Behavior from '../behavior';
import BuildBehavior from 'behaviours/build';
import HarvestBehavior from '../behaviours/harvest';
import { IdleBehavior } from '../behaviours/idle';
import { States } from '../utils/enums';
import TransferBehavior from '../behaviours/transfer';

const stateToBehaviorMap: { [key: string]: new (creep: Creep) => Behavior } = {
  [States.idle]: IdleBehavior,
  [States.harvest]: HarvestBehavior,
  [States.transfer]: TransferBehavior,
  [States.build]: BuildBehavior,
};

export function behaviorFactory(creep: Creep): Behavior {
  const state = creep.memory.state || States.idle;

  if (!(state in stateToBehaviorMap)) {
    throw new Error(`unknown behavior "${state}"`);
  }

  const T = stateToBehaviorMap[state as States];

  return new T(creep);
}

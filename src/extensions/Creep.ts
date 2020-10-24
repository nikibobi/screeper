import { States } from 'utils/enums';

declare global {
  interface Creep {
    switchState(state: States): void;
  }
}

export {};

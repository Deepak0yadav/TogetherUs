/**
 * PlayerStateMachine — Gather-style: idle, walking, interacting, sitting, sleeping, locked.
 * Movement disabled when interacting; only IDLE and WALKING allow walking.
 */

const STATE = {
  IDLE: 'idle',
  WALKING: 'walking',
  INTERACTING: 'interacting',
  SITTING: 'sitting',
  SLEEPING: 'sleeping',
  LOCKED: 'locked',
};

export class PlayerStateMachine {
  constructor() {
    this._state = STATE.IDLE;
    this._interactObjectId = null;
  }

  get state() {
    return this._state;
  }

  isIdle() {
    return this._state === STATE.IDLE;
  }

  isWalking() {
    return this._state === STATE.WALKING;
  }

  isInteracting() {
    return this._state === STATE.SITTING || this._state === STATE.SLEEPING || this._state === STATE.INTERACTING || this._state === STATE.LOCKED;
  }

  canWalk() {
    return this._state === STATE.IDLE || this._state === STATE.WALKING;
  }

  enterIdle() {
    this._state = STATE.IDLE;
    this._interactObjectId = null;
  }

  enterWalking() {
    if (this.canWalk()) this._state = STATE.WALKING;
  }

  enterSitting(objectId) {
    this._state = STATE.SITTING;
    this._interactObjectId = objectId || null;
  }

  enterSleeping(objectId) {
    this._state = STATE.SLEEPING;
    this._interactObjectId = objectId || null;
  }

  enterInteracting(objectId) {
    this._state = STATE.INTERACTING;
    this._interactObjectId = objectId || null;
  }

  enterLocked() {
    this._state = STATE.LOCKED;
  }

  exitLocked() {
    if (this._state === STATE.LOCKED) this._state = STATE.IDLE;
  }
}

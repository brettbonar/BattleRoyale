import KEY_CODE from "../util/keyCodes.mjs"

const EVENTS = {
  MOVE_UP: "moveUp",
  MOVE_DOWN: "moveDown",
  MOVE_LEFT: "moveLeft",
  MOVE_RIGHT: "moveRight",
  PRIMARY_FIRE: "primaryFire",
  SECONDARY_FIRE: "secondaryFire",
  PREVIOUS_WEAPON: "previousWeapon",
  NEXT_WEAPON: "nextWeapon",
  USE: "use",
  FLY_UP: "flyUp",
  FLY_DOWN: "flyDown",
  SHOW_MAP: "showMap",
  SHOW_SCORES: "showScores",
  SHOW_MENU: "showMenu"
}

const eventsOrder = [
  EVENTS.MOVE_UP,
  EVENTS.MOVE_DOWN,
  EVENTS.MOVE_LEFT,
  EVENTS.MOVE_RIGHT,
  EVENTS.PRIMARY_FIRE,
  EVENTS.SECONDARY_FIRE,
  EVENTS.PREVIOUS_WEAPON,
  EVENTS.NEXT_WEAPON,
  EVENTS.USE,
  EVENTS.FLY_UP,
  EVENTS.FLY_DOWN,
  EVENTS.SHOW_MAP,
  EVENTS.SHOW_SCORES,
  EVENTS.SHOW_MENU
];

const defaultKeyBindings = {
  [EVENTS.MOVE_UP]: KEY_CODE.W,
  [EVENTS.MOVE_DOWN]: KEY_CODE.S,
  [EVENTS.MOVE_LEFT]: KEY_CODE.A,
  [EVENTS.MOVE_RIGHT]: KEY_CODE.D,
  [EVENTS.USE]: KEY_CODE.E,
  [EVENTS.PREVIOUS_WEAPON]: KEY_CODE.Q,
  [EVENTS.NEXT_WEAPON]: KEY_CODE.R,
  [EVENTS.SHOW_MAP]: KEY_CODE.M,
  [EVENTS.FLY_UP]: KEY_CODE.SPACE,
  [EVENTS.FLY_DOWN]: KEY_CODE.SHIFT,
  [EVENTS.SHOW_SCORES]: KEY_CODE.TAB,
  [EVENTS.SHOW_MENU]: KEY_CODE.ESCAPE,
  [EVENTS.PRIMARY_FIRE]: "leftClick",
  [EVENTS.SECONDARY_FIRE]: "rightClick"
};

let keyBindings = _.cloneDeep(defaultKeyBindings);

export {
  EVENTS,
  eventsOrder,
  defaultKeyBindings,
  keyBindings
}

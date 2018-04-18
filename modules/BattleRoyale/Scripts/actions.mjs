let actions = {};

actions.prowl = {
  type: "script",
  name: "prowl",
  action: {
    name: "prowl",
    actionDuration: 0,
    actionType: "channeling",
    automatic: false,
    animationType: "stealth",
    manaCost: 0
  },
  effect: {
    runScript: "Prowl"
  }
};

export default actions;

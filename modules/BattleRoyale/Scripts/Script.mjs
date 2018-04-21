import Prowl from "./Prowl.mjs"
import EntryPortals from "./EntryPortals.mjs"

function createScript(type, params) {
  if (type === "Prowl") {
    return new Prowl(params);
  } else if (type === "EntryPortals") {
    return new EntryPortals(params);
  } else {
    console.log("No script for ", type);
  }
}

export default createScript;

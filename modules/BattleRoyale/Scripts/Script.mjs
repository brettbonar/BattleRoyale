import Prowl from "./Prowl.mjs"

function createScript(type, params) {
  if (type === "Prowl") {
    return new Prowl(params);
  } else {
    console.log("No script for ", type);
  }
}

export default createScript;

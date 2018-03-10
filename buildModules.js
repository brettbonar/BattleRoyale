const fs = require("fs");
const _ = require("lodash");

let path = __dirname + "/modules/";

function getModuleSpec(file) {
  let start = file.indexOf("=", file.indexOf("modulespec")) + 1;
  let moduleSpecStr = file.substring(start, file.indexOf("};", start) + 1);
  return JSON.parse(moduleSpecStr);
}

function getClientImport(clientImport) {
  // let pieces = clientImport.split(".");
  // let importName = pieces[0];
  // let moduleName = pieces[0];
  // if (pieces.length > 0) {
  //   moduleName = pieces[1];
  // }

  // return ";import " + importName + " from " + moduleName + ";";
  return clientImport;
}

function getClientExports(clientExports) {
  return ";export {" + clientExports.join(",") + " };";
}

function getClientDefaultExport(defaultExport) {
  return ";export default " + defaultExport + ";";
}

function getServerExports(serverExports) {
  return "module.exports = {" + serverExports.map((exp) => {
    return exp + ":" + exp;
  }).join(",") + "};";
}

function getServerDefaultExport(defaultExport) {
  return ";module.exports = " + defaultExport + ";";
}

function writeClientModule(path, moduleSpec, fileData) {
  let imports = "";
  if (moduleSpec.clientImports) {
    imports = moduleSpec.clientImports.join(";") + ";";
  }
  
  let exp = "";
  if (moduleSpec.exports) {
    exp = getClientExports(moduleSpec.exports);
  }
  if (moduleSpec.default) {
    exp += getClientDefaultExport(moduleSpec.default);
  }

  fs.writeFileSync(path, imports.concat(fileData).concat(exp));
}

function writeServerModule(path, moduleSpec, fileData) {
  let imports = "";
  if (moduleSpec.serverImports) {
    imports = moduleSpec.serverImports.join(";") + ";";
  }
  
  let exp = "";
  if (moduleSpec.exports) {
    exp = getServerExports(moduleSpec.exports);
  }
  if (moduleSpec.default) {
    exp += getServerDefaultExport(moduleSpec.default);
  }

  fs.writeFileSync(path, imports.concat(fileData).concat(exp));
}

function buildModules(params) {
  let fileData = params.data.toString();
  let moduleSpec = getModuleSpec(fileData);
  
  writeClientModule(params.clientOut + params.file, moduleSpec, fileData);
  writeServerModule(params.serverOut + params.file, moduleSpec, fileData);
}

fs.readdir(path, (err, files) => {
  for (const file of files) {
    fs.readFile(path + file, (err, data) => {
      console.log("File: ", file);
      buildModules({
        file: file,
        data: data,
        clientOut: __dirname + "/public/libs/",
        serverOut: __dirname + "/libs/"
      });
    });
  }
});


// module.exports = {
//   getDistance: getDistance,
//   normalize: normalize
// };

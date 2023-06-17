import fs from "fs";
import meta from "./package.json" assert { type: "json" };

const args = process.argv.slice(2);

console.log(args);

args.forEach((path) => {
  fs.readFile(path, "utf8", (err, data) => {
    if (err) {
      return console.log(err);
    }
    var result = data.replace(/process\.env\.FLOWCONNECT_VERSION/g, `"${meta.version}"`);

    fs.writeFile(path, result, "utf8", (err) => {
      if (err) return console.log(err);
    });
  });
});

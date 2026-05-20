import fs from "fs";
import path from "path";

const meta = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "package.json"), "utf8"));

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

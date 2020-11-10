import fs from "fs";
import dotenv from "dotenv"
import scrapper from "./scrapper.js"
import sender from "./sender.js";
dotenv.config();

(async () => {
    const ret = await scrapper.getData();

    const old = JSON.parse(fs.readFileSync("out.json", {encoding: 'utf8', flag: 'r'}));

    const difference = scrapper.detectChanges(old, ret);

    fs.writeFile("out.json", JSON.stringify(ret), err => {
        if (err) return console.log(err);
    });
    sender.sendChangeNotice(difference);
})();
import fs from "fs";
import dotenv from "dotenv"
import scrapper from "./scrapper.js"
dotenv.config();


(async () => {
    const ret = await scrapper.getData();

    fs.writeFile("out.json", JSON.stringify(ret), err => {
        if (err) return console.log(err);
        console.log('written');
    });
})();
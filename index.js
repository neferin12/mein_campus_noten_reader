import fs from "fs";
import dotenv from "dotenv"
import scrapper from "./scrapper.js"
import sender from "./sender.js";
dotenv.config();

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

(async () => {
    // noinspection InfiniteLoopJS
    while (true) {
        try {
            console.log("Checking...");
            const ret = await scrapper.getData();
            console.log("Got data");
            if (!(ret instanceof Error)) {
                if (fs.existsSync("./out.json")) {
                    console.log("Reading old data");
                    const old = JSON.parse(fs.readFileSync("out.json", {encoding: 'utf8', flag: 'r'}));

                    const difference = scrapper.detectChanges(old, ret);

                    if (difference.length > 0) {
                        console.log("Differences found")
                        sender.sendChangeNotice(difference);
                    } else {
                        console.log("No differences");
                    }

                }

                if (ret) {
                    console.log("Writing file");
                    fs.writeFile("out.json", JSON.stringify(ret), err => {
                        if (err) return console.log(err);
                    });
                }
            } else {
                console.error("Non Fatal Error: "+ret.name);
            }
        } catch (e){
            console.error(e);
        }

        await sleep(60 * 1000);
    }
})();

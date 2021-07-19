import fs from "fs";
import dotenv from "dotenv"
import scrapper, {initScrapper} from "./scrapper"
import sender from "./sender";
import Notenspiegel from "./Notenspiegel";
dotenv.config();

function sleep(ms): Promise<any> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}



(async () => {
    let puppet = await initScrapper();

    // noinspection InfiniteLoopJS
    while (true) {
        try {
            console.log("Checking...");
            const ret = await scrapper.getData(puppet);
            console.log("Got data");
            const n = new Notenspiegel(ret);
            if (!(ret instanceof Error || !ret)) {
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
            } else if(ret && ret["name"]){
                console.error("Non Fatal Error: "+ret.name);
            }
        } catch (e){
            console.error(e);
            await puppet.browser.close();
            puppet = await initScrapper();
        }

        await sleep(60 * 1000);
    }
})();

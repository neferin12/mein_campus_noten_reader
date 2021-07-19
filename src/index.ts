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

process.on('SIGTERM', () => process.exit());


console.log("Started");

(async () => {
    let puppet = await initScrapper();

    // noinspection InfiniteLoopJS
    do {
        try {
            console.log("Checking...");
            const ret = await scrapper.getData(puppet);
            console.log("Got data");
            let notenspiegel: Notenspiegel;
            try {
                notenspiegel = new Notenspiegel(ret);
            } catch (e) {
                console.error(e);
                console.error("Trying again...")
                continue;
            }
            if (!(ret instanceof Error || !ret)) {
                if (fs.existsSync("./out.json")) {
                    console.log("Reading old data");
                    const oldJson = JSON.parse(fs.readFileSync("out.json", {encoding: 'utf8', flag: 'r'}));

                    // const difference = scrapper.detectChanges(old, ret);
                    const differences = notenspiegel.findDifferences(oldJson);
                    if (differences.length > 0) {
                        console.log("Differences found")
                        sender.sendChangeNotice(differences);
                    } else {
                        console.log("No differences");
                    }

                }

                if (notenspiegel) {
                    console.log("Writing file");
                    fs.writeFile("out.json", JSON.stringify(notenspiegel.all), err => {
                        if (err) return console.log(err);
                    });
                }
            } else if (ret && ret["name"]) {
                console.error("Non Fatal Error: " + ret.name);
            }
        } catch (e) {
            console.error(e);
            await puppet.browser.close();
            puppet = await initScrapper();
        }

        // await sleep(60 * 1000);
    }while (false)
    await puppet.browser.close();

})();

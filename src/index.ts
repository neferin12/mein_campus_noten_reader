import fs from "fs";
import dotenv from "dotenv"
import sender from "./sender";
import Notenspiegel from "./Notenspiegel";
import Scrapper from "./Scrapper";
import {log} from "./Logger";
import {version} from "../package.json";

dotenv.config();




function sleep(ms): Promise<any> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

process.on('SIGTERM', () => process.exit());


(async () => {
    log.info("Started Campus Reader v"+version);

    let puppet = await Scrapper.initScrapper();

    // noinspection InfiniteLoopJS
    do {
        try {
            log.info("Checking...");
            const ret = await Scrapper.timeout(30000, () => puppet.getData());
            log.debug("Got data");
            let notenspiegel: Notenspiegel;
            try {
                notenspiegel = new Notenspiegel(ret);
            } catch (e) {
                log.error(e);
                log.debug("Trying again...")
                continue;
            }
            if (ret) {
                if (fs.existsSync("./out.json")) {
                    log.debug("Reading old data");
                    const oldJson = JSON.parse(fs.readFileSync("out.json", {encoding: 'utf8', flag: 'r'}));
                    if (oldJson.length/2 > notenspiegel.length) {
                        log.debug("Found invalid data (too few entries)");
                        continue;
                    }
                    // const difference = scrapper.detectChanges(old, ret);
                    const differences = notenspiegel.findDifferences(oldJson);
                    if (differences.length > 0) {
                        log.info("Differences found")
                        sender.sendChangeNotice(differences);
                    } else {
                        log.info("No differences");
                    }

                }

                if (notenspiegel) {
                    log.debug("Writing file");
                    fs.writeFile("out.json", JSON.stringify(notenspiegel.all), err => {
                        if (err) log.error(err);
                    });
                }
            }
        } catch (e) {
            log.error(e);
            puppet = await Scrapper.initScrapper();
        }

        await sleep(60 * 1000);
    } while (true)
    // noinspection UnreachableCodeJS
    await puppet.close();

})();

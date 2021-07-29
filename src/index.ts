import fs from "fs";
import dotenv from "dotenv"
import sender from "./sender";
import Notenspiegel from "./Notenspiegel";
import {Logger} from "tslog";
import Scrapper from "./Scrapper";

dotenv.config();
// @ts-ignore
export const log: Logger = new Logger({minLevel: process.env.LOG_LEVEL || "info"});


function sleep(ms): Promise<any> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

process.on('SIGTERM', () => process.exit());


log.debug("Started");

(async () => {
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

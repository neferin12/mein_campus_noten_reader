import fs from "fs";
import dotenv from "dotenv"
import scrapper, {initScrapper} from "./scrapper"
import sender from "./sender";
import Notenspiegel from "./Notenspiegel";
import {Logger} from "tslog";

dotenv.config();
// @ts-ignore
export const log: Logger = new Logger({minLevel: process.env.LOG_LEVEL | "info"});


function sleep(ms): Promise<any> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

process.on('SIGTERM', () => process.exit());


log.debug("Started");

(async () => {
    let puppet = await initScrapper();

    // noinspection InfiniteLoopJS
    do {
        try {
            log.info("Checking...");
            const ret = await scrapper.getData(puppet);
            log.debug("Got data");
            let notenspiegel: Notenspiegel;
            try {
                notenspiegel = new Notenspiegel(ret);
            } catch (e) {
                log.error(e);
                log.debug("Trying again...")
                continue;
            }
            if (!(ret instanceof Error || !ret)) {
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
            } else if (ret && ret["name"]) {
                log.error("Non Fatal Error: " + ret.name);
            }
        } catch (e) {
            log.error(e);
            await puppet.browser.close();
            puppet = await initScrapper();
        }

        // await sleep(60 * 1000);
    } while (false)
    await puppet.browser.close();

})();

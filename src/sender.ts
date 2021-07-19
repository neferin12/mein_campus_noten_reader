import nodemailer from "nodemailer";
import dotenv from "dotenv";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import Mail from "nodemailer/lib/mailer";
import Entry from "./Entry";
import {log} from "./index";

dotenv.config();

const env = process.env;
let transporter = nodemailer.createTransport({
    host: env.SMTP_SERVER,
    port: 587,
    secure: false,
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD
    },
    requireTLS: true
}, {
    from: '"Notencrawler" ' + env.SMTP_USER,
    to: env.MAILTO,
    priority: 'high'
});

function send(message: Mail.Options, force: boolean = false) {
    if (env.ENABLE_MAILING !== "false" || force) {
        transporter.verify(function (error, success) {
            if (error) {
                log.error(error);
            } else {
                transporter.sendMail(message).then(() => log.info("Mail versendet")).catch(e => log.error(e));
            }
        });

    } else {
       log.info("Keine Mail versendet (deaktiviert)")
    }
}

function sendTestmessage() {
    send({
        subject: "Test",
        html: "<p>Das ist eine <b>Testnachricht</b><br>Eingebettetes Bild:</p><img src='cid:attachmentImage@jp-studios.de'/>",
        attachments: [{
            filename: "testimage.png",
            path: "./testimage.png",
            cid: "attachmentImage@jp-studios.de"
        }]
    }, true)
}

function sendChangeNotice(entries: Array<Entry>) {
    let html = [];
    html.push("<h3>Es gab eine Notenänderung</h3><h5>Geänderte Einträge:</h5><hr><ul>");
    for (const entry of entries) {
        html.push(`<li>${entry.toHTML()}</li>`)
    }
    html.push("</ul><hr><h5>Deine momentane Notenübersicht:</h5><img src='cid:gradesummary@jp-studios.de' alt='Notenübersicht'/>");
    send({
        subject: "Notenänderung!",
        html: html.join(""),
        attachments: [{
            filename: "notenspiegel.png",
            path: "./notenspiegel.png",
            cid: "gradesummary@jp-studios.de"
        }]
    })
}


export default {
    send, sendTestmessage, sendChangeNotice
}

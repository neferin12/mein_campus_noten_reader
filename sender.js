import nodemailer from "nodemailer";
import dotenv from "dotenv";

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
    tls: {
        requireTLS: true
    }
}, {
    from: '"Notencrawler" ' + env.SMTP_USER,
    to: env.MAILTO,
    priority: 'high'
});

function send(message) {

    transporter.verify(function (error, success) {
        if (error) {
            console.log(error);
        } else {
            transporter.sendMail(message)
        }
    });
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
    })
}

function sendChangeNotice(entries) {
    let html = [];
    html.push("<h4>Diese Prüfungen wurden hinzugefügt:</h4><ul>");
    for (const entry of entries) {
        html.push(`<li><b>${entry["Prüfungstext"]}</b> (${entry["#"]}): <b>${entry["Note"]}</b></li>`)
    }
    html.push("</ul><h5>Deine momentane Notenübersicht:</h5><img src='cid:gradesummary@jp-studios.de' alt='Notenübersicht'/>");
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

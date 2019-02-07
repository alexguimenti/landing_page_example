const express = require("express");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const path = require("path");
const nodemailer = require("nodemailer");
const hbs = require("express-hbs");
var request = require('request');

const app = express();

app.engine(
    "hbs",
    hbs.express4({
        partialsDir: __dirname + "/views/partials"
    })
);
app.set("view engine", "hbs");
app.set("views", __dirname + "/views");

// Static folder
app.use("/public", express.static(path.join(__dirname, "public")));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.render("contact");
});

app.get("/2", (req, res) => {
    res.render("contact2");
});

app.get("/inbound", (req, res) => {
    res.render("inbound");
});

app.get("/send", (req, res) => {
    res.render("contact");
});

app.post("/send", (req, res) => {

    // variables
    var contactId;
    var compId;
    var dId;
    var faturamento = 0;
    var platforms = ["Nao Compativel 1", "Nao Compativel 2",];

    const output = `
    <p>You have a new contact request</p>
    <ul>
        <li>Nome: ${req.body.firstname}</li>
        <li>Sobrenome: ${req.body.lastname}</li>
        <li>Empresa: ${req.body.company}</li>
        <li>Cnpj: ${req.body.cnpj}</li>
        <li>Website: ${req.body.website}</li>
        <li>Email: ${req.body.email}</li>
        <li>Telefone: ${req.body.phone}</li>
        <li>Plataforma: ${req.body.platform}</li>
        <li>Tier: ${req.body.tier}</li>
        <li>Provedor Atual: ${req.body.provider}</li>
        <li>Menssagem: ${req.body.message}</li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.message}</p>
    `;

    "use strict";
    const nodemailer = require("nodemailer");

    // async..await is not allowed in global scope, must use a wrapper
    async function main() {

        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        let account = await nodemailer.createTestAccount();

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: "alexguimenti90@gmail.com", // generated ethereal user
                pass: "Xandigui89#" // generated ethereal password
            }
        });

        // setup email data with unicode symbols
        let mailOptions = {
            from: '"Inbound 👻" <inbound@mexpay.com>', // sender address
            to: "alexguimenti90@gmail.com", // list of receivers
            subject: "Hello ✔", // Subject line
            text: "Hello world?", // plain text body
            html: output // html body
        };

        // send mail with defined transport object
        let info = await transporter.sendMail(mailOptions)

        console.log("Message sent: %s", info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

        const request = require('request')

        request.post("https://api.hubapi.com/contacts/v1/contact?hapikey=ae33d527-7fcc-4f17-ad03-2ed8c5b4e6fb", {
            json: {
                "properties": [
                    {
                        "property": "firstname",
                        "value": req.body.firstname
                    },
                    {
                        "property": "lastname",
                        "value": req.body.lastname
                    },
                    {
                        "property": "email",
                        "value": req.body.email
                    },
                    {
                        "property": "phone",
                        "value": req.body.phone
                    }
                ]
            }
        }, (error, res, body) => {
            if (error) {
                console.error(error)
                return
            }

            contactId = body.vid;
            // console.log("contact id: " + contactId);

            // console.log(`statusCode: ${res.statusCode}`);

            request.post("https://api.hubapi.com/companies/v2/companies?hapikey=ae33d527-7fcc-4f17-ad03-2ed8c5b4e6fb", {
                json: {
                    "properties": [
                        {
                            "name": "name",
                            "value": req.body.company
                        }
                    ]
                }
            }, (error, res, body) => {
                if (error) {
                    console.error(error)
                    return
                }

                compId = body.companyId;
                // console.log("company id: " + compId)


                //console.log(`statusCode: ${res.statusCode}`)
                //console.log(body)

                request.post("https://api.hubapi.com/deals/v1/deal?hapikey=ae33d527-7fcc-4f17-ad03-2ed8c5b4e6fb",
                    {
                        json: {
                            "properties": [
                                {
                                    "value": req.body.company,
                                    "name": "dealname"
                                },
                                {
                                    "name": "url",
                                    "value": req.body.url
                                },
                                {
                                    "name": "plataforma",
                                    "value": req.body.platform
                                },
                                {
                                    "name": "amount",
                                    "value": req.body.tier
                                },
                                {
                                    "name": "tier",
                                    "value": req.body.tier
                                },
                                {
                                    "name": "cnpj",
                                    "value": req.body.cnpj
                                },
                                {
                                    "name": "provider",
                                    "value": req.body.provider
                                },
                                {
                                    "value": "appointmentscheduled",
                                    "name": "dealstage"
                                },
                                {
                                    "value": "default",
                                    "name": "pipeline"
                                },
                                {
                                    "value": 34970470,
                                    "name": "hubspot_owner_id"
                                },
                                {
                                    "value": req.body.message,
                                    "name": "message"
                                },
                                {
                                    "value": "newbusiness",
                                    "name": "dealtype"
                                }
                            ]
                        }
                    }, (error, res, body) => {
                        if (error) {
                            console.error(error)
                            return


                        }

                        console.log(req.body.platform)

                        dId = body.dealId;

                        // check compatibility


                        if (platforms.includes(req.body.platform)) {
                            request.put(`https://api.hubapi.com/deals/v1/deal/${dId}?hapikey=ae33d527-7fcc-4f17-ad03-2ed8c5b4e6fb`, {
                                json: {
                                    "properties": [
                                        {
                                            "name": "dealstage",
                                            "value": "1e073713-798c-43a1-99d5-d68ffe188036"
                                        }
                                    ]
                                }
                            }, (error, res, body) => {
                                if (error) {
                                    console.error(error)
                                    return
                                }

                            });
                        }

                        request.put(`https://api.hubapi.com/deals/v1/deal/${dId}/associations/CONTACT?id=${contactId}&hapikey=ae33d527-7fcc-4f17-ad03-2ed8c5b4e6fb`, (error, res, body) => {
                            if (error) {
                                console.error(error)
                                return
                            }
                            //console.log(`statusCode: ${res.statusCode}`)
                            //console.log(body)
                        })
                        request.put(`https://api.hubapi.com/deals/v1/deal/${dId}/associations/COMPANY?id=${compId}&hapikey=ae33d527-7fcc-4f17-ad03-2ed8c5b4e6fb`, (error, res, body) => {
                            if (error) {
                                console.error(error)
                                return
                            }
                            //console.log(`statusCode: ${res.statusCode}`)
                            //console.log(body)

                        })


                    });

            });

        });

        res.render("contact", { msg: "Seu email foi enviado! Entraremos em contato em breve." });

        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    }

    main().catch(console.error);

});




app.listen(3000, () => console.log("Server started on port 3000!"));
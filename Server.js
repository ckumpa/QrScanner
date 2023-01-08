const http = require("http");
const express = require("express");   /* Accessing express module */
const app = express();  /* app is a request handler function */
const bodyParser = require("body-parser"); /* To handle post parameters */
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, '.env') })
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.set('views', __dirname + '/views');

portNumber = 5001
const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const databaseAndCollection = {db: process.env.MONGO_DB_NAME, collection: process.env.MONGO_COLLECTION};
const { MongoClient, ServerApiVersion } = require('mongodb');

var client = null;
async function main() {
    const uri = `mongodb+srv://${userName}:${password}@cluster0.pzsxtoz.mongodb.net/?retryWrites=true&w=majority`;
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    await client.connect();
}
main().catch(console.error);

app.get("/", (request, response) => {
    response.render(__dirname + '/index.ejs');
});

app.post("/scanned", async (request, response) => {
    const result = request.body.inputbox;
    const entry = await lookUpOneEntry(client, databaseAndCollection, result);
    process.stdout.write(entry);
    const variables = 
        {firstname: entry.firstname, 
        lastname: entry.lastname, 
        email: entry.email,
        dietaryrestrictions: entry.dietaryrestrictions, 
        phonenumber: entry.phonenumber, 
        numbertickets: entry.numbertickets,
        guests: entry.guests, 
        venmo: entry.venmo
        };
    await client.close();
    response.render("../views/scanned.ejs", variables);
})


app.listen(portNumber);
process.stdout.write(`Webserver started and running at http://localhost:${portNumber}\n`);
async function lookUpOneEntry(client, databaseAndCollection, email) {
    let filter = {email: email};
    const result = await client.db(databaseAndCollection.db)
                        .collection(databaseAndCollection.collection)
                        .findOne(filter);
    
    if (result) {
        console.log(result);
        return result;
    } else {
        return `No entry found with name ${email}`;
    }
}
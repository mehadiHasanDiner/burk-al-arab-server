const express = require('express')
// const bodyParser = require('body-parser');
const bodyParser = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
// 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ctgcy.mongodb.net/burjArab?retryWrites=true&w=majority`;
const port = 5000

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


var serviceAccount = require("./configs/burj-al-arab-firebase-practice-firebase-adminsdk-vrgxc-611a0e154e.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});





const password = "arabinHotel626";


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookings = client.db("burjArab").collection("booking");

  app.post('/addBooking', (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking)
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  })

  app.get('/bookings', (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith('Bearer ')) {
      const idToken = bearer.split(' ')[1];
      admin.auth().verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;
          if (tokenEmail == queryEmail) {
            bookings.find({ email: queryEmail })
              .toArray((err, documents) => {
                res.status(200).send(documents);
              })
          }
        })
        .catch((error) => {
      res.status(401).send('Unauthorized  Access')
        });
    }
    else {
      res.status(401).send('Unauthorized  Access')
    }

  })
});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port)


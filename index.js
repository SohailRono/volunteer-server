const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

const app = express();
require('dotenv').config();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('task'));
app.use(fileUpload());
const port = 3001


const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.on0vi.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const taskCollection = client.db("volunteerDb").collection("tasks");
  const userCollection = client.db("volunteerDb").collection("users");

  app.get('/getalltask', (req, res) => {
    const task = taskCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  });

  app.get('/gettaskById/:id', (req, res) => {
    taskCollection.find({ _id: ObjectId(req.params.id) })
      .toArray((err, documents) => {
        res.send(documents[0]);
      })
  });

  app.post('/addusertask', (req, res) => {
    const user = req.body;
    userCollection.insertOne(user)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  });

  app.get('/usertaskByEmail', (req, res) => {
    const email = req.query.email;
    console.log(email)
    userCollection.find({ email: email })
      .toArray((err, documents) => {
        res.send(documents);
      })
  });

  app.delete('/deleteUserTaskById/:id', (req, res) => {
    userCollection.deleteOne({ _id: ObjectId(req.params.id) })
      .then(result => {
        res.send(result.deletedCount > 0)
      })
  });

  app.get('/getAllUsers', (req, res) => {
    userCollection.find({})
      .toArray((err, document) => {
        res.send(document);
      })
  });

  app.post('/addTask', (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;
    const date = req.body.date;
    
    file.mv(`${__dirname}/task/${file.name}`, err => {
      if(err){
        console.log(err);
        return res.status(500).send({msg:'File upload fail'});
      }
      taskCollection.insertOne({title,background:description,img:file.name})
      .then(result => {
        res.send(result.insertedCount>0);
      })
      return res.send({name:file.name, path: `/${file.name}`})
    })
  })

});



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


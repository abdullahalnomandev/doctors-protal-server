const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const cors = require('cors')
const port = 5000 || process.env.PORT;

require('dotenv').config()
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ez7qy.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });;


app.use(cors())
app.use(express.json())
app.use(express.static('doctors'))
app.use(fileUpload());

client.connect(err => {
    console.log(err);
    const appointmentCollection = client.db("doctorsportal").collection("bokingappionment");
    const doctorsCollection = client.db("doctorsportal").collection("doctors");

    app.post('/AddAppointment', (req, res) => {

        const appointment = req.body;
        appointmentCollection.insertOne(appointment)


            .then(result => {
                res.send(result.insertedCount > 0)
            })

    })


    app.post('/appointmentsByDate', (req, res) => {
        const date = req.body;
        const email = req.body.email;
        doctorsCollection.find({ email: email })

            .toArray((err, doctors) => {
                const filter = { date: date.date }
                if (doctors.length === 0) {
                    filter.email = email;
                }
                appointmentCollection.find(filter)
                    .toArray((err, documents) => {
                        console.log(email, date.date, doctors, documents)
                        res.send(documents);
                    })
            })
    })


    app.get('/appointments', (req, res) => {

        appointmentCollection.find({})
            .toArray((err, appointment) => {

                res.send(appointment)
            })
    })



    // app.post('/addDoctor',(req,res)=>{

    //     const name = req.body.name;
    //     const email = req.body.email;
    //     const file = req.files.file;


    //     file.mv(`${__dirname}/doctors/${file.name}`,err => {

    //         if( err){
    //             console.log(err);
    //             return res.status(500).send({msg:'Failed to upload Image'});
    //         }

    //         return res.send({name:file.name,path:`/${file.name}`})
    //     })

    //     console.log(name,email,file);
    // })

    app.post("/addDoctor", (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        const photoName = file.name;
        console.log(name, email, file);
        
        file.mv(`${__dirname}/doctors/${file.name}`, (err) => {
            if (err) {
                console.log();
                return res.status(500).send({
                    msg: "Failed to upload image in the server",
                });
            }
            return res.send({
                name: file.name,
                path: `/${file.name}`,
            });
        });
        doctorsCollection.insertOne({
            name,
            email,
            photoName: file.name,
        }).then((result) => {
            console.log(result);
        });
    });


    app.get('/doctors', (req, res) => {
        doctorsCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });


    app.post('/isDoctor', (req, res) => {

        const email = req.body.email;
        
        doctorsCollection.find({ email: email })

            .toArray((err, doctors) => {

                    res.send(doctors.length > 0)
            })


    })


})


app.listen(port, () => console.log('listening port 5000'))
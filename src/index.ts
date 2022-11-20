import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
const compression = require("compression");
const app = express();

app.use(compression()); 
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

const MONGODB_URI:string = 'mongodb://localhost:27017/testtype';
mongoose.connect(MONGODB_URI).then(
    () => { console.log('MongoDB connected'); },
  ).catch((err: Error) => {
    console.log('MongoDB connection error. Please make sure MongoDB is running. ' + err);
    process.exit();
});

const logroutes = require("./controllers/logs");
app.use("/logs", logroutes);


app.get('/*', (req, res) => {
    res.sendFile('public/index.html', { root: __dirname });
})
  
app.listen(5000,()=> console.log('Server running'));
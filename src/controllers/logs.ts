import * as express from 'express';
const app = express.Router()
var multer = require('multer');
const path = require("path")
var fs = require('fs');


const UPLOAD_PATH = './files/import/'
// const upload = multer({ dest: `${UPLOAD_PATH}/`});

var storage = multer.diskStorage({
    destination: function (req: any, file: any, cb: any) {
        cb(null, UPLOAD_PATH)
    },
    filename: function (req: any, file: any, cb: any) {
        cb(null, file.fieldname + "-" + Date.now() + ".log")
    }
})


const maxSize = 1 * 1000 * 1000;

var upload = multer({
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: function (req: any, file: any, cb: any) {

        // Set the filetypes, it is optional
        var filetypes = /log/;
        console.log('file = ',file)
        var mimetype = file.originalname.match(/\.(log)$/);
         
        // var mimetype = filetypes.test(file.mimetype);
       
        var extname = filetypes.test(path.extname(
            file.originalname).toLowerCase());
        console.log('mimetype == ',mimetype)
        console.log('extname == ',extname)
        if (mimetype && extname) {
            return cb(null, true);
        }else{

        cb("Error: File upload only supports the "
            + "following filetypes - " + filetypes);
            return
        }
    }
}).single("file_url");



app.post('/import', function (req: any, res) {
    upload(req, res, function (err: any) {
        if (err) {
            res.json({ error: 'invalid_details', error_description: err });
            return
        }
        if (!req.file) {
            res.json({ error: 'invalid_details', error_description: 'File is required.' });
            return;
        }
        fs.readFile(req.file.path, "utf8", (err:any, data:any) => {
            const logs = data.split('\n');
            let content=[]
            
            for (let i=0;i<logs.length;i++){
              var logdata=logs[i].split(" - ");
              var timestamp = new Date(logdata[0]); 
              var isodate = timestamp.getTime(); 

              var datajson=JSON.parse(logdata[2]);

              let da={
                timestamp:isodate,
                loglevel:logdata[1],
                transactionId:datajson.transactionId,
                details:datajson.details,
                err:datajson.err?datajson.err:''
              }
              content.push(da)
            }
            res.json(content)
          });
    })
})
module.exports = app
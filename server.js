const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
const EventEmitter = require("events");


const dbName = "imgDB";
const collectionName = "images";
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

const eventEmitter = new EventEmitter();
const storage = multer.diskStorage({
    destination: "./public/assets/images/",
    filename: function(req, file, cb){
        cb(null, file.fieldname + "-" + Date.now() + "-" + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage
}).single("myImage");


const app = express();
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

const PORT = process.env.PORT || 3000;

var items = new Array();

function retreiveData(){
    var store = new Array();
    client.connect(function(err){
        assert.equal(err, null);
        const db = client.db(dbName);
        const collection = db.collection(collectionName);


        collection.find({}).toArray(function(err, result){
            assert.equal(err, null);
            console.log(result);
            for(var i=0; i < result.length; i++){
                var newObj = {
                    memoryName: result[i].memoryName,
                    imgUrl: result[i].imgUrl,
                    library: result[i].library
                };
                store.push(newObj);
            }
        }); 
    });
    return store;
}
items = retreiveData();
var uploadErr = 0;
app.listen(PORT, () => {
    console.log("Server is listening on port 3000.");
});

app.get("/", (req, res) => {
    res.redirect("/login");
});

app.get("/logout", (req, res) => {
    res.redirect("/");
})

app.get("/login", (req, res) => {

    res.render("login");
});

app.post("/login", (req, res) => {

    var username = req.body.username;
    res.redirect("/"+username);
});

app.get("/upload", (req, res) => {
    res.status(404);
    res.send("<h1>400 Not Found</h1><br /><p>Please head back to the library</p>");
});

app.get("/about", (req, res) => {
    res.send("<h1>About Page </h1>");
});

app.get("/:username/upload", (req, res) => {
    var username = req.params.username;
    if (uploadErr === 0){
        res.render("upload", {msg : undefined, id: username});
    }
    else {
        uploadErr = 0;
        res.render("upload", {msg : "There was an error, please try again", id: username});
    }
    

});

app.post("/:username/upload", (req, res) => {
    var username = req.params.username;
    upload(req, res, (err) => {
        if (err){
            uploadErr = 1;
            res.redirect("/"+username+"/upload")
        }
        else{
            console.log(req.file);
            var item = {
                imgUrl: req.file.filename,
                memoryName: req.body.memText,
                library: username
            }
            client.connect(function(err){
                assert.equal(err, null);
                const db = client.db(dbName);
                const collection = db.collection(collectionName);
        
        
                collection.insertOne(item, function(err, result){
                    assert.equal(err, null);
                });
            });
            items.push(item);
            res.redirect("/"+username);
        }
    });

    

    
});

app.get("/:username", (req, res) => {
    console.log("The username received is : " + req.path);
    var username = req.params.username;
    console.log(items);

    var imgArray = [];
    for(var i=0; i < items.length; i++){
        if(items[i].library == username){
            imgArray.push(items[i]);
        }
    }


    res.render("home", {userName : username, imgArray: imgArray});
});



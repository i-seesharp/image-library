const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");


const app = express();
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server is listening on port 3000.");
});

app.get("/", (req, res) => {
    res.redirect("/login");
});

app.get("/login", (req, res) => {

    res.render("login");
});

app.post("/login", (req, res) => {

    var username = req.body.username;
    res.redirect("/"+username);
});

app.get("/about", (req, res) => {
    res.send("<h1>About Page </h1>");
});

app.get("/:username/upload", (req, res) => {
    var username = req.params.username;
    res.send("Upload a new image to the "+username+" library.");

});

app.get("/:username", (req, res) => {
    console.log("The username received is : " + req.path);
    var username = req.params.username;

    res.render("home", {userName : username});
});


const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
mongoose.connect("mongodb://localhost:27017/alisinaDB", {useNewUrlParser: true});

const itemsSchema = {
    name: String,
};

const Title = mongoose.model("Title", itemsSchema);

const item1 = new Title ({
    name: "This is the first one"
});

const item2 = new Title ({
    name: "This is the second one"
});

const item3 = new Title ({
    name: "This is the thrid one",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema],
}

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res){

    Title.find({}, function (err, foundedItems){

        if(foundedItems.length === 0) {
          Title.insertMany(defaultItems, function(err){
            if(err){
              console.log(err);
            } else {
              console.log("Successfully seaved to the DB");
            }
            res.redirect("/");
          });
        } else {
          res.render("home", {listTitle: "Today", listItems: foundedItems});
        }
    });
});

app.get("/:customlistName", function(req, res){
    const customlistName = _.capitalize(req.params.customlistName);

    List.findOne({name: customlistName}, function(err, foundList){
        if(!err){
            if(!foundList) {
               // Creat new List
               const list = new List ({
                name: customlistName,
                items: defaultItems
            });
        
            list.save();
            res.redirect("/" + customlistName);

            } else {
                // Show an existing List
                res.render("home", {listTitle: foundList.name, listItems: foundList.items});
            }
        }
    });

  
});

app.post("/", function (req, res){
    const item = req.body.newItem;
    const listName = req.body.list;

    const itemName = new Title({
        name: item,
    });

    if(listName === "Today"){
        itemName.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(itemName);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
});

app.post("/delete", function(req, res){
    const checkedItems = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today") {
        Title.findByIdAndRemove(checkedItems, function(err){
            if(err){
                console.log(err);
            } else {
                console.log("Successfully removed from DB");
            }
        });
        res.redirect("/");
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItems}}}, function(err, founList){
            if(!err){
                res.redirect("/" + listName);
            }
        });
    }
});

app.listen(3000, function(){
    console.log("Server started on port 3000..");
});
const express  = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const date = require(__dirname +"/date.js");
const _ = require("lodash")

const app = express();

let items = [];
let workItems = [];
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome"
})

const item2 = new Item({
    name: "Eat"
})

const item3 = new Item({
    name: "Sleep lol"
})

const defaultItems=[item1,item2,item3]

const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/",function(req,res){
    //const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    
    
    // if(today.getDay() == 6 || today.getDay() == 0){
    //     // day = weekday[today.getDay()]
    // }
    // else{
    //     day = weekday[today.getDay()]
    // }

    let day = date.getDate();



    Item.find({}, function(err, foundItems){

        if(foundItems.length === 0){
            Item.insertMany(defaultItems)
            res.redirect("/")
        }
        else{
            res.render("list",{listTitle: "Today", newListItems: foundItems});
        }
        
    })
});

app.get("/:customListName",function(req,res){

    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err, foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                    name: customListName,
                    items: defaultItems
                })
                list.save();
                res.redirect("/" + customListName)
            }
            else{
                res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
            }
        }
        
        
    })

    
})

app.post("/", function(req,res){

    let itemName= req.body.newItem;
    const listName = req.body.list;

    const item = new Item ({
        name: itemName
    });


    if(listName === "Today"){
        item.save();
    res.redirect("/")
    }
    else{
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName)
        })
    }
    
    
})

app.post("/delete", function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName == "Today"){
        Item.findByIdAndRemove(checkedItemId, function(err){
            if(err){console.log(err);}
            else{
                res.redirect("/")
            }
        })
    }

    else{
        List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}},function(err,foundList){
            if(!err){
                res.redirect("/"+listName)
            }
        });
    }

    
})




app.get("/work", function(req, res){
    res.render("list",{listTitle: "Work List" , newListItems: workItems})
})

app.post("/work",function(req,res){
    let item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
})

app.get("/about", function(req, res){
    res.render("about")
})

app.listen(1099, function(){
    console.log("Server on port 45")
});
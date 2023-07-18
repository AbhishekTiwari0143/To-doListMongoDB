const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash")
const mongoose = require("mongoose")

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery', false);
const connectDB = async ()=> {
  try {
    const connect = await mongoose.connect(process.env.Mongo_URI);
    console.log(`MongoDB Connected: ${connect.connection.host}`)
  } catch(error) {
    console.log(error)
    process.exit(1);
  }
}


const itemsSchema = {
  name: String
}
const Item = new mongoose.model("Item", itemsSchema)

const item1 = new Item({
  name: "Welcome"
})
const item2 = new Item({
  name: "(+) TO ADD"
})
const item3 = new Item({
  name: "<-- TO DELETE"
})
const defaultItems = [item1, item2, item3]

const listSchema = {
  name: String,
  items: [itemsSchema]
}
const List = mongoose.model("List", listSchema)

app.get("/", function(req, res) {
  findItems()
  async function findItems(){
    try{
      const foundItems = await Item.find({})
      if(foundItems.length === 0){
        Item.insertMany(defaultItems)
        res.redirect("/")
      }
      else{
        res.render("list", {listTitle: 'Today', newListItems: foundItems});
      }
      } catch(err){
        console.log(err)
      }
    }
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName)
  find()
  async function find(){

    const found = await List.findOne({name: customListName});
    if(!found){
      const list = new List({
        name: customListName,
        items: defaultItems
      })
      list.save()
      res.redirect("/" + customListName)
    }
    else{
      res.render('list', {listTitle : customListName, newListItems: found.items})
    }
  }
})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list
  const item = new Item({
    name : itemName
  })

  if(listName === 'Today'){
    item.save()
    res.redirect("/")
  }else{
    find()
    async function find(){
      const found = await List.findOne({name: listName})
      found.items.push(item)
      found.save()
      res.redirect("/" + listName)
    }
  }  
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName

  if(listName === "Today"){
    removeItem()
    async function removeItem(){
      try{
        await Item.findByIdAndRemove(checkedItemId)
        }
        catch(err){
          console.log(err)
        }
      }
    res.redirect('/')
  }else{
    findItems()
    async function findItems(){
      await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}});
      res.redirect("/" + listName)
    }
  }
})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});

// Dependencies
// =============================================================

// Requiring our Todo model
var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");

module.exports = function(app) {

    // Create all our routes and set up logic within those routes where required.
     app.get("/", function(req, res) {
         
          res.redirect("/saved");
     });
 
     app.get("/saved", function(req, res) {
         db.Article
        .find({}) 
        .then(function(dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
          res.render("saved",{articles:dbArticle});
        })
        .catch(function(err) {
      // If an error occurred, send it to the client
            res.json(err);
        });
     });


   app.get("/scrape", function(req, res) {
     //console.log("ENTRO A FUNCION");
    axios.get("https://www.cnbc.com/world-economy/").then(function(response) {
     var list = [];
      //console.log("CREO VARIABLE");
     var $ = cheerio.load(response.data);

    $(".stories_assetlist li .asset").each(function(i, element) {
      
      var result = {};

      result.title = $(element).children(".headline").find("a").text();

      result.link = "https://www.cnbc.com"+$(element).children(".headline").find("a").attr("href");

      result.snipe = $(element).children("p").text();   

      result.newsid = $(element).children(".headline").find("a").attr("data-nodeid");
       
      db.Article.findOne({newsid: result.newsid}, (err,idnews) => {

      if (idnews==null){  
            list.push(result);
       };
    });
  
  });
  res.render("index",{articles:list});
});
});

  // Route for saving/updating an Article's associated Note
  app.post("/saved", function(req, res) {
  
      var result = {};
      // Add the text and href of every link, and save them as properties of the result object
      result.title = req.body.title;

      result.link = req.body.link;
    //result.link = "https://www.cnbc.com"+result.link;
      result.snipe = req.body.snipe;   
      result.newsid = req.body.newsid;

      db.Article.findOne({newsid: result.newsid}, (err,idnews) => {

      if (idnews==null){  
            db.Article
           .create(result)
           .then(function(dbArticle){
            return res.redirect("/scrape");
          })
         .catch(function(err) {
            res.send("Problem to add this Article");
         });
      };
    });
  });


app.post("/removed/:id", function(req, res) {
     db.Article
     .findOneAndRemove({_id: req.params.id})
     .then(function(dbArticle){
      return res.redirect("/saved");
    })
    .catch(function(err){
      res.send("Problem to remove this Article");
    });
 });

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article
    .find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article
    .findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note
    .create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.post("/notes/:id", function(req, res) {
     db.Article
     .update({_id:req.params.id},{$unset:{note:1}})
     .then(function(dbArticle){
      return res.redirect("/saved");
    })
    .catch(function(err){
      res.send("Problem to remove this Note");
    });
 });

}

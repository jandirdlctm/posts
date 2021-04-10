const express = require("express");
const cors = require("cors");
const model = require("./model");

var moment = require("moment");

const session = require("express-session");
const passport = require("passport");
const passportLocal = require("passport-local");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({extended : false}));
app.use(cors({ credentials: true, origin: 'null'}));
app.use(express.static('public'));

//passport middlewares
app.use(session({ secret: 'kadfs8sdafkldaj65', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());


// PASSPORT IMPLEMENTATIONS

// 1. LOCAL STRATEGY
passport.use(new passportLocal.Strategy({
    // some configs go here
    usernameField: "email",
    passwordField: "plainPassword"   
}, function(email, plainPassword, done){
    // done is a function, call when done
    model.User.findOne({ email: email }).then(function(user){
        // verify that the user exists:
        if (!user){
            //fail : user does not exist
            done(null, false);
            return;
        }
        // verify user's password
        user.verifyPassword(plainPassword, function(result){
            if (result){
                done(null, user);
            }
            else{
                done(null, false);
            }
        });
    }).catch(function(err){
        done(err);
    })
}));

// 2. SERIALIZED USER TO SESSION
passport.serializeUser(function(user, done){
    done(null, user._id)
})

// 3. DESERIALIZED USER FROM SESSION
passport.deserializeUser(function(userId, done){
    model.User.findOne({ _id: userId }).then(function(user){
        done(null, user);
    }).catch(function(err){
        done(err);
    });
});

// 4. AUTHENTICATE ENDPOINT
app.post("/session", passport.authenticate("local"),function(req,res){
    // this function is called if authentication succeeds.
    res.sendStatus(201);
});

// 5. "ME" ENDPOINT
app.get("/session", function(req,res){
    if (req.user){
        //send user details
        res.json(req.user);
    }
    else{
        res.sendStatus(401);
    }
});

// POSTS
app.get("/posts", (req,res)=>{
    console.log("posts hit");
    if (!req.user){
        res.sendStatus(401);
        return;
    }
    
    model.Post.find().then((posts) =>{
        for (var i = 0; i < posts.length; i++){
            console.log(posts[i].date);
            var dateCreated = new Date(posts[i].date)
            posts[i].date = moment(dateCreated).fromNow();
            console.log(posts[i].date);
        }

        res.json(posts)
    })
})

app.post("/posts", (req, res)=>{

    if (!req.user){
        res.sendStatus(401);
        return;
    }

    var date = new Date();
    var post = new model.Post({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        post: req.body.post,
        date: date.toString(),
        user: req.user._id
    })
    post.save().then((post)=>{
        console.log("Post created");
        res.status(201).json(post);
    }).catch(function(err){
        if (err.errors){
            var messages = {};
            for (var e in err.errors){
                messages[e] = err.errors[e].message;
            }
            res.status(422).json(messages);
        }
        else{
            res.sendStatus(500);
        }
    })
})


app.delete("/posts/:postId", (req, res)=>{

    if (!req.user){
        res.sendStatus(401);
        return;
    }

    model.Post.findOne({ _id: req.params.postId}).then(function(post){
        if (post && post.user.equals(req.user._id)){
            model.Post.deleteOne({ _id: post._id }, function(error){
                if (error){
                    console.log(error);
                }
                res.sendStatus(202);
            })
        }
        else{
            res.sendStatus(404);
        }
    }).catch(function(err){
        res.sendStatus(404);
    })
})


// USERS
app.post("/users", function(req, res){

  //CHECK IF EMAIL IS UNIQUE
  model.User.findOne({ email: req.body.email}).then(function(user){
    if (user){
      // email alreayd exists in the db
      res.status(422).json({
          email: "Already registered"
      });
    }
    else{
      var user = new model.User({
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        email : req.body.email,
      });

        user.setEncryptedPassword(req.body.plainPassword, function(){  
          user.save().then(function(){
            res.status(201).json(user);
          }).catch(function(err){
            if (err.errors){
                //mongoose validation failure
                var messages = {};
                for (var e in err.errors){
                    messages[e] = err.errors[e].message;
                }
                res.status(422).json(messages);
            }
            else{
                //some other worse failure
                res.sendStatus(500);
            }
          })
      });
    }
  })
});


app.listen(port, function(){
    console.log(`app listening at http://localhost:${port}`);
})
  
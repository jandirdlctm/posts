const mongoose = require("mongoose");
const bcrypt = require("bcrypt")

mongoose.connect('mongodb+srv://jandir_17:PtiOpPuiU8jdjXMs@cluster0.vqspd.mongodb.net/postVille?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});


// POST MODEL DB
const postSchema = mongoose.Schema({
    firstName : {
      type: String,
      required: true
    },
    lastName : {
      type: String,
      required: true
    },
    post : {
      type: String,
      required: true
    },
    date : {
      type: String,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
});
  
const Post = mongoose.model('Post', postSchema);

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true,
        unique: true
    },
    encryptedPassword: {
        type: String,
        required: true
    }

});

userSchema.methods.setEncryptedPassword = function(plainPassword, callback){
    bcrypt.hash(plainPassword, 12).then(hash => {
        this.encryptedPassword = hash;
        callback();
    });
};

userSchema.methods.verifyPassword = function(plainPassword, callback){
    bcrypt.compare(plainPassword, this.encryptedPassword).then(result =>{
        callback(result);
    });
};



const User = mongoose.model('User', userSchema);


// EXPORTING SO IT CAN BE USED
module.exports = {
    Post : Post,
    User : User
}
const mongoose = require('mongoose');

const db_link = "mongodb+srv://Ayush:8tcbE7sZFKKk6Hc@cluster0.afqwe.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

mongoose.connect(db_link).then(function(connection) {
    console.log("database connected");
}).catch(function(error) {
    console.log("database connection error: " + error);
});

const userSchema = mongoose.Schema({
    name: {
        type:String,
        required:true
    },
    email: {
        type:String,
        required:true,
        unique:true
    },
    password: {
        type:String,
        required:true,
        minLength:8
    },
    address : {
        type:String,
        required:true
    },
    friends : [String],

    profile_image : {
        type:String,
        required:true
    }
})

const usermodel = mongoose.model('usermodel',userSchema);

// (function adddata(){
//     let data = {
//         name: "Ayush Gupta",
//         email: "ayushrishik.punk@gmail.com",
//         password: "Asyau@1234",
//         address: "538 ka/400 triveni nagar tulsi puram lucknow",
//         friends: [],
//         profile_image: "default.jpg"
//     }

//     usermodel.create(data,(err,res) => {
//         if(err) {
//             console.log("some error occured");
//             return;
//         }

//         console.log(res);
//     })
// })();
usermodel.find().exec(function(err, users){
    console.log('users : ', users);
    console.log('err', err);
   });




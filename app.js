const express = require('express');
const app = express();
const url = require('url');
const path = require('path');
const mongoose = require('mongoose');
const db_link = "mongodb+srv://Ayush:8tcbE7sZFKKk6Hc@cluster0.afqwe.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const multer = require('multer');


var userdata = {};
var userfriends = new Set();

app.set('views', path.join(__dirname,'/views'));
app.set('view engine','ejs');

app.use(express.static(path.join(__dirname,'/Images')));

var arr = ["jpeg","jpg","png","bmp"];
const filestorage = multer.diskStorage({
    destination: (req, file, next) => {
        next(null,'./Images');
    },
    filename: (req, file, next) =>{
        next(null,userdata.email+'--'+file.originalname);
    }
})
const upload = multer({storage: filestorage});
const port = process.env.PORT || '3000';
app.listen(port,()=> console.log(`Server started on port ${port}`));

app.get('/', function(req, res) {
    res.render('login');
})

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

app.get('/signin', function(req, res) {
    const data = url.parse(req.url,true).query;
    let result = validate(data.email,data.password);
    if(result){
        usermodel.findOne({ email:data.email,password:data.password},(err,datagot)=>{
            if(err){
                console.log(err);
            }
            if(datagot == null){
               res.send("User not found.")
            }else{
                userdata = datagot;
                for(let i in userdata.friends){
                    if(userfriends.has(userdata.friends[i])){
                        continue;
                    }else{
                        userfriends.add(userdata.friends[i]);
                    }
                }
                console.log(datagot);
                console.log("Signin successfull");
                res.render('myprofile',{data : datagot});
            }
        });
    }else{
        res.send("Incorrect email or password.");
    }
})

app.get('/signupcheck', function(req, res){
    const data = url.parse(req.url,true).query;
    console.log(data);
    let result = validate(data.email,data.password);
    if(result){
        let value = {
            name: data.names,
            email: data.emails,
            password: data.passwords,
            address: data.address,
            friends: [],
            profile_image:'default.jpg'
        }
        adddata(value);
        res.render('login');
    }else{
        res.send("Incorrect email or password format.");
    }
})

app.post('/single',upload.single('image'), (req, res) => {
    if(req.file === undefined){
        console.log("No file to upload");
        return;
    }
    var check = req.file.mimetype.split('/')[1];
    console.log(req);
    var flag = false;
    for(var i in arr){
        var data = arr[i]+"";
        if(data == check){
            flag = true;
            break;
        }
    }
    if(flag){
        usermodel.updateOne({email:userdata.email},{profile_image : userdata.email+'--'+req.file.originalname},(error,info) => {
            if(error) {
                console.log(error);
            }
            console.log("file uploded");
        });
        usermodel.findOne({ email:userdata.email,password:userdata.password},(err,datagot)=>{
            if(err){
                console.log(err);
            }
            if(datagot == null){
               res.send("User not found.")
            }else{
                console.log(datagot);
                console.log("File uploaded successfully")
                res.render('myprofile',{data : datagot});
            }
        });
    }else{
        res.send('“File format not supported');
    }
});

app.get('/allpeoples',function(req, res){
    usermodel.find({},function(err,datagot){
        if(err){
            console.log(err);
        }
        res.render('users',{data: datagot,mydata: userdata});
    })
})

function adddata(data){
    usermodel.create(data,(err,res) => {
        if(err) {
            console.log("some error occured while inserting data.");
            return;
        }
        console.log(res);
        console.log("data added successfully.");
    })
}

app.get('/myprofile', function(req, res){
    usermodel.findOne({ email:userdata.email,password:userdata.password},(err,datagot)=>{
        if(err){
            console.log(err);
        }
        if(datagot == null){
           res.send("User not found.")
        }else{
            console.log(datagot);
            res.render('myprofile',{data : datagot});
        }
    });
})

app.get('/addfriend',function(req,res){
    let data = url.parse(req.url,true).query;
    console.log(data);
    var arr = [];
    arr = userdata.friends;
    arr.push(data.username);

    console.log(userdata.name);
    console.log(data.username);
    
    usermodel.updateOne({email: userdata.email},{friends: arr},(err,info)=>{
        if(err){
            console.log("friend not added");
            return;
        }
        console.log(info);
        console.log("friend added successfully");
    })

    var arr1 = [];

    usermodel.findOne({email: data.useremail},(err,info) =>{
        if(err){
            console.log("Cannot fetch the new friend frienlist");
            return;
        }
        arr1 = info.friends;
        console.log(arr1);
        arr1.push(userdata.name);
        console.log("printing friends list after updation.")
        console.log(arr1);      

        usermodel.updateOne({email: data.useremail},{friends: arr1},(err1,info1)=>{
            if(err1){
                console.log("Error occured in updating friend friends list");
                return;
            }
            console.log(arr1);
            console.log(info1);
            console.log("You are added in friends friend list");
        })
    })

    console.log("after list updation");
    console.log(arr1);

    usermodel.find({},function(err2,datagot){
        if(err2){
            console.log(err2);
        }
        res.render('users',{data: datagot,mydata: userdata});
    })

})

app.get('/myfriends',function(req, res){
    usermodel.find({},function(err,datagot){
        var userfriendset = new Set();
        if(err){
            console.log(err);
            return;
        }
        for(let i in userdata.friends){
            userfriendset.add(userdata.friends[i]);
        }
        console.log("userdata");
        console.log(userdata);
        console.log(userfriendset)
        console.log("datagot");
        console.log(datagot);
        var obj = [];
        for(let i in datagot){
            let name = datagot[i].name;
            if(userfriendset.has(name) && userdata.name != name){
                obj.push(datagot[i]);
            }
        }
        console.log(obj);
        res.render('friends',{data : obj});
    })

})

    


function validate(email,password){
    if(email === "" || password === ""){
        return false;
    }
    return true;
}


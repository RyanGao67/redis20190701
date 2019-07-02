var express = require('express')
var app = express()
var path = require('path');
var logger = require('morgan');
app.use(express.json({extended:false}));
// var express = require('express')
var bodyParser = require('body-parser')
 
// var app = express()
 
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())
var redis = require("redis"),
    client = redis.createClient();
// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /* ... */ });

client.on("error", function (err) {
    console.log("Error " + err);
});
client.on("connect", function(){
    console.log("redis server connected...");
})

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));



app.get('/', (req, res)=>{
    var title = 'Task List';
    client.lrange('tasks',0, -1, (err, reply)=>{
        res.render('index', {
            title: title,
            tasks: reply
        })
    })
});

app.post('/task/add', (req, res)=>{
    var task = req.body.task;
    console.log(req);
    client.rpush('tasks', task, (err, reply)=>{
        if(err){
            console.log(err);
        }
        console.log("Task Added ...");
        res.redirect('/');
    })
});

app.post('/task/delete', (req, res)=>{
    var tasksToDel = req.body.tasks;
    client.lrange('tasks', 0, -1 , (err, tasks)=>{
        for(var i=0;i<tasks.length;i++){
            if(tasksToDel.indexOf(tasks[i])>-1){
                client.lrem('tasks', 0, tasks[i], function(err){
                    if(err)console.log(err);
                });
            }
        }
        res.redirect('/')
    });
});

app.post('/call/add', (req, res)=>{
    var newCall= {};
    newCall.name= req.body.name;
    newCall.company = req.body.company;
    client.hmset('call', ['name', newCall.name, 'company', newCall.company],(err, reply)=>{
        if(err)console.log(err);
        console.log(reply);
        res.redirect('/')
    })
});
app.listen(3000, ()=>{
    console.log(`Server is running on port 3000`);
});
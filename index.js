var inspector = require('inspector');
const express = require('express');
const app = express();
const port = 3000;
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('todos.json');
const db = low(adapter);
const shortid = require('shortid');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//logger
app.use((req, res, next) => {
    console.log(`Request Url : ${req.url}, Request method : ${req.method}, Date of Request: ${Date()}`);
    next();
  });

app.use( (req, res, next) =>  {
    res.status(500);
    res.send({error : "server error"});
});

//return all users with thier todos  
app.get('/api/todos', (req, res) => {
    const todos = db.get('users').value();
    res.send(todos);
    res.statusCode = 200;
});

//return specific user's todos
app.get('/api/todos/:username', (req, res) => {
    const username = req.params.username;
    const targted = db.get('users')
                    .find({ "username": username })
                    .get('todos')
                    .value();
    res.send({"user": username, "todos" : targted});
    res.statusCode = 200;
});

//add new todos to a user if it is existed and logged in 
app.post('/api/todos/', (req, res) => {
    const { username, todos } = req.body;
    const user = db.get('users').find({ "username": username }).value();
    if (!user || !user["loggedIn"]) {
        res.send('user not exsit');
        res.statusCode = 404;
    } else {
        let usertodos = db.get('users')
            .find({ "username": username })
            .get('todos')
            .value();
        console.log(usertodos);
        usertodos = usertodos.concat(todos);
        usertodos.forEach((item) => {
            item["id"] = shortid();
        });
        db.get('users')
            .find({ "username": username })
            .assign({ "todos": usertodos })
            .write();
        res.send('todo created successfully');
        res.statusCode = 200;
    }
});

// delete todo using user id and todo id 
app.delete('/api/todos/:userId/:todoId', (req, res) => {
    const user = db.get('users').find({ "id": req.params.userId }).value();
    if (user && user["loggedIn"]) {
        const todo = db.get('users').find({ id: req.params.userId })
            .get('todos').find({ id: req.params.todoId }).value();
        if (todo) {
            db.get('users').find({ id: req.params.userId })
                .get('todos')
                .remove({ id: req.params.todoId })
                .write()
            res.send("Todo deleted succussfully");
            res.statusCode = 200;
        } else {
            res.send("Todo not existed");
            res.statusCode = 404;
            return;
        }
    } else {
        res.send("user not exsit");
        res.statusCode = 404;
    }
});

//edit todo's title or status
app.patch('/api/todos/:userId/:todoId', (req, res) => {
    const user = db.get('users').find({ id: req.params.userId }).value();
    if (user && user["loggedIn"]) {
        const todo = db.get('users').find({ id: req.params.userId })
            .get('todos').find({ id: req.params.todoId }).value();
        if (todo) {
            const { title, status, ...x } = req.body;
            if (Object.keys(x).length > 0) {
                res.send("invalid attributs");
                res.statusCode = 442;
                return;
            }
            if (title) {
                db.get('users').find({ id: req.params.userId })
                    .get('todos')
                    .find({ id: req.params.todoId })
                    .assign({ title: title })
                    .write()
            }
            if (status) {
                db.get('users').find({ id: req.params.userId })
                    .get('todos')
                    .find({ id: req.params.todoId })
                    .assign({ status: status })
                    .write()
            }
            res.send("Todo updated succussfully");
            res.statusCode = 200;
        } else {
            res.send("Todo not existed");
            res.statusCode = 404;
            return;
        }
    } else {
        res.send("user not exsit");
        res.statusCode = 404;
    }
});

//register new user
app.post('/api/register', async (req, res) => {
    const { username, fname, password } = await req.body;
    if (!username) {
        res.send({error: 'username is required'});
        res.statusCode = 422;
        return;
    }
    if(!fname) {
        res.send({error: 'fname is required'});
        res.statusCode = 422;
        return;
    }
    if(!password){
        res.send({error: 'password is required'});
        res.statusCode = 422;
        return;
    }
    db.get('users')
    .push({ id: shortid(), username: username, fname: fname, password: password, loggedIn: false, todos: [] })
    .write();
    res.send({message:'user was registered successfully'}); 
    res.statusCode = 200;
});

//user login using username and password
app.post('/api/login', (req, res)=>{
    const {username, password} = req.body;
    const user = db.get('users').find({username : username}).value();
    if(!user || user["password"] != password){
        res.send({error: 'invalid credentials' });
        res.statusCode = 401;
        return;
    }
    db.get('users')
    .find({username : username})
    .assign({loggedIn : true})
    .write()
    res.send({message: "logged in successfully", profile:{name: username}});
    res.statusCode = 200;
});



app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`)
});

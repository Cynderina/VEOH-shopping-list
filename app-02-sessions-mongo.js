const express = require('express');
const PORT = process.nextTick.PORT || 8080;
const body_parser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//Mongoose must be added here for schema and models + in the end the connection
const user_schema = new Schema({
    name: {
        type: String,
        required: true
    }
});
const user_model = mongoose.model('user', user_schema);

let app = express();

app.use(body_parser.urlencoded({
    extended: true
}));

app.use(session({
    secret: '1234qwerty',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 100000
    }
}));

let users = [];

app.use((req, res, next) => {
    console.log(`PATH:  ${req.path}`);
    next();
});
//check if user is logged in. If not redirect to login page
const is_logged_handler = (req,res,next) => {
    if (!req.session.user){
        return res.redirect('/login');
    }
    next();
};

app.use((req,res, next) => {
    if(!req.session.user){
        return next();
    }
    user_model.findById(req.session.user._id).then((user) => {
        req.user = user;
        next();
    });
});

//What will be shown when user is logged in
app.get('/', is_logged_handler, (req, res, next) => {
    const user = req.session.user;
    res.write(`
    <html>
    <body>
        Logged in as user: ${user.name}
        <form action="/logout" method="POST">
            <button type="submit">Log out</button>
        </form>
    </body>
    </html>
    `);
    res.end();
});

app.post('/logout', (req, res, next) => {
    //format session
   req.session.destroy();
   res.redirect('/login');
});
//Page where the user gets logging in and registering screens
app.get('/login', (req, res, next) => {
    console.log('user: ', req.session.user)
    res.write(`
    <html>
    <body>
        <form action="/login" method="POST">
            <input type="text" name="user_name">
            <button type="submit">Log in</button>
        </form>
        <form action="/register" method="POST">
            <input type="text" name="user_name">
            <button type="submit">Register</button>
        </form>
    </body>
    </html>
    `);
    res.end();
})

//Sends the logging in information and will log in user if it exists
//user is boolean to tell if user is found
//user_name is to store user's name
app.post('/login', (req, res, next) => {
    const user_name = req.body.user_name;
    user_model.findOne({
        name: user_name
    }).then((user) => {
        if (user){
            req.session.user = user;
            return res.redirect('/');
        }
        res.redirect('/login');
    })
});

app.post('/register', (req, res, next) => {
    const user_name = req.body.user_name;
    user_model.findOne({
        name: user_name
    }).then((user) => {
        if (user){
            console.log('User name already registered');
            return res.redirect('/login');
        }

        let new_user = new user_model({
            name: user_name
        });

        new_user.save().then(() => {
            return res.redirect('login');
        });
    });
});


app.use((req, res, next) => {
    res.status(404);
    res.send('404');
    res.end();
});

const mongoose_url= 'mongodb+srv://shoppinglistdb:yrDP8Lx3hm02osOp@cluster0-dtiht.mongodb.net/test?retryWrites=true&w=majority';

mongoose.connect(mongoose_url, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(() => {
    console.log('Mongoose connected');
    console.log('Start Express server');
    app.listen(PORT);
})

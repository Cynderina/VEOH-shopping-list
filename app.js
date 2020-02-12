const express = require('express');
const PORT = process.nextTick.PORT || 8080;
const body_parser = require('body-parser');
const session = require('express-session');

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
//What will be shown when user is logged in
app.get('/', is_logged_handler, (req, res, next) => {
    const user = req.session.user;
    res.write(`
    <html>
    <body>
        Logged in as user: ${user}
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
    let user = users.find((name) =>
    {
        return user_name == name;
    });
    if (user) {
        console.log('User logged in: ', user);
        req.session.user = user;
        return res.redirect('/');
    }
})

app.post('/register', (req, res, next) => {
    const user_name = req.body.user_name;
    let user = users.find((name) => {
        return user_name == name;
    });
    if (user){
        return res.send('User name already registered');
    }
    users.push(user_name);
    console.log('users: ', users);
    res.redirect('/login');
})


app.use((req, res, next) => {
    res.status(404);
    res.send('404');
    res.end();
});

app.listen(PORT);
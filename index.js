const express = require('express')
const cors = require('cors')
const app = express()
const port = 8080
var expressWs = require('express-ws')(app);
app.use(cors())        // Avoid CORS errors in browsers
app.use(express.json()) // Populate req.body

app.ws('/', function(ws, req) {
    ws.on('message', function(msg) {
      expressWs.getWss().clients.forEach(client => client.send(msg));
    });
    console.log('socket', req.testing);
  });

let times = [
    {id: 1, day: "2022-02-14", start: "8:00", end: "8:30", bookedBy: ""},
    {id: 2, day: "2022-02-15", start: "8:00", end: "8:30", bookedBy: "Testing123"},
    {id: 3, day: "2022-02-16", start: "8:30", end: "9:00", bookedBy: ""},
    {id: 4, day: "2022-02-17", start: "9:00", end: "9:30", bookedBy: "Test2"}
]
const users = [
    {id: 1, username: "Admin", password: "Password", isAdmin: true},
    {id: 2, username: "User", password: "Password", isAdmin: false}
]

let sessions = [
    {id: 1, userId: 1}
]

function isValidFutureDate(req) {
    const date = new Date(req.body.day + ' ' + req.body.start);
    if (!date.getDate()) return false;
    return new Date() <= date;
}

function requireAdmin(req, res, next) {
    // Check that the sessionId is present
    if (!req.body.sessionId) {
        return res.status(400).send({error: 'You have to login'})
    }

    // Check that the sessionId is valid
    const sessionUser = sessions.find((session) => session.id === parseInt(req.body.sessionId));
    if (!sessionUser) {
        return res.status(401).send({error: 'Invalid sessionId'})
    }

    // Check that the sessionId in the sessions has user in it
    const user = users.findById(sessionUser.userId);
    if (!user) {
        return res.status(400).send({error: 'SessionId does not have an user associated with it'})
    }

    // Check that the user is an admin
    if (!user.isAdmin) {
        return res.status(400).send({error: 'Insufficient permissions'})
    }
    next()
}

function getTime(req) {
    return times.findById(req.params.id);
}

Array.prototype.findById = function (value) {
    return this.findBy('id', parseInt(value))
}
Array.prototype.findBy = function (field, value) {
    return this.find(function (x) {
        return x[field] === value;
    })
}

app.get('/times', (req, res) => {
    res.send(times)
})

app.patch('/times/edit/:id', requireAdmin, (req, res) => {
    // Check that :id is a valid number
    if ((Number.isInteger(req.params.id) && req.params.id > 0)) {
        return res.status(400).send({error: 'Invalid id'})
    }
    let time = getTime(req);
    // Check that time with given id exists
    if (!time) {
        return res.status(404).send({error: 'Time not found'})
    }

    // Change name, day, start, end and phone for given id if provided
    if (req.body.name) {
        // Check that name is valid
        if (!/^\w{2,}/.test(req.body.name)) {
            return res.status(400).send({error: 'Invalid name'})
        }
        time.bookedBy = req.body.name
    }

    // Check that start is valid
    if (!req.body.start || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(req.body.start)) {
        return res.status(400).send({error: 'Invalid start'})
    }
    time.start = req.body.start

    // Check that day is valid
    if (!req.body.day || !isValidFutureDate(req)) {
        return res.status(400).send({error: 'Invalid day'})
    }
    time.day = req.body.day

    // Check that end is valid
    if (!req.body.end || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(req.body.end)) {
        return res.status(400).send({error: 'Invalid end'})
    }
    // Check that end is bigger than start
    if (req.body.end < req.body.start) {
        return res.status(400).send({error: 'Invalid end'})
    }
    time.end = req.body.end
    if (req.body.phone) {
        // Check that phone is valid
        if (!req.body.phone || !/^\+?[1-9]\d{6,14}$/.test(req.body.phone)) {
            return res.status(400).send({error: 'Invalid phone'})
        }
        time.phone = req.body.phone
    }
    expressWs.getWss().clients.forEach(client => client.send(JSON.stringify(time)));
    res.status(200).send(time)
})

app.post('/times', requireAdmin, (req, res) => {
    // Add name, day, start, end and phone if provided
    let newTime = {id: 0, day: "", start: "", end: "", bookedBy: ""}
    if (req.body.name) {
        // Check that name is valid
        if (!/^\w{4,}/.test(req.body.name)) {
            return res.status(400).send({error: 'Invalid name'})
        }
        newTime.bookedBy = req.body.name
    }

    // Check that start is valid
    if (!req.body.start || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(req.body.start)) {
        return res.status(400).send({error: 'Invalid start'})
    }

    newTime.start = req.body.start

    // Check that day is valid
    if (!req.body.day || !isValidFutureDate(req)) {
        return res.status(400).send({error: 'Invalid day'})
    }

    newTime.day = req.body.day

    // Check that end is valid
    if (!req.body.end || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(req.body.end)) {
        return res.status(400).send({error: 'Invalid end'})
    }

    newTime.end = req.body.end

    // Check that end is bigger than start
    if (req.body.end < req.body.start) {
        return res.status(400).send({error: 'Invalid end'})
    }

    if (req.body.phone) {
        // Check that phone is valid
        if (!/^\+?[1-9]\d{6,14}$/.test(req.body.phone)) {
            return res.status(400).send({error: 'Invalid phone'})
        }
        newTime['phone'] = req.body.phone
    }

    const ids = times.map(object => {
        return object.id;
    });
    const maxTimeId = Math.max(...ids);
    newTime['id'] = maxTimeId + 1
    times.push(newTime)
    expressWs.getWss().clients.forEach(client => client.send(JSON.stringify(newTime)));
    res.status(200).end()
})


app.delete('/times/:id', requireAdmin, (req, res) => {
    // Check that :id is a valid number
    if ((Number.isInteger(req.params.id) && req.params.id > 0)) {
        return res.status(400).send({error: 'Invalid id'})
    }

    // Check that time with given id exists
    if (!times.findById(req.params.id)) {
        return res.status(404).send({error: 'Time not found'})
    }
    times = times.filter((time) => time.id !== parseInt(req.params.id));
    expressWs.getWss().clients.forEach(client => client.send(parseInt(req.params.id)));
    res.status(200).end()
})

app.get('/times/available', (req, res) => {
    let timesAvailable = [];
    let i = 0;
    while (i < times.length) {
        if (!times[i].bookedBy) {
            timesAvailable.push(times[i]);
        }
        i++;
    }
    res.send(timesAvailable)
})

app.get('/times/:id', (req, res) => {
    let time = getTime(req);
    if (!time) {
        return res.status(404).send({error: "Time not found"})
    }
    res.send(time)
})

app.patch('/times/:id', (req, res) => {

    // Check that :id is a valid number
    if ((Number.isInteger(req.params.id) && req.params.id > 0)) {
        return res.status(400).send({error: 'Invalid id'})
    }
    let time = getTime(req);
    // Check that time with given id exists
    if (!time) {
        return res.status(404).send({error: 'Time not found'})
    }

    // Check that name is valid
    if (!/^\w{4,}/.test(req.body.name)) {
        return res.status(400).send({error: 'Invalid name'})
    }

    // Check that phone is valid
    if (!/^\+?[1-9]\d{6,14}$/.test(req.body.phone)) {
        return res.status(400).send({error: 'Invalid phone'})
    }

    // Change name and phone for given id
    time.bookedBy = req.body.name
    time.phone = req.body.phone
    expressWs.getWss().clients.forEach(client => client.send(time.id));
    res.status(200).end()
})
app.post('/users', (req, res) => {
    if (!req.body.username || !req.body.password) {
        return res.status(400).send({error: 'One or all params are missing'})
    }

    let user = users.findBy('username', req.body.username);
    if (user) {
        return res.status(409).send({error: 'Conflict: The user already exists. '})
    }

    users.push({id: users.length + 1, username: req.body.username, password: req.body.password, isAdmin: false})

    user = users.findById(users.length);
    let newSession = {
        id: sessions.length + 1,
        userId: user.id
    }
    sessions.push(newSession)
    res.status(201).send({sessionId: sessions.length})
})
app.post('/sessions', (req, res) => {
    if (!req.body.username || !req.body.password) {
        return res.status(400).send({error: 'One or all params are missing'})
    }
    const user = users.find((user) => user.username === req.body.username && user.password === req.body.password);
    if (!user) {
        return res.status(401).send({error: 'Unauthorized: username or password is incorrect'})
    }
    let newSession = {
        id: sessions.length + 1,
        userId: user.id
    }
    sessions.push(newSession)
    res.status(201).send(
        {sessionId: sessions.length}
    )
})
app.delete('/sessions', (req, res) => {
    sessions = sessions.filter((session) => session.id === req.body.sessionId);
    res.status(200).end()
})

app.listen(8080, () => {
    console.log(`API up at: http://localhost:${port}`)
})
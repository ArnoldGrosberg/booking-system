const express = require('express')
const cors = require('cors')
const app = express()
const port = 8080

app.use(cors())        // Avoid CORS errors in browsers
app.use(express.json()) // Populate req.body

const times = [
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

app.get('/times', (req, res) => {
    res.send(times)
})

app.get('/times/available', (req, res) => {
    var timesAvailable = [];
    var i = 0;
    while (i < times.length) {
        if (!times[i].bookedBy) {
            timesAvailable.push(times[i]);
        }
        i++;
    }
    res.send(timesAvailable)
})

app.get('/times/:id', (req, res) => {
    if (typeof times[req.params.id - 1] === 'undefined') {
        return res.status(404).send({error: "Time not found"})
    }
    res.send(times[req.params.id - 1])
})

app.patch('/times/:id', (req, res) => {

    // Check that :id is a valid number
    if ((Number.isInteger(req.params.id) && req.params.id > 0)) {
        return res.status(400).send({error: 'Invalid id'})
    }

    // Check that time with given id exists
    if(!times[req.params.id - 1]) {
        return res.status(404).send({error: 'Time not found'})
    }

    // Check that name is valid
    if(!/^\w{4,}/.test(req.body.name)){
        return res.status(400).send({error: 'Invalid name'})
    }

    // Check that phone is valid
    if(!/^\+?[1-9]\d{6,14}$/.test(req.body.phone)){
        return res.status(400).send({error: 'Invalid phone'})
    }

    // Change name and phone for given id
    times[req.params.id - 1]['bookedBy'] = req.body.name
    times[req.params.id - 1]['phone'] = req.body.phone

    res.status(200).end()
})
app.post('/users', (req, res) => {
    if (!req.body.username || !req.body.password) {
        return res.status(400).send({ error: 'One or all params are missing' })
    }

    let user = users.find( ( user )=> user.username === req.body.username);
    if (user) {
        return res.status(409).send({ error: 'Conflict: The user already exists. ' })
    }

    users.push({id: users.length + 1, username: req.body.username, password: req.body.password, isAdmin: false})

    user = users.find( ( user )=> user.username === req.body.username && user.password === req.body.password);
    if (!user) {
        return res.status(507).send({ error: 'Insufficient Storage: The server is unable to store the representation needed to complete the request.' })
    }
    let newSession = {
        id: sessions.length + 1,
        userId: user.id
    }
    sessions.push(newSession)
    res.status(201).send({sessionId: sessions.length})
})
app.post('/sessions', (req, res) => {
    if (!req.body.username || !req.body.password) {
        return res.status(400).send({ error: 'One or all params are missing' })
    }
    const user = users.find( ( user )=> user.username === req.body.username && user.password === req.body.password);
    if (!user) {
        return res.status(401).send({ error: 'Unauthorized: username or password is incorrect' })
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
app.post('/sessions/logout', (req, res) => {
    sessions = sessions.filter( ( session ) => session.id === req.body.sessionId );
    res.status(200).end()
})

app.listen(8080, () => {
    console.log(`API up at: http://localhost:${port}`)
})
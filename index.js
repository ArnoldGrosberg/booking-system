const express = require('express')
const cors = require('cors')
const app = express()
const port = 8080

app.use(cors())        // Avoid CORS errors in browsers
app.use(express.json()) // Populate req.body

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

app.get('/times', (req, res) => {
    res.send(times)
})


app.patch('/times/edit/:id', (req, res) => {
    // Check that the sessionId is present
    if (!req.body.sessionId) {
        return res.status(400).send({error: 'You have to login'})
    }

    // Check that the sessionId is valid
    const sessionUser = sessions.find( ( session ) => session.id === req.body.sessionId );
    if (!sessionUser) {
        return res.status(400).send({error: 'Invalid sessionId'})
    }

    // Check that the sessionId in the sessions has user in it
    if (!users[sessionUser.userId]) {
        return res.status(400).send({error: 'SessionId does not have an user associated with it'})
    }

    // Check that the user is an admin
    if (users[sessionUser.userId]['isAdmin'] !== false) {
        return res.status(400).send({error: 'Insufficient permissions'})
    }

    // Check that :id is a valid number
    if ((Number.isInteger(req.params.id) && req.params.id > 0)) {
        return res.status(400).send({error: 'Invalid id'})
    }

    // Check that time with given id exists
    if(!times[req.params.id - 1]) {
        return res.status(404).send({error: 'Time not found'})
    }

    // Change name, day, start, end and phone for given id if provided

    if(req.body.name){
        // Check that name is valid
        if(!/^\w{4,}/.test(req.body.name)){
            return res.status(400).send({error: 'Invalid name'})
        }
        times[req.params.id - 1]['bookedBy'] = req.body.name
    }

    if(req.body.day){
    // Check that day is valid
    if(!/^(19|20)\d\d([- /.])(0[1-9]|1[012])\2(0[1-9]|[12][0-9]|3[01])/.test(req.body.day)){
        return res.status(400).send({error: 'Invalid day'})
    }
        times[req.params.id - 1]['day'] = req.body.day
    }

    if(req.body.start){
        // Check that start is valid
        if(!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]/.test(req.body.start)){
            return res.status(400).send({error: 'Invalid start'})
        }
        times[req.params.id - 1]['start'] = req.body.start
    }

    if(req.body.end){
        // Check that end is valid
        if(!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]/.test(req.body.end)){
            return res.status(400).send({error: 'Invalid end'})
        }
        times[req.params.id - 1]['end'] = req.body.end
    }

    if(req.body.phone){
    // Check that phone is valid
    if(!/^\+?[1-9]\d{6,14}$/.test(req.body.phone)){
        return res.status(400).send({error: 'Invalid phone'})
    }
        times[req.params.id - 1]['phone'] = req.body.phone
    }



    res.status(200).end()
})

app.patch('/times/add', (req, res) => {
    // Check that the sessionId is present
    if (!req.body.sessionId) {
        return res.status(400).send({error: 'You have to login'})
    }

    // Check that the sessionId is valid
    const sessionUser = sessions.find( ( session ) => session.id === req.body.sessionId );
    if (!sessionUser) {
        return res.status(400).send({error: 'Invalid sessionId'})
    }

    // Check that the sessionId in the sessions has user in it
    if (!users[sessionUser.userId]) {
        return res.status(400).send({error: 'SessionId does not have an user associated with it'})
    }

    // Check that the user is an admin
    if (users[sessionUser.userId]['isAdmin'] !== false) {
        return res.status(400).send({error: 'Insufficient permissions'})
    }

    // Check that :id is a valid number
    if ((Number.isInteger(req.params.id) && req.params.id > 0)) {
        return res.status(400).send({error: 'Invalid id'})
    }

    // Check that time with given id exists
    if(!times[req.params.id - 1]) {
        return res.status(404).send({error: 'Time not found'})
    }

    // Change name, day, start, end and phone for given id if provided

    if(req.body.name){
        // Check that name is valid
        if(!/^\w{4,}/.test(req.body.name)){
            return res.status(400).send({error: 'Invalid name'})
        }
        times[req.params.id - 1]['bookedBy'] = req.body.name
    }

    if(req.body.day){
        // Check that day is valid
        if(!/^(19|20)\d\d([- /.])(0[1-9]|1[012])\2(0[1-9]|[12][0-9]|3[01])/.test(req.body.day)){
            return res.status(400).send({error: 'Invalid day'})
        }
        times[req.params.id - 1]['day'] = req.body.day
    }

    if(req.body.start){
        // Check that start is valid
        if(!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]/.test(req.body.start)){
            return res.status(400).send({error: 'Invalid start'})
        }
        times[req.params.id - 1]['start'] = req.body.start
    }

    if(req.body.end){
        // Check that end is valid
        if(!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]/.test(req.body.end)){
            return res.status(400).send({error: 'Invalid end'})
        }
        times[req.params.id - 1]['end'] = req.body.end
    }

    if(req.body.phone){
        // Check that phone is valid
        if(!/^\+?[1-9]\d{6,14}$/.test(req.body.phone)){
            return res.status(400).send({error: 'Invalid phone'})
        }
        times[req.params.id - 1]['phone'] = req.body.phone
    }
    res.status(200).end()
})


app.delete('/times/delete/:id', (req, res) => {
    // Check that the sessionId is present
    if (!req.body.sessionId) {
        return res.status(400).send({error: 'You have to login'})
    }

    // Check that the sessionId is valid
    const sessionUser = sessions.find( ( session ) => session.id === req.body.sessionId );
    if (!sessionUser) {
        return res.status(401).send({error: 'Invalid sessionId'})
    }

    // Check that the sessionId in the sessions has user in it
    if (!users[sessionUser.userId]) {
        return res.status(400).send({error: 'SessionId does not have an user associated with it'})
    }

    // Check that the user is an admin
    if (users[sessionUser.userId]['isAdmin'] !== false) {
        return res.status(400).send({error: 'Insufficient permissions'})
    }

    // Check that :id is a valid number
    if ((Number.isInteger(req.params.id) && req.params.id > 0)) {
        return res.status(400).send({error: 'Invalid id'})
    }

    // Check that time with given id exists
    if(!times[req.params.id - 1]) {
        return res.status(404).send({error: 'Time not found'})
    }
    console.log(req.params.id)
    console.log(times)
    times = times.filter( ( time ) => time.id !== parseInt(req.params.id ));
    console.log(times)
    res.status(200).end()
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
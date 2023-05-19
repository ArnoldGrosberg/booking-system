const https = require('https');
const fs = require('fs');
const cors = require('cors')
const swaggerUi = require('swagger-ui-express');
const {OAuth2Client} = require('google-auth-library');
const readline = require("readline");
const port = 8080;
const googleOAuth2Client = new OAuth2Client('230415817594-crmji8nc98jh4v2fg86d4eq1cokp5rv3.apps.googleusercontent.com');
const swaggerDocument = require('./swagger.json');
const express = require('express');

let app = express();

let loggedInUser;

// Store user data
app.use(function (req, res, next) {
    let sessionId = parseInt(getSessionId(req))
    if (sessionId) {
        const sessionUser = sessions.find((session) => session.id === sessionId);
        if (sessionUser) {
            loggedInUser = users.findById(sessionUser.userId);
            loggedInUser.sessionId = sessionUser.id;
        }
    } else {
        loggedInUser = {};
    }
    loggedInUser.userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    next();
});

function login(user, req) {
    const session = createSession(user.id);
    loggedInUser = {...user, sessionId: session.id, userIp: req.headers['x-forwarded-for'] || req.socket.remoteAddress};
}


function log(eventName, extraData) {

    // Create timestamp
    const timeStamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')

    // Parse extraData and eventName to JSON and escape the delimiter with backslash
    extraData = JSON.stringify(extraData).replace(/　/g, '\\　');

    // trim only quotes from extraData
    extraData = extraData.replace(/^"(.*)"$/, '$1');

    // Write to file
    fs.appendFile('./log.txt', timeStamp + '　' + loggedInUser.userIp + '　' + loggedInUser.id + '　' + eventName + '　' + extraData + ' \r\n', function (err) {
        if (err) throw err;
    });
}

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

let httpsServer = https
    .createServer(
        // Provide the private and public key to the server by reading each
        // file's content with the readFileSync() method.
        {
            key: fs.readFileSync("key.pem"), cert: fs.readFileSync("cert.pem"),
        }, app)

    .listen(port, () => {
        console.log("Server is running at https://localhost:" + port);
    });
const expressWs = require('express-ws')(app, httpsServer);
app.use(cors())        // Avoid CORS errors in browsers
app.use(express.json()) // Populate req.body
async function getDataFromGoogleJwt(token) {
    const ticket = await googleOAuth2Client.verifyIdToken({
        idToken: token, audience: '230415817594-crmji8nc98jh4v2fg86d4eq1cokp5rv3.apps.googleusercontent.com',
    });
    return ticket.getPayload();
}

app.get('/logs', async (req, res) => {
    if (requireAdmin(req, res) !== true) {
        return
    }
    // Read the log file
    const lines = [];
    const lineReader = readline.createInterface({
        input: fs.createReadStream('./log.txt'), crlfDelay: Infinity
    });

    // Parse the log file
    for await (const line of lineReader) {

        // Split the line into array with '　' as delimiter, except when the delimiter is escaped with backslash
        const fields = line.match(/(\\.|[^　])+/g)

        // Iterate over result
        if (fields){
        for (let i = 0; i < fields.length; i++) {

            // Remove backslash from escaped '　'
            fields[i] = fields[i].replace(/\\/g, '');
        }

        // Add the line to the lines array
        lines.push({
            timeStamp: fields[0], userIp: fields[1], userId: fields[2], eventName: fields[3], extraData: fields[4]
        });
    }}

    // Return the lines array
    return res.send(lines);
});

app.post('/oAuth2Login', async (req, res) => {
    try {
        const dataFromGoogleJwt = await getDataFromGoogleJwt(req.body.credential)
        if (dataFromGoogleJwt) {
        let user = users.findBy('sub', dataFromGoogleJwt.sub);
        if (!user) {
            user = createUser(dataFromGoogleJwt.email, null, dataFromGoogleJwt.sub)
        }
        login(user, req);
        log("oAuth2Login", `${dataFromGoogleJwt.name} (${dataFromGoogleJwt.email}) logged in with Google OAuth2 as user ${user.email}`);
        let clientBookedTimes = times.filter((time) => time.userId === user.id);
        res.status(201).send({
            sessionId: loggedInUser.sessionId, isAdmin: user.isAdmin, bookedTimes: JSON.stringify(clientBookedTimes)
        })
        }
    } catch (err) {
        return res.status(400).send({error: 'Login unsuccessful'});
    }
});

app.ws('/', function (ws) {
});

let times = [{
    id: 1, day: "2022-02-14", start: "8:00", end: "8:30", email: "", bookedBy: null, userId: null, phone: null
}, {
    id: 2, day: "2025-02-15", start: "8:00", end: "8:30", bookedBy: null, userId: null, phone: null
}, {id: 3, day: "2025-02-16", start: "8:30", end: "9:00", bookedBy: null, userId: null, phone: null}, {
    id: 4, day: "2025-02-17", start: "9:00", end: "9:30", bookedBy: null, userId: null, phone: null
}, {id: 5, day: "2025-02-17", start: "9:30", end: "10:00", bookedBy: null, userId: null, phone: null}, {
    id: 6, day: "2025-02-17", start: "10:00", end: "10:30", bookedBy: null, userId: null, phone: null
},]
const users = [{id: 1, email: "Admin", password: "Password", isAdmin: true, sub: "102881469727696684931"}, {
    id: 2, email: "User", password: "Password", isAdmin: false
}]

let sessions = [{id: 1, userId: 1}]

function createUser(email, password, sub) {
    let user = {
            id: (users.reduce((max, object) => {
                return object.id > max ? object.id : max;
            }, 0)) + 1,
            email: email,
            password: password,
            isAdmin: false,
            sub: sub
        };
    users.push(user)
    return user;
}

function createSession(userId) {

    // Find max id from sessions using reduce
    let newSession = {
        id: sessions.reduce((max, p) => p.id > max ? p.id : max, 0) + 1, userId
    }
    sessions.push(newSession)
    return newSession
}

function isValidFutureDate(req) {
    const date = new Date(req.body.day + ' ' + req.body.start);
    if (!date.getDate()) return false;
    return new Date() <= date;
}

function getSessionId(req) {
    const authorization = req.headers.authorization;
    if (!authorization) return null;
    const parts = authorization.split(' ');
    if (parts.length !== 2) return null;
    if (/^Bearer$/i.test(parts[0])) {
            return parts[1];
    }
    return null;
}

function requireAdmin(req, res) {

    const sessionId = getSessionId(req);
    if (!sessionId) {
        return res.status(401).send({error: 'You have to login'})
    }

    const sessionUser = sessions.find((session) => session.id === parseInt(sessionId));
    if (!sessionUser) return res.status(401).json({error: 'Invalid token'});

    // Check that the sessionId in the sessions has user in it
    const user = users.findById(sessionUser.userId);
    if (!user) {
        return res.status(400).send({error: 'SessionId does not have an user associated with it'})
    }

    // Check that the user is an admin
    if (!user.isAdmin) {
        return res.status(400).send({error: 'Insufficient permissions'})
    }
    return true
}

function requireLogin(req, res, next) {

    if (!loggedInUser.sessionId) {
        return res.status(401).send({error: 'You have to login'})
    }

    const sessionUser = sessions.find((session) => session.id === loggedInUser.sessionId);
    if (!sessionUser) return res.status(401).json({error: 'Invalid token'});

    // Check that the sessionId in the sessions has user in it
    const user = users.findById(sessionUser.userId);
    if (!user) {
        return res.status(404).send({error: 'SessionId does not have an user associated with it'})
    }

    req.sessionId = sessionUser.id
    req.isAdmin = user.isAdmin
    next()
}

function getTime(id) {
    return times.findById(id);
}

function getBookedTimes() {
    return times.filter((time) => time.userId === loggedInUser.id);
}

Array.prototype.findById = function (id) {
    return this.findBy('id', parseInt(id))
}
Array.prototype.findBy = function (field, value) {
    return this.find(function (x) {
        return x[field] === value;
    })
}

const delay = ms => new Promise(res => setTimeout(res, ms));
app.get('/times', (req, res) => {
    res.send(times)
})

app.use(express.static(__dirname + '/public'));

app.patch('/times/:id', requireLogin, (req, res) => {

    // Check that :id is a valid number
    if ((Number.isInteger(req.params.id) && parseInt(req.params.id) > 0)) {
        return res.status(400).send({error: 'Invalid id'})
    }

    let time = getTime(req.params.id);

    // Check that time with given id exists
    if (!time) {
        return res.status(404).send({error: 'Time not found'})
    }

    let timeOriginal = JSON.parse(JSON.stringify(time));

    // Change name, day, start, end and phone for given id if provided
    if (req.body.name) {

        // Check that name is valid
        if (!/^\w{2,}/.test(req.body.name)) {
            return res.status(400).send({error: 'Invalid name'})
        }
        time.bookedBy = req.body.name
        time.userId = loggedInUser.id
    }

    // Check that start is valid
    if (req.body.start) {
        if (requireAdmin(req, res) !== true) {
            return
        }
        if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(req.body.start)) {
            return res.status(400).send({error: 'Invalid start'})
        }
        time.start = req.body.start
    }

    // Check that day is valid
    if (req.body.day) {
        if (requireAdmin(req, res) !== true) {
            return
        }
        if (!isValidFutureDate(req)) {
            return res.status(400).send({error: 'Invalid day'})
        }
        time.day = req.body.day
    }

    // Check that end is valid
    if (req.body.end) {
        if (requireAdmin(req, res) !== true) {
            return
        }
        if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(req.body.end)) {
            return res.status(400).send({error: 'Invalid end'})
        }

        // Check that end is bigger than start
        if (req.body.end.padStart(5, "0") < req.body.start.padStart(5, "0")) {
            return res.status(400).send({error: 'Invalid end'})
        }
        time.end = req.body.end
    }

    // Check that phone is valid
    if (req.body.phone) {
        if (!req.body.phone || !/^\+?[1-9]\d{6,14}$/.test(req.body.phone)) {
            return res.status(400).send({error: 'Invalid phone'})
        }
        time.phone = req.body.phone
        time.userId = loggedInUser.id
    }
    if ((!req.body.name && req.body.phone) || (!req.body.phone && req.body.name)) {
        if (requireAdmin(req, res) !== true) {
            return
        }
        time.phone = req.body.phone
        time.bookedBy = req.body.name
    }
    if (!req.body.name && !req.body.phone) {
        time.bookedBy = null
        time.phone = null
        time.userId = null
    }

    function diff(obj1, obj2) {

        // function get unique keys from timeOriginal and time
        function getUniqueKeys(obj1, obj2) {
            let keys = Object.keys(obj1).concat(Object.keys(obj2));
            return keys.filter(function (item, pos) {
                return keys.indexOf(item) === pos;
            });
        }

        let result = {};
        for (let k of getUniqueKeys(obj1, obj2)) {
            if (obj1[k] !== obj2[k]) {
                result[k] = obj2[k];
            }
        }
        return result;
    }

    log("editTime", {id: time.id, diff: diff(timeOriginal, time)});

    // Distribute change to other clients
    expressWs.getWss().clients.forEach(client => client.send(JSON.stringify(time)));
    if (req.body.name && req.body.phone) {
        expressWs.getWss().clients.forEach(client => client.send(time.id));
    }
    res.status(200).send(time)
})

app.post('/times', (req, res) => {
    if (requireAdmin(req, res) !== true) {
        return
    }
    // Add name, day, start, end and phone if provided
    let newTime = {id: 0, day: "", start: "", end: "", bookedBy: ""}
    if (req.body.name) {

        // Check that name is valid
        if (!/^\w{4,}/.test(req.body.name)) {
            return res.status(400).send({error: 'Invalid name'})
        }
        newTime.bookedBy = req.body.name
        newTime.userId = loggedInUser.id
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
    if (req.body.end.padStart(5, "0") < req.body.start.padStart(5, "0")) {
        return res.status(400).send({error: 'Invalid end'})
    }

    if (req.body.phone) {
        // Check that phone is valid
        if (!/^\+?[1-9]\d{6,14}$/.test(req.body.phone)) {
            return res.status(400).send({error: 'Invalid phone'})
        }
        newTime['phone'] = req.body.phone
        newTime.userId = loggedInUser.id
    }

    const ids = times.map(object => {
        return object.id;
    });
    const maxTimeId = Math.max(...ids);
    newTime['id'] = maxTimeId + 1
    times.push(newTime)
    log("addTime", newTime);
    expressWs.getWss().clients.forEach(client => client.send(JSON.stringify(newTime)));
    res.status(201).end()
})


app.delete('/times/:id', (req, res) => {
    if (requireAdmin(req, res) !== true) {
        return
    }

    // Check that :id is a valid number
    if ((Number.isInteger(req.params.id) && parseInt(req.params.id) > 0)) {
        return res.status(400).send({error: 'Invalid id'})
    }
    let time = times.findById(parseInt(req.params.id))

    // Check that time with given id exists
    if (!time) {
        return res.status(404).send({error: 'Time not found'})
    }
    times = times.filter((time) => time.id !== parseInt(req.params.id));
    log("deleteTime", `Time: ${time.id}, ${time.day} ${time.start}-${time.end} for ${time.bookedBy} (${time.phone}) deleted`);
    expressWs.getWss().clients.forEach(client => client.send(parseInt(req.params.id)));
    res.status(204).end()
})

app.get('/times/available', async (req, res) => {

    // 1-second delay before responding to test front end caching
    await delay(1000);

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

app.get('/time/:id', (req, res) => {
    let time = getTime(req.params.id);
    if (!time) {
        return res.status(404).send({error: "Time not found"})
    }
    res.send(time)
})

app.get('/times/booked', requireLogin, (req, res) => {
    let bookedTimes = getBookedTimes();
    if (!bookedTimes) {
        return res.status(404).send({error: "Booked times not found"})
    }
    res.send({bookedTimes: JSON.stringify(bookedTimes), isAdmin: req.isAdmin})
})

app.post('/users', (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).send({error: 'One or all params are missing'})
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
        return res.status(400).send({error: 'Invalid email'})
    }
    let user = users.findBy('email', req.body.email);
    if (user) {
        return res.status(409).send({error: 'Conflict: The user already exists. '})
    }

    user = createUser(
            req.body.email, req.body.password, null
    );
    login(user, req)
    log("registration", `User: ${loggedInUser.email} created and logged in`);
    res.status(201).send({sessionId: loggedInUser.sessionId})
})
app.post('/sessions', (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).send({error: 'One or all params are missing'})
    }
    const user = users.find((user) => user.email === req.body.email && user.password === req.body.password);
    if (!user) {
        return res.status(401).send({error: 'Unauthorized: email or password is incorrect'})
    }
    login(user, req)
    let clientBookedTimes = times.filter((time) => time.userId === loggedInUser.id);
    log("login", `User: ${loggedInUser.email} logged in`);
    res.status(201).send({
        sessionId: loggedInUser.sessionId, isAdmin: user.isAdmin, bookedTimes: JSON.stringify(clientBookedTimes)
    })
})
app.delete('/sessions', requireLogin, (req, res) => {
    sessions = sessions.filter((session) => session.id !== req.sessionId);
    log("logout", `User: ${loggedInUser.email} logged out`);
    res.status(204).end()
})
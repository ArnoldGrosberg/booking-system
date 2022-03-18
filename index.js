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

app.listen(8080, () => {
    console.log(`API up at: http://localhost:${port}`)
})
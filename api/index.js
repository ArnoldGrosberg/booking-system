
const express = require('express')

const cors = require('cors')

const app = express()
const port = 8080


app.use(cors())        // Avoid CORS errors in browsers

app.use(express.json()) // Populate req.body



const times = [

    { id: 1, day: "Monday", start: "8:00", end:"8:30", bookedBy:"" },
    { id: 2, day: "Monday", start: "8:00", end:"8:30", bookedBy:"Testing123"  },
    { id: 3, day: "Monday", start: "8:30", end:"9:00", bookedBy:""  },
    { id: 4, day: "Monday", start: "9:00", end:"9:30", bookedBy:"Test2"  },
    { id: 5, day: "Monday", start: "8:00", end:"8:30", bookedBy:""  },
    { id: 6, day: "Monday", start: "8:00", end:"8:30", bookedBy:""  },
    { id: 7, day: "Monday", start: "8:00", end:"8:30", bookedBy:""  },
    { id: 8, day: "Monday", start: "8:00", end:"8:30", bookedBy:""  },
    { id: 9, day: "Monday", start: "8:00", end:"8:30", bookedBy:""  },
    { id: 10, day: "Monday", start: "8:00", end:"8:30", bookedBy:""  },
    { id: 11, day: "Monday", start: "8:00", end:"8:30", bookedBy:""  },
    { id: 12, day: "Monday", start: "8:00", end:"8:30", bookedBy:""  },
    { id: 13, day: "Monday", start: "8:00", end:"8:30", bookedBy:""  },
    { id: 14, day: "Monday", start: "8:00", end:"8:30", bookedBy:""  },
    { id: 15, day: "Monday", start: "8:00", end:"8:30", bookedBy:""  },
    { id: 16, day: "Monday", start: "8:00", end:"8:30", bookedBy:""  },
    { id: 17, day: "Monday", start: "8:00", end:"8:30", bookedBy:""  },
    { id: 18, day: "Monday", start: "8:00", end:"8:30", bookedBy:""  },
    { id: 19, day: "Monday", start: "8:00", end:"8:30", bookedBy:""  },
    { id: 20, day: "Monday", start: "8:00", end:"8:30", bookedBy:""  },
    { id: 21, day: "Monday", start: "8:00", end:"8:30", bookedBy:""  },
    { id: 22, day: "Monday", start: "8:00", end:"8:30", bookedBy:""  },

]



app.get('/times', (req, res) => {

    res.send(times)

})

app.get('/times/available', (req, res) => {
    var timesAvailable = [];
    var i = 0;
    while (i < times.length) {
        if (!times[i].bookedBy ) {
            timesAvailable.push(times[i]);
        }
        i++;
    }
    res.send(timesAvailable)


})



app.get('/times/:id', (req, res) => {

    if (typeof times[req.params.id - 1] === 'undefined') {

        return res.status(404).send({ error: "times not found" })

    }

    res.send(times[req.params.id - 1])

})



app.post('/times', (req, res) => {

    if (!req.body.id) {
        return res.status(400).send({ error: 'One or all params are missing '})

    }

    let newTime = {

        id: times.length + 1,
        day: req.body.day,
        start: req.body.start,
        end: req.body.start,
        bookedBy: req.body.start

    }

    times.push(newTime)

    res.status(201)
        .location('localhost:${port}/times/' + (times.length - 1))
        .send(newTime)

})



app.listen(8080, () => {

    console.log(`API up at: http://localhost:${port}`)

})

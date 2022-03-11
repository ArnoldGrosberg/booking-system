
const express = require('express');

const cors = require('cors');

const app = express();



app.use(cors());        // Avoid CORS errors in browsers

app.use(express.json()) // Populate req.body



const widgets = [
/*
    { id: 1, day: "Monday", start: "8:00", end:"8:30"  },
    { id: 2, day: "Monday", start: "8:00", end:"8:30"  },
    { id: 3, day: "Monday", start: "8:30", end:"9:00"  },
    { id: 4, day: "Monday", start: "9:00", end:"9:30"  },
    { id: 5, day: "Monday", start: "8:00", end:"8:30"  },
    { id: 6, day: "Monday", start: "8:00", end:"8:30"  },
    { id: 7, day: "Monday", start: "8:00", end:"8:30"  },
    { id: 8, day: "Monday", start: "8:00", end:"8:30"  },
    { id: 9, day: "Monday", start: "8:00", end:"8:30"  },
    { id: 10, day: "Monday", start: "8:00", end:"8:30"  },
    { id: 11, day: "Monday", start: "8:00", end:"8:30"  },
    { id: 12, day: "Monday", start: "8:00", end:"8:30"  },
    { id: 13, day: "Monday", start: "8:00", end:"8:30"  },
    { id: 14, day: "Monday", start: "8:00", end:"8:30"  },
    { id: 15, day: "Monday", start: "8:00", end:"8:30"  },
    { id: 16, day: "Monday", start: "8:00", end:"8:30"  },
    { id: 17, day: "Monday", start: "8:00", end:"8:30"  },
    { id: 18, day: "Monday", start: "8:00", end:"8:30"  },
    { id: 19, day: "Monday", start: "8:00", end:"8:30"  },
    { id: 20, day: "Monday", start: "8:00", end:"8:30"  },
    { id: 1, day: "Monday", start: "8:00", end:"8:30"  },
    { id: 1, day: "Monday", start: "8:00", end:"8:30"  },
    { id: 3, day: "Crazlinger", price: 59.99 },
*/
]



app.get('/widgets', (req, res) => {

    res.send(widgets)

})



app.get('/widgets/:id', (req, res) => {

    if (typeof widgets[req.params.id - 1] === 'undefined') {

        return res.status(404).send({ error: "Widget not found" })

    }

    res.send(widgets[req.params.id - 1])

})



app.post('/widgets', (req, res) => {

    if (!req.body.name || !req.body.price) {

        return res.status(400).send({ error: 'One or all params are missing' })

    }

    let newWidget = {

        id: widgets.length + 1,

        price: req.body.price,

        name: req.body.name

    }

    widgets.push(newWidget)

    res.status(201).location('localhost:8080/widgets/' + (widgets.length - 1)).send(

        newWidget

    )

})



app.listen(8080, () => {

    console.log(`API up at: http://localhost:8080`)

})

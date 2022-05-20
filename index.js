require('dotenv').config()
const http = require('http')

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')


const app = express()

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

const { response } = require('express')

// ÄLÄ KOSKAAN TALLETA SALASANOJA GitHubiin!
/* const url =
  `mongodb+srv://fullstack:<password>@cluster0.o1opl.mongodb.net/noteApp?retryWrites=true&w=majority`
 */


/* let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  }, {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  }, {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  }, {
    id: 4,
    name: "Mary Poppendick",
    number: "39-23-6423122",
  }] */

/*
const app = http.createServer((request, response) => {
response.writeHead(200, { 'Content-Type': 'application/json' })
response.end(JSON.stringify(notes))
})
*/




app.use(cors())
morgan.token('body', (request, reponse) => { return JSON.stringify(request.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.use(express.static('build'))
app.use(express.json())
app.use(requestLogger)



//get all
app.get("/api/persons", (req, response) => {
  Person.find({}).then(people => {
    response.json(people)
  })
})

//get by id
app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  }).catch(error => next(error))
})

//get info
app.get("/info", (request, response) => {
  Person.find({}).then(people => {
    response.send(`<p>Phonebook has info for ${people.length} people.</p><br/><p>${new Date()}</p>`)
  })
})

//delete
app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.deleteOne({ _id: id }).then((result) => {
    response.status(204).end()
  }).catch(error => next(error))
})


const generateId = () => {
  Person.find({}).then((people) => {
    return Math.max(...people.map(n => n.id)) + 1
  })
}

//create new
app.post("/api/persons", (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'content missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })


  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
    .catch(error => next(error))
})

//update
app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body

  console.log(request.body)

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(result => {
      response.json(request.body)
    })
    .catch(error => next(error))

})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)


const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === "CastError") {
    return response.status(400).send({ error: 'malformmated id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

const http = require('http')

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')


const app = express()

let persons = [
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
  }]

/*
const app = http.createServer((request, response) => {
response.writeHead(200, { 'Content-Type': 'application/json' })
response.end(JSON.stringify(notes))
})
*/
app.use(cors())
app.use(express.json())
morgan.token('body', (request, reponse) => { return JSON.stringify(request.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(express.static('build'))


app.get("/api/persons", (req, res) => {
  res.json(persons)
})

app.get("/api/persons/:id", (req, res) => {
  const id = req.params.id
  const person = persons.find(person => person.id == id)
  console.log(person)
  console.log(id)
  res.json(person)
})

app.get("/info", (req, res) => {
  res.send(`<p>Phonebook has info for ${persons.length} people.</p><br/><p>${new Date()}</p>`)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

const generateId = () => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(n => n.id))
    : 0
  return maxId + 1
}


app.post("/api/persons", (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      error: 'name missing'
    })
  }

  if (!body.number) {
    return response.status(400).json({
      error: 'number missing'
    })
  }

  const currentNames = persons.map(person => person.name)

  if (currentNames.includes(body.name)) {
    return response.status(200).json({
      error: 'name must be unique'
    })
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number
  }

  persons = persons.concat(person)

  response.json(person)
})

app.put("/api/persons/:id", (request, response) => {
  const body = request.body
  console.log(request.body)

  persons = persons.map(person => person.name === body.name ? { ...person, number: body.number } : person)

})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

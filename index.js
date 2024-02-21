const express = require('express')
const app = express()
const persons = require('./persons.json')
const morgan = require('morgan')

app.use(express.static('dist'))
app.use(express.json())
app.use(morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      JSON.stringify(req.body)
    ].join(' ')
  }))


app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.get('/info', (req, res) => {
    const hour = new Date();
    const numElements = persons.length;
    
    const data = `
    <p>Phonebook has info for ${numElements} people</p>
        <p>${hour}</p>
    `;
  
    res.send(data);
  });

  app.get('/api/persons/:id', (req, res) => {
      const id = Number(req.params.id);
    const person = persons.find((p) => p.id === id);
    console.log(person);
    if (person) {
        return res.json(person);
    } else {
        res.status(404).json({ message: 'Person not found' });
    }
});

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);
    if (id <= persons.length) {
        const person = persons.filter((p) => p.id !== id);
        console.log(person);
        res.json(person);
    } else {
        res.status(204).end();
    }
});

app.post('/api/persons', (req, res)=> {
    const newPerson = req.body;
if (!newPerson.name || !newPerson.number) {
    return res.status(400).json({ error: 'name or number is missing' });
  }
  
  if (persons.find((p) => p.name === newPerson.name)) {
      return res
      .status(400)
      .json({ error: 'name must be unique' });
  }


const newId = Math.floor(Math.random() * 1000000) + 1;
newPerson.id = newId;
  persons.push(newPerson);
  res.json(newPerson);
  morgan.token('body', (request)=> JSON.stringify(request.body))
})


const PORT = 3001
app.listen(PORT)
console.log(`Server running in port ${PORT}`);
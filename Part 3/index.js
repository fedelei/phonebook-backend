const express = require('express')
const app = express()
const persons = require('./persons.json')
const morgan = require('morgan')
require('dotenv').config()
const Person = require('./models/persons')


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
	Person.find({}).then(result => {
		res.json(result)

	})
})

app.get('/info', (req, res) => {
	const hour = new Date()
	const numElements = persons.length

	const data = `
    <p>Phonebook has info for ${numElements} people</p>
        <p>${hour}</p>
    `

	res.send(data)
})

app.get('/api/persons/:id', (req, res, next) => {
	Person.findById(req.params.id)
		.then(person => {
			if (person) {
				res.json(person)
			} else {
				res.status(404).json({ message: 'Person not found' })
			}
		})
		.catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
	Person.findByIdAndDelete(req.params.id)
		.then(() => {
			res.status(204).end()
		})
		.catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
	const body = req.body


	if (body === undefined) {
		return res.status(400).json({ error: 'content missing' })
	}
	Person.findOne({ name: body.name })
		.then(existPerson => {
			if(existPerson){
				alert('The Person is already. Do you want replace?')
				existPerson.number = body.number
				existPerson.save().then(updatedPerson => {
					res.json(updatedPerson)
				}).catch(error => next(error))
			}else {
				const person = new Person({
					name: body.name,
					number: body.number
				})
				person.save().then(savedPerson => {
					res.json(savedPerson)
				}).catch(error => next(error))
			}
		})


})

app.put('/api/persons/:id', (req, res) => {
	const body = req.body

	const person = {
		name: body.name,
		number: body.number,
	}

	Person.findByIdAndUpdate(req.params.id, person, { new: true })
		.then(updatedPerson => {
			res.json(updatedPerson.toJSON())
		})
		.catch(console.log('error'))
})

const errorHandler = (error, req, res, next) => {
	console.error(error.message)

	if (error.name === 'CastError') {
		return res.status(400).send({ error: 'malformatted id' })
	} else if(error.name === 'ValidationError'){
		return res.status(400).json({ error: error.message })
	}

	next(error)
}


app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT)
console.log(`Server running in port ${PORT}`)


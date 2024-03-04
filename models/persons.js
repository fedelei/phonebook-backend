const mongoose = require('mongoose')
require('dotenv').config();

mongoose.set('strictQuery', false)

const url = process.env.DATABASE_URI

mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const numberReg= /^(\d{2,3})-(\d+)$/;

const personSchema = new mongoose.Schema({
   name: {
    type: String,
    minlength: 3,
    required: true,
    unique: true
   },
   number: {
    type: String,
    minlength: 8,
    required: true,
    validate: {
      validator: (value) => {
        return numberReg.test(value)
      },
      message: 'The phone number must be in the format xx-xxxxxxx'
     }
   }
   
})
personSchema.set('toJSON', {
   transform: (document, returnedObject) => {
     returnedObject.id = returnedObject._id.toString()
     delete returnedObject._id
     delete returnedObject.__v
   }
 })

module.exports = mongoose.model('persons', personSchema)
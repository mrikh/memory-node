const mongoose = require('mongoose')

const url = process.env.PORT ? process.env.MONGODB_URI : 'mongodb://127.0.0.1:27017/Memory'

mongoose.connect(url, {
    useNewUrlParser : true,
    useCreateIndex : true,
    useFindAndModify : false
}, (error) => {
    if (error){
        console.log('Connection Error: ' + error)
    }
})


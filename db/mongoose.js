const mongoose = require('mongoose')

const debug = process.env.PORT === 3000

const retryConnect = () => {

    const url = debug ? 'mongodb://127.0.0.1:27017/Memory' : process.env.MONGOLAB_URI

    mongoose.connect(url, {
        useNewUrlParser : true,
        useCreateIndex : true,
        useFindAndModify : false
    }, (error) => {
        if (error){
            console.log('Connection Error: ' + error)
            setTimeout(retryConnect, 5000)
        }
    })
}
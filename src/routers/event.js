const express = require('express')
const Event = require('../models/event')
const constants = require('../utils/constants')
const auth = require('../middleware/auth')
const User = require('../models/user')

const router = new express.Router()

router.post('/event/create', auth, async (req, res, next) => {

    try{
        var params = req.body
        params.creator = req.user._id
        //as event is craeted now only
        params.eventStatus = 0

        const event = new Event(params)
        await event.save()
        await event.generateStructure()

        res.status(200).send({code : 200, message : constants.success, data : {event}})
    }catch (error){
        next(error)
    }
})

module.exports = router
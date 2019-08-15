const express = require('express')
const ObjectId = require('mongodb').ObjectID;
const Event = require('../models/event')
const constants = require('../utils/constants')
const auth = require('../middleware/auth')
const User = require('../models/user')

const router = new express.Router()

router.post('/event/create', auth, async (req, res, next) => {

    var params = req.body
    params.creator = req.user._id
    //as event is craeted now only
    params.eventStatus = 0
    params.location = {
        type : 'Point',
        coordinates : [params.long, params.lat]
    }

    try{
        const event = new Event(params)
        await event.save()
        await event.populate({
            path : 'creator',
            options : { select : { _id : 1, name : 1, profilePhoto : 1 }}
        }).populate({
            path : 'invited',
            options : { select : { _id : 1, name : 1, profilePhoto : 1 }} 
        }).populate({
            path : 'attending',
            options : { select : { _id : 1, name : 1, profilePhoto : 1 }, limit : 3} 
        }).execPopulate()

        res.status(200).send({code : 200, message : constants.success, data : event})
    }catch (error){
        next(error)
    }
})

//only show public events/explore section
//GET /event/list?lat=0.0&long=0.0&distance=1000&limit=10&skip=10&eventStatus=0&userId=""
router.get('/event/list', async (req, res, next) => {

    try{
        var matchCondition = {
            location : {
                $near : {
                    $maxDistance : req.query.distance * 1000,
                    $geometry : {
                        type : 'Point',
                        coordinates : [req.query.long, req.query.lat]
                    }
                }
            }, 
            privacy : 1
        }

        if (req.query.status === 1){
            matchCondition['endDate'] = {
                $lte : new Date()
            }
        }else{
            matchCondition['endDate'] = {
                $gte : new Date()
            }
        }

        if (req.query.userId){
            matchCondition['creator'] = {
                $ne : new ObjectId(req.query.userId)
            }
        }
        
        const results = await Event.find(matchCondition).select({'photos' : 1, '_id' : 1, 'eventName' : 1, 'startDate' : 1, 'addressTitle' : 1, 'addressDetail' : 1, 'invited' : 1}).skip(parseInt(req.query.skip)).limit(parseInt(req.query.limit)).populate({
            path : 'attending',
            options : { select : { _id : 1, name : 1, profilePhoto : 1 }, limit : 3} 
        })

        const events = results.map((event) => {
            const temp = event.toJSON()
            if (req.query.userId){
                temp.isAttending = eventObject.attending.some((id) => {
                    return id.equals(user._id)
                })
            }else{
                temp.isAttending = false
            }
            delete temp.invited
            return temp
        })
        res.status(200).send({code : 200, message : constants.success, data : events})

    }catch (error) {
        next(error)
    }
})

//these are events that the user has marked as attending

//GET /event/userList?limit=10&skip=10&eventStatus=0
router.get('/event/userList', auth, async (req, res, next) => {

    try{
        const results = await Event.find({

            //attending events mein dhoondo
            //sort by event start date 

        }).skip(parseInt(req.query.skip)).limit(parseInt(req.query.limit)).populate({
            path : 'creator',
            options : { select : { _id : 1, name : 1, profilePhoto : 1 }}
        })

        res.status(200).send({code : 200, message : constants.success, data : results})
    }catch (error) {
        next(error)
    }
})

//events user is invited to
//GET /event/invitedEvents?limit=10&skip=10
router.get('/event/invitedEvents', auth, async (req, res, next) => {

    try{

        if (!req.user._id){
            const error = new Error()
            error.statusCode = 404
            throw error
        }

        const results = await Event.find({

            //invited events mein dhoondo
            //sort by event start date 

        }).skip(parseInt(req.query.skip)).limit(parseInt(req.query.limit)).populate({
            path : 'creator',
            options : { select : { _id : 1, name : 1, profilePhoto : 1 }}
        })

        res.status(200).send({code : 200, message : constants.success, data : results})
    }catch (error) {
        next(error)
    }
})

module.exports = router
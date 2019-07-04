const express = require('express')
const User = require('../models/user')
const constants = require('../utils/constants')

const router = new express.Router()

router.post('/users/signUp', async (req, res, next) => {
    try{
        const user = new User(req.body)
        const token = await user.generateAuthToken()
        res.send({code : 200, message : constants.success, data : {user, token}})
    }catch (error){
        next(error)
    }
})

router.get('/users/checkUsername/:username', async (req, res, next) => {
    try{
        const user = await User.findOne({username : req.params.username})
        if (user){
            const error = new Error(constants.username_exists)
            error.statusCode = 422
            throw error
        }
        res.send({code : 200, message : constants.success})
    }catch(error){
        next(error)
    }
})


module.exports = router
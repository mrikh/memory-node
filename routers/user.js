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

router.get('/users/checkInfo', async (req, res, next) => {

    console.log(process.env)
    const username = req.query.username

    try{
        if (username){
            const user = await User.findOne({username})
            if (user){
                const error = new Error(constants.username_exists)
                error.statusCode = 422
                throw error
            }
            res.send({code : 200, message : constants.success})
        }else{
            const error = new Error(constants.params_missing)
            error.statusCode = 422
            throw error
        }
    }catch(error){
        next(error)
    }
})

module.exports = router
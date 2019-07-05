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

    const username = req.query.username

    try{
        console.log(username)
        if (username){
            console.log('1')
            const user = await User.findOne({username})
            console.log('2')
            if (user){
                console.log('3')
                const error = new Error(constants.username_exists)
                error.statusCode = 422
                throw error
            }
            console.log('4')
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
const express = require("express")
const app = express()

const mysql = require("mysql")

const db = mysql.createPool({
    connectionLimit: 100,
    host: "127.0.0.1",
    user: "root",
    password: "password",
    database: "userdb",
    port: "3306"
})

db.getConnection( (err, connection) => {
    if (err) throw(err)
    console.log("DB connected successfully: " + connection.threadId)
})

const generateAccessToken = require("./generateAccessToken")
//LOGIN (AUTHENTICATE USER)
app.post("/login", (req, res)=> {
    const user = req.body.name
    const password = req.body.password
    db.getConnection ( async (err, connection)=> {
        if (err) throw (err)
        const sqlSearch = "Select * from user where user = ?"
        const search_query = mysql.format(sqlSearch,[user])
        await connection.query (search_query, async (err, result) => {
        connection.release()
        
        if (err) throw (err)
        if (result.length == 0) {
            console.log("--------> User does not exist")
            res.sendStatus(404)
        } 
        else {
            const passwordRecord = result[0].password
            if (passwordRecord === password) {
                console.log("---------> Login Successful")
                res.send(`${user} is logged in!`)
                const token = generateAccessToken({user: user})
                res.json({accessToken: token})
            } 
            else {
                console.log("---------> Password Incorrect")
                res.send("Password incorrect!")
            }
        }
        }) 
    }) 
})     

// logout
app.get("/logout", function (req, res) {
    req.logout(function(err) {
        if (err) { return next(err) }
        res.redirect('/')
    })
})

// change password
app.post("/changePassword", function (req, res) {
    const userId = req.body.userid
    const new_password = req.body.new_password
    const old_password = req.body.old_password

    db.getConnection ( async (err, connection)=> {
        if (err) throw (err)
        const sqlUpdate = "UPDATE user SET password = ? where userId = ? and password = ?"
        const search_query = mysql.format(sqlUpdate, [new_password], [userId], [old_password])
        await connection.query (search_query, async (err, result) => {
        connection.release()
        
        if (err) throw (err)
        if (result.length == 0) {
            console.log("--------> User does not exist")
            res.sendStatus(404)
        } 
        else {
            const passwordRecord = result[0].password
            if (passwordRecord === password) {
                console.log("---------> Login Successful")
                res.send(`Password changed successfully`)
            } 
            else {
                console.log("---------> Password Incorrect")
                res.send("Password incorrect!")
            }
        }
        }) 
    })
})

app.listen(8080,
    ()=> console.log('Server started'))
require('dotenv').config()
const fs = require('fs')
const db = require('./connect')

const sql = fs.readFileSync('./database/countries.sql').toString();


(async () => {
    try {
        await db.query(sql)
        console.log("Setup complete")
    } catch (error) {
        console.error(error)
    } finally {
        await db.end()
    }
})()

// (() => {
//     try {
//         db.query(sql)
//         db.end()
//         console.log("Setup complete")
//     } catch (error) {
//         console.error(error)
//     }
// })()


// db.query(sql)
//     .then((data) => {
//         db.end()
//         console.log("Setup complete")
//         console.log(data)
//     })
//     .catch((error) => console.error(error))

// const setupDb = async () => {
//     try {
//         await db.query(sql)
//         await db.end()
//         console.log("Setup complete")
//     } catch (error) {
//         console.error(error)
//     }
// }

// setupDb()
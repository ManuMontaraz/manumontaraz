// queries.js t
const path = require('path')
const { pool } = require(path.join(__dirname, '..', '..', 'database', 'js', 'database.js'))

exports.getLanguage = async (username) => {
    const response = await pool.query(
        `SELECT language
        FROM users
        WHERE username = $1`,
        [username]
    )

    if (response.rowCount === 0) {
        console.log(`usuario "${username}" no encontrado o no se pudo actualizar el idioma`)
        return null
    }
    return response.rows[0].language
}

exports.updateLanguage = async (username, language) => {
    const response = await pool.query(
        `UPDATE users
        SET language = $2
        WHERE username = $1`,
        [username, language]
    )

    if (response.rowCount === 0) {
        console.log(`usuario "${username}" no encontrado o no se pudo actualizar el idioma`)
        return null
    }
    return "ok"
}
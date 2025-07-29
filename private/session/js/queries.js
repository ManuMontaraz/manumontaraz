// queries.js
const path = require('path')
const { pool } = require(path.join(__dirname, '..', '..', 'database', 'js', 'database.js'))

exports.getUserByUsernameOrEmail = async (usernameOrEmail) => {
    // TO-DO: SI EN DB "REVOKE TOKEN", NO DEBERÍA PODER INICIAR SESIÓN CON JWT
    const response = await pool.query(
        `SELECT 
            username,
            name,
            last_name,
            email,
            password,
            password_salt,
            language
        FROM users
        WHERE username = $1
            OR email = $1`,
        [usernameOrEmail]
    )
    return response.rows[0] || null
}

exports.signupUser = async (userData) => {

    try {
        const response = await pool.query(
            `WITH inserted_user AS (
                INSERT INTO users (username, name, last_name, email, password, password_salt, language)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id
            ),
            inserted_confirmation AS (
                INSERT INTO confirmation_users (id_user)
                SELECT id FROM inserted_user
                RETURNING id_user, confirmation_code
            )
            SELECT u.id, c.confirmation_code
            FROM inserted_user u
            JOIN inserted_confirmation c ON u.id = c.id_user;
            `,
            [userData.username, userData.name, userData.last_name, userData.email, userData.password, userData.password_salt, userData.language]
        )

        if (response.rowCount === 0) {
            return {"status":"ko", "message":"Error al registrar el usuario. Por favor, inténtalo de nuevo más tarde."}
        }
        return {"status":"ok", "confirmation_code": response.rows[0].confirmation_code}

    } catch (error) {
        if (error.code === '23505') {
            // Violación de UNIQUE constraint (usuario ya existe)
            return {"status":"ko", "message":"El usuario ya existe"};
            //throw new Error('El usuario ya existe');
        }
        // Otros errores inesperados
        //throw error;
        return {"status":"ko", "message":"Error al registrar el usuario. Por favor, inténtalo de nuevo más tarde."}
    }
}
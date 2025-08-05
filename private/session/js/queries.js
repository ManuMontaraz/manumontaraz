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

exports.generateKeyForResetPassword = async (email) => {
    try {
        const response = await pool.query(
            `WITH inserted_user AS (
                SELECT id, name, language
                FROM users
                WHERE email = $1
            ),
            upsert_reset_password AS (
                INSERT INTO reset_password (id_user)
                SELECT id
                FROM inserted_user
                ON CONFLICT (id_user)
                DO UPDATE SET
                    reset_password_code = DEFAULT,
                    date_updated = NOW()
                RETURNING reset_password_code, id_user
            )
            SELECT rp.reset_password_code, u.name, u.language
            FROM upsert_reset_password AS rp
            JOIN inserted_user AS u
                ON rp.id_user = u.id;`,
            [email]
        )
        if (response.rowCount === 0) {
            console.log(`No se encontró un usuario con el email: ${email}`)
            return null
        }
        return response.rows[0]
    }
    catch (error) {
        console.error('Error generating reset password key:', error)
        return null
    }
}

exports.signupUser = async (userData) => {

    try {
        const response = await pool.query(
            `WITH inserted_user AS (
                INSERT INTO users (username, name, last_name, email, password, password_salt, language)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id
            ),
            upserted_confirmation AS (
                INSERT INTO confirmation_users (id_user)
                SELECT id
                FROM inserted_user
                ON CONFLICT (id_user)
                DO UPDATE SET
                    confirmation_code = DEFAULT,
                    date_updated = NOW()
                RETURNING id_user, confirmation_code
            )
            SELECT u.id, c.confirmation_code
            FROM inserted_user u
            JOIN upserted_confirmation c ON u.id = c.id_user;`,
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

exports.confirmUser = async (confirmationCode) => {
    try {
        const response = await pool.query(
            `UPDATE users AS u
                SET confirmed = TRUE
            FROM confirmation_users AS cu
            WHERE u.id = cu.id_user
                AND cu.confirmation_code = $1
                AND u.confirmed = FALSE
            RETURNING u.confirmed;`,
            [confirmationCode]
        )

        console.log("response",response)

        if (response.rowCount === 0) {
            return {"status":"ko", "message":"[mlang:confirm_message_ko]"}
        }

        return {"status":"ok", "message":"[mlang:confirm_message_ok]"}

    } catch (error) {
        // Manejo de errores inesperados
        return {"status":"ko", "message":"[mlang:confirm_message_error]"}
    }
}
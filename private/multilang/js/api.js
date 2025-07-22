const path = require('path')
const jwt = require('jsonwebtoken')
const { app } = require(path.join(__dirname,'..','..','server','js','server.js'))
const { /*get_translation, */translate, update_language } = require(path.join(__dirname,'functions.js'))

app.get('/api/language',(request, response) => { 
    
    if(!request.body)return

    response.json("Hola, soy la API de traducción de palabras clave, pero aún no existo :(")

    //TO-DO: Hacer api para traducir palabras clave
    
}) 

app.post('/api/language/set',(request, response) => { 
    
    if(!request.body)return

    const queryLang = request.body.lang
    const queryTranslate = request.body.translate

    const token = request.headers.authorization ? request.headers.authorization.split(' ')[1] : null
    
    response.setHeader('Set-Cookie', `language=${queryLang}; Path=/; Max-Age=31536000; SameSite=Strict`)
    
    jwt.verify(token, process.env.JWT_SECRET, (error, authData) => {
        if (!error) {
            //TO-DO: Actualizar Base de datos de lenguaje
            request.user = authData
            update_language(authData.user, queryLang)
        }
    })

    const translation = translate(queryLang,queryTranslate)

    //console.log("translation",translation)

    response.json({"translation":translation,"message":`Hola, quieres traducir la web en: [${queryLang}]`})

    //const languageFile = get_language_file(language)

    //TO-DO: Hacer api para traducir palabras clave
    
}) 
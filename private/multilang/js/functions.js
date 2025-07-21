const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken')
const { updateLanguage, getLanguage } = require(path.join(__dirname, 'queries.js'))

function get_language_file(lang = "es"){
    const filePath = path.join(__dirname, '..', 'lang', `${lang}.json`)
    
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'))
    }else{
        console.error(`El archivo de idioma ${lang} no existe.`)
        return {}
    }
}

async function get_language(cookies){

    let language = "es" // Idioma por defecto
    if(cookies){
        console.log("cookies",cookies)

        let session
        if(cookies.split(";").find(cookie => cookie.trim().startsWith("montarazSession="))){
            session = cookies.split(";").find(cookie => cookie.trim().startsWith("montarazSession=")).split("=")[1]

            await jwt.verify(session, process.env.JWT_SECRET, async (error, authData) => {
                if(error){
                    console.log('Token inválido:', error)
                }
                const data = await getLanguage(authData.user)

                if(data) language = data
            })
        }

        if(cookies.split(";").find(cookie => cookie.trim().startsWith("language="))){
            language = cookies.split(";").find(cookie => cookie.trim().startsWith("language=")).split("=")[1]
        }
    }
    // TO-DO: Obtener el idioma de sesión si existe, si no existe, de cookie, si no existe, del header
    

    console.log(`Idioma obtenido: ${language}`)

    return language
}

async function update_language(username, language){
    const data = await updateLanguage(username, language)

    if(data === "ok"){
        /*
        const languageFile = get_language_file(language)
        console.log("languageFile",languageFile)
        */
        console.log(`Idioma actualizado a [${language}] correctamente para el usuario ${username}`)
    }else{
        console.error(`Error al actualizar el idioma a [${language}] para el usuario ${username}`)
    }
    return data
}

function translate(lang = "es", find){
    const replace = get_language_file(lang)

    if(!find)return false
    
    if(typeof find === 'string'){
        for(let indexReplace = 0 ; indexReplace < Object.entries(replace).length ; indexReplace++){
            const [key, value] = Object.entries(replace)[indexReplace]
            find = find.replaceAll(`[mlang:${key}]`, value)
        }
    }else if(typeof find === 'object' && Array.isArray(find)){
        const objectFind = {}
        for(let indexFind = 0 ; indexFind < find.length ; indexFind++){
            const item = Object.entries(replace).find(key => key[0] === find[indexFind])
            objectFind[item[0]] = item[1]
        }
        find = objectFind
    }
    return find
}

module.exports = { get_language_file, get_language, update_language, translate }
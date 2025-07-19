const fs = require('fs')
const path = require('path')
const { updateLanguage } = require(path.join(__dirname, 'queries.js'))

function get_language_file(lang = "es"){
    const filePath = path.join(__dirname, '..', 'lang', `${lang}.json`)
    
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'))
    }else{
        console.error(`El archivo de idioma ${lang} no existe.`)
        return {}
    }
}

async function update_language(username, language, response){
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
}

function get_translation(lang = "es"){

}

module.exports = { get_language_file, get_translation, update_language }
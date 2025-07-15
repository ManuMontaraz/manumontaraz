const fs = require('fs')
const path = require('path')

const languageFile = get_language_file()

function get_language_file(lang = "es"){
    const filePath = path.join(__dirname, '..', 'lang', `${lang}.json`)
    
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'))
    }else{
        console.error(`El archivo de idioma ${lang} no existe.`)
        return {}
    }
}
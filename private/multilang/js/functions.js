import fs from 'fs'
import path from 'path'

import { __dirname } from '../../server/js/server.js'

const translations = {}
export async function translate(lang, text) {
    const debug = false

    if(debug) console.log(`Attempting translation for language: ${lang}, text: ${text}`)
    
    if(!translations[lang]) {
        try {
            const filePath = path.join(__dirname, '..', '..', 'multilang', 'lang', `${lang}.json`)
            const data = await fs.promises.readFile(filePath, 'utf8')
            translations[lang] = JSON.parse(data)
        } catch (error) {
            console.error(`Error loading translation file for language: ${lang}`, error)
            return text // Devolver el texto original si no se puede cargar la traducción
        }
    }

    const keys = Object.keys(translations[lang])
    const values = Object.values(translations[lang])

    let indexKeys = 0
    const iterate = ()=>{
        if(indexKeys >= keys.length) return text

        const key = keys[indexKeys]
        const value = values[indexKeys]

        if(text.includes(key)){
            if(debug)console.log(`Replacing key: ${key} with value: ${value}`)

            text = text.replaceAll(key, value)

            if(debug)console.log(`Current translated text: ${text}`)
        }
    
        indexKeys++
        iterate()
    }

    iterate()

    if(debug)console.log("final translated text: ", text)
    return text
}

function get_language() {
    
}
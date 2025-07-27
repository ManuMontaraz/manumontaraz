/*

event.preventDefault();
fetch(
    "/api",
    {
        headers:{
            "Authorization": `Bearer ${document.querySelector("#token").value}`
        }
    }
).then(response=>response.json()).then(data=>{
    document.querySelector("#log").innerText = JSON.stringify(data)
})

*/

document.addEventListener("DOMContentLoaded", function() {

    if(get_cookie("montarazSession"))login()
        
})


function login(){
    event.preventDefault()

    const elementUser = document.querySelector("#login_user")
    const elementPass = document.querySelector("#login_pass")
    const elementRemember = document.querySelector("#login_remember")

    let sessionCookie = get_cookie("montarazSession")

    if(sessionCookie && (elementUser.value || elementPass.value)){
        sessionCookie = null
    }

    if (!sessionCookie && (!elementUser.value || !elementPass.value)) {
        document.querySelector("#log").innerText = "Por favor, completa ambos campos."
        return
    }

    const url = sessionCookie ? "/api/login/jwt" : "/api/login"

    const headers = sessionCookie ? {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Bearer ${sessionCookie}`
    } : {
        "Content-Type": "application/json; charset=utf-8"
    }

    const body = JSON.stringify(!sessionCookie || (elementUser.value && elementPass.value) ? {
        user: elementUser.value,
        pass: elementPass.value,
        remember: elementRemember.checked
    } : {
        user: JSON.parse(atob(sessionCookie.split(".")[1])).user,
        remember: JSON.parse(atob(sessionCookie.split(".")[1])).remember
    })

    console.log("url",url)
    console.log("headers",headers)
    console.log("body",body)

    document.querySelector("#log").innerText = "Iniciando sesión..."

    fetch(
        url,
        {
            method: "POST",
            headers: headers,
            body: body
        }
    ).then(response=>response.json()).then(token=>{
        console.log("token",token)
        const language = token.language || "es"
        document.querySelector("#log").innerText = JSON.stringify(token)
        if(language != get_cookie("language")){
            set_language(language)
        }
    })
}

function logout(){
    event.preventDefault()

    const sessionCookie = get_cookie("montarazSession")

    if (!sessionCookie) {
        document.querySelector("#log").innerText = "No hay sesión iniciada."
        return
    }

    document.querySelector("#log").innerText = "Cerrando sesión..."

    const body = JSON.stringify({user: JSON.parse(atob(sessionCookie.split(".")[1])).user})

    fetch(
        "/api/logout",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: body
        }
    ).then(response=>response.json()).then(data=>{
        document.querySelector("#log").innerText = JSON.stringify(data)
        delete_cookie("montarazSession")
    })
}

function signup(){
    event.preventDefault()

    const elementName = document.querySelector("#signup_name")
    const elementLastName = document.querySelector("#signup_last_name")
    const elementUser = document.querySelector("#signup_user")
    const elementEmail = document.querySelector("#signup_email")
    const elementPass = document.querySelector("#signup_pass")
    const elementConfirmPass = document.querySelector("#signup_confirm_pass")
    const elementRemember = document.querySelector("#signup_remember")
    const elementTerms = document.querySelector("#signup_terms")
    const elementNewsletter = document.querySelector("#signup_newsletter")
    const language = get_cookie("language") || "es"

    if (!elementName.value || !elementLastName.value || !elementUser.value || !elementEmail.value || !elementPass.value || !elementConfirmPass.value) {
        document.querySelector("#log").innerText = "Por favor, completa todos los campos."
        return
    }
    if (elementPass.value !== elementConfirmPass.value) {
        document.querySelector("#log").innerText = "Las contraseñas no coinciden."
        return
    }
    if (!elementTerms.checked) {
        document.querySelector("#log").innerText = "Debes aceptar los términos y condiciones."
        return
    }


    const url = "/api/signup"

    const headers = {
        "Content-Type": "application/json; charset=utf-8"
    }
    const body = JSON.stringify({
        name: elementName.value,
        lastName: elementLastName.value,
        user: elementUser.value,
        email: elementEmail.value,
        pass: elementPass.value,
        repeatPass: elementConfirmPass.value,
        remember: elementRemember.checked,
        terms: elementTerms.checked,
        newsletter: elementNewsletter.checked,
        language: language
    })

    document.querySelector("#log").innerText = "Creando una nueva cuenta..."

    fetch(
        url,
        {
            method: "POST",
            headers: headers,
            body: body
        }
    ).then(response=>response.json()).then(response=>{
        console.log("response",response)
        document.querySelector("#log").innerText = JSON.stringify(response)
    })
}
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
        document.querySelector("#log").innerText = JSON.stringify(token)
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

function signin(){
    event.preventDefault()

    const elementUser = document.querySelector("#signin_user")
    const elementPass = document.querySelector("#signin_pass")
    const elementConfirmPass = document.querySelector("#signin_confirm_pass")
    const elementEmail = document.querySelector("#signin_email")
    const elementRemember = document.querySelector("#signin_remember")
}
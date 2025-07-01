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
    //event.preventDefault()

    let sessionCookie = get_cookie("montarazSession")

    if(sessionCookie && (document.querySelector("#user").value || document.querySelector("#pass").value)){
        sessionCookie = null
    }

    if (!sessionCookie && (!document.querySelector("#user").value || !document.querySelector("#pass").value)) {
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

    const body = JSON.stringify(!sessionCookie || (document.querySelector("#user").value && document.querySelector("#pass").value) ? {
        user: document.querySelector("#user").value,
        pass: document.querySelector("#pass").value 
    } : {
        user: JSON.parse(atob(sessionCookie.split(".")[1])).user
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

function get_cookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function delete_cookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}
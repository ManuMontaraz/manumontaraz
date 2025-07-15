function set_language(lang = "es"){

    let sessionCookie = get_cookie("montarazSession")

    const url = `/api/language/set`
    const headers = sessionCookie ? {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Bearer ${sessionCookie}`
    } : {
        "Content-Type": "application/json; charset=utf-8"
    }
    const body = JSON.stringify({
        lang: lang
    })

    fetch(
        url,
        {
            method: "POST",
            headers: headers,
            body: body
        }
    )
    .then(response=>response.json())
    .then(data=>{
        document.querySelector("#log").innerText = JSON.stringify(data)
    })
}
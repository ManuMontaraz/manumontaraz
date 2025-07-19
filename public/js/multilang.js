function set_language(lang = "es"){

    let sessionCookie = get_cookie("montarazSession")
    let jsonLang = {}

    const elementsLang = document.querySelectorAll("*[mlang]")

    for(let indexElements = 0 ; indexElements < elementsLang.length ; indexElements++){
        const element = elementsLang[indexElements]
        jsonLang[element.getAttribute("mlang").split(";")[1]]
    }

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
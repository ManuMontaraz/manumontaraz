function set_language(lang = "es"){

    let sessionCookie = get_cookie("montarazSession")
    const arrayTranslate = []

    const elementsLang = document.querySelectorAll("*[mlang]")

    for(let indexElements = 0 ; indexElements < elementsLang.length ; indexElements++){
        const element = elementsLang[indexElements]
        arrayTranslate.push(element.getAttribute("mlang").split(";")[1])
    }

    console.log("arrayTranslate",arrayTranslate)

    const url = `/api/language/set`
    const headers = sessionCookie ? {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Bearer ${sessionCookie}`
    } : {
        "Content-Type": "application/json; charset=utf-8"
    }
    const body = JSON.stringify({
        lang: lang,
        translate: arrayTranslate
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
        console.log("data.translation",data.translation)

        for(let indexElements = 0 ; indexElements < elementsLang.length ; indexElements++){
            const element = elementsLang[indexElements]
            const elementAttribute = element.getAttribute("mlang").split(";")
            if(data.translation[elementAttribute[1]]){
                switch(elementAttribute[0]){
                    case "text":
                        element.innerText = data.translation[elementAttribute[1]]
                    break
                    case "value":
                        element.value = data.translation[elementAttribute[1]]
                    break
                    case "placeholder":
                        element.setAttribute("placeholder",data.translation[elementAttribute[1]])
                    break
                }
            }
        }

        document.querySelector("#log").innerText = JSON.stringify(data)
    })
}
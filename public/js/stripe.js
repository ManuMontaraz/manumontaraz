function get_products(){
    const url = "/api/stripe/products"

    const headers = {
        "Content-Type": "application/json; charset=utf-8"
    }

    fetch(
        url,
        {
            method: "GET",
            headers: headers
        }
    ).then(response=>response.json()).then(response=>{
        console.log("response",response)
        document.querySelector("#log").innerText = JSON.stringify(response)
    })
}

get_products()
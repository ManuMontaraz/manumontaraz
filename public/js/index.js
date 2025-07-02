function test_api(){
    event.preventDefault();
    fetch(
        "/api",
        {
            headers:{
                "Authorization": `Bearer ${get_cookie("montarazSession")}`
            }
        }
    ).then(response=>response.json()).then(data=>{
        document.querySelector("#log").innerText = JSON.stringify(data)
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
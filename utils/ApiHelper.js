class ApiHelper {
    constructor(url) {
        this.url = url
        this.token
    }
    setToken(token) {
        this.token = token;
    }

    async get(endpoint){
       const response = await fetch(`${this.url}${endpoint}`, {
        method : "GET",
        headers : {
            "Content-Type" : "application/json"
        }
       })

       if(!response.ok){
        throw new Error(`HTTP error! Status: ${response.status}`)
       }
    //    console.log(await response.json())
       return await response.json()
    }

    async post(endpoint, payload){
        const response = await fetch(`${this.url}${endpoint}`, {
            method : "POST",
            headers : {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify(payload)
        })

        if(!response.ok){
            throw new Error(`HTTP error! Status: ${response.status}`)
        }

        return await response.json()

    }

    async getAuthorization(endpoint){
        const response = await fetch(`${this.url}${endpoint}`, {
            method : "GET",
            headers : {
                "Content-Type" : "application/json",
                "Authorization" : this.token
            }
        })

        if(!response.ok){
            throw new Error(`HTTP error! Status: ${response.status}`)
        }

        return await response.json()
    }

    async postAuthorization(endpoint, payload){
        const response = await fetch(`${this.url}${endpoint}`, {
            method : "POST",
            headers : {
                "Content-Type" : "application/json",
                "Authorization" : this.token
            },
            body : JSON.stringify(payload)
        })

        if(!response.ok){
            throw new Error(`HTTP error! Status: ${response.status}`)
        }

        return await response.json()

    }

    async postFormAuthorization(endpoint, formData) {
        const response = await fetch(`${this.url}${endpoint}`, {
            method: "POST",
            headers: {
                "Authorization": this.token
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    }

      async deleteAuthorization(endpoint) {
    const response = await fetch(`${this.url}${endpoint}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: this.token,
      },
    });
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.json();
  }

  async putAuthorization(endpoint, payload) {
  const response = await fetch(`${this.url}${endpoint}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": this.token
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return await response.json();
}




    
}

// const apiHelper = new ApiHelper("http://localhost:3000")
const apiHelper = new ApiHelper("https://wishmanagement-be")
export default apiHelper
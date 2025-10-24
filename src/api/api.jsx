import api from "./apiService";

const CONTROLS = {
    moveUp: "ArrowUp",
    moveDown: "ArrowDown",
    moveLeft: "ArrowLeft",
    moveRight: "ArrowRight",
    shoot: "Space",
    exit: "Escape",
};

const signup = async (form) => {
  try {
    const response = await api.post('/auth/signup', form)

    if (response.data.token) {
      localStorage.setItem("token", response.data.token)
    }
    localStorage.setItem("userName", form.userName)
    localStorage.setItem("email", response.data.email)
    localStorage.setItem("volume", "100")
    localStorage.setItem("controls", JSON.stringify(CONTROLS))
    
    return {
      success: true,
      message: response.data.message
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      message: err.response?.data?.message || "Signup failed"
    }
  }
}

const login = async (form) => {
  try {
    const response = await api.get(`/auth/login?email=${form.email}&password=${form.password}`)
    
    if (response.data.token) {
      localStorage.setItem("token", response.data.token)
    }
    localStorage.setItem("email", form.email)
    localStorage.setItem("userName", response.data.userName)

    return {
      success: true,
      message: response.data.message
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      message: err.response?.data?.message || "Login failed"
    }
  }
}

const updateUserName = async (userName) => {
  try {
    const response = await api.put(`/user/profile/update`,{
      userName
    })
    return {
      success: true,
      message: response.data.message
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      message: err.response?.data?.message || "Updation failed"
    }
  }
}

const aggregatedData = async () => {
  try{
    const res = await api.get("/user/stats"); 
    return {
      success: true,
      data: res.data
    }
  } catch(err) {
    console.error(err)
    return {
      success: false,
      message: err.response?.data?.message || "Fetch failed"
    }
  }
}

const matchHistory = async (reset,page,limit) => {
  try{
    const res = await api.get("/user/history",{ 
      params: { page: reset ? 1 : page, limit } 
    }) 
    return {
      success: true,
      data: res.data
    }
  } catch(err) {
    console.error(err)
    return {
      success: false,
      message: err.response?.data?.message || "Fetch failed"
    }
  }
}

const createMatch = async (spawnCount) => {
  try{
    const res = await api.post("/game/match/create",{ 
      spawnCount
    }) 
    return {
      success: true,
      data: res.data
    }
  } catch(err) {
    console.error(err)
    return {
      success: false,
      message: err.response?.data?.message || "Fetch failed"
    }
  }
}

export { 
    signup,
    login,
    updateUserName,
    aggregatedData,
    matchHistory,
    createMatch
}

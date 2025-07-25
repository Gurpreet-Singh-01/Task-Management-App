import { configureStore } from "@reduxjs/toolkit";
import authReducers from "../slices/authSlice"
const store = configureStore({
    reducer:{
        auth:authReducers
    }
})

export default store
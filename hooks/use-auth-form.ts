"use client"

import { useState } from "react"

export function useAuthForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailError, setEmailError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleContinue = () => {
    if (!email) {
      setEmailError("Please enter your email address")
      return
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address")
      return
    }

    // Show confirmation screen
    setShowConfirmation(true)
  }

  const handlePasswordContinue = () => {
    if (!email) {
      setEmailError("Please enter your email address")
      return
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address")
      return
    }

    if (!password) {
      setEmailError("Please enter your password")
      return
    }

    // Handle password login logic here
    console.log("Login with password", { email, password })
  }

  const handlePasswordLogin = () => {
    setShowPasswordForm(true)
  }

  const handleBackToMain = () => {
    setShowPasswordForm(false)
    setPassword("")
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    emailError,
    setEmailError,
    showPassword,
    showConfirmation,
    showPasswordForm,
    handleContinue,
    handlePasswordContinue,
    handlePasswordLogin,
    handleBackToMain,
    togglePasswordVisibility,
  }
}

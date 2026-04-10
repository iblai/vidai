"use client"

import { useState } from "react"
import { redirectToAuthSpa } from "@/lib/iblai/auth-utils"

export function useAuthForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailError, setEmailError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  const handleContinue = () => {
    // Redirect to ibl.ai SSO login
    redirectToAuthSpa()
  }

  const handlePasswordContinue = () => {
    // Redirect to ibl.ai SSO login
    redirectToAuthSpa()
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

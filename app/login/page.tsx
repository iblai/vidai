"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuthForm } from "@/hooks/use-auth-form"
import { useSlides } from "@/hooks/use-slides"
import { GoogleIcon, AppleIcon, EyeIcon, EyeOffIcon } from "@/components/auth-icons/auth-icons"

import { WatchSection } from "@/components/sections/watch-section"
import { PricingSection } from "@/components/sections/pricing-section"
import { FAQSection } from "@/components/sections/faq-section"
import { NavigationBar } from "@/components/sections/navigation-bar"
import { ScrollToTopButton } from "@/components/sections/scroll-to-top-button"

export default function LoginPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)
  const [showNavBar, setShowNavBar] = useState(false)
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(0)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [activeSection, setActiveSection] = useState<string>("")
  const [viewportHeight, setViewportHeight] = useState(0)

  const [contentVisible, setContentVisible] = useState({
    title: true,
    subtitle: true,
    startButton: true,
    footer: true,
  })
  const [hasScrolled, setHasScrolled] = useState(false)
  const [isCompactMode, setIsCompactMode] = useState(false)

  const {
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
  } = useAuthForm()

  const { currentSlide, fadeIn, slideStyles, slides, changeSlide } = useSlides()

  // Enhanced viewport height tracking with content adaptation
  useEffect(() => {
    const updateViewportAndContent = () => {
      const isMobile = window.innerWidth <= 768
      let newViewportHeight

      if (isMobile) {
        newViewportHeight = window.innerHeight
      } else {
        newViewportHeight = window.innerHeight
      }

      setViewportHeight(newViewportHeight)

      // Determine if we need compact mode based on available space
      const isVerySmall = newViewportHeight < 550
      const isSmall = newViewportHeight < 650

      setIsCompactMode(isVerySmall || isSmall)

      // Adaptive content visibility based on height and scroll
      if (isVerySmall) {
        // Very small screens: hide subtitle and start button initially
        setContentVisible({
          title: true,
          subtitle: hasScrolled,
          startButton: hasScrolled,
          footer: hasScrolled,
        })
      } else if (isSmall) {
        // Small screens: hide start button initially
        setContentVisible({
          title: true,
          subtitle: true,
          startButton: hasScrolled,
          footer: hasScrolled,
        })
      } else {
        // Normal screens: show everything
        setContentVisible({
          title: true,
          subtitle: true,
          startButton: true,
          footer: true,
        })
      }
    }

    updateViewportAndContent()

    const handleResize = () => {
      const isMobile = window.innerWidth <= 768
      if (!isMobile) {
        updateViewportAndContent()
      }
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [hasScrolled])

  // Scroll detection for revealing hidden content
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50
      if (scrolled !== hasScrolled) {
        setHasScrolled(scrolled)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [hasScrolled])

  // Calculate dynamic sizing based on viewport height
  const getResponsiveSizes = () => {
    const isMobile = typeof window !== "undefined" && window.innerWidth <= 768
    const maxHeight = Math.min(viewportHeight, 730)
    const isSmallScreen = maxHeight < 600
    const isMediumScreen = maxHeight >= 600 && maxHeight < 700

    // Compact mode adjustments
    const compactAdjustment = isCompactMode
      ? {
          logoHeight: "h-5",
          titleSize: "text-base",
          subtitleSize: "text-xs",
          buttonHeight: "h-8",
          inputHeight: "h-8",
          spacing: "space-y-2",
          padding: "p-2",
          margin: "mb-2",
          iconSize: "w-3 h-3",
          iconWatchSize: "w-4 h-4",
          fontSize: "text-xs",
        }
      : {}

    return {
      containerHeight: maxHeight,
      logoHeight: isSmallScreen ? "h-6" : isMediumScreen ? "h-8" : "h-10",
      titleSize: isSmallScreen ? "text-lg" : isMediumScreen ? "text-xl" : "text-2xl",
      subtitleSize: isSmallScreen ? "text-xs" : isMediumScreen ? "text-sm" : "text-base",
      buttonHeight: isSmallScreen ? "h-9" : isMediumScreen ? "h-10" : "h-12",
      inputHeight: isSmallScreen ? "h-9" : isMediumScreen ? "h-10" : "h-12",
      spacing: isSmallScreen ? "space-y-3" : isMediumScreen ? "space-y-4" : "space-y-5",
      spacingTitle: isSmallScreen ? "space-y-12" : isMediumScreen ? "space-y-13" : "space-y-16",
      padding: isSmallScreen ? "p-3" : isMediumScreen ? "p-4" : "p-6",
      margin: isSmallScreen ? "mb-3" : isMediumScreen ? "mb-4" : "mb-6",
      footerSpacing: "py-3",
      iconSize: isSmallScreen ? "w-4 h-4" : isMediumScreen ? "w-5 h-5" : "w-6 h-6",
      iconWatchSize: isSmallScreen ? "w-5 h-5" : isMediumScreen ? "w-6 h-6" : "w-7 h-7",
      fontSize: isSmallScreen ? "text-xs" : isMediumScreen ? "text-sm" : "text-base",
      ...compactAdjustment,
    }
  }

  const sizes = getResponsiveSizes()

  // FAQ data
  const faqData = [
    {
      question: "How does vidAI work?",
      answer:
        "vidAI uses advanced AI technology to help you create engaging video content and interactive characters. Simply upload your materials and let our AI transform them into compelling videos.",
    },
    {
      question: "What kind of files can I upload?",
      answer:
        "You can upload various file types including images, videos, PDFs, and text files. Our AI can process and analyze these materials to create amazing video content.",
    },
    {
      question: "How do I create interactive characters?",
      answer:
        "Use our character generation tools to create AI-powered avatars that can interact with your audience. Upload photos or videos to get started.",
    },
    {
      question: "Can I customize my videos?",
      answer:
        "Yes! You have full control over your video content, including styles, effects, and character interactions. Our platform offers extensive customization options.",
    },
    {
      question: "Is vidAI free to use?",
      answer:
        "We offer both free and premium plans. The free plan includes basic features, while premium plans unlock advanced AI models and additional capabilities.",
    },
    {
      question: "How do I share my creations?",
      answer:
        "You can easily share your videos and characters through direct links, social media, or by embedding them in your website or presentations.",
    },
  ]

  // Handle smooth scrolling to watch section
  const scrollToWatch = () => {
    const watchSection = document.getElementById("watch-section")
    if (watchSection) {
      watchSection.scrollIntoView({ behavior: "smooth" })
      setShowNavBar(true)
    }
  }

  // Handle smooth scrolling to pricing section
  const scrollToPricing = () => {
    const pricingSection = document.getElementById("pricing-section")
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: "smooth" })
      setShowNavBar(true)
    }
  }

  // Handle smooth scrolling to FAQ section
  const scrollToFAQ = () => {
    const faqSection = document.getElementById("faq-section")
    if (faqSection) {
      faqSection.scrollIntoView({ behavior: "smooth" })
      setShowNavBar(true)
    }
  }

  // Handle scroll back to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
    setShowNavBar(false)
  }

  // Toggle FAQ expansion
  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index)
  }

  useEffect(() => {
    if (showConfirmation) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            router.push("/characters/generate")
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [showConfirmation, router])

  // Handle scroll detection for navbar and active sections
  useEffect(() => {
    const handleScroll = () => {
      const watchSection = document.getElementById("watch-section")
      const pricingSection = document.getElementById("pricing-section")
      const faqSection = document.getElementById("faq-section")

      // Show/hide navbar
      if (watchSection || pricingSection || faqSection) {
        const watchRect = watchSection?.getBoundingClientRect()
        const pricingRect = pricingSection?.getBoundingClientRect()
        const faqRect = faqSection?.getBoundingClientRect()
        setShowNavBar(
          (watchRect && watchRect.top <= 100) ||
            (pricingRect && pricingRect.top <= 100) ||
            (faqRect && faqRect.top <= 100),
        )
      }

      // Determine active section
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight

      if (watchSection && pricingSection && faqSection) {
        const watchTop = watchSection.offsetTop - 200
        const pricingTop = pricingSection.offsetTop - 200
        const faqTop = faqSection.offsetTop - 200

        if (scrollY >= faqTop) {
          setActiveSection("faq")
        } else if (scrollY >= pricingTop) {
          setActiveSection("pricing")
        } else if (scrollY >= watchTop) {
          setActiveSection("watch")
        } else {
          setActiveSection("")
        }
      }

      // Show/hide scroll to top button
      setShowScrollTop(window.scrollY > 200)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="w-full">
      {/* Navigation Bar - Fixed at top when scrolled to watch section */}
      <NavigationBar
        showNavBar={showNavBar}
        activeSection={activeSection}
        scrollToWatch={scrollToWatch}
        scrollToPricing={scrollToPricing}
        scrollToFAQ={scrollToFAQ}
        scrollToTop={scrollToTop}
      />

      {/* Original Login Section - Dynamic height with 730px max */}
      <div
        className="flex w-full flex-col xl:flex-row overflow-hidden"
        style={{
          height: typeof window !== "undefined" && window.innerWidth <= 768 ? "100vh" : `${sizes.containerHeight}px`,
          maxHeight: typeof window !== "undefined" && window.innerWidth <= 768 ? "none" : "730px",
          minHeight: "100vh",
        }}
      >
        {/* Left Column - Auth Form */}
        <div className="flex w-full flex-col xl:w-1/2 h-full">
          <div className="flex flex-col h-full p-3 md:p-4 lg:p-6 justify-between">
            {/* Logo Section */}
            <div className={`flex justify-center items-center gap-3 flex-shrink-0`}>
              <Image
                src="/images/videogenai-logo.png"
                alt="vidAI Logo"
                width={300}
                height={60}
                className={`${sizes.logoHeight} w-auto`}
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-[#38A1E5] to-[#0078FF] bg-clip-text text-transparent">
                vidAI
              </span>
            </div>

            {/* Title and Subtitle Section - Centered */}
            {!showConfirmation && !showPasswordForm && (
              <div className="flex justify-center items-center">
                <div className="text-center">
                  <div className={`space-y-2 transition-all duration-300 ${isCompactMode ? "transform scale-95" : ""}`}>
                    <h1
                      className={`${sizes.titleSize} sm:${sizes.titleSize} md:text-xl lg:text-2xl xl:text-3xl text-[#4E5460] leading-tight font-normal transition-all duration-300 ${
                        contentVisible.title ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                      }`}
                    >
                      Create Characters & Video Clips
                    </h1>
                    {contentVisible.subtitle && (
                      <p
                        className={`text-gray-600 mt-1 ${sizes.subtitleSize} leading-tight transition-all duration-300 ${
                          contentVisible.subtitle ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                        }`}
                      >
                        Expand your teaching style with our AI-powered tools
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Auth Container Section - Centered */}
            <div className="flex justify-center items-center">
              {!showConfirmation ? (
                <>
                  {!showPasswordForm ? (
                    <div
                      className={`rounded-[0.70rem] border-[0.25px] border-[rgba(115,185,255,0.3)] bg-[#F5F8FF] ${sizes.padding} shadow-[0_0.125rem_1.25rem_0.3125rem_rgba(115,185,255,0.23)] w-full max-w-[31rem]`}
                    >
                      <div className={`flex flex-col justify-between ${sizes.spacing}`}>
                        <div className="w-full">
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value)
                              if (emailError) setEmailError("")
                            }}
                            className={`${sizes.inputHeight} rounded-md ${sizes.fontSize} ${emailError ? "border-2 border-blue-500" : "border-gray-200"}`}
                          />
                          {emailError && (
                            <p style={{ color: "#0078FF", fontSize: "0.7rem", marginTop: "0.25rem" }}>{emailError}</p>
                          )}
                        </div>

                        <Button
                          className={`w-full ${sizes.buttonHeight} text-white rounded-md ${sizes.fontSize} font-medium`}
                          style={{
                            background: "linear-gradient(to right, #38A1E5, #0078FF)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "linear-gradient(to right, #2E91D5, #0069E0)"
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "linear-gradient(to right, #38A1E5, #0078FF)"
                          }}
                          onClick={handleContinue}
                        >
                          Continue
                        </Button>

                        <div className={`text-center text-gray-500 ${sizes.fontSize} py-1`}>OR</div>

                        <Button
                          variant="outline"
                          className={`w-full ${sizes.buttonHeight} flex items-center justify-center gap-1 border border-gray-200 rounded-md ${sizes.fontSize}`}
                        >
                          <GoogleIcon />
                          Continue with Google
                        </Button>

                        <Button
                          variant="outline"
                          className={`w-full ${sizes.buttonHeight} flex items-center justify-center gap-1 border border-gray-200 rounded-md ${sizes.fontSize}`}
                        >
                          <AppleIcon />
                          Continue with Apple
                        </Button>

                        <Button
                          variant="outline"
                          className={`w-full ${sizes.buttonHeight} flex items-center justify-center gap-1 border border-gray-200 rounded-md ${sizes.fontSize}`}
                          onClick={handlePasswordLogin}
                        >
                          <svg width="1.25rem" height="1.25rem" viewBox="0 -960 960 960" fill="#383838">
                            <path d="M80-200v-80h800v80H80Zm46-242-52-30 34-60H40v-60h68l-34-58 52-30 34 58 34-58 52 30-34 58h68v60h-68l34 60-52 30-34-60-34 60Zm320 0-52-30 34-60h-68v-60h68l-34-58 52-30 34 58 34-58 52 30-34 58h68v60h-68l34 60-52 30-34-60-34 60Zm320 0-52-30 34-60h-68v-60h68l-34-58 52-30 34 58 34-58 52 30-34 58h68v60h-68l34 60-52 30-34-60-34 60Z"></path>
                          </svg>
                          Continue with Password
                        </Button>

                        <div className="w-full text-center">
                          <div className="text-xs text-gray-500">
                            <Link href="/terms" className="hover:underline">
                              Terms of Use
                            </Link>
                            <span className="mx-2">|</span>
                            <Link href="/privacy" className="hover:underline">
                              Privacy Policy
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Password Login Form - Dynamic sizing
                    <div
                      className={`rounded-[0.70rem] border-[0.25px] border-[rgba(115,185,255,0.3)] bg-[#F5F8FF] ${sizes.padding} shadow-[0_0.125rem_1.25rem_0.3125rem_rgba(115,185,255,0.23)] w-full max-w-[28rem]`}
                    >
                      <div className={`flex flex-col justify-between ${sizes.spacing}`}>
                        <div className="w-full">
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value)
                              if (emailError) setEmailError("")
                            }}
                            className={`${sizes.inputHeight} rounded-md ${sizes.fontSize} ${emailError ? "border-2 border-blue-500" : "border-gray-200"}`}
                          />
                        </div>

                        <div className="w-full relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value)
                              if (emailError) setEmailError("")
                            }}
                            className={`${sizes.inputHeight} rounded-md ${sizes.fontSize} ${emailError ? "border-2 border-blue-500" : "border-gray-200"}`}
                          />
                          {password.length > 0 && (
                            <button
                              type="button"
                              onClick={togglePasswordVisibility}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                          )}
                        </div>
                        {emailError && (
                          <p style={{ color: "#0078FF", fontSize: "0.7rem", marginTop: "0.25rem" }}>{emailError}</p>
                        )}

                        <Button
                          className={`w-full ${sizes.buttonHeight} text-white rounded-md ${sizes.fontSize}`}
                          style={{
                            background: "linear-gradient(to right, #0078FF, #38A1E5)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "linear-gradient(to right, #0069E0, #2E91D5)"
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "linear-gradient(to right, #0078FF, #38A1E5)"
                          }}
                          onClick={handlePasswordContinue}
                        >
                          Continue
                        </Button>

                        <div className="flex justify-center w-full">
                          <button
                            onClick={handleBackToMain}
                            className="flex items-center text-blue-400 hover:text-blue-500"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className={`${sizes.iconSize} mr-1`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className={`text-blue-400 ${sizes.fontSize}`}>Back</span>
                          </button>
                        </div>

                        <div className="w-full text-center">
                          <div className="text-xs text-gray-500">
                            <Link href="/terms" className="hover:underline">
                              Terms of Use
                            </Link>
                            <span className="mx-2">|</span>
                            <Link href="/privacy" className="hover:underline">
                              Privacy Policy
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center w-full max-w-md text-center">
                  <div className="mb-4">
                    <Image
                      src="/images/design-mode/message_icon.png"
                      alt="Email Sent"
                      width={viewportHeight < 600 ? 60 : 80}
                      height={viewportHeight < 600 ? 60 : 80}
                      className="mx-auto"
                    />
                  </div>
                  <h2 className={`${sizes.titleSize} font-medium text-gray-700 mb-3`}>
                    We sent you a magic link to log in!
                  </h2>
                  <p className={`text-gray-600 mb-1 ${sizes.fontSize}`}>
                    We sent an email to you at <span className="font-medium text-[#0078FF]">{email}</span>.
                  </p>
                  <p className={`text-gray-600 ${sizes.fontSize}`}>
                    Click the link in the email to log in to your account.
                  </p>
                  <p className={`text-gray-500 mt-3 ${sizes.fontSize}`}>
                    Redirecting to dashboard in <span className="font-medium text-[#0078FF]">{countdown}</span>{" "}
                    seconds...
                  </p>
                </div>
              )}
            </div>

            {/* Footer Section */}
            {contentVisible.footer && (
              <div
                className={`flex-shrink-0 transition-all duration-300 ${
                  contentVisible.footer ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                {/* Divider */}
                <div className="w-full px-2 py-3">
                  <div className="border-t border-gray-200"></div>
                </div>

                <div className="w-full px-2 pb-2">
                  <div className="flex flex-col items-center justify-center gap-2">
                    {/* Left side - Watch, Pricing, FAQ - Centered */}
                    <div className="flex items-center justify-center space-x-3 sm:space-x-6 w-full">
                      <button
                        onClick={scrollToWatch}
                        className={`flex items-center gap-1 sm:gap-2 transition-colors group ${
                          activeSection === "watch" ? "text-[#38A1E5]" : "text-[#3E6BAD] hover:text-[#2E5A9D]"
                        }`}
                      >
                        <Image
                          src="/images/design-mode/video.png"
                          alt="Watch"
                          width={24}
                          height={24}
                          className={`${sizes.iconWatchSize} group-hover:scale-110 transition-transform`}
                        />
                        <span className={`${sizes.fontSize} font-semibold`}>Watch</span>
                      </button>
                      <button
                        onClick={scrollToPricing}
                        className={`flex items-center gap-1 sm:gap-2 transition-colors group ${
                          activeSection === "pricing" ? "text-[#38A1E5]" : "text-[#3E6BAD] hover:text-[#2E5A9D]"
                        }`}
                      >
                        <Image
                          src="/images/design-mode/pricing.png"
                          alt="Pricing"
                          width={24}
                          height={24}
                          className={`${sizes.iconSize} group-hover:scale-110 transition-transform`}
                        />
                        <span className={`${sizes.fontSize} font-semibold`}>Pricing</span>
                      </button>
                      <button
                        onClick={scrollToFAQ}
                        className={`flex items-center gap-1 sm:gap-2 transition-colors group ${
                          activeSection === "faq" ? "text-[#38A1E5]" : "text-[#3E6BAD] hover:text-[#2E5A9D]"
                        }`}
                      >
                        <Image
                          src="/images/design-mode/faq.png"
                          alt="FAQ"
                          width={24}
                          height={24}
                          className={`${sizes.iconSize} group-hover:scale-110 transition-transform`}
                        />
                        <span className={`${sizes.fontSize} font-semibold`}>FAQ</span>
                      </button>
                    </div>

                    {/* Right side - Powered by - Only show when right column is hidden */}
                    <div className="flex items-center text-[#3E6BAD] xl:hidden">
                      <span className="flex items-center text-sm">
                        Powered by
                        <Image
                          src="/images/design-mode/iblai-logo.png"
                          alt="IBL AI"
                          width={43}
                          height={19}
                          className="h-4 w-auto mx-2"
                          style={{ marginBottom: "0.45rem" }}
                        />
                        in New York
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Logo and Slides - Dynamic sizing */}
        <div className="hidden xl:flex xl:w-1/2 bg-blue-50 flex-col rounded-[0.70rem] m-4">
          <div className="flex flex-col h-full p-6 justify-between">
            {/* Logo at the top */}
            <div className="flex justify-center w-full flex-shrink-0">
              <Image
                src="/images/videogenai-logo.png"
                alt="vidAI Logo"
                width={50}
                height={50}
                className={`${sizes.logoHeight} w-auto`}
              />
            </div>

            {/* Slides - Centered */}
            <div className="flex items-center justify-center w-full min-h-0">
              <div className="flex flex-col items-center justify-center w-full h-full px-2">
                <div
                  className={`w-full h-full flex items-center justify-center transition-opacity duration-150 ease-in-out ${
                    fadeIn ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div className="w-full max-w-xl">
                    <Image
                      src={slides[currentSlide].image || "/placeholder.svg"}
                      alt={slides[currentSlide].alt}
                      width={600}
                      height={480}
                      className="w-full h-auto rounded-lg shadow-lg object-contain"
                      priority={currentSlide === 0}
                      loading={currentSlide === 0 ? "eager" : "lazy"}
                    />
                  </div>
                </div>

                {/* Slider dots - Positioned below images */}
                <div className="flex justify-center gap-2 mt-6 flex-shrink-0">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentSlide ? "bg-blue-500 scale-110" : "bg-gray-300 hover:bg-gray-400"
                      }`}
                      onClick={() => changeSlide(index)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Powered by - Bottom section */}
            <div className="flex justify-end flex-shrink-0">
              <div className="flex items-center text-[#3E6BAD]">
                <span className="flex items-center text-sm">
                  Powered by
                  <Image
                    src="/images/design-mode/iblai-logo.png"
                    alt="IBL AI"
                    width={43}
                    height={19}
                    className="h-4 w-auto mx-2"
                    style={{ marginBottom: "0.45rem" }}
                  />
                  in New York
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Show when content is hidden */}
      {isCompactMode && (!contentVisible.subtitle || !contentVisible.startButton || !contentVisible.footer) && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            Scroll for more
          </div>
        </div>
      )}

      {/* Watch Section - Appears after scrolling */}
      <WatchSection />

      {/* Pricing Section - Appears after scrolling */}
      <PricingSection />

      {/* FAQ Section - Appears after scrolling */}
      <FAQSection />

      {/* Scroll to Top Button */}
      <ScrollToTopButton showScrollTop={showScrollTop} scrollToTop={scrollToTop} />
    </div>
  )
}

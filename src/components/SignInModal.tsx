import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import ArrowLeftSLineIcon from 'remixicon-react/ArrowLeftSLineIcon'
import CloseFillIcon from 'remixicon-react/CloseFillIcon'
import EyeLineIcon from 'remixicon-react/EyeLineIcon'
import EyeOffLineIcon from 'remixicon-react/EyeOffLineIcon'
import LockPasswordLineIcon from 'remixicon-react/LockPasswordLineIcon'
import MailLineIcon from 'remixicon-react/MailLineIcon'
import { images } from '../assets/images'
import { authApi, cartApi } from '../api'
import { clearOAuthState, saveOAuthReturnPath, saveOAuthState } from '../api/googleOAuth'
import { useAuth } from '../context/AuthContext'
import { useShop } from '../context/ShopContext'
import { signInLegalCopy, type SignInStep } from '../data/auth'
import { getGoogleOAuthCallbackPath } from '../data/shopRoutes'

type SignInModalProps = {
  isOpen: boolean
  onClose: () => void
}

function IconInputField({
  id,
  icon: Icon,
  type = 'text',
  value,
  onChange,
  placeholder,
  rightSlot,
}: {
  id: string
  icon: typeof MailLineIcon
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  rightSlot?: ReactNode
}) {
  return (
    <label
      htmlFor={id}
      className="flex h-14 w-full items-center overflow-hidden rounded-2xl border border-border-secondary"
    >
      <Icon className="ml-4 size-6 shrink-0 text-text-secondary" aria-hidden />
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 bg-transparent px-4 text-base font-medium leading-5 tracking-[-0.32px] text-text-primary outline-none placeholder:font-medium placeholder:text-text-secondary"
      />
      {rightSlot ? <div className="mr-4 shrink-0">{rightSlot}</div> : null}
    </label>
  )
}

function GoogleIcon() {
  return (
    <span className="flex size-12 items-center justify-center overflow-hidden rounded-full">
      <img alt="" aria-hidden className="size-12 object-contain" src={images.auth.google} />
    </span>
  )
}

function FacebookIcon() {
  return (
    <span className="flex size-12 items-center justify-center overflow-hidden rounded-full">
      <img alt="" aria-hidden className="size-12 object-contain" src={images.auth.facebook} />
    </span>
  )
}

function AppleIcon() {
  return (
    <span className="flex size-12 items-center justify-center overflow-hidden rounded-full">
      <img alt="" aria-hidden className="size-12 object-contain" src={images.auth.apple} />
    </span>
  )
}

function LegalNotice({ onLinkClick }: { onLinkClick: () => void }) {
  return (
    <p className="text-center text-base font-medium leading-5 tracking-[-0.32px] text-text-secondary">
      By continuing, you agree to our{' '}
      <Link
        to="/terms-of-use"
        onClick={onLinkClick}
        className="underline hover:text-text-primary"
      >
        Terms of Use
      </Link>{' '}
      and{' '}
      <Link
        to="/privacy-policy"
        onClick={onLinkClick}
        className="underline hover:text-text-primary"
      >
        Privacy Policy
      </Link>
      .
    </p>
  )
}

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const { signIn, register } = useAuth()
  const { refreshCart, refreshWishlist } = useShop()
  const location = useLocation()
  const [step, setStep] = useState<SignInStep>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isRegisterFlow, setIsRegisterFlow] = useState(false)
  /**
   * True when `check-email` reports an account that only has a Google login and
   * no password, so we must not show a password field for it.
   */
  const [isOAuthOnlyAccount, setIsOAuthOnlyAccount] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setStep('email')
    setEmail('')
    setPassword('')
    setShowPassword(false)
    setIsRegisterFlow(false)
    setIsOAuthOnlyAccount(false)
    setIsSubmitting(false)
    setErrorMessage(null)
  }, [isOpen])

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${scrollbarWidth}px`

    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose()
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleClose, isOpen])

  const handleEmailContinue = async () => {
    if (!email.trim()) return
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      const response = await authApi.checkEmail(email.trim())
      setIsRegisterFlow(response.nextStep === 'register')
      setIsOAuthOnlyAccount(response.nextStep === 'oauth')
      // Google-only accounts have no password, so sending them to the password
      // step would dead-end. Send them straight back to the provider buttons.
      setStep(response.nextStep === 'oauth' ? 'email' : 'password')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to continue with email.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordContinue = async () => {
    if (!password.trim()) return
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      if (isRegisterFlow) {
        await register(email.trim(), password.trim())
      } else {
        await signIn(email.trim(), password.trim())
      }
      try {
        await cartApi.mergeCart()
      } catch {
        // Guest cart merge is best-effort after sign-in.
      }
      await refreshCart()
      await refreshWishlist()
      handleClose()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to sign in.')
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Starts the Google flow: ask the API for a fresh URL + CSRF `state`, stash
   * both, then hand the whole page over to Google. The callback page reads the
   * state back and completes the exchange.
   */
  const handleGoogleSignIn = useCallback(async () => {
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      // A fresh URL/state pair on every click: `state` is single-use and short-lived.
      const { url, state } = await authApi.getGoogleOAuthUrl()
      clearOAuthState()
      saveOAuthState(state)
      // Return the user to where they started (e.g. checkout) after sign-in. The
      // modal can be reopened on the callback page itself when a Google attempt
      // failed, and saving that would loop the user back here forever.
      if (location.pathname !== getGoogleOAuthCallbackPath()) {
        saveOAuthReturnPath(location.pathname + location.search)
      }
      window.location.assign(url)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to continue with Google.')
      setIsSubmitting(false)
    }
  }, [location.pathname, location.search])

  if (!isOpen) return null

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Close sign in modal"
        className="fixed inset-0 z-50 bg-[rgba(0,6,7,0.3)]"
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sign-in-title"
        className="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[min(632px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-bg-primary"
      >
        <div className="flex shrink-0 items-center gap-2 px-6 py-4">
          {step === 'password' ? (
            <button
              type="button"
              onClick={() => setStep('email')}
              className="flex cursor-pointer items-center gap-0 rounded-full py-1 pr-2"
            >
              <ArrowLeftSLineIcon className="size-6 text-text-primary" aria-hidden />
              <span className="text-sm font-medium leading-4.5 tracking-[-0.28px] text-text-primary">
                Back
              </span>
            </button>
          ) : (
            <span className="flex-1" aria-hidden />
          )}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className={`flex size-6 shrink-0 cursor-pointer items-center justify-center ${
              step === 'password' ? '' : 'ml-auto'
            }`}
          >
            <CloseFillIcon className="size-6 text-text-secondary" aria-hidden />
          </button>
        </div>

        <div className="overflow-y-auto">
          <div className="border-b border-border-primary px-6 py-4">
            {step === 'email' ? (
              <h2
                id="sign-in-title"
                className="text-center text-xl font-semibold leading-6 tracking-[-0.4px] text-text-primary"
              >
                Sign in / Register
              </h2>
            ) : (
              <div className="flex flex-col gap-1">
                <h2
                  id="sign-in-title"
                  className="text-xl font-semibold leading-6 tracking-[-0.4px] text-text-primary"
                >
                  Create your account
                </h2>
                <p className="text-sm font-medium leading-4.5 tracking-[-0.28px] text-text-secondary">
                  Registration is easy, just fill in the password.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 border-b border-border-primary p-6">
            <IconInputField
              id="sign-in-email"
              icon={MailLineIcon}
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="Email address"
            />

            {step === 'password' ? (
              <IconInputField
                id="sign-in-password"
                icon={LockPasswordLineIcon}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={setPassword}
                placeholder="Password"
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOffLineIcon className="size-6 text-text-secondary" aria-hidden />
                    ) : (
                      <EyeLineIcon className="size-6 text-text-secondary" aria-hidden />
                    )}
                  </button>
                }
              />
            ) : null}

            {errorMessage ? (
              <p className="text-sm font-medium leading-4.5 tracking-[-0.28px] text-primary-red">
                {errorMessage}
              </p>
            ) : null}

            {isOAuthOnlyAccount ? (
              <p className="text-sm font-medium leading-4.5 tracking-[-0.28px] text-text-secondary">
                This account uses Google to sign in and has no password yet. Continue with Google
                below, or use Forgot password to set one.
              </p>
            ) : null}

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                void (step === 'email' ? handleEmailContinue() : handlePasswordContinue())
              }}
              className="btn-orange flex h-13 w-full cursor-pointer items-center justify-center rounded-full px-6 text-base font-medium leading-5 tracking-[-0.32px] text-text-inverse disabled:cursor-not-allowed disabled:opacity-70"
            >
              Continue
            </button>
          </div>

          {step === 'email' ? (
            <div className="flex flex-col items-center gap-4 p-6">
              <p className="text-center text-base font-medium leading-5 tracking-[-0.32px] text-text-secondary">
                Or continue with other ways
              </p>
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  aria-label="Continue with Google"
                  disabled={isSubmitting}
                  onClick={() => {
                    void handleGoogleSignIn()
                  }}
                  className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <GoogleIcon />
                </button>
                <button type="button" aria-label="Continue with Facebook" className="cursor-pointer">
                  <FacebookIcon />
                </button>
                <button type="button" aria-label="Continue with Apple" className="cursor-pointer">
                  <AppleIcon />
                </button>
              </div>
            </div>
          ) : null}

          <div className="p-6">
            <LegalNotice onLinkClick={handleClose} />
            <span className="sr-only">{signInLegalCopy}</span>
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}

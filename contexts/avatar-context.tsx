"use client"

import { createContext, useContext, useReducer, useCallback, type ReactNode, useEffect } from "react"

interface Message {
  type: "user" | "bot"
  content: string
}

interface AvatarState {
  isLoading: boolean
  isReady: boolean
  isSpeaking: boolean
  isThinking: boolean
  isListening: boolean
  status: string
  speechText: string
  error: string | null
  language: "en" | "hi" | "kn"
  conversationHistory: Message[] // Add this line
  avatar: any
  bones: {
    head?: any
    jaw?: any
    neck?: any
    spine?: any
    leftArm?: any
    rightArm?: any
    leftHand?: any
    rightHand?: any
    [key: string]: any
  }
  morphTargets: { [key: string]: { mesh: any; index: number } }
}

type AvatarAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_READY"; payload: boolean }
  | { type: "SET_SPEAKING"; payload: boolean }
  | { type: "SET_THINKING"; payload: boolean }
  | { type: "SET_LISTENING"; payload: boolean }
  | { type: "SET_STATUS"; payload: string }
  | { type: "SET_SPEECH_TEXT"; payload: string }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_LANGUAGE"; payload: "en" | "hi" | "kn" }
  | { type: "ADD_MESSAGE"; payload: Message } // Add this line
  | { type: "CLEAR_CONVERSATION" } // Add this line
  | { type: "SET_AVATAR"; payload: any }
  | { type: "SET_BONES"; payload: Partial<AvatarState["bones"]> }
  | { type: "SET_MORPH_TARGETS"; payload: AvatarState["morphTargets"] }

const initialState: AvatarState = {
  isLoading: true,
  isReady: false,
  isSpeaking: false,
  isThinking: false,
  isListening: false,
  status: "Loading avatar...",
  speechText: "",
  error: null,
  language: "en",
  conversationHistory: [], // Add this line
  avatar: null,
  bones: {},
  morphTargets: {},
}

function avatarReducer(state: AvatarState, action: AvatarAction): AvatarState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "SET_READY":
      return { ...state, isReady: action.payload }
    case "SET_SPEAKING":
      return { ...state, isSpeaking: action.payload }
    case "SET_THINKING":
      return { ...state, isThinking: action.payload }
    case "SET_LISTENING":
      return { ...state, isListening: action.payload }
    case "SET_STATUS":
      return { ...state, status: action.payload }
    case "SET_SPEECH_TEXT":
      return { ...state, speechText: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload }
    case "SET_LANGUAGE":
      return { ...state, language: action.payload }
    case "ADD_MESSAGE": // Add this case
      return { ...state, conversationHistory: [...state.conversationHistory, action.payload] }
    case "CLEAR_CONVERSATION": // Add this case
      return { ...state, conversationHistory: [] }
    case "SET_AVATAR":
      return { ...state, avatar: action.payload }
    case "SET_BONES":
      return { ...state, bones: { ...state.bones, ...action.payload } }
    case "SET_MORPH_TARGETS":
      return { ...state, morphTargets: action.payload }
    default:
      return state
  }
}

interface AvatarContextType {
  state: AvatarState
  setLoading: (loading: boolean) => void
  setReady: (ready: boolean) => void
  setSpeaking: (speaking: boolean) => void
  setThinking: (thinking: boolean) => void
  setListening: (listening: boolean) => void
  setStatus: (status: string) => void
  setSpeechText: (text: string) => void
  setError: (error: string | null) => void
  setLanguage: (language: "en" | "hi" | "kn") => void
  addMessage: (message: Message) => void // Add this line
  clearConversation: () => void // Add this line
  setAvatar: (avatar: any) => void
  setBones: (bones: Partial<AvatarState["bones"]>) => void
  setMorphTargets: (morphTargets: AvatarState["morphTargets"]) => void
}

const AvatarContext = createContext<AvatarContextType | null>(null)

export function AvatarProvider({ children, language }: { children: ReactNode; language: "en" | "hi" | "kn" }) {
  const [state, dispatch] = useReducer(avatarReducer, { ...initialState, language })

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading })
  }, [])

  const setReady = useCallback((ready: boolean) => {
    dispatch({ type: "SET_READY", payload: ready })
  }, [])

  const setSpeaking = useCallback((speaking: boolean) => {
    dispatch({ type: "SET_SPEAKING", payload: speaking })
  }, [])

  const setThinking = useCallback((thinking: boolean) => {
    dispatch({ type: "SET_THINKING", payload: thinking })
  }, [])

  const setListening = useCallback((listening: boolean) => {
    dispatch({ type: "SET_LISTENING", payload: listening })
  }, [])

  const setStatus = useCallback((status: string) => {
    dispatch({ type: "SET_STATUS", payload: status })
  }, [])

  const setSpeechText = useCallback((text: string) => {
    dispatch({ type: "SET_SPEECH_TEXT", payload: text })
  }, [])

  const setError = useCallback((error: string | null) => {
    dispatch({ type: "SET_ERROR", payload: error })
  }, [])

  const setAvatar = useCallback((avatar: any) => {
    dispatch({ type: "SET_AVATAR", payload: avatar })
  }, [])

  const setBones = useCallback((bones: Partial<AvatarState["bones"]>) => {
    dispatch({ type: "SET_BONES", payload: bones })
  }, [])

  const setMorphTargets = useCallback((morphTargets: AvatarState["morphTargets"]) => {
    dispatch({ type: "SET_MORPH_TARGETS", payload: morphTargets })
  }, [])

  const setLanguage = useCallback((language: "en" | "hi" | "kn") => {
    dispatch({ type: "SET_LANGUAGE", payload: language })
  }, [])

  const addMessage = useCallback((message: Message) => {
    dispatch({ type: "ADD_MESSAGE", payload: message })
  }, [])

  const clearConversation = useCallback(() => {
    dispatch({ type: "CLEAR_CONVERSATION" })
  }, [])

  useEffect(() => {
    setLanguage(language)
  }, [language, setLanguage])

  const value = {
    state,
    setLoading,
    setReady,
    setSpeaking,
    setThinking,
    setListening,
    setStatus,
    setSpeechText,
    setError,
    setLanguage,
    addMessage,
    clearConversation,
    setAvatar,
    setBones,
    setMorphTargets,
  }

  return <AvatarContext.Provider value={value}>{children}</AvatarContext.Provider>
}

export function useAvatar() {
  const context = useContext(AvatarContext)
  if (!context) {
    throw new Error("useAvatar must be used within an AvatarProvider")
  }
  return context
}

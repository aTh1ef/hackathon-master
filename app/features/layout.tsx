'use client'
import { useAuth } from "../../contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

type Props = {
    children: React.ReactNode
}

export default function FeatureLayout({ children }: Props) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            alert("You must be signed in!")
            router.replace("/")
        }
    }, [user, loading, router])

    if (loading) return <div>Loading...</div>
    if (!user) return null

    return <>{children}</>
}



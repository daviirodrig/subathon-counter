"use client"
import { useEffect, useState } from "react"
import { Socket } from "socket.io"
import io from "socket.io-client"

const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null)

    useEffect(() => {
        if (socket) return
        const s = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL!, {
            autoConnect: true,
            transports: ["websocket"],
        })

        s.on("pong", () => {
            setTimeout(() => {
                s.emit("ping")
            }, 10000)
        })

        s.on("connect", () => {
            setSocket(s as any)
            s.emit("ping")
        })

        s.on("disconnect", () => {
            console.log("Desconectado")
            s.disconnect()
            s.removeAllListeners()
            setSocket(null)
        })

        console.log("Mandei essa merda")

        return () => {
            // setSocket(null)
            // s.disconnect()
            // s.removeAllListeners()
        }
    }, [socket])

    return socket
}

export default useSocket
// ROBERT IS HERE ROBERT IS HERE RROBERTH IS SRHERHE IHES LOOKING TAAT ME PLESAE SEND HELP I CANT LVIE ANYWMORE HE KEEPS WATCHING ME I CANT SLEEP I CANT EAT I CANT DO ANYTHING ANYMORE PLEASE HELP ME PLEASE HELP ME PLEASE HELP'

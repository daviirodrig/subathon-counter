import storage from "./handlers/storage"
await storage.read()

import { ApiCheer, ApiDonation, ApiSub, ApiSubGift } from "./types/responses"
import cors from "cors"
import express from "express"
import http from "http"
// import { Server } from "socket.io"
import tmi from "./services/tmi"
import websocket from "./websocket"

const app = express()
const httpServer = http.createServer(app)
// const io = new Server(httpServer, { cors: { origin: "*" } })

websocket.init(httpServer)

app.use(cors({ origin: "*" }))
app.use(express.json())

app.all("*", (req, res) => {
    console.log(req.query, req.params, req.body)
    res.status(200).send("OK")
})

httpServer.listen(5555, () => {
    console.log("Server listening on port 5555")
})

import livepix from "./services/livepix"
import timer from "./handlers/timer"
import commands from "./handlers/commands"
import youtube from "./services/youtube"

livepix.setDonationCallback((donation) => {
    console.log(
        `Donation "${donation.author}" ${donation.amount.formatted}: "${donation.message}"`
    )

    timer.addMs(
        Number(donation.amount.value * timer.getMultipliers().msPerReal)
    )
    websocket.sendTime()
    websocket.broadcast("donation", donation satisfies ApiDonation)
})

livepix.startConnection()

tmi.setBitsCallback((bits) => {
    const cheerEvent = {
        amount: bits.bitsAmount,
        time: 1,
        user: {
            name: bits.username,
            color: bits.color,
        },
    } satisfies ApiCheer

    console.log(`Bits "${cheerEvent.user.name}" ${cheerEvent.amount}`)
    websocket.broadcast("cheer", cheerEvent)

    timer.addMs(timer.getMultipliers().msPerBit * bits.bitsAmount)
    websocket.sendTime()
})

tmi.setSubCallback((sub) => {
    const subEvent = {
        time: 1,
        user: {
            name: sub.username,
            color: sub.color,
        },
    } satisfies ApiSub

    console.log(`Sub "${subEvent.user.name}"`)
    websocket.broadcast("sub", subEvent)

    timer.addMs(1 * timer.getMultipliers().msPerSub)
    websocket.sendTime()
})

tmi.setSubGroupCallback((subGroup) => {
    console.log({ subGroup })
})

tmi.setSubGiftCallback((subGift) => {
    const subgiftEvent = {
        author: subGift.author,
        authorColor: subGift.authorColor,
        receiver: subGift.receiver,
    } satisfies ApiSubGift

    console.log(
        `SubGift "${subgiftEvent.author}" -> "${subgiftEvent.receiver}"`
    )
    websocket.broadcast("subgift", subgiftEvent)
    timer.addMs(1 * timer.getMultipliers().msPerSub)
    websocket.sendTime()
})

tmi.getClient().on("message", commands.handleTwitchMessage)
tmi.connect()

youtube.setSuperchatCallback((donation) => {
    if (donation.amount.currency !== "brl") return
    console.log(
        `Superchat "${donation.author}" ${donation.amount.formatted}: "${donation.message}"`
    )

    timer.addMs(
        Number(donation.amount.value * timer.getMultipliers().msPerReal)
    )
    websocket.sendTime()
    websocket.broadcast("donation", donation satisfies ApiDonation)
})

youtube.setMemberCallback((member) => {
    const subEvent = {
        time: 1,
        user: {
            name: member.username,
            color: "#ffffff",
        },
    } satisfies ApiSub
    console.log(`Member "${member.username}"`)
    timer.addMs(1 * timer.getMultipliers().msPerSub)
    websocket.broadcast("sub", subEvent satisfies ApiSub)
})

youtube.setMemberGiftCallback((memberGift) => {
    const subgiftEvent = {
        author: memberGift.author,
        authorColor: "#ffffff",
        receiver: memberGift.receiver,
    } satisfies ApiSubGift
    console.log(
        `MemberGift "${subgiftEvent.author}" -> "${subgiftEvent.receiver}"`
    )
    websocket.broadcast("subgift", subgiftEvent satisfies ApiSubGift)
    timer.addMs(1 * timer.getMultipliers().msPerSub)
    websocket.sendTime()
})

youtube.getClient().on("message", (msg) => commands.handleYoutubeMessage(msg)) //commands.handleYoutubeMessage)
youtube.connect()

const saveData = async () => {
    await storage.write({
        ...timer.getMultipliers(),
        timeLeft: timer.getMsLeft(),
        isPaused: timer.getPauseStatus(),
        lastTimePaused: timer.getLastPauseTime(),
    })
    setTimeout(saveData, 1000)
}

setTimeout(() => {
    console.log("Iniciando sistema de save")
    saveData()
}, 5000)

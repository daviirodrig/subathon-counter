import ms from "parse-duration"
import { ChatUserstate } from "tmi.js"
import websocket from "../websocket"
import timer from "./timer"
import type { IMultipliers } from "./timer"
import type { IChatYTMessage } from "tubechat/lib/types/Client"

const PREFIX = "!"

const handleTimer = (rawArgs: string[]) => {
    if (rawArgs.length === 0) return console.log("Sem args", rawArgs)
    const firstArg = rawArgs[0]
    const operator = firstArg[0]
    const prettyTime = firstArg.slice(1, firstArg.length)

    const msTime = ms(prettyTime)
    if (typeof msTime !== "number")
        return console.log("Tempo inválido", prettyTime)

    switch (operator) {
        case "+":
            timer.addMs(msTime)
            break
        case "-":
            timer.removeMs(msTime)
            break
        case "=":
            timer.setMs(msTime)
            break
        default:
            console.log("Operator inválido", operator)
            return
    }

    websocket.broadcast("forced-time", { operator, prettyTime })
    websocket.sendTime()
}

const handleValueChange = (key: keyof IMultipliers) => (rawArgs: string[]) => {
    const [value] = rawArgs
    const msTime = ms(value)
    if (!msTime) return console.log("Tempo inválido", value)
    const multipliers = timer.getMultipliers()
    timer.setMultipliers({ ...multipliers, [key]: msTime })

    console.log("Setei", key, msTime, value)
}

const handleReload = () => {
    websocket.broadcast("reload")
}

const handlePause = () => {
    timer.togglePause()
    websocket.broadcast("pause-status", timer.getPauseStatus())
    console.log("Paused", timer.getPauseStatus())
}

const handleTwitchMessage = (
    channel: string,
    tags: ChatUserstate,
    message: string,
    self: boolean
) => {
    if (tags["message-type"] !== "chat") return
    if (self || !message.startsWith(PREFIX)) return

    const whiteListUserIds: string[] = []

    const [source, ...args] = message.slice(1).split(/ +/g)
    const isMod = whiteListUserIds.includes(tags["user-id"]!)
    if (!isMod) return console.log("Usuário não é mod", tags.username!, message)

    console.log("Handling %s from %s", message, tags.username!)
    handleCommands(source, args)
}

const handleYoutubeMessage = (message: IChatYTMessage) => {
    // console.log("Handling youtube message", message)

    const whitelist: string[] = []
    const isMod = message.isModerator || message.isOwner || whitelist.includes(message.channelId)

    if (!message.message[0].text?.startsWith(PREFIX)) return
    if (!isMod) {
        console.log("User is not mod", message.name)
        return
    }
    const [source, ...args] =
        message.message[0].text?.slice(1).split(/ +/g) || []

    console.log("Handling %s from %s", message.message[0].text, message.name)
    handleCommands(source, args)
}

const handleCommands = (command: string, args: string[]) => {
    switch (command) {
        case "timer":
            return handleTimer(args)
        case "real":
            return handleValueChange("msPerReal")(args)
        case "sub":
            return handleValueChange("msPerSub")(args)
        case "bit":
        case "bits":
            handleValueChange("msPerBit")(args)
            return
        case "reload":
            return handleReload()
        case "pause":
        case "stop":
        case "start":
            return handlePause()
        default:
            console.log("Command inválido", command, args.toString())
            return
    }
}

const commands = {
    handleTwitchMessage,
    handleYoutubeMessage,
}

export default commands

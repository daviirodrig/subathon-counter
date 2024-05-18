import { TubeChat } from "tubechat"
import myEnv from "../myEnv"
import { ApiDonation } from "../types/responses"

const client = new TubeChat()

type MemberCallback = ({ username }: { username: string }) => void

type MemberGiftCallback = ({
    author,
    receiver,
}: {
    author: string
    receiver: string
}) => void

type SuperchatCallback = ({ amount, author, message }: ApiDonation) => void

let memberCallback: null | MemberCallback = null
let superchatCallback: null | SuperchatCallback = null
let memberGiftCallback: null | MemberGiftCallback = null

client.on("chat_connected", (channel, videoID) => {
    console.log("Connected to", channel, videoID)
})

client.on("chat_disconnected", (channel, videoID) => {
    console.log("Disconnected from", channel, videoID)
})

client.on("chat_error", (e) => {
    console.log("chat_error", e)
})

client.on("superchatSticker", (superchatSticker) => {
    if (superchatCallback)
        superchatCallback({
            amount: {
                value: superchatSticker.amount,
                currency: superchatSticker.currency,
                formatted: superchatSticker.formated,
            },
            author: superchatSticker.name,
            message: superchatSticker.message?.[0].text || "",
            type: "",
        })
})

client.on("superchat", (superchat) => {
    if (superchatCallback)
        superchatCallback({
            amount: {
                value: superchat.amount,
                currency: superchat.currency,
                formatted: superchat.formated,
            },
            author: superchat.name,
            message: superchat.message?.[0].text || "",
            type: "",
        })
})


client.on("sub", (member) => {
    if (memberCallback) memberCallback({ username: member.name })
})
client.on("subGift", (memberGift) => {
    console.log("SubGift", memberGift)
    // if (memberGiftCallback)
    //     memberGiftCallback({
    //         author: memberGift.channelName,
    //         receiver: memberGift.giftTo.join(", "),
    //     })
})
client.on("subgiftGroup", (subgiftGroup) => {
    console.log("SubgiftGroup", subgiftGroup)
})

client.on("userReceiveSubGift", (userReceiveSubGift) => {
    console.log("UserReceiveSubGift", userReceiveSubGift)
    if (memberGiftCallback)
        memberGiftCallback({
            author: userReceiveSubGift.text,
            receiver: userReceiveSubGift.name,
        })
})

const youtube = {
    connect: () => {
        if (myEnv.YT_CHANNEL === "disabled") {
            console.log("YouTube disabled")
            return
        }
        console.log("Connecting to YouTube...")
        client.connect(myEnv.YT_CHANNEL)
    },
    getClient: () => client,
    setMemberCallback: (cb: MemberCallback) => {
        memberCallback = cb
    },
    setSuperchatCallback: (cb: SuperchatCallback) => {
        superchatCallback = cb
    },
    setMemberGiftCallback: (cb: MemberGiftCallback) => {
        memberGiftCallback = cb
    },
}
export default youtube

import { REST, Routes, APIUser } from "discord.js";
import {Keys} from "../../keys/keys.js";

// * Removes every command from bot.
const rest = new REST({ version: "10" }).setToken(Keys.token)

async function main() {
    const currentUser = await rest.get(Routes.user()) as APIUser

    const endpoint = Routes.applicationCommands(currentUser.id)

    await rest.put(endpoint, { body: [] })
    return currentUser
}

main()
    .then((user) => {
        const tag = `${user.username}#${user.discriminator}`
        const response = `Successfully removed all commands for public mode on ${tag}`

        console.log(response)
    })
    .catch(console.error)

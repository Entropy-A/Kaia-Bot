import {REST, Routes, APIUser, ApplicationCommandData} from "discord.js";
import {commands} from "../../commands/index.js";
import {Keys} from "../../keys/keys.js";

// * Deploys Commands to guild via API.
const body: ApplicationCommandData[] = [];
commands.categories.forEach(category => {
    category.commands.forEach(command => {
        body.push(command.data);
    });
});
const rest = new REST({ version: "10" }).setToken(Keys.token)

async function main() {
    const currentUser = await rest.get(Routes.user()) as APIUser

    const endpoint = process.env.NODE_ENV === "production"
        ? Routes.applicationCommands(currentUser.id)
        : Routes.applicationGuildCommands(currentUser.id, Keys.testGuild)

    await rest.put(endpoint, { body })

    return currentUser
}

main()
    .then((user) => {
        const tag = `${user.username}#${user.discriminator}`
        const response = process.env.NODE_ENV === "production"
            ? `Successfully released commands for public mode on ${tag}`
            : `Successfully registered commands for development mode on ${tag}`

        console.log(response)
    })
    .catch(console.error)
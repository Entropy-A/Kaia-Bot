import {plainToInstance} from "class-transformer";
import {Locale, LocaleString} from "discord.js";
import fs from "fs";
import {z} from "zod";
import {getDeepestElements, MyJSON} from "../utils/index.js";
import {syslog} from "../index.js";

// TODO: Rewatch if everything works and improve coe (errror handling)
// Create the Zod schema
const textDataSchema = z.object({
    error: z.object({

        embedLayout: z.object({
            description: z.string(),
            cause: z.string(),
        }),

        botNotConnected: z.object({
            title: z.string().optional(),
            message: z.string(),
            cause: z.string().optional(),
        }),

        failedCommand: z.object({
            title: z.string().optional(),
            message: z.string(),
            cause: z.string().optional(),
        }),

        userNotConnectedToVoice: z.object({
            title: z.string().optional(),
            message: z.string(),
            cause: z.string().optional(),
        }),

        notConnectedToSameVC: z.object({
            title: z.string().optional(),
            message: z.string(),
            cause: z.string().optional(),
        }),

        alreadyPaused: z.object({
            title: z.string().optional(),
            message: z.string(),
            cause: z.string().optional(),
        }),

        alreadyResumed: z.object({
            title: z.string().optional(),
            message: z.string(),
            cause: z.string().optional(),
        }),

        couldNotSkip: z.object({
            title: z.string().optional(),
            message: z.string(),
            cause: z.string().optional(),
        }),

        UNEXPECTED_ERROR: z.object({
            title: z.string(),
            message: z.string(),
        }),
    }),

    commands: z.object({
        categorys: z.object({
            general: z.object({
                name: z.string(),
                description: z.string(),
            }),
            debug: z.object({
                name: z.string(),
                description: z.string(),
            }),
            music: z.object({
                name: z.string(),
                description: z.string(),
            }),
        }),

        ping: z.object({
            commandDescription: z.string(),
            detailedDescription: z.object({
                title: z.string(),
                description: z.string(),
                syntax: z.string(),
                returns: z.string(),
            }),
            title: z.string(),
            message: z.object({
                close: z.string(),
                normal: z.string(),
                slow: z.string(),
            }),
        }),

        help: z.object({
            commandDescription: z.string(),
            detailedDescription: z.object({
                title: z.string(),
                description: z.string(),
                syntax: z.string(),
                returns: z.string()
            }),

            selectMenuPlaceholder: z.string(),

            menu: z.object({
                title: z.string(),
                description: z.string(),
            }),

            commandFieldNames: z.object({
                syntax: z.string(),
                returns: z.string()
            }),

            commandTitle: z.string(),
            commandFooter: z.string()
        }),

        play: z.object({
            commandDescription: z.string(),
            detailedDescription: z.object({
                title: z.string(),
                description: z.string(),
                syntax: z.string(),
                returns: z.string()
            }),
            optionDescription: z.string(),
            playerStart: z.string(),
            addToQueue: z.string()
        }),

        skip: z.object({
            commandDescription: z.string(),
            detailedDescription: z.object({
                title: z.string(),
                description: z.string(),
                syntax: z.string(),
                returns: z.string()
            }),

            title: z.string(),
            empty: z.string(),
        }),

        pause: z.object({
            commandDescription: z.string(),
            detailedDescription: z.object({
                title: z.string(),
                description: z.string(),
                syntax: z.string(),
                returns: z.string()
            }),

            title: z.string()
        }),

        resume: z.object({
            commandDescription: z.string(),
            detailedDescription: z.object({
                title: z.string(),
                description: z.string(),
                syntax: z.string(),
                returns: z.string()
            }),

            title: z.string()
        }),

        remind: z.object({
            commandDescription: z.string(),
            detailedDescription: z.object({
                title: z.string(),
                description: z.string(),
                syntax: z.string(),
                returns: z.string()
            }),

            title: z.string(),
            newReminderTitle: z.string(),
            newReminderSelect: z.string()
        }),
    }),
});

type InferredType = z.infer<typeof textDataSchema>;
// Recursively map the type so that "string" gets replaced with "LocaleText"
type ReplaceStringWithLocaleText<T> = {
    [K in keyof T]: T[K] extends string | undefined ? LocaleText : T[K] extends Record<any, any> ? ReplaceStringWithLocaleText<T[K]> : T[K];
};
type TextData = ReplaceStringWithLocaleText<InferredType>;

const Locals = Object.values(Locale)

/**
 * Class to make local-text-handling easier.
 * @function get(local) Returns string corresponding to specified locale.
 * @function insertInMessage(local) Inserts array of strings into the message at ever instance of "[]" and returns specified locale.
 */
// TODO: Remove [...] in Errors when handling the text stuff
export class LocaleText  {
    constructor(private data: Record<LocaleString, string>) {}

    public get locals() {
        return this.data
    }

    public get(locale: LocaleString = "en-US"): string {
        if (this.data[locale]) return this.data[locale]
        else if (this.data["en-US"]) return this.data["en-US"]
        else throw new Error(`[Text] Accessed property was not defined in the ["en-us" and "${locale}"] language file(s).`)
    }

    public insertInMessage(strings: string[], locale: LocaleString): string {
        let pendingMessage = this.get(locale)

        for (const string of strings) {
            let i = pendingMessage.indexOf("[]");
            if (i < 0) throw new Error(`[InsertInMessage Error] List ${strings} contains MORE strings than [spaces] exist in provided string [${pendingMessage}].`);
            pendingMessage = pendingMessage.slice(0, i) + string + pendingMessage.slice(i + 2);
        }

        if (pendingMessage.indexOf("[]") > -1) throw new Error(`[InsertInMessage Error] List [${strings}] contains LESS strings than [spaces] exist in provided string [${pendingMessage}].`);
        return pendingMessage;
    }
}

// Creates an Object with each language-file as value and its id as key and the JSON file as value.
const files = fs.readdirSync("src/text/languages");
const languages: Record<string, Object> = {};

for (const file of files) {
    const fileId = file.split(".")[1] as Locale

    // Check if fileId matches LocaleString
    if (!Locals.includes(fileId)) throw new Error(`Language filename [${fileId}] does not match Locals.`)
    const data = MyJSON.parse(`src/text/languages/${file}`)

    // Check if file matches the schema
    textDataSchema.parse(data);
    syslog.log("Text validation", "Successful: JSON matches the schema.")

    const id: LocaleString = fileId
    languages[id] = plainToInstance(Object, data);
}

// Creates an empty text Object as Type Text to get the property skeleton.
let data = {} as TextData

// Collects all language files to create the text-class-data.
for (const [id, language] of Object.entries(languages)) {
    const results = getDeepestElements(language);

    // Runs through each language file
    for (const result of results) {
        let currentTree: any = data;

        result.path.forEach((path, i) => {

            // Initializes class if in last branch.
            if (i === result.path.length - 1) {

                if (!currentTree[path]) currentTree[path] = new LocaleText({} as Record<LocaleString, string>)
            }

            // * Develops tree if not in last branch.
            else if (!currentTree[path]) {

                currentTree[path] = {};
            }
            currentTree = currentTree[path];
        })

        // * Sets text
        currentTree.data[id] = result.value;
    }
}

/**
 * @see You should use get() for auto check for errors (ex.: If something was not specified in language file).
 */
export const text = data;
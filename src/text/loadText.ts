import {plainToInstance} from "class-transformer";
import {Locale, LocaleString} from "discord.js";
import fs from "fs";
import {z, ZodError} from "zod";
import {getDeepestElements, parse, syslog} from "../utils/index.js";
import {textDataSchema} from "./textDataSchema.js";

// TODO: Rewatch if everything works and improve coe (errror handling)
// Create the Zod schema


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
    const data = parse(`src/text/languages/${file}`)

    // ! Check if file matches the schema
    try {
        const id: LocaleString = fileId
        languages[id] = textDataSchema.parse(data);
        syslog.log(`Text validation [${id}]`, "Successful: JSON matches the schema.")

    } catch (e) {
        if (e instanceof ZodError) {
            syslog.error("Text validation", "Failed.")
            for (const err of e.errors) {
                syslog.error("Text validation", `${err.path.join(".")}: ${err.message}`);
            }
        } else {
            syslog.error("Text validation", "Unknown error occurred:", e);
        }
        process.exit(1);
    }
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
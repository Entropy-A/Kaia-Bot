import {z} from "zod";

export const textDataSchema = z.object({
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
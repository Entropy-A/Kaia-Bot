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
        categories: z.object({
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
            statistics: z.object({
                name: z.string(),
                description: z.string(),
            })
        }),

        ping: z.object({
            description: z.string(),
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
            description: z.string(),
            detailedDescription: z.object({
                title: z.string(),
                description: z.string(),
                syntax: z.string(),
                returns: z.string()
            }),

            menu: z.object({
                title: z.string(),
                description: z.string(),
                credits: z.string(),
            }),

            detailedInfoPage: z.object({
                title: z.string(),
                syntax: z.string(),
                returns: z.string(),
                footer: z.string()
            }),

            selectMenuPlaceholder: z.string(),
        }),

        play: z.object({
            description: z.string(),
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
            description: z.string(),
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
            description: z.string(),
            detailedDescription: z.object({
                title: z.string(),
                description: z.string(),
                syntax: z.string(),
                returns: z.string()
            }),

            title: z.string()
        }),

        resume: z.object({
            description: z.string(),
            detailedDescription: z.object({
                title: z.string(),
                description: z.string(),
                syntax: z.string(),
                returns: z.string()
            }),

            title: z.string()
        }),

        statistics: z.object({
            description: z.string(),
            detailedDescription: z.object({
                title: z.string(),
                description: z.string(),
                syntax: z.string(),
                returns: z.string(),
            }),

        }),








        remind: z.object({
            description: z.string(),
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
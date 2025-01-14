import fs from "fs"

export function parse(path: string): any {
    const data = fs.readFileSync(path, "utf-8")
    return  JSON.parse(data)
}


export function getDeepestElements(object: Object, path: string[] = []): { value: unknown; path: string[] }[] {
    const values = [];

    // Returns the deepest value that's not an Object. Arrays will be returned as a whole.
    if (typeof object !== "object" || Array.isArray(object)) {
        values.push({ value: object, path });

        // Enters one level deeper in Object
    } else {
        const objectEntries = Object.entries(object);
        for (const [key, deeperObject] of objectEntries) {
            values.push(...getDeepestElements(deeperObject, [...path, key]));
        }
    }

    return values;
}
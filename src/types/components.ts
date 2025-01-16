import { ComponentProtoData, ComponentPrototype} from "./index.js"
import { ButtonGenerator, StringSelectGenerator, ModalGenerator} from "../utils/generators/index.js"

/**
 * Class for component handling.
 */
export class Button extends ComponentPrototype<ButtonGenerator> {
    constructor(data: ComponentProtoData<ButtonGenerator>) {
        super(data)
    }
}

/**
 * Class for component handling.
 */
// ! Not required
/* export class Modal extends ComponentPrototype<ModalGenerator> {
    constructor(data: ComponentProtoData<ModalGenerator>) {
        super(data)
    }
} */

/**
 * Class for component handling.
 */
export class StringSelect extends ComponentPrototype<StringSelectGenerator> {
    constructor(data: ComponentProtoData<StringSelectGenerator>) {
        super(data)
    }
}



export type ComponentPrototypes = Button | StringSelect // TODO: Find better way and add more
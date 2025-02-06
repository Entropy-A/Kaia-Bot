import { ComponentProtoData, ComponentPrototype} from "./index.js"
import { ButtonGenerator, StringSelectGenerator, ModalGenerator} from "../utils/generators/index.js"
import {UserSelectGenerator} from "../utils/generators/userSelect.js";
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
// ! Not required maybe remove elsewhere too
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

/**
 * Class for component handling.
 */
export class UserSelect extends ComponentPrototype<UserSelectGenerator> {
    constructor(data: ComponentProtoData<UserSelectGenerator>) {
        super(data)
    }
}

export type ComponentPrototypes = Button | StringSelect | UserSelect // TODO: Find better way and add more
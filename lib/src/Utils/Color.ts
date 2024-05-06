/**
 * Enum representing text colors for console output.
 */
enum TextColor {
    Black = '\x1b[30m',
    Red = '\x1b[31m',
    Green = '\x1b[32m',
    Yellow = '\x1b[33m',
    Blue = '\x1b[34m',
    Magenta = '\x1b[35m',
    Cyan = '\x1b[36m',
    White = '\x1b[37m'
}

/**
 * Extending the String prototype to add color methods.
 */
declare global {
    interface String {
        Black(): string;
        Red(): string;
        Green(): string;
        Yellow(): string;
        Blue(): string;
        Magenta(): string;
        Cyan(): string;
        White(): string;
    }
}

String.prototype.Black = function (): string {
    return `${TextColor.Black}${this}\x1b[0m`;
};

String.prototype.Red = function (): string {
    return `${TextColor.Red}${this}\x1b[0m`;
};

String.prototype.Green = function (): string {
    return `${TextColor.Green}${this}\x1b[0m`;
};

String.prototype.Yellow = function (): string {
    return `${TextColor.Yellow}${this}\x1b[0m`;
};

String.prototype.Blue = function (): string {
    return `${TextColor.Blue}${this}\x1b[0m`;
};

String.prototype.Magenta = function (): string {
    return `${TextColor.Magenta}${this}\x1b[0m`;
};

String.prototype.Cyan = function (): string {
    return `${TextColor.Cyan}${this}\x1b[0m`;
};

String.prototype.White = function (): string {
    return `${TextColor.White}${this}\x1b[0m`;
};

export { TextColor };

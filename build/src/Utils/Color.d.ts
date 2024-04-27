declare enum TextColor {
    Black = "\u001B[30m",
    Red = "\u001B[31m",
    Green = "\u001B[32m",
    Yellow = "\u001B[33m",
    Blue = "\u001B[34m",
    Magenta = "\u001B[35m",
    Cyan = "\u001B[36m",
    White = "\u001B[37m"
}
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
export { TextColor };
export {};

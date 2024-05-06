import DiscordJs from "./Discord";
import OceanicJS from "./Oceanic";
import Eris from "./Eris";
import Libs from "../Utils/Libs";

/**
 * Library class
 */
class Library {
  /**
   * Instance of the blue client
   */
  public blue: any;
  /**
   * Library name
   */
  public lib: string;

  constructor(lib: string, blue: any) {
    this.lib = lib;
    this.blue = blue;
  }

  /**
   * Main function to initialize the library
   */
  main(): void {
    switch (this.lib) {
      case Libs.DiscordJs:
        this.blue.send = (data: any) => new DiscordJs(this.blue).send(data);
        break;
      case Libs.Eris:
        this.blue.send = (data: any) => new Eris(this.blue).send(data);
        break;
      case Libs.OceanicJS:
        this.blue.send = (data: any) => new OceanicJS(this.blue).send(data);
        break;
      default:
        throw new Error("Not supported library.");
    }
  }
}

export default Library;

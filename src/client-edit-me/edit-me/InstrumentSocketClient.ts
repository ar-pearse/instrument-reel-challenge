/**
 * ☑️ You can edit MOST of this file to add your own styles.
 */

/**
 * ✅ You can add/edit these imports
 */
import {
  Instrument,
  InstrumentSymbol,
  WebSocketClientMessageJson,
  WebSocketServerMessageJson,
} from "../../common-leave-me";

/**
 * Notes:
 * 
 * To subscribe or unsubscribe to/from instrument(s), send a message to the server with the following format:
 * 
 * export type WebSocketClientMessageJson =
  | {
      type: "subscribe";
      instrumentSymbols: InstrumentSymbol[];
    }
  | {
      type: "unsubscribe";
      instrumentSymbols: InstrumentSymbol[];
    };
  *
  * The server will start responding with a message with the following format:
  * 
  * export type WebSocketServerMessageJson = {
      type: "update";
      instruments: Instrument[];
    };
 */

/**
 * ❌ Please do not edit this class name
 */
export class InstrumentSocketClient {
  /**
   * ❌ Please do not edit this private property name
   */
  private _socket: WebSocket;

  /**
   * ✅ You can add more properties for the class here (if you want) 👇
   */

  private _instrumentMap: Map<InstrumentSymbol, number> = new Map();

  constructor() {
    /**
     * ❌ Please do not edit this private property assignment
     */
    this._socket = new WebSocket("ws://localhost:3000/ws");

    /**
     * ✅ You can edit from here down 👇
     */
  }

  private _sendMessage(message: WebSocketClientMessageJson) {
    this._socket.send(JSON.stringify(message));
  }

  public open(cb: () => void) {
    if (this._socket.readyState === this._socket.CLOSED) {
      this._socket = new WebSocket("ws://localhost:3000/ws");
    }

    if (this._socket.readyState !== this._socket.OPEN) {
      this._socket.addEventListener("open", cb);
    } else {
      this._socket.removeEventListener("open", cb);
      cb();
    }
  }

  public listen(
    instrumentSymbols: InstrumentSymbol[],
    callback: (instruments: Instrument[]) => void
  ) {
    instrumentSymbols.forEach((val) => {
      const mappedInstrumentAmount = this._instrumentMap.get(val);

      if (mappedInstrumentAmount !== undefined) {
        this._instrumentMap.set(val, mappedInstrumentAmount + 1);
      } else {
        this._instrumentMap.set(val, 1);
      }
    });

    const cb = (ev: MessageEvent<any>) => {
      callback(
        (JSON.parse(ev.data) as WebSocketServerMessageJson).instruments.filter(
          (val) => instrumentSymbols.includes(val.code)
        )
      );
    };

    this._socket.removeEventListener("message", cb);

    this._sendMessage({
      type: "subscribe",
      instrumentSymbols,
    });

    this._socket.addEventListener("message", cb);

    return {
      unsubscribe: () => {
        const instrumentsToRemove: InstrumentSymbol[] = [];

        instrumentSymbols.forEach((val) => {
          const mappedValue = this._instrumentMap.get(val);

          if (mappedValue === undefined) {
            return;
          } else if (mappedValue - 1 === 0) {
            instrumentsToRemove.push(val);
            this._instrumentMap.delete(val);
          } else {
            this._instrumentMap.set(val, mappedValue - 1);
          }
        });

        this._sendMessage({
          type: "unsubscribe",
          instrumentSymbols: instrumentsToRemove,
        });

        this._socket.removeEventListener("message", cb);
      },
    };
  }
}

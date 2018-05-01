import * as WebSocket from 'ws'
import { Observable } from 'rxjs'

export type Interval =
  | '1m'
  | '3m'
  | '5m'
  | '15m'
  | '30m'
  | '1h'
  | '2h'
  | '4h'
  | '6h'
  | '8h'
  | '12h'
  | '1d'
  | '3d'
  | '1w'
  | '1M'

export interface Candle {
  pair: string
  startTime: Date
  endTime: Date
  interval: Interval
  openPrice: number
  closePrice: number
  highPrice: number
  lowPrice: number
  closed: boolean
}

export function candlestick(
  pair: string,
  interval: Interval
): Observable<Candle> {
  const observable = new Observable<Candle>(observer => {
    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${pair}@kline_${interval}`
    )
    ws.on('error', observer.error.bind(observer))
    ws.on('close', observer.complete.bind(observer))
    ws.on('message', (data: string) => {
      try {
        const parsed = parseRawCandle(data)
        observer.next(parsed)
      } catch (err) {
        observer.error(new Error('Failed to parse data: \n' + data))
      }
    })
  })

  return observable
}

function parseRawCandle(rawCandle: string): Candle {
  const json = JSON.parse(rawCandle)

  return {
    pair: json.s,
    startTime: new Date(json.k.t),
    endTime: new Date(json.k.T),
    interval: json.k.i,
    openPrice: Number(json.k.o),
    highPrice: Number(json.k.h),
    closePrice: Number(json.k.c),
    lowPrice: Number(json.k.l),
    closed: json.k.x,
  }
}

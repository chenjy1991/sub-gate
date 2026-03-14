import { NextResponse } from 'next/server'

interface ResultData<T> {
  code: number
  msg: string
  data: T | null
}

export function ok<T>(data?: T): NextResponse<ResultData<T>> {
  return NextResponse.json({
    code: 0,
    msg: 'ok',
    data: data ?? null,
  })
}

export function fail(msg: string): NextResponse<ResultData<null>> {
  return NextResponse.json({
    code: 1,
    msg,
    data: null,
  })
}

export function unauthorized(): NextResponse<ResultData<null>> {
  return NextResponse.json(
    { code: 1, msg: '未登录或登录已过期', data: null },
    { status: 401 }
  )
}

export interface PageResult<T> {
  total: number
  list: T[]
}

export function pageResult<T>(total: number, list: T[]): PageResult<T> {
  return { total, list }
}

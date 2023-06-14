import { FilterQuery } from "mongoose"

export type TypeFilter<T = null> = {
    match: FilterQuery<T>,
    project: Partial<Record<keyof T, 1>>,
    sort: Partial<Record<keyof T, 1 | -1>>,
    skip: number,
    limit: number
}

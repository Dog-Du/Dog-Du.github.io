/* tslint:disable */
/* eslint-disable */

export class Universe {
    free(): void;
    [Symbol.dispose](): void;
    cells_ptr(): number;
    clear(): void;
    height(): number;
    constructor(width: number, height: number);
    randomize(): void;
    set_cell(row: number, col: number, alive: number): void;
    /**
     * Place a pattern at (row, col). Pattern is a flat array with width.
     */
    set_pattern(row: number, col: number, pattern: Uint8Array, pat_w: number): void;
    tick(): void;
    toggle(row: number, col: number): void;
    width(): number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_universe_free: (a: number, b: number) => void;
    readonly universe_cells_ptr: (a: number) => number;
    readonly universe_clear: (a: number) => void;
    readonly universe_height: (a: number) => number;
    readonly universe_new: (a: number, b: number) => number;
    readonly universe_randomize: (a: number) => void;
    readonly universe_set_cell: (a: number, b: number, c: number, d: number) => void;
    readonly universe_set_pattern: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
    readonly universe_tick: (a: number) => void;
    readonly universe_toggle: (a: number, b: number, c: number) => void;
    readonly universe_width: (a: number) => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;

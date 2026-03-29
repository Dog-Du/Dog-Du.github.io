use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Universe {
    width: u32,
    height: u32,
    cells: Vec<u8>,
    next: Vec<u8>,
}

#[wasm_bindgen]
impl Universe {
    #[wasm_bindgen(constructor)]
    pub fn new(width: u32, height: u32) -> Self {
        let size = (width * height) as usize;
        Self {
            width,
            height,
            cells: vec![0; size],
            next: vec![0; size],
        }
    }

    pub fn width(&self) -> u32 { self.width }
    pub fn height(&self) -> u32 { self.height }
    pub fn cells_ptr(&self) -> *const u8 { self.cells.as_ptr() }

    pub fn toggle(&mut self, row: u32, col: u32) {
        let idx = (row * self.width + col) as usize;
        self.cells[idx] ^= 1;
    }

    pub fn set_cell(&mut self, row: u32, col: u32, alive: u8) {
        let idx = (row * self.width + col) as usize;
        self.cells[idx] = alive;
    }

    pub fn clear(&mut self) {
        self.cells.fill(0);
    }

    pub fn randomize(&mut self) {
        // Simple LCG - no need for rand crate
        let mut seed: u64 = 0xDEAD_BEEF;
        for cell in self.cells.iter_mut() {
            seed = seed.wrapping_mul(6364136223846793005).wrapping_add(1);
            *cell = if (seed >> 33) & 1 == 1 { 1 } else { 0 };
        }
    }

    pub fn tick(&mut self) {
        let w = self.width;
        let h = self.height;
        for row in 0..h {
            for col in 0..w {
                let idx = (row * w + col) as usize;
                let neighbors = self.count_neighbors(row, col);
                self.next[idx] = match (self.cells[idx], neighbors) {
                    (1, 2) | (1, 3) => 1,
                    (0, 3) => 1,
                    _ => 0,
                };
            }
        }
        std::mem::swap(&mut self.cells, &mut self.next);
    }

    fn count_neighbors(&self, row: u32, col: u32) -> u8 {
        let w = self.width;
        let h = self.height;
        let mut count = 0u8;
        for dr in [h - 1, 0, 1] {
            for dc in [w - 1, 0, 1] {
                if dr == 0 && dc == 0 { continue; }
                let r = (row + dr) % h;
                let c = (col + dc) % w;
                count += self.cells[(r * w + c) as usize];
            }
        }
        count
    }

    /// Place a pattern at (row, col). Pattern is a flat array with width.
    pub fn set_pattern(&mut self, row: u32, col: u32, pattern: &[u8], pat_w: u32) {
        let pat_h = pattern.len() as u32 / pat_w;
        for r in 0..pat_h {
            for c in 0..pat_w {
                let tr = (row + r) % self.height;
                let tc = (col + c) % self.width;
                self.cells[(tr * self.width + tc) as usize] = pattern[(r * pat_w + c) as usize];
            }
        }
    }
}

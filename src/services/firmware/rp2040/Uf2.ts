// UF2 parser for RP2040 firmware images.
// Format: 512-byte blocks (see pico-sdk boot/uf2.h).

export const UF2_MAGIC_START0 = 0x0a324655;
export const UF2_MAGIC_START1 = 0x9e5d5157;
export const UF2_MAGIC_END = 0x0ab16f30;
export const UF2_FLAG_NOT_MAIN_FLASH = 0x00000001;
export const UF2_FLAG_FAMILY_ID_PRESENT = 0x00002000;
export const RP2040_FAMILY_ID = 0xe48bff56;

export const UF2_BLOCK_SIZE = 512;
export const FLASH_START = 0x10000000;
// 16 MB is the largest flash the RP2040 can map.
export const FLASH_END = 0x11000000;
export const FLASH_PAGE_SIZE = 256;
export const FLASH_SECTOR_SIZE = 4096;

export type Uf2Image = {
  // Flash page address -> 256 bytes of data, sorted by address.
  pages: Map<number, Uint8Array>;
  familyId: number | undefined;
  // Total bytes that will be written.
  size: number;
};

export class Uf2Error extends Error {}

export function parseUf2(data: Uint8Array): Uf2Image {
  if (data.length === 0 || data.length % UF2_BLOCK_SIZE !== 0) {
    throw new Uf2Error('The file is not a UF2 image (size is not 512 * n).');
  }
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const pages = new Map<number, Uint8Array>();
  let familyId: number | undefined;

  for (let offset = 0; offset < data.length; offset += UF2_BLOCK_SIZE) {
    const u32 = (o: number) => view.getUint32(offset + o, true);
    if (
      u32(0) !== UF2_MAGIC_START0 ||
      u32(4) !== UF2_MAGIC_START1 ||
      u32(UF2_BLOCK_SIZE - 4) !== UF2_MAGIC_END
    ) {
      throw new Uf2Error(
        `Broken UF2 block at offset ${offset} (bad magic numbers).`
      );
    }
    const flags = u32(8);
    if (flags & UF2_FLAG_NOT_MAIN_FLASH) continue;
    const targetAddr = u32(12);
    const payloadSize = u32(16);
    if (flags & UF2_FLAG_FAMILY_ID_PRESENT) {
      const blockFamily = u32(28);
      if (familyId === undefined) familyId = blockFamily;
      if (blockFamily !== RP2040_FAMILY_ID) {
        throw new Uf2Error(
          `This UF2 is not for the RP2040 (family 0x${blockFamily.toString(16)}).`
        );
      }
    }
    if (payloadSize !== FLASH_PAGE_SIZE || targetAddr % FLASH_PAGE_SIZE) {
      throw new Uf2Error(
        `Unsupported UF2 block at offset ${offset} (payload must be one aligned 256-byte page).`
      );
    }
    if (targetAddr < FLASH_START || targetAddr + payloadSize > FLASH_END) {
      throw new Uf2Error(
        `UF2 block targets 0x${targetAddr.toString(16)}, outside the RP2040 flash.`
      );
    }
    pages.set(
      targetAddr,
      data.slice(offset + 32, offset + 32 + FLASH_PAGE_SIZE)
    );
  }
  if (pages.size === 0) {
    throw new Uf2Error('The UF2 image has no data for the flash.');
  }
  const sorted = new Map([...pages.entries()].sort(([a], [b]) => a - b));
  return { pages: sorted, familyId, size: sorted.size * FLASH_PAGE_SIZE };
}

export type FlashSector = {
  // Sector start address (4096-aligned).
  address: number;
  // Runs of consecutive pages inside the sector: [address, data].
  runs: { address: number; data: Uint8Array }[];
};

// Groups pages by 4 KB erase sector and merges consecutive pages so each
// sector is erased once and written with as few transfers as possible.
export function planSectors(image: Uf2Image): FlashSector[] {
  const sectors = new Map<number, FlashSector>();
  for (const [address, page] of image.pages) {
    const sectorAddress = address - (address % FLASH_SECTOR_SIZE);
    let sector = sectors.get(sectorAddress);
    if (!sector) {
      sector = { address: sectorAddress, runs: [] };
      sectors.set(sectorAddress, sector);
    }
    const last = sector.runs[sector.runs.length - 1];
    if (last && last.address + last.data.length === address) {
      const merged = new Uint8Array(last.data.length + page.length);
      merged.set(last.data);
      merged.set(page, last.data.length);
      last.data = merged;
    } else {
      sector.runs.push({ address, data: page });
    }
  }
  return [...sectors.values()];
}

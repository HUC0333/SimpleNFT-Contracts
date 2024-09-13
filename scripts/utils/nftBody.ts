import { Address, beginCell, Cell } from "@ton/core";

export type mintParams = {
    queryId: number;
    itemOwnerAddress: Address;
    itemIndex: number;
    amount: bigint;
    commonContentUrl: string;
  };

export function createMintBody(params: mintParams): Cell {
    const body = beginCell();
    body.storeUint(1, 32);
    body.storeUint(params.queryId || 0, 64);
    body.storeUint(params.itemIndex, 64);
    body.storeCoins(params.amount);

    const nftItemContent = beginCell();
    nftItemContent.storeAddress(params.itemOwnerAddress);

    const uriContent = beginCell();
    uriContent.storeBuffer(Buffer.from(params.commonContentUrl));
    nftItemContent.storeRef(uriContent.endCell());

    body.storeRef(nftItemContent.endCell());
    return body.endCell();
  }
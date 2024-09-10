import { KeyPair } from "@ton/crypto";
import {
  beginCell,
  Cell,
  WalletContractV5R1,
} from "@ton/ton";
import {  Builder, OpenedContract } from '@ton/core';
import { TonClient, internal } from "@ton/ton";
import { mnemonicNew, mnemonicToPrivateKey } from "@ton/crypto";
import { getEndpoint } from "./endpoint";

export type OpenedWallet = {
  contract: OpenedContract<WalletContractV5R1>;
  keyPair: KeyPair;
};

export async function openWallet(mnemonic: string[], testnet: boolean) {
  const keyPair = await mnemonicToPrivateKey(mnemonic);

  const client = new TonClient({
    endpoint: await getEndpoint(),
    apiKey: process.env.API_KEY,
  });

  const wallet = WalletContractV5R1.create({
    workchain: 0,
    publicKey: keyPair.publicKey,
  });

  let contract = client.open(wallet);
  contract.getSeqno();
  return { contract, keyPair };
}

export async function getWalletContract(mnemonic: string[]) {
  const keyPair = await mnemonicToPrivateKey(mnemonic);
  const client = new TonClient({
    endpoint: await getEndpoint(),
    apiKey: process.env.TONCENTER_API_KEY,
  });

  const wallet = WalletContractV5R1.create({
    workchain: 0,
    publicKey: keyPair.publicKey,
  });
  const contract = client.open(wallet);
  return contract;
}

export async function getKeypair (mnemonic: string[]) {
  return await mnemonicToPrivateKey(mnemonic);
}

function bufferToChunks(buff: Buffer, chunkSize: number) {
  const chunks: Buffer[] = [];
  while (buff.byteLength > 0) {
    chunks.push(buff.slice(0, chunkSize));
    buff = buff.slice(chunkSize);
  }
  return chunks;
}

function makeSnakeCell(data: Buffer): Cell {
  const chunks = bufferToChunks(data, 127);

  if (chunks.length === 0) {
    return beginCell().endCell();
  }

  if (chunks.length === 1) {
    return beginCell().storeBuffer(chunks[0]).endCell();
  }

  let curCell = beginCell();

  for (let i = chunks.length - 1; i >= 0; i--) {
    const chunk = chunks[i];

    curCell.storeBuffer(chunk);

    if (i - 1 >= 0) {
      const nextCell = beginCell();
      nextCell.storeRef(curCell);
      curCell = nextCell;
    }
  }

  return curCell.endCell();
}

export function encodeOffChainContent(content: string): Cell | Builder {
  let data = Buffer.from(content);
  const offChainPrefix = Buffer.from([0x01]);
  data = Buffer.concat([offChainPrefix, data]);
  return makeSnakeCell(data);
}

export function encodeToHex(input: string): string {
  const hex = Buffer.from(input, 'utf-8').toString('hex');
  const lengthHex = (input.length).toString(16).padStart(2, '0');
  return `${lengthHex}${hex}`;
}

export function decodeFromHex(hexInput: string): string {
  const hexData = hexInput.slice(2);
  return Buffer.from(hexData, 'hex').toString('utf-8');
}